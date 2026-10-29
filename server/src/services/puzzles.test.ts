import { describe, it, expect } from "vitest";
import { validateFractionMove, validateAtomMove, validateHeritageAnswer, fractionSum, sanitizeText, validNickname, validCode } from "./puzzles";

describe("Fraction Forge validation (Phase 4)", () => {
  it("accepts 1/2 + 1/4 + 1/4 = 1 and completes", () => {
    expect(validateFractionMove([], "p1").ok).toBe(true);
    expect(validateFractionMove(["p1"], "p2").ok).toBe(true);
    const r = validateFractionMove(["p1", "p2"], "p3");
    expect(r.ok).toBe(true); expect(r.complete).toBe(true);
    expect(fractionSum(["p1", "p2", "p3"])).toBeCloseTo(1);
  });
  it("rejects moves past 1 whole, duplicates and unknown pieces", () => {
    expect(validateFractionMove(["p1", "p4"], "p5").complete).toBe(true); // 1/2+1/3+1/6 also = 1
    expect(validateFractionMove(["p1", "p2"], "p4").ok).toBe(false); // 1/2+1/4+1/3 > 1
    expect(validateFractionMove(["p1"], "p1").ok).toBe(false);
    expect(validateFractionMove([], "nope").ok).toBe(false);
  });
});
describe("Molecule Builder validation (Phase 5)", () => {
  it("accepts only correct H2O slots and completes", () => {
    expect(validateAtomMove({}, "oxygen", "center").ok).toBe(true);
    expect(validateAtomMove({}, "oxygen", "left").ok).toBe(false);
    expect(validateAtomMove({ oxygen: "center" }, "hydrogen1", "center").ok).toBe(false);
    const r = validateAtomMove({ oxygen: "center", hydrogen1: "left" }, "hydrogen2", "right");
    expect(r.ok).toBe(true); expect(r.complete).toBe(true);
  });
});
describe("Heritage validation (Phase 6)", () => {
  it("checks answers server-side", () => {
    expect(validateHeritageAnswer("qutb-minar", 0).ok).toBe(true);
    expect(validateHeritageAnswer("qutb-minar", 1).ok).toBe(false);
    expect(validateHeritageAnswer("bogus", 0).ok).toBe(false);
  });
});
describe("input hygiene (Phases 1/3/8)", () => {
  it("sanitizes chat and validates nickname/code", () => {
    expect(sanitizeText('<b>hi</b>   there')).toBe("bhi/b there");
    expect(validNickname("Asha_7")).toBe("Asha_7");
    expect(validNickname("x")).toBeNull();
    expect(validNickname("<script>")).toBeNull();
    expect(validCode("ab12")).toBe("AB12");
    expect(validCode("!!")).toBeNull();
  });
});
