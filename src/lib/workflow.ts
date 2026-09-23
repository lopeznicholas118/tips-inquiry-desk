import type {InquiryStatus} from "@/db/schema";

const TRANSITIONS: Record<InquiryStatus, InquiryStatus[]> = {
  new: ["needs_review", "ai_failed"],
  ai_failed: ["needs_review"], // staff can trigger a retry
  needs_review: ["approved", "rejected"],
  approved: ["sent", "needs_review"], // pull back if something looks wrong before it sends
  rejected: [],
  sent: [],
};

export function canTransition(from: InquiryStatus, to: InquiryStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: InquiryStatus, to: InquiryStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid status transition: ${from} -> ${to}`);
  }
}