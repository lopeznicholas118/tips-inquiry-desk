// src/app/api/inquiries/[id]/route.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { PATCH } from "./route";

async function seedInquiry(status: string) {
  const id = crypto.randomUUID();
  await db.insert(inquiries).values({
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
    customerName: "Test",
    customerEmail: "test@example.com",
    originalMessage: "hi",
    status,
  });
  return id;
}

beforeEach(async () => {
  await db.delete(inquiries);
});

describe("PATCH /api/inquiries/[id]", () => {
  it("approves a needs_review inquiry", async () => {
    const id = await seedInquiry("needs_review");
    const req = new Request(`http://localhost/api/inquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "approve", reviewedBy: "staff@thetips.golf" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id }) });
    expect(res.status).toBe(200);

    const [row] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    expect(row.status).toBe("approved");
    expect(row.reviewedBy).toBe("staff@thetips.golf");
  });

  it("blocks an invalid transition (can't approve straight from new)", async () => {
    const id = await seedInquiry("new");
    const req = new Request(`http://localhost/api/inquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "approve", reviewedBy: "staff@thetips.golf" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id }) });
    expect(res.status).toBe(409);
  });
});