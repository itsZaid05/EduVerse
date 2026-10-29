import { Client, Room } from "colyseus.js";

/**
 * Primary endpoint: SAME ORIGIN as the page, path-prefixed with /colyseus.
 * Vite (dev + preview) proxies /colyseus/* — HTTP matchmake and the game
 * WebSocket — to the Colyseus server on localhost:2567. This works in the
 * sandbox preview where only the client's port is reliably reachable.
 */
export function serverEndpoint(): string {
  const env = (import.meta as any).env?.VITE_SERVER_URL as string | undefined;
  if (env) return env.replace(/\/$/, "");
  return `${window.location.origin}/colyseus`;
}

/** Direct-to-server endpoint (fallback if the same-origin proxy is unavailable). */
export function directEndpoint(): string {
  const { protocol, hostname } = window.location;
  if (/^5173-/.test(hostname)) return `${protocol}//${hostname.replace(/^5173-/, "2567-")}`;
  return `${protocol}//${hostname}:2567`;
}

export interface JoinOpts { nickname: string; code: string; role: "student" | "teacher"; pin?: string }

export async function joinClass(opts: JoinOpts): Promise<Room> {
  const endpoints = [serverEndpoint(), directEndpoint()].filter((v, i, a) => a.indexOf(v) === i);
  let lastErr: any = null;
  for (const endpoint of endpoints) {
    try {
      const room = await joinVia(endpoint, opts);
      console.info(`[EduVerse] connected via ${endpoint}`);
      (window as any).__eduverseEndpoint = endpoint;
      return room;
    } catch (err: any) {
      lastErr = err;
      // A server-side rejection (bad PIN, duplicate nickname, ...) has a numeric
      // code — retrying on another endpoint would fail identically. Stop here.
      if (typeof err?.code === "number") throw err;
      console.warn(`[EduVerse] join via ${endpoint} failed, trying fallback…`, err);
    }
  }
  throw new Error(`Cannot reach the EduVerse server (tried: ${endpoints.join(", ")}). ${lastErr?.message || lastErr || ""}`.trim());
}

async function joinVia(endpoint: string, opts: JoinOpts): Promise<Room> {
  const client = new Client(endpoint);
  const meta = { nickname: opts.nickname, code: opts.code.toUpperCase(), role: opts.role };
  const saved = sessionStorage.getItem("ev-reconnect");
  if (saved && sessionStorage.getItem("ev-room-meta") === JSON.stringify(meta) && sessionStorage.getItem("ev-endpoint") === endpoint) {
    try { const room = await client.reconnect(saved); sessionStorage.setItem("ev-reconnect", room.reconnectionToken); return room; }
    catch { sessionStorage.removeItem("ev-reconnect"); }
  }
  const room = await client.joinOrCreate("classroom", { ...opts, code: opts.code.toUpperCase() });
  sessionStorage.setItem("ev-reconnect", room.reconnectionToken);
  sessionStorage.setItem("ev-room-meta", JSON.stringify(meta));
  sessionStorage.setItem("ev-endpoint", endpoint);
  return room;
}

/** Convert Colyseus schema state into a plain, React-friendly snapshot. */
export function snapshot(state: any) {
  const players: any[] = [];
  state.players?.forEach((p: any, id: string) => players.push({
    id, nickname: p.nickname, role: p.role, zone: p.zone, x: p.x, y: p.y, z: p.z, rotY: p.rotY,
    score: p.score, attempts: p.attempts, discoveries: p.discoveries, connected: p.connected,
  }));
  const pairs = (s: string) => s ? Object.fromEntries(s.split(",").filter(Boolean).map((x: string) => x.split("="))) : {};
  return {
    code: state.code, activity: state.activity, teamScore: state.teamScore, announcement: state.announcement,
    mathPlaced: state.mathPlaced ? state.mathPlaced.split(",").filter(Boolean) : [], mathAttempts: state.mathAttempts, mathComplete: state.mathComplete, mathHint: state.mathHint || 0, mathPuzzle: state.mathPuzzle || "whole", mathDone: state.mathDone ? state.mathDone.split(",").filter(Boolean) : [],
    sciencePlaced: pairs(state.sciencePlaced || ""), scienceAttempts: state.scienceAttempts, scienceComplete: state.scienceComplete, elapsedStart: state.elapsedStart,
    scienceLevel: state.scienceLevel || "h2o", scienceHint: state.scienceHint || 0, science2Placed: pairs(state.science2Placed || ""), science2Attempts: state.science2Attempts || 0, science2Complete: !!state.science2Complete,
    mathTooBig: state.mathTooBig || 0, scienceBadSlot: state.scienceBadSlot || 0, heritageWrong: state.heritageWrong || 0,
    heritageFound: state.heritageFound ? state.heritageFound.split(",").filter(Boolean) : [], heritageAttempts: state.heritageAttempts,
    players, feed: [...(state.feed || [])], chat: [...(state.chat || [])],
  };
}
export type Snap = ReturnType<typeof snapshot>;
