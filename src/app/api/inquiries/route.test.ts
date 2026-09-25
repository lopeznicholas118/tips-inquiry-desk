// src/app/api/inquiries/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { POST, GET } from "./route";

vi.mock("@/lib/ai/triage", () => ({
  triageInquiry: vi.fn().mockResolvedValue({
    detected_language: "en",
    category: "booking",
    urgency: "normal",
    message_en: "I'd like to book a lesson.",
    message_es: "Me gustaría reservar una clase.",
    draft_reply: "Happy to help! What day works?",
    draft_reply_en: "Happy to help! What day works?",
    missing_info: [],
    needs_human: false,
  }),
  TriageError: class TriageError extends Error {},
}));

beforeEach(async () => {
  await db.delete(inquiries);
});

describe("POST /api/inquiries", () => {
  it("creates and triages an inquiry", async () => {
    const req = new Request("http://localhost/api/inquiries", {
      method: "POST",
      body: JSON.stringify({ name: "Ana", email: "ana@example.com", message: "Quiero reservar una clase" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const {id} = await res.json();

    const [row] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    expect(row.status).toBe("needs_review");
    expect(row.category).toBe("booking");
  });

  it("rejects invalid input before touching the AI or the DB", async () => {
    const req = new Request("http://localhost/api/inquiries", {
      method: "POST",
      body: JSON.stringify({ name: "", email: "not-an-email", message: "hi" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("keeps the inquiry and marks it ai_failed if triage throws", async () => {
    const { triageInquiry } = await import("@/lib/ai/triage");
    vi.mocked(triageInquiry).mockRejectedValueOnce(new Error("API down"));

    const req = new Request("http://localhost/api/inquiries", {
      method: "POST",
      body: JSON.stringify({ name: "Ben", email: "ben@example.com", message: "Simulator bays Saturday?" }),
    });

    const res = await POST(req);
    const { id } = await res.json();

    const [row] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    expect(row.status).toBe("ai_failed");
  });
});

describe("GET /api/inquiries", () => {
  it("filters by status", async () => {
    await POST(
      new Request("http://localhost/api/inquiries", {
        method: "POST",
        body: JSON.stringify({ name: "Cy", email: "cy@example.com", message: "Hola, precios?" }),
      })
    );

    const res = await GET(new Request("http://localhost/api/inquiries?status=needs_review"));
    const rows = await res.json();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r: { status: string }) => r.status === "needs_review")).toBe(true);
  });
});