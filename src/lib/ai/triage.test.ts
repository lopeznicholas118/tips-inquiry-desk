import {describe, it, expect, vi} from "vitest";
import {triageInquiry, TriageError} from "./triage";
import type Anthropic from "@anthropic-ai/sdk";

function fakeClient(toolInput: unknown): Anthropic {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "tool_use", name: "record_triage", input: toolInput }],
      }),
    },
  } as unknown as Anthropic;
}

describe("triageInquiry", () => {
  it("parses a valid structured response", async () => {
    const client = fakeClient({
      detected_language: "es",
      category: "fitting",
      urgency: "normal",
      message_en: "I'd like to book a club fitting.",
      message_es: "Me gustaría reservar un ajuste de equipo.",
      draft_reply: "¡Con gusto! ¿Qué día le conviene?",
      draft_reply_en: "Happy to help! What day works for you?",
      missing_info: [],
      needs_human: false,
    });

    const result = await triageInquiry("Quisiera reservar un fitting", "facts", client);
    expect(result.detected_language).toBe("es");
    expect(result.category).toBe("fitting");
  });

  it("throws TriageError when output fails schema validation", async () => {
    const client = fakeClient({ detected_language: "es" }); // missing required fields

    await expect(
      triageInquiry("hola", "facts", client)
    ).rejects.toThrow(TriageError);
  });

  it("throws TriageError when the API call itself fails", async () => {
    const client = {
      messages: { create: vi.fn().mockRejectedValue(new Error("network error")) },
    } as unknown as Anthropic;

    await expect(triageInquiry("hi", "facts", client)).rejects.toThrow(TriageError);
  });
});