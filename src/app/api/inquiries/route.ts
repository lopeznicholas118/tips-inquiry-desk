import {z} from "zod";
import {eq, desc} from "drizzle-orm";
import {readFileSync} from "fs";
import path from "path";
import {db} from "@/db";
import {inquiries, INQUIRY_STATUSES} from "@/db/schema";
import {triageInquiry, TriageError} from "@/lib/ai/triage";

const InquiryInput = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  message: z.string().min(5).max(4000),
});

function loadBusinessFacts(): string {
  return readFileSync(path.join(process.cwd(), "data/business-facts.md"), "utf-8");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = InquiryInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({error: z.flattenError(parsed.error)}, {status: 400});
  }

  const {name, email, message} = parsed.data;
  const id = crypto.randomUUID();
  const now = new Date();

  // Save BEFORE calling the AI — a failed API call must never lose the customer's message.
  await db.insert(inquiries).values({
    id,
    createdAt: now,
    updatedAt: now,
    customerName: name,
    customerEmail: email,
    originalMessage: message,
    status: "new",
  });

  try {
    const result = await triageInquiry(message, loadBusinessFacts());

    await db
      .update(inquiries)
      .set({
        updatedAt: new Date(),
        detectedLanguage: result.detected_language,
        category: result.category,
        urgency: result.urgency,
        messageEn: result.message_en,
        messageEs: result.message_es,
        draftReply: result.draft_reply,
        draftReplyEn: result.draft_reply_en,
        missingInfo: JSON.stringify(result.missing_info),
        needsHuman: result.needs_human,
        status: "needs_review",
      })
      .where(eq(inquiries.id, id));
  } catch (err) {
    console.error("Triage failed for inquiry", id, err instanceof TriageError ? err.cause : err);
    await db
      .update(inquiries)
      .set({ updatedAt: new Date(), status: "ai_failed" })
      .where(eq(inquiries.id, id));
  }

  return Response.json({ id }, { status: 201 });
}

const StatusFilter = z.enum(INQUIRY_STATUSES).optional();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = StatusFilter.safeParse(searchParams.get("status") ?? undefined);
  if (!parsed.success) {
    return Response.json({ error: "Invalid status filter" }, { status: 400 });
  }

  const rows = parsed.data
    ? await db.select().from(inquiries).where(eq(inquiries.status, parsed.data)).orderBy(desc(inquiries.createdAt))
    : await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));

  return Response.json(rows);
}