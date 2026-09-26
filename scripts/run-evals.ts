import {readFileSync} from "fs";
import {franc} from "franc";
import {triageInquiry, type TriageResult} from "../src/lib/ai/triage";

type EvalCase = {
  id: string;
  description: string;
  message: string;
  checks: {
    expectedLanguage?: "en" | "es";
    expectedCategory?: string;
    expectedNeedsHuman?: boolean;
    replyMustMatchDetectedLanguage?: boolean;
    missingInfoMustBeNonEmpty?: boolean;
    forbiddenPricePattern?: boolean;
    draftReplyMustNotContain?: string[];
  };
};

type EvalResult = { id: string; passed: boolean; failures: string[] };

const FRANC_TO_LANG: Record<string, "en" | "es"> = { eng: "en", spa: "es" };

function checkReplyLanguage(reply: string, expected: string): string | null {
  const detected = franc(reply, { minLength: 3 });
  const mapped = FRANC_TO_LANG[detected];
  if (!mapped) return null; // too short/ambiguous for franc to judge — skip rather than false-fail
  if (mapped !== expected) return `draft_reply reads as "${mapped}", expected "${expected}"`;
  return null;
}

function runChecks(result: TriageResult, evalCase: EvalCase): string[] {
  const failures: string[] = [];
  const { checks } = evalCase;

  if (checks.expectedLanguage && result.detected_language !== checks.expectedLanguage) {
    failures.push(`detected_language: got "${result.detected_language}", expected "${checks.expectedLanguage}"`);
  }
  if (checks.expectedCategory && result.category !== checks.expectedCategory) {
    failures.push(`category: got "${result.category}", expected "${checks.expectedCategory}"`);
  }
  if (checks.expectedNeedsHuman !== undefined && result.needs_human !== checks.expectedNeedsHuman) {
    failures.push(`needs_human: got ${result.needs_human}, expected ${checks.expectedNeedsHuman}`);
  }
  if (checks.missingInfoMustBeNonEmpty && result.missing_info.length === 0) {
    failures.push(`missing_info: expected at least one item, got none`);
  }
  if (checks.forbiddenPricePattern && /\$\s?\d/.test(result.draft_reply)) {
    failures.push(`draft_reply contains an ungrounded dollar amount: "${result.draft_reply}"`);
  }
  for (const banned of checks.draftReplyMustNotContain ?? []) {
    if (result.draft_reply.toLowerCase().includes(banned.toLowerCase())) {
      failures.push(`draft_reply contains banned text "${banned}"`);
    }
  }
  if (checks.replyMustMatchDetectedLanguage !== false) {
    const issue = checkReplyLanguage(result.draft_reply, result.detected_language);
    if (issue) failures.push(issue);
  }

  return failures;
}

async function main() {
  const facts = readFileSync("data/business-facts.md", "utf-8");
  const cases: EvalCase[] = JSON.parse(readFileSync("evals/inquiries.json", "utf-8"));
  const results: EvalResult[] = [];

  // Sequential, not Promise.all — keeps console output readable and avoids bursting rate limits.
  for (const evalCase of cases) {
    process.stdout.write(`Running ${evalCase.id}... `);
    try {
      const result = await triageInquiry(evalCase.message, facts);
      const failures = runChecks(result, evalCase);
      results.push({ id: evalCase.id, passed: failures.length === 0, failures });
      console.log(failures.length === 0 ? "PASS" : "FAIL");
    } catch (err) {
      results.push({ id: evalCase.id, passed: false, failures: [`Threw: ${err}`] });
      console.error(err);
      console.log("ERROR");
    }
  }

  const passed = results.filter((r) => r.passed).length;
  console.log(`\n--- ${passed}/${results.length} passed ---\n`);
  for (const r of results) {
    if (!r.passed) {
      console.log(`❌ ${r.id}`);
      r.failures.forEach((f) => console.log(`   - ${f}`));
    }
  }

  process.exit(passed === results.length ? 0 : 1);
}

main();