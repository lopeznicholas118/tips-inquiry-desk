"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {StatusBadge} from "@/components/StatusBadge";
import type {InquiryStatus} from "@/db/schema";

type Inquiry = {
  id: string;
  customerName: string;
  customerEmail: string;
  originalMessage: string;
  detectedLanguage: string | null;
  messageEn: string | null;
  draftReply: string | null;
  draftReplyEn: string | null;
  missingInfo: string | null;
  needsHuman: boolean;
  status: string;
};

export function ReviewPanel({inquiry}: {inquiry: Inquiry}) {
  const router = useRouter();
  const [draftReply, setDraftReply] = useState(inquiry.draftReply ?? "");
  const [reviewedBy, setReviewedBy] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missingInfo: string[] = inquiry.missingInfo ? JSON.parse(inquiry.missingInfo) : [];

  async function sendAction(action: "approve" | "reject" | "edit" | "mark_sent") {
    if (!reviewedBy.trim()) {
      setError("Enter your name before taking an action.");
      return;
    }
    setPending(true);
    setError(null);

    const res = await fetch(`/api/inquiries/${inquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, draftReply, reviewedBy }),
    });

    setPending(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong.");
      return;
    }
    router.refresh(); // re-runs the Server Component so it re-fetches from the DB — no local/server state drift
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Review Inquiry</h1>
        <StatusBadge status={inquiry.status as InquiryStatus} />
      </div>

      <section className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Original message</h2>
          <p className="whitespace-pre-wrap rounded border p-3 text-sm bg-black-50">{inquiry.originalMessage}</p>
          <p className="mt-2 text-xs text-gray-400">
            {inquiry.customerName} · {inquiry.customerEmail} · detected: {inquiry.detectedLanguage ?? "unknown"}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">English translation</h2>
          <p className="whitespace-pre-wrap rounded border p-3 text-sm bg-black-50">
            {inquiry.messageEn ?? "Not yet triaged."}
          </p>
        </div>
      </section>

      {missingInfo.length > 0 && (
        <section className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-600">
          <strong>Missing info the AI flagged:</strong>
          <ul className="list-disc pl-5 mt-1">
            {missingInfo.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </section>
      )}

      {inquiry.needsHuman && (
        <p className="text-sm text-red-600 font-medium">
          ⚠ The AI flagged this inquiry as needing human judgment before replying.
        </p>
      )}

      <section>
        <h2 className="text-sm font-medium text-gray-500 mb-1">
          Draft reply (customer&apos;s language) — edit before approving
        </h2>
        <textarea
          value={draftReply}
          onChange={(e) => setDraftReply(e.target.value)}
          rows={5}
          className="w-full rounded border p-3 text-sm"
        />
        <div>
        {inquiry.detectedLanguage === "es" && <p className="mt-2 text-xs text-gray-500 whitespace-pre-wrap">
          English reference: {inquiry.draftReplyEn ?? "—"}
        </p>}
        </div>
      </section>

      <section>
        <label className="block text-sm font-medium text-gray-500 mb-1">Your name (for the audit trail)</label>
        <input
          value={reviewedBy}
          onChange={(e) => setReviewedBy(e.target.value)}
          placeholder="e.g. Jordan"
          className="rounded border p-2 text-sm w-64"
        />
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          disabled={pending || inquiry.status !== "needs_review"}
          onClick={() => sendAction("edit")}
          className="px-4 py-2 rounded border text-sm disabled:opacity-40"
        >
          Save Edit
        </button>
        <button
          disabled={pending || inquiry.status !== "needs_review"}
          onClick={() => sendAction("approve")}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-40"
        >
          Approve
        </button>
        <button
          disabled={pending || inquiry.status !== "needs_review"}
          onClick={() => sendAction("reject")}
          className="px-4 py-2 rounded bg-red-600 text-white text-sm disabled:opacity-40"
        >
          Reject
        </button>
        <button
          disabled={pending || inquiry.status !== "approved"}
          onClick={() => sendAction("mark_sent")}
          className="px-4 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-40"
        >
          Mark Sent
        </button>
      </div>
    </div>
  );
}