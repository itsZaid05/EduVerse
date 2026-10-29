import { Client, Room } from "colyseus.js";

export function serverEndpoint(): string {
  const env = (import.meta as any).env?.VITE_SERVER_URL as string | undefined;
  if (env) return env;
  const { protocol, hostname } = window.location;
  // Arena/local preview: each port gets its own host prefix, e.g. 5173-<id>.e2b.app
  if (/^5173-/.test(hostname)) return `${protocol}//${hostname.replace(/^5173-/, "2567-")}`;
  return `${protocol}//${hostname}:2567`;
}

export interface JoinOpts { nickname: string; code: string; role: "student" | "teacher"; pin?: string }

export async function joinClass(opts: JoinOpts): Promise<Room> {
  const client = new Client(serverEndpoint());
  const meta = { nickname: opts.nickname, code: opts.code.toUpperCase(), role: opts.role };
  const saved = sessionStorage.getItem("ev-reconnect");
  // Only reuse a reconnection token for the SAME class + role it was issued to;
  // otherwise a changed code/role would silently land the user in the wrong room.
  if (saved && sessionStorage.getItem("ev-room-meta") === JSON.stringify(meta)) {
    try { const room = await client.reconnect(saved); sessionStorage.setItem("ev-reconnect", room.reconnectionToken); return room; }
    catch { sessionStorage.removeItem("ev-reconnect"); }
  }
  const room = await client.joinOrCreate("classroom", { ...opts, code: opts.code.toUpperCase() });
  sessionStorage.setItem("ev-reconnect", room.reconnectionToken);
  sessionStorage.setItem("ev-room-meta", JSON.stringify(meta));
  return room;
}

/** Convert Colyseus schema state into a plain, React-friendly snapshot. */
export function snapshot(state: any) {
  const players: any[] = [];
  state.players?.forEach((p: any, id: string) => players.push({
    id, nickname: p.nickname, role: p.role, zone: p.zone, x: p.x, y: p.y, z: p.z, rotY: p.rotY,
    score: p.score, attempts: p.attempts, discoveries: p.discoveries, connected: p.connected,
  }));
  return {
    code: state.code, activity: state.activity, teamScore: state.teamScore, announcement: state.announcement,
    mathPlaced: state.mathPlaced ? state.mathPlaced.split(",").filter(Boolean) : [], mathAttempts: state.mathAttempts, mathComplete: state.mathComplete, mathPuzzle: state.mathPuzzle || "whole", mathDone: state.mathDone ? state.mathDone.split(",").filter(Boolean) : [],
    sciencePlaced: state.sciencePlaced ? Object.fromEntries(state.sciencePlaced.split(",").map((s: string) => s.split("="))) : {}, scienceAttempts: state.scienceAttempts, scienceComplete: state.scienceComplete, elapsedStart: state.elapsedStart,
    scienceLevel: state.scienceLevel || "h2o", science2Placed: state.science2Placed ? Object.fromEntries(state.science2Placed.split(",").filter(Boolean).map((s: string) => s.split("="))) : {}, science2Attempts: state.science2Attempts || 0, science2Complete: !!state.science2Complete,
    mathTooBig: state.mathTooBig || 0, scienceBadSlot: state.scienceBadSlot || 0, heritageWrong: state.heritageWrong || 0,
    heritageFound: state.heritageFound ? state.heritageFound.split(",").filter(Boolean) : [], heritageAttempts: state.heritageAttempts,
    players, feed: [...(state.feed || [])], chat: [...(state.chat || [])],
  };
}
export type Snap = ReturnType<typeof snapshot>;
