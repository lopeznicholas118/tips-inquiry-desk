// src/app/page.tsx
import Link from "next/link";

const STEPS = [
  {
    title: "A customer writes",
    body: "Inquiries arrive in English or Spanish through a simple public form.",
  },
  {
    title: "AI triages and drafts",
    body: "Claude detects the language, categorizes the request, translates it, and drafts a reply in the customer's own language.",
  },
  {
    title: "A human approves",
    body: "Staff review and edit every draft. Nothing is marked sent without a named reviewer signing off.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Tips Inquiry Desk</h1>
      <p className="mt-4 text-lg text-gray-600">
        A bilingual (English/Spanish) inquiry triage tool for a golf club.{" "} The AI drafts, and a human approves.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/submit" className="rounded border px-5 py-2.5 text-sm">
          Submit an Inquiry
        </Link>
        <Link href="/inquiries" className="rounded border px-5 py-2.5 text-sm">
          Open Staff Inbox
        </Link>
      </div>

      <ol className="mt-14 space-y-6">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm">
              {i + 1}
            </span>
            <div>
              <h2 className="font-medium">{step.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-sm text-gray-600">
        Try it: submit a message in Spanish, then open the staff inbox to review the draft. <br/>All data here is
        fictional.{"  "}
        <a
          href="https://github.com/lopeznicholas118/tips-inquiry-desk"
          className="underline">
          <br />
          <br />

          Source on GitHub
        </a>
        .
      </p>
    </main>
  );
}