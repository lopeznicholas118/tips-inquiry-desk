import type {InquiryStatus} from "@/db/schema";

const STYLES: Record<InquiryStatus, string> = {
  new: "bg-gray-100 text-gray-700",
  needs_review: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  sent: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  ai_failed: "bg-orange-100 text-orange-800",
};

const LABELS: Record<InquiryStatus, string> = {
  new: "New",
  needs_review: "Needs Review",
  approved: "Approved",
  sent: "Sent",
  rejected: "Rejected",
  ai_failed: "AI Failed",
};

export function StatusBadge({status}: {status: InquiryStatus}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}