import { Room, Client } from "colyseus";
import { ClassState, Player } from "../state/ClassState";
import {
  validateFractionMove, validateAtomMove, validateHeritageAnswer,
  sanitizeText, validNickname, validCode, clampPos, ZONES,
} from "../services/puzzles";
import { FRACTION_HINTS, SCIENCE_HINTS, FRACTION_EXPLANATION, SCIENCE_EXPLANATION, HERITAGE_HOTSPOTS } from "../content/content";
import { getAiHint } from "../services/aiHints";

const TEACHER_PIN = process.env.TEACHER_PIN || "1234";
const csv = (s: string) => (s ? s.split(",").filter(Boolean) : []);
const parsePairs = (s: string) => Object.fromEntries(csv(s).map((p) => p.split("=") as [string, string]));

export class ClassRoom extends Room<ClassState> {
  private lastChat = new Map<string, number>();
  private lastAi = new Map<string, number>();
  private lastMove = new Map<string, number>();

  onCreate(options: any) {
    this.setState(new ClassState());
    this.state.code = validCode(options?.code) || "DEMO1";
    this.state.elapsedStart = Date.now();
    this.maxClients = 40;
    this.pushFeed(`Session ${this.state.code} created.`);

    this.onMessage("move", (client, m: any) => {
      const p = this.state.players.get(client.sessionId); if (!p) return;
      const now = Date.now(); if (now - (this.lastMove.get(client.sessionId) || 0) < 50) return;
      this.lastMove.set(client.sessionId, now);
      if (m?.zone && ZONES.includes(m.zone) && m.zone !== p.zone) { p.zone = m.zone; this.pushFeed(`${p.nickname} moved to ${m.zone}.`); }
      p.x = clampPos(m?.x); p.y = 1.6; p.z = clampPos(m?.z); p.rotY = typeof m?.rotY === "number" ? m.rotY : 0;
    });

    this.onMessage("placeFraction", (client, m: any) => {
      const p = this.player(client); if (!p || this.state.mathComplete) return this.feedback(client, "Fraction Forge is already complete. Ask your teacher to reset it to play again.");
      const placed = csv(this.state.mathPlaced);
      const r = validateFractionMove(placed, String(m?.pieceId || ""));
      p.attempts++; this.state.mathAttempts++;
      if (!r.ok) return this.feedback(client, `✗ ${r.reason}`);
      this.state.mathPlaced = [...placed, String(m.pieceId)].join(",");
      if (r.complete && !this.state.mathComplete) {
        this.state.mathComplete = true; this.award(client, p, 100);
        this.broadcast("feedback", { text: `🎉 Fraction Forge complete! ${FRACTION_EXPLANATION} (+100 team points)`, kind: "success" });
        this.pushFeed(`Fraction Forge completed by ${p.nickname} (+100).`);
      } else this.broadcast("feedback", { text: `✓ ${r.reason}`, kind: "success" });
    });

    this.onMessage("placeAtom", (client, m: any) => {
      const p = this.player(client); if (!p || this.state.scienceComplete) return this.feedback(client, "Molecule complete. Ask your teacher to reset it to play again.");
      const placed = parsePairs(this.state.sciencePlaced);
      const r = validateAtomMove(placed, String(m?.atomId || ""), String(m?.slotId || ""));
      p.attempts++; this.state.scienceAttempts++;
      if (!r.ok) return this.feedback(client, `✗ ${r.reason}`);
      this.state.sciencePlaced = Object.entries({ ...placed, [String(m.atomId)]: String(m.slotId) }).map(([k, v]) => `${k}=${v}`).join(",");
      if (r.complete) {
        this.state.scienceComplete = true; this.award(client, p, 100);
        this.broadcast("feedback", { text: `🎉 ${SCIENCE_EXPLANATION} (+100 team points)`, kind: "success" });
        this.pushFeed(`Molecule Builder completed by ${p.nickname} (+100).`);
      } else this.broadcast("feedback", { text: `✓ ${r.reason}`, kind: "success" });
    });

    this.onMessage("answerHeritage", (client, m: any) => {
      const p = this.player(client); if (!p) return;
      const id = String(m?.hotspotId || "");
      if (csv(this.state.heritageFound).includes(id)) return this.feedback(client, "Your team already discovered this hotspot.");
      const r = validateHeritageAnswer(id, Number(m?.answerIndex));
      p.attempts++; this.state.heritageAttempts++;
      if (!r.ok) return this.feedback(client, `✗ ${r.reason}`);
      this.state.heritageFound = [...csv(this.state.heritageFound), id].join(",");
      if (!csv(p.discoveries).includes(id)) p.discoveries = [...csv(p.discoveries), id].join(",");
      this.award(client, p, 30);
      this.broadcast("feedback", { text: `✓ ${r.reason} ${r.clue || ""} (+30 team points)`, kind: "success" });
      this.pushFeed(`${p.nickname} discovered ${HERITAGE_HOTSPOTS.find((h) => h.id === id)?.title} (+30).`);
      if (csv(this.state.heritageFound).length >= 3) this.pushFeed("All 3 heritage discoveries found! 🏆");
    });

    this.onMessage("hint", (client, m: any) => {
      const zone = String(m?.zone || "");
      if (zone === "math") { const i = Math.min(this.state.mathHint, FRACTION_HINTS.length - 1); this.state.mathHint++; this.broadcast("feedback", { text: `💡 Hint ${i + 1}: ${FRACTION_HINTS[i]}`, kind: "hint" }); }
      else if (zone === "science") { const i = Math.min(this.state.scienceHint, SCIENCE_HINTS.length - 1); this.state.scienceHint++; this.broadcast("feedback", { text: `💡 Hint ${i + 1}: ${SCIENCE_HINTS[i]}`, kind: "hint" }); }
      else if (zone === "heritage") this.broadcast("feedback", { text: "💡 Hint: Follow the glowing markers — tower first, then the domed gateway, then the conservation board.", kind: "hint" });
    });

    // Phase 9: optional AI hint, predefined fallback; never affects scoring/validation.
    this.onMessage("aiHint", async (client, m: any) => {
      const now = Date.now(); if (now - (this.lastAi.get(client.sessionId) || 0) < 3000) return; // rate limit
      this.lastAi.set(client.sessionId, now);
      const text = await getAiHint(String(m?.subject || "math"), String(m?.mistake || "general"));
      client.send("feedback", { text: `🤖 ${text}`, kind: "hint" });
    });

    this.onMessage("chat", (client, m: any) => {
      const p = this.player(client); if (!p) return;
      const now = Date.now(); if (now - (this.lastChat.get(client.sessionId) || 0) < 800) return; // rate limit
      this.lastChat.set(client.sessionId, now);
      const text = sanitizeText(m?.text, 120); if (!text) return;
      this.state.chat.push(`${p.nickname}: ${text}`); while (this.state.chat.length > 30) this.state.chat.shift();
    });

    // Teacher commands — backend-validated: only clients authenticated as teacher at join.
    this.onMessage("teacher", (client, m: any) => {
      const p = this.player(client);
      if (!p || p.role !== "teacher") return client.send("feedback", { text: "⛔ Teacher command rejected: not authorized.", kind: "error" });
      const action = String(m?.action || "");
      if (action === "setActivity") {
        const a = String(m.activity || "lobby"); if (!["lobby", "math", "science", "heritage", "summary"].includes(a)) return;
        this.state.activity = a; this.broadcast("goto", { activity: a }); this.pushFeed(`Teacher started activity: ${a}.`);
      } else if (action === "announce") {
        const text = sanitizeText(m.text, 140); if (!text) return;
        this.state.announcement = text; this.broadcast("feedback", { text: `📣 Teacher: ${text}`, kind: "announce" }); this.pushFeed(`Announcement: ${text}`);
      } else if (action === "resetMath") { this.state.mathPlaced = ""; this.state.mathComplete = false; this.state.mathHint = 0; this.broadcast("feedback", { text: "↺ Teacher reset Fraction Forge.", kind: "announce" }); this.pushFeed("Teacher reset Fraction Forge."); }
      else if (action === "resetScience") { this.state.sciencePlaced = ""; this.state.scienceComplete = false; this.state.scienceHint = 0; this.broadcast("feedback", { text: "↺ Teacher reset Molecule Builder.", kind: "announce" }); this.pushFeed("Teacher reset Molecule Builder."); }
      else if (action === "resetHeritage") { this.state.heritageFound = ""; this.state.players.forEach((pl) => (pl.discoveries = "")); this.broadcast("feedback", { text: "↺ Teacher reset Heritage Explorer.", kind: "announce" }); this.pushFeed("Teacher reset Heritage Explorer."); }
      else if (action === "broadcastHint") this.broadcast("feedback", { text: "💡 Teacher hint: Work together — talk through each move before you place it!", kind: "hint" });
    });
  }

  async onJoin(client: Client, options: any) {
    const nickname = validNickname(options?.nickname);
    if (!nickname) throw new Error("Nickname must be 2–16 letters/numbers.");
    const role = options?.role === "teacher" ? "teacher" : "student";
    if (role === "teacher" && String(options?.pin || "") !== TEACHER_PIN) throw new Error("Invalid teacher PIN.");
    // Prevent duplicate nicknames (also covers stale rejoin duplicates).
    this.state.players.forEach((p, id) => { if (p.nickname === nickname && id !== client.sessionId) throw new Error("That nickname is already in this session. Pick another."); });
    const p = new Player(); p.nickname = nickname; p.role = role;
    p.x = Math.random() * 4 - 2; p.z = 8 + Math.random() * 2;
    this.state.players.set(client.sessionId, p);
    this.pushFeed(`${nickname} joined as ${role}.`);
  }

  async onLeave(client: Client, consented: boolean) {
    const p = this.state.players.get(client.sessionId); if (!p) return;
    p.connected = false;
    try {
      if (consented) throw new Error("consented");
      await this.allowReconnection(client, 30); // reconnect without losing progress/duplicates
      p.connected = true; this.pushFeed(`${p.nickname} reconnected.`);
    } catch {
      this.state.players.delete(client.sessionId);
      this.pushFeed(`${p.nickname} left.`);
    }
  }

  private player(client: Client) { return this.state.players.get(client.sessionId); }
  private feedback(client: Client, text: string) { client.send("feedback", { text, kind: text.startsWith("✓") || text.startsWith("🎉") ? "success" : "error" }); }
  private award(_client: Client, p: Player, pts: number) { p.score += pts; this.state.teamScore += pts; }
  private pushFeed(text: string) { this.state.feed.push(`${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — ${text}`); while (this.state.feed.length > 40) this.state.feed.shift(); }
}
