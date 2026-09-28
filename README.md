# Tips Inquiry Desk

A bilingual (English/Spanish) customer inquiry triage system, built as a
portfolio project for The Tips' software engineering internship.

Check the deployed project on Vercel [here](https://tips-inquiry-desk-ocfmj4avf-lopeznicholas118.vercel.app/).

## The problem

A golf club gets customer inquiries in English and Spanish about bookings,
lessons, fittings, and events. Staff lose time triaging and translating each
one by hand.

## The solution

Customers submit an inquiry. An AI layer (Claude, via the Anthropic SDK)
detects the language, categorizes it, drafts a reply in the customer's own
language, and flags anything it can't confidently answer. A staff member
reviews and edits the draft before it's approved — nothing is ever sent
without a human in the loop.

## Architecture

- **Next.js (App Router) + TypeScript** — Server Components read the
  database directly; Client Components handle interactive review actions
  through API routes.
- **Drizzle ORM + libSQL/Turso** — same SQL locally (a plain file) and in
  production (a hosted Turso database) — one driver, no code branching.
- **Anthropic SDK** — forced tool use (`tool_choice`) returns structured,
  Zod-validated output every time.
- **Zod** — validates both the AI's output and all API input.
- **Vitest** — unit tests for the workflow state machine, mocked tests for
  the AI layer, and integration tests for every API route.

## The review gate

An inquiry can only reach `sent` by passing through
`new → needs_review → approved → sent`. This is enforced in
`src/lib/workflow.ts`, not just in the UI — even a bug in the frontend can't
skip a human review, since the API checks the same state machine before any
status change.

## Setup

\`\`\`bash
npm install
cp .env.example .env.local   # fill in ANTHROPIC_API_KEY
npm run db:migrate
npm run dev
\`\`\`

## Testing

\`\`\`bash
npm run test    # unit + integration tests, no API calls
npm run eval    # property-based checks against the real API (costs a small
                # amount — run manually, not on every commit)
\`\`\`

Current eval results: **10/10** passing (see `evals/inquiries.json`).

## Known limitations (by design, for v1)

- No authentication on the staff inbox.
- No real email delivery (`ConsoleMailer` logs instead of sending).
- No live booking calendar — exact date/time availability is confirmed by
  staff during review, not by the AI.

## What I'd build next

- Give the AI tools (hours lookup, mock calendar, pricing lookup) instead of
  a single static facts file.
- Track staff edits to AI drafts as a feedback signal for prompt tuning.
- A WhatsApp/SMS intake channel.