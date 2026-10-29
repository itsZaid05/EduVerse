import { FRACTION_PIECES, ATOMS, CO2_ATOMS, HERITAGE_HOTSPOTS } from "../content/content";

const EPS = 1e-9;

/** Sum of placed fraction pieces; null if any piece id is unknown. */
export function fractionSum(placed: string[]): number | null {
  let s = 0;
  for (const id of placed) {
    const p = FRACTION_PIECES[id];
    if (!p) return null;
    s += p.value;
  }
  return s;
}
export type MoveResult = { ok: boolean; reason: string; complete?: boolean };
/** Server-authoritative validation for one Fraction Forge placement. */
export function validateFractionMove(placed: string[], pieceId: string): MoveResult {
  const piece = FRACTION_PIECES[pieceId];
  if (!piece) return { ok: false, reason: "Unknown piece." };
  if (placed.includes(pieceId)) return { ok: false, reason: "That piece is already placed." };
  const sum = fractionSum(placed)! + piece.value;
  if (sum > 1 + EPS) return { ok: false, reason: `Too big! ${piece.label} would push the total past 1 whole. Try a smaller piece.` };
  return { ok: true, reason: sum >= 1 - EPS ? "You completed the whole!" : `Placed ${piece.label}. Keep going!`, complete: sum >= 1 - EPS };
}
export type ScienceLevel = "h2o" | "co2";
export const SCIENCE_LEVELS: ScienceLevel[] = ["h2o", "co2"];
export function validateAtomMove(placed: Record<string, string>, atomId: string, slotId: string, level: ScienceLevel = "h2o"): MoveResult {
  const table = level === "co2" ? CO2_ATOMS : ATOMS;
  const atom = table[atomId];
  if (!atom) return { ok: false, reason: "Unknown atom." };
  if (placed[atomId]) return { ok: false, reason: "That atom is already placed." };
  if (Object.values(placed).includes(slotId)) return { ok: false, reason: "That position is already filled." };
  if (atom.correctSlot !== slotId) return { ok: false, reason: `The ${atom.element} atom doesn't belong there. Check the H₂O target diagram.` };
  const complete = Object.keys(placed).length + 1 === Object.keys(table).length;
  return { ok: true, reason: complete ? (level === "co2" ? "CO₂ complete!" : "H₂O complete!") : `${atom.label} placed correctly.`, complete };
}
export function validateHeritageAnswer(hotspotId: string, answerIndex: number): MoveResult & { clue?: string } {
  const h = HERITAGE_HOTSPOTS.find((x) => x.id === hotspotId);
  if (!h) return { ok: false, reason: "Unknown hotspot." };
  if (answerIndex !== h.answer) return { ok: false, reason: "Not quite — re-read the card and try again. No points are lost." };
  return { ok: true, reason: `Correct! Discovery recorded: ${h.title}`, clue: h.clue };
}
export function sanitizeText(raw: unknown, max = 120): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/[<>&"']/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}
export function validNickname(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const n = raw.trim();
  if (n.length < 2 || n.length > 16) return null;
  if (!/^[A-Za-z0-9 _-]+$/.test(n)) return null;
  return n;
}
export function validCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const c = raw.trim().toUpperCase();
  return /^[A-Z0-9]{4,8}$/.test(c) ? c : null;
}
export const ZONES = ["campus", "math", "science", "heritage"];
export function clampPos(v: unknown): number {
  const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
  return Math.max(-20, Math.min(20, n));
}
