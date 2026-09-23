import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const inquiries = sqliteTable("inquiries", {
  
  // Metrics of inquiry
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),

  // Customer-submitted
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  originalMessage: text("original_message").notNull(),

  // AI-populated — null until triage runs
  detectedLanguage: text("detected_language"),
  category: text("category"),
  urgency: text("urgency"),
  messageEn: text("message_en"),
  messageEs: text("message_es"),
  draftReply: text("draft_reply"),
  draftReplyEn: text("draft_reply_en"),
  missingInfo: text("missing_info"),
  needsHuman: integer("needs_human", { mode: "boolean" }).notNull().default(false),

  // Workflow
  status: text("status").notNull().default("new"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
});

export const INQUIRY_STATUSES = [
  "new",
  "needs_review",
  "approved",
  "rejected",
  "sent",
  "ai_failed",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];