import Anthropic from "@anthropic-ai/sdk";
import {z} from "zod";
import {SYSTEM_PROMPT} from "./prompts";

export const TriageResult = z.object({
  detected_language: z.enum(["en", "es", "other"]),
  category: z.enum([
    "booking", "lessons", "fitting", "repair",
    "events", "membership", "pricing", "other",
  ]),
  urgency: z.enum(["low", "normal", "high"]),
  message_en: z.string(),
  message_es: z.string(),
  draft_reply: z.string().describe(
    "Reply in the SAME language as detected_language: English if detected_language is 'en', " +
    "Spanish if detected_language is 'es'." + 
    "Never default to Spanish for an English-language inquiry."
  ),
  draft_reply_en: z.string().describe("English version, for staff review"),
  missing_info: z.array(z.string()),
  needs_human: z.boolean(),
});
export type TriageResult = z.infer<typeof TriageResult>;

export class TriageError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "TriageError";
  }
}

const defaultClient = new Anthropic();

export async function triageInquiry(
  message: string,
  businessFacts: string,
  client: Anthropic = defaultClient
): Promise<TriageResult> {
  let response: Anthropic.Message;

  try {
    response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2000,
      system: `${SYSTEM_PROMPT}\n\n<business_facts>\n${businessFacts}\n</business_facts>`,
      tools: [
        {
          name: "record_triage",
          description: "Record the structured triage result for this customer inquiry.",
          input_schema: z.toJSONSchema(TriageResult) as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: "record_triage" },
      messages: [
        { role: "user", content: `<customer_message>\n${message}\n</customer_message>` },
      ],
    });
  } catch (err) {
    throw new TriageError("Anthropic API call failed", err);
  }

  const block = response.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new TriageError("Model did not return a tool_use block");
  }

  const parsed = TriageResult.safeParse(block.input);
  if (!parsed.success) {
    throw new TriageError("Model output failed schema validation", parsed.error);
  }

  return parsed.data;
}