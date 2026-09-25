import {z} from "zod";
import {eq} from "drizzle-orm";
import {db} from "@/db";
import {inquiries, type InquiryStatus} from "@/db/schema";
import {assertTransition} from "@/lib/workflow";

const PatchInput = z.object({
  action: z.enum(["approve", "reject", "edit", "mark_sent"]),
  draftReply: z.string().optional(), // only used with "edit"
  reviewedBy: z.string().min(1),
});

const ACTION_TO_STATUS: Record<string, InquiryStatus> = {
  approve: "approved",
  reject: "rejected",
  mark_sent: "sent",
};

export async function PATCH(
  req: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const {id} = await params; // Next.js 15+: params is a Promise, must be awaited

  const body = await req.json().catch(() => null);
  const parsed = PatchInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({error: z.flattenError(parsed.error)}, {status: 400});
  }
  const { action, draftReply, reviewedBy } = parsed.data;

  const [existing] = await db.select().from(inquiries).where(eq(inquiries.id, id));
  if (!existing) {
    return Response.json({ error: "Inquiry not found" }, { status: 404 });
  }

  // "edit" doesn't move the status — it updates the draft while still in review.
  if (action === "edit") {
    if (!draftReply) {
      return Response.json({ error: "draftReply is required for edit" }, { status: 400 });
    }
    await db.update(inquiries).set({ draftReply, updatedAt: new Date() }).where(eq(inquiries.id, id));
    const [updated] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return Response.json(updated);
  }

  const nextStatus = ACTION_TO_STATUS[action];
  try {
    assertTransition(existing.status as InquiryStatus, nextStatus);
  } catch {
    return Response.json(
      {error: `Cannot move inquiry from "${existing.status}" to "${nextStatus}"`},
      {status: 409}
    );
  }

  await db
    .update(inquiries)
    .set({ status: nextStatus, reviewedBy, reviewedAt: new Date(), updatedAt: new Date() })
    .where(eq(inquiries.id, id));

  const [updated] = await db.select().from(inquiries).where(eq(inquiries.id, id));
  return Response.json(updated);
}