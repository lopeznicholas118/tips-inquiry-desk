// src/lib/workflow.test.ts
import {describe, it, expect} from "vitest";
import {canTransition, assertTransition} from "./workflow";

describe("canTransition", () => {
  it("allows new -> needs_review", () => {
    expect(canTransition("new", "needs_review")).toBe(true);
  });

  it("blocks needs_review -> sent (must be approved first)", () => {
    expect(canTransition("needs_review", "sent")).toBe(false);
  });

  it("blocks skipping review entirely", () => {
    expect(canTransition("new", "sent")).toBe(false);
  });

  it("assertTransition throws on an invalid transition", () => {
    expect(() => assertTransition("rejected", "sent")).toThrow();
  });
});