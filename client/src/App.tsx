import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Room } from "colyseus.js";
import { joinClass, snapshot, type Snap } from "./network/client";
import World, { type Zone } from "./world/World";
import { FRACTION_PIECES, FRACTION_PUZZLES, HOTSPOTS, SOURCES, MOLECULES } from "./games/content";

type Feedback = { text: string; kind: string };

export default function App() {
  const [room, setRoom] = useState<Room | null>(null);
  const [snap, setSnap] = useState<Snap | null>(null);
  const [mode, setMode] = useState<"student" | "teacher">("student");
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("DEMO1");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [conn, setConn] = useState("");
  const roomRef = useRef<Room | null>(null);

  const connect = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (nickname.trim().length < 2) return setError("Nickname needs at least 2 characters (letters/numbers).");
    if (!/^[A-Za-z0-9]{4,8}$/.test(code.trim())) return setError("Class code must be 4–8 letters/numbers, e.g. DEMO1.");
    if (mode === "teacher" && !pin) return setError("Teachers must enter the teacher PIN.");
    setBusy(true);
    try {
      const r = await joinClass({ nickname: nickname.trim(), code: code.trim(), role: mode, pin });
      roomRef.current = r; setRoom(r);
      r.onStateChange((s: any) => setSnap(snapshot(s)));
      setSnap(snapshot(r.state));
      r.onMessage("feedback", (f: Feedback) => setFeedback((prev) => [f, ...prev].slice(0, 5)));
      r.onMessage("goto", ({ activity }: any) => { /* zone follows via Student's effect below */ });
      r.onLeave(() => setConn("Disconnected — refresh to reconnect (your team's progress is kept)."));
      r.onError((_c: number, m?: string) => setError(m || "Connection error"));
    } catch (err: any) { setError(err?.message ? `Could not join: ${err.message}` : "Could not join. Is the server running? Check the code/PIN."); }
    setBusy(false);
  };

  if (!room || !snap) return (
    <main className="join">
      <div className="card">
        <h1>🌍 EduVerse</h1>
        <p className="tag">Explore. Collaborate. Learn. — a shared 3D school for Grades 6–10</p>
        <div className="tabs" role="tablist">
          <button className={mode === "student" ? "on" : ""} onClick={() => setMode("student")}>🎓 Student</button>
          <button className={mode === "teacher" ? "on" : ""} onClick={() => setMode("teacher")}>🧑‍🏫 Teacher</button>
        </div>
        <form onSubmit={connect}>
          <label>Nickname<input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. Asha7" maxLength={16} autoFocus /></label>
          <label>Class code<input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="DEMO1" maxLength={8} /></label>
          {mode === "teacher" && <label>Teacher PIN<input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Set by your school (demo default in server .env)" /></label>}
          {error && <p className="err" role="alert">{error}</p>}
          <button className="primary" disabled={busy}>{busy ? "Joining…" : mode === "teacher" ? "Open Teacher Dashboard" : "Enter EduVerse 🚀"}</button>
        </form>
        <p className="fine">Nicknames only — no real names or accounts needed. Teacher tip: start a session as teacher with any new code, then share that code with students.</p>
      </div>
    </main>
  );

  return mode === "teacher"
    ? <Teacher room={room} snap={snap} feedback={feedback} conn={conn} />
    : <Student room={room} snap={snap} feedback={feedback} conn={conn} nickname={nickname} />;
}

export function Elapsed({ start }: { start: number }) {
  const [, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((v) => v + 1), 1000); return () => clearInterval(t); }, []);
  if (!start) return null;
  const sec = Math.max(0, Math.floor((Date.now() - start) / 1000));
  return <span>⏱️ {String(Math.floor(sec / 60)).padStart(2, "0")}:{String(sec % 60).padStart(2, "0")}</span>;
}

function Student({ room, snap, feedback, conn, nickname }: { room: Room; snap: Snap; feedback: Feedback[]; conn: string; nickname: string }) {
  const [zone, setZone] = useState<Zone>("campus");
  const [hotspot, setHotspot] = useState<string | null>(null);
  const [chat, setChat] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const me = snap.players.find((p) => p.id === room.sessionId);

  const enter = useCallback((z: Zone) => { setZone(z); room.send("move", { zone: z, x: 0, z: 6 }); }, [room]);
  useEffect(() => { // teacher "next activity" moves the class
    if (snap.activity === "math") enter("math"); else if (snap.activity === "science") enter("science");
    else if (snap.activity === "heritage") enter("heritage"); else if (snap.activity === "lobby") enter("campus");
    else if (snap.activity === "summary") setShowSummary(true);
  }, [snap.activity]); // eslint-disable-line

  const allDone = snap.mathComplete && snap.scienceComplete && snap.heritageFound.length >= 3;
  const hs = HOTSPOTS.find((h) => h.id === hotspot);

  return (
    <main className="layout">
      <section className="stage">
        <World room={room} snap={snap} zone={zone} onEnterZone={enter} onHotspot={setHotspot} />
        <div className="hud-top">
          <strong>🌍 EduVerse</strong><span>Code: {snap.code}</span><span>📍 {zone}</span>
          <span>⭐ Team {snap.teamScore}</span><Elapsed start={snap.elapsedStart} /><span>🙋 {nickname} · {me?.score || 0} pts</span>
          {conn && <span className="err">{conn}</span>}
        </div>
        <div className="hud-bottom">⌨️ WASD / arrow keys to walk · 🖱️ drag to look around · Click glowing portals &amp; markers (or use panel buttons)</div>
        {snap.announcement && <div className="announce">📣 {snap.announcement}</div>}
      </section>

      <aside className="panel">
        <nav className="zones">
          {(["campus", "math", "science", "heritage"] as Zone[]).map((z) => <button key={z} className={zone === z ? "on" : ""} onClick={() => enter(z)}>{z === "campus" ? "🏫 Campus" : z === "math" ? "➗ Math Lab" : z === "science" ? "🔬 Science Lab" : "🏛️ Heritage"}</button>)}
        </nav>
        {feedback.map((f, i) => <p key={i} className={`fb ${f.kind}`}>{f.text}</p>)}

        {zone === "campus" && <div><h2>Welcome! 🎉</h2><p>Walk to a portal or tap one above: <b>Math Lab</b> (Fraction Forge), <b>Science Lab</b> (Molecule Builder), or <b>Heritage Explorer</b> (Qutb Minar).</p><p>👥 In this session: {snap.players.filter(p=>p.connected).map((p) => p.nickname).join(", ") || "…"}</p></div>}

        {zone === "math" && (() => { const pz = FRACTION_PUZZLES.find((x) => x.id === snap.mathPuzzle) || FRACTION_PUZZLES[0]; const sum = snap.mathPlaced.reduce((t: number, id: string) => t + (pz.pieces.find((x) => x.id === id)?.value || 0), 0); return <div>
          <h2>➗ Fraction Forge — {pz.title}</h2><p><b>Mission:</b> fill the bar to exactly <b>{pz.targetLabel}</b>. Moves that pass the target are rejected by the server. {snap.mathDone.length}/2 puzzles scored.</p>
          <div className="bar"><div style={{ width: `${Math.min(100, (sum / pz.target) * 100)}%` }} /></div>
          <p>Total: <b>{sum.toFixed(2)} / {pz.targetLabel}</b> · Attempts: {snap.mathAttempts} {snap.mathComplete && "· ✅ Complete"}</p>
          <div className="btnrow">{pz.pieces.map((pc) => <button key={pc.id} disabled={snap.mathPlaced.includes(pc.id)} onClick={() => room.send("placeFraction", { pieceId: pc.id })} style={{ borderColor: pc.color }}>{pc.label}{snap.mathPlaced.includes(pc.id) ? " ✓" : ""}</button>)}</div>
          <div className="btnrow"><button onClick={() => room.send("hint", { zone: "math" })}>💡 Hint</button><button onClick={() => room.send("aiHint", { subject: "math", mistake: "fraction-sum" })}>🤖 Ask AI hint</button></div>
          <p className="fine">Puzzles scored: {FRACTION_PUZZLES.map((x) => `${snap.mathDone.includes(x.id) ? "✅" : "⬜"} ${x.title}`).join(" · ")}</p>
        </div>; })()}

        {zone === "science" && (() => { const lvl = (snap.scienceLevel === "co2" ? "co2" : "h2o") as "h2o" | "co2"; const mol = MOLECULES[lvl]; const placed = lvl === "co2" ? snap.science2Placed : snap.sciencePlaced; const done = lvl === "co2" ? snap.science2Complete : snap.scienceComplete; const att = lvl === "co2" ? snap.science2Attempts : snap.scienceAttempts; return <div>
          <h2>🔬 Molecule Builder</h2>
          <div className="btnrow">{(["h2o", "co2"] as const).map((l) => <button key={l} className={lvl === l ? "on" : ""} onClick={() => room.send("setScienceLevel", { level: l })}>{MOLECULES[l].name}{l === "h2o" && snap.scienceComplete ? " ✅" : l === "co2" && snap.science2Complete ? " ✅" : ""}</button>)}</div>
          <p><b>Mission:</b> build <b>{mol.formula}</b>. {mol.mission} (Simplified model, not a full chemistry simulation.)</p>
          <p>Placed: {Object.keys(placed).length}/3 · Attempts: {att} {done && "· ✅ Complete (+100)"}</p>
          {mol.atoms.map(([atom, label]) => (
            <div key={atom} className="atomrow"><span>{label}{placed[atom] ? ` ✓ (${placed[atom]})` : ""}</span>
              {["center", "left", "right"].map((sl) => <button key={sl} disabled={!!placed[atom]} onClick={() => room.send("placeAtom", { atomId: atom, slotId: sl, level: lvl })}>{sl}</button>)}</div>
          ))}
          <div className="btnrow"><button onClick={() => room.send("hint", { zone: "science" })}>💡 Hint</button><button onClick={() => room.send("aiHint", { subject: "science", mistake: "atom-count" })}>🤖 Ask AI hint</button></div>
        </div>; })()}

        {zone === "heritage" && <div>
          <h2>🏛️ Heritage Explorer: Qutb Minar</h2>
          <p><i>Stylized educational reconstruction — not a survey-accurate model.</i></p>
          <p><b>Mission:</b> find 3 discoveries ({snap.heritageFound.length}/3). Walk to glowing markers or tap:</p>
          <div className="btnrow">{HOTSPOTS.map((h) => <button key={h.id} onClick={() => setHotspot(h.id)}>{snap.heritageFound.includes(h.id) ? "✅ " : "📍 "}{h.title}</button>)}</div>
          <button onClick={() => room.send("hint", { zone: "heritage" })}>💡 Hint</button>
          <p className="fine">Sources: {SOURCES.map((s) => <span key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>{" · "}</span>)}</p>
        </div>}

        {hs && <div className="cardbox"><h3>{hs.title}</h3><p>{hs.card}</p><p><b>{hs.question}</b></p>
          {hs.options.map((o, i) => <button key={i} className="opt" onClick={() => room.send("answerHeritage", { hotspotId: hs.id, answerIndex: i })}>{o}</button>)}
          <button className="opt" onClick={() => setHotspot(null)}>Close card</button></div>}

        <div className="chat"><h3>💬 Class chat (this session)</h3>
          <div className="chatlog">{snap.chat.slice(-6).map((c, i) => <p key={i}>{c}</p>)}</div>
          <form onSubmit={(e) => { e.preventDefault(); if (chat.trim()) room.send("chat", { text: chat }); setChat(""); }}>
            <input value={chat} onChange={(e) => setChat(e.target.value)} maxLength={120} placeholder="Message your team (max 120 chars)" /><button>Send</button></form>
          <div className="btnrow">{["Great teamwork! 👏", "I need help 🤔", "Let's try the hint 💡"].map((q) => <button key={q} onClick={() => room.send("chat", { text: q })}>{q}</button>)}</div>
        </div>

        <button className="primary" onClick={() => setShowSummary(true)}>🏁 View session summary</button>
        {showSummary && <div className="cardbox"><h3>🏆 Session Summary</h3>
          <p>Team score: <b>{snap.teamScore}</b> · Your score: <b>{me?.score || 0}</b> · <Elapsed start={snap.elapsedStart} /></p>
          <p>{snap.mathComplete ? "🏅 Fraction Forge badge" : "➗ Fraction Forge: not yet"}<br/>{snap.scienceComplete ? "🏅 Molecule Builder (H₂O) badge" : "🔬 Molecule Builder H₂O: not yet"}<br/>{snap.science2Complete ? "🏅 CO₂ Builder badge" : "🫧 Molecule Builder CO₂: optional level"}<br/>{snap.heritageFound.length >= 3 ? "🏅 Heritage Explorer badge" : `🏛️ Heritage discoveries: ${snap.heritageFound.length}/3`}</p>
          {allDone && <p>🎉 <b>All missions complete — amazing teamwork!</b></p>}
          <button className="opt" onClick={() => setShowSummary(false)}>Close</button></div>}
      </aside>
    </main>
  );
}

function downloadRecap(snap: Snap) {
  const elapsed = snap.elapsedStart ? Math.floor((Date.now() - snap.elapsedStart) / 1000) : 0;
  const students = snap.players.filter((x: any) => x.role === "student");
  const lines = [
    "EduVerse — Session Recap", "========================",
    `Class code: ${snap.code}`, `Duration: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`, `Team score: ${snap.teamScore}`, "",
    "Students:",
    ...students.map((x: any) => `- ${x.nickname} | zone: ${x.zone} | score: ${x.score} | attempts: ${x.attempts} | discoveries: ${x.discoveries ? x.discoveries.split(",").length : 0}/3 | ${x.connected ? "online" : "offline"}`),
    "", "Activities:",
    `Fraction Forge puzzles scored: ${snap.mathDone.join(", ") || "none"} (attempts ${snap.mathAttempts})`,
    `Molecule Builder H2O: ${snap.scienceComplete ? "complete" : "not complete"} (attempts ${snap.scienceAttempts})`,
    `Molecule Builder CO2: ${snap.science2Complete ? "complete" : "not complete"} (attempts ${snap.science2Attempts})`,
    `Heritage discoveries: ${snap.heritageFound.join(", ") || "none"} (attempts ${snap.heritageAttempts})`,
    "", "Common errors:",
    `Fraction overshoot past target: ${snap.mathTooBig}`, `Atom wrong/filled slot: ${snap.scienceBadSlot}`, `Heritage wrong answers: ${snap.heritageWrong}`,
    "", "Activity feed:", ...[...snap.feed].reverse(),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `eduverse-recap-${snap.code}.txt`; a.click(); URL.revokeObjectURL(a.href);
}

function Teacher({ room, snap, feedback, conn }: { room: Room; snap: Snap; feedback: Feedback[]; conn: string }) {
  const [ann, setAnn] = useState("");
  const cmd = (action: string, extra: any = {}) => room.send("teacher", { action, ...extra });
  const students = snap.players.filter((p) => p.role === "student");
  return (
    <main className="dash">
      <h1>🧑‍🏫 Teacher Dashboard — Class {snap.code}</h1>
      <p>Share code <b>{snap.code}</b> with students. Current activity: <b>{snap.activity}</b> · Team score: <b>{snap.teamScore}</b> {conn && <span className="err">{conn}</span>}</p>
      {feedback.map((f, i) => <p key={i} className={`fb ${f.kind}`}>{f.text}</p>)}
      <div className="grid">
        <section><h2>👥 Live roster ({students.filter((s: any)=>s.connected).length} online)</h2>
          <table><thead><tr><th>Student</th><th>Status</th><th>Zone</th><th>Score</th><th>Attempts</th><th>Discoveries</th></tr></thead>
          <tbody>{students.map((p: any) => <tr key={p.id}><td>{p.nickname}</td><td>{p.connected ? "🟢 online" : "⚪ away"}</td><td>{p.zone}</td><td>{p.score}</td><td>{p.attempts}</td><td>{p.discoveries ? p.discoveries.split(",").length : 0}/3</td></tr>)}</tbody></table>
          {!students.length && <p>No students yet — share the class code.</p>}
          <h3>📊 Metrics · <Elapsed start={snap.elapsedStart} /></h3><p>Math attempts {snap.mathAttempts} · complete {String(snap.mathComplete)}<br/>Science H₂O attempts {snap.scienceAttempts} · complete {String(snap.scienceComplete)}<br/>Science CO₂ attempts {snap.science2Attempts} · complete {String(snap.science2Complete)}<br/>Heritage attempts {snap.heritageAttempts} · discoveries {snap.heritageFound.length}/3</p>
          <h3>🎯 Common errors (auto-classified)</h3><p>➗ Fraction moves past 1 whole: <b>{snap.mathTooBig}</b><br/>🔬 Atoms in wrong/filled positions: <b>{snap.scienceBadSlot}</b><br/>🏛️ Wrong heritage answers: <b>{snap.heritageWrong}</b></p>
        </section>
        <section><h2>🎛️ Controls (server-validated)</h2>
          <div className="btnrow">{[["lobby","🏫 Send class to Campus"],["math","➗ Start Math"],["science","🔬 Start Science"],["heritage","🏛️ Start Heritage"],["summary","🏁 End → Summary"]].map(([a,l]) => <button key={a} onClick={() => cmd("setActivity", { activity: a })}>{l}</button>)}</div>
          <div className="btnrow"><button onClick={() => cmd("broadcastHint")}>💡 Broadcast hint</button>
          <button onClick={() => cmd("nextMathPuzzle")}>⏭️ Next math puzzle</button><button onClick={() => cmd("resetMath")}>↺ Reset Math</button><button onClick={() => cmd("resetScience")}>↺ Reset Science</button><button onClick={() => cmd("resetHeritage")}>↺ Reset Heritage</button></div>
          <form onSubmit={(e) => { e.preventDefault(); cmd("announce", { text: ann }); setAnn(""); }}>
            <input value={ann} onChange={(e) => setAnn(e.target.value)} maxLength={140} placeholder="Announcement to whole class" /><button className="primary">📣 Send</button></form>
          <button className="primary" onClick={() => downloadRecap(snap)}>⬇️ Download session recap (.txt)</button>
          <h3>📰 Activity feed</h3><div className="feed">{[...snap.feed].reverse().map((f, i) => <p key={i}>{f}</p>)}</div>
        </section>
      </div>
    </main>
  );
}
