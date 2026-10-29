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
  const [mathSel, setMathSel] = useState<string | null>(null);
  const [sciSel, setSciSel] = useState<string | null>(null);
  const [sciMsg, setSciMsg] = useState("Select an atom from the tray, then click its target slot.");
  const [mathMsg, setMathMsg] = useState("Select a fraction piece from the tray, then place it on the forge board.");
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
  const mathPz = FRACTION_PUZZLES.find((x) => x.id === snap.mathPuzzle) || FRACTION_PUZZLES[0];
  const pieceById = (id: string) => mathPz.pieces.find((x) => x.id === id);
  const selectPiece = (id: string) => {
    const pc = pieceById(id); if (!pc) return;
    if (snap.mathPlaced.includes(id)) { setMathMsg(`${pc.label} is already on the board — pieces cannot be placed twice.`); return; }
    if (snap.mathComplete) { setMathMsg("This puzzle is complete. Your teacher can rotate or reset it."); return; }
    if (mathSel === id) { room.send("placeFraction", { pieceId: id }); setMathSel(null); setMathMsg(`Placing ${pc.label}…`); return; }
    setMathSel(id); setMathMsg(`Selected ${pc.label} (${Math.round(pc.value * 12)}/12). Now click the forge board — or click the piece again — to place it.`);
  };
  const placeSelected = () => {
    if (!mathSel) { setMathMsg("Select a piece from the tray first, then place it."); return; }
    room.send("placeFraction", { pieceId: mathSel }); setMathSel(null); setMathMsg("Placing…");
  };
  useEffect(() => { setMathSel(null); }, [snap.mathPuzzle, snap.mathPlaced.join(","), zone]); // eslint-disable-line
  const sciLvl = (snap.scienceLevel === "co2" ? "co2" : "h2o") as "h2o" | "co2";
  const sciMol = MOLECULES[sciLvl];
  const sciPlaced = sciLvl === "co2" ? snap.science2Placed : snap.sciencePlaced;
  const sciDone = sciLvl === "co2" ? snap.science2Complete : snap.scienceComplete;
  const sciAttempts = sciLvl === "co2" ? snap.science2Attempts : snap.scienceAttempts;
  const selectAtom = (id: string) => {
    const atom = sciMol.atoms.find(([a]) => a === id); if (!atom) return;
    if (id in sciPlaced) { setSciMsg(`${atom[1]} is already placed — each atom can be used only once.`); return; }
    if (sciDone) { setSciMsg("This molecule is complete. Ask your teacher for a reset to build it again."); return; }
    setSciSel(id); setSciMsg(`Selected ${atom[1]}. Now click the matching target slot on the assembly station.`);
  };
  const selectSlot = (slot: "center" | "left" | "right") => {
    if (!sciSel) { setSciMsg("Select an atom from the tray first, then click a target slot."); return; }
    room.send("placeAtom", { atomId: sciSel, slotId: slot, level: sciLvl }); setSciSel(null); setSciMsg("Placing…");
  };
  useEffect(() => { setSciSel(null); }, [sciLvl, JSON.stringify(sciPlaced), zone]); // eslint-disable-line

  return (
    <main className="layout">
      <section className="stage">
        <World room={room} snap={snap} zone={zone} onEnterZone={enter} onHotspot={setHotspot} mathSelected={mathSel} onSelectPiece={selectPiece} onPlaceBoard={placeSelected} sciSelected={sciSel} onSelectAtom={selectAtom} onSelectSlot={selectSlot} />
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

        {zone === "campus" && <div className="mission">
          <h2>Quest Board</h2>
          <p className="obj">Choose a portal to start a mission. Team progress so far:</p>
          <div className="questrows">
            <div className="questrow"><span>➗ Math Lab — Fraction Forge</span><b>{snap.mathDone.length ? `${snap.mathDone.length}/2 puzzles scored` : "Not started"}</b></div>
            <div className="questrow"><span>🔬 Science Lab — Molecule Builder</span><b>{snap.scienceComplete || snap.science2Complete ? `H₂O ${snap.scienceComplete ? "✓" : "…"} · CO₂ ${snap.science2Complete ? "✓" : "…"}` : "Not started"}</b></div>
            <div className="questrow"><span>🏛️ Heritage Explorer — Qutb Minar</span><b>{snap.heritageFound.length ? `${snap.heritageFound.length}/3 discoveries` : "Not started"}</b></div>
          </div>
          <p className="meta">Team score: <b>{snap.teamScore}</b> · Activity: <b>{snap.activity === "lobby" ? "Free explore" : snap.activity}</b></p>
          {snap.announcement ? <p className="selmsg">📣 {snap.announcement}</p> : <p className="selmsg">No active announcements. Your teacher's notices will appear here.</p>}
          <h3>Recent updates</h3>
          {snap.feed.length ? <div className="feed">{[...snap.feed].slice(-4).reverse().map((f: string, i: number) => <p key={i}>{f}</p>)}</div> : <p className="fine">No recent activity yet.</p>}
          <h3>Players on campus</h3>
          <p>{snap.players.filter((p: any) => p.connected && p.zone === "campus").map((p: any) => p.nickname).join(", ") || "Just you for now — classmates will appear here."}</p>
        </div>}

        {zone === "math" && (() => { const pz = mathPz; const units = snap.mathPlaced.reduce((t: number, id: string) => t + Math.round((pieceById(id)?.value || 0) * 12), 0); const tUnits = Math.round(pz.target * 12); const gcd = (x: number, y: number): number => (y ? gcd(y, x % y) : x); const g = gcd(units, 12) || 1; const cells: (string | null)[] = Array(12).fill(null); let cur = 0; snap.mathPlaced.forEach((id: string) => { const pc = pieceById(id); if (!pc) return; for (let i = 0; i < Math.round(pc.value * 12) && cur < 12; i++) cells[cur++] = pc.color; }); const placedLabels = snap.mathPlaced.map((id: string) => pieceById(id)?.label).filter(Boolean); return <div className="mission">
          <h2>Fraction Forge</h2>
          <p className="obj">Make one whole using the given pieces.</p>
          <div className="targetrow"><span>Target: <b>{pz.targetLabel === "1" ? "1/1" : pz.targetLabel} = {tUnits}/12</b></span><span>Current: <b>{units}/12{units > 0 && units !== 12 ? ` = ${units / g}/${12 / g}` : ""}{snap.mathComplete ? " · 1 whole" : ""}</b></span></div>
          <div className="cells" role="img" aria-label={`Progress ${units} of ${tUnits} twelfths`}>{cells.map((c, i) => <span key={i} className={i >= tUnits ? "cell beyond" : "cell"} style={c ? { background: c } : undefined} />)}</div>
          <p className="meta">Attempts: {snap.mathAttempts} · Hints used: {Math.min(snap.mathHint, 3)}/3 · Pieces placed: {snap.mathPlaced.length}</p>
          <p className="selmsg" role="status">{mathMsg}</p>
          <div className="traydom">
            {pz.pieces.map((pc) => { const used = snap.mathPlaced.includes(pc.id); return <button key={pc.id} className={`piecebtn${mathSel === pc.id ? " sel" : ""}${used ? " used" : ""}`} style={{ flexGrow: Math.round(pc.value * 12), borderColor: pc.color }} onClick={() => selectPiece(pc.id)} aria-pressed={mathSel === pc.id}>{pc.label}<small>{used ? "used" : `${Math.round(pc.value * 12)}/12`}</small></button>; })}
          </div>
          <div className="btnrow"><button className="primary placebtn" onClick={placeSelected} disabled={!mathSel || snap.mathComplete}>Place selected piece on board</button></div>
          <div className="btnrow"><button onClick={() => room.send("hint", { zone: "math" })}>Hint ({Math.min(snap.mathHint, 3)}/3)</button><button onClick={() => room.send("aiHint", { subject: "math", mistake: "fraction-sum" })}>Ask AI hint</button></div>
          {snap.mathComplete && <div className="complete"><h3>Puzzle complete</h3><p className="eq">{placedLabels.join(" + ")} = {pz.targetLabel === "1" ? "1 whole" : pz.targetLabel}</p><p>{pz.explanation}</p><div className="btnrow"><button onClick={() => enter("campus")}>Back to campus</button><button onClick={() => enter("science")}>Next: Science Lab</button></div></div>}
          <p className="fine">Puzzles scored: {FRACTION_PUZZLES.map((x) => `${snap.mathDone.includes(x.id) ? "✅" : "⬜"} ${x.title}`).join(" · ")}</p>
        </div>; })()}

        {zone === "science" && <div className="mission">
          <p className="kicker">SCIENCE LAB</p><h2>MOLECULE BUILDER</h2>
          <p className="obj">{sciMol.title}. {sciMol.mission}</p>
          <div className="btnrow">{(["h2o", "co2"] as const).map((l) => <button key={l} className={sciLvl === l ? "on" : ""} onClick={() => room.send("setScienceLevel", { level: l })}>{l === "h2o" ? "💧 H₂O" : "🫧 CO₂"}{l === "h2o" && snap.scienceComplete ? " ✅" : l === "co2" && snap.science2Complete ? " ✅" : ""}</button>)}</div>
          <p className="meta">Progress: <b>{Object.keys(sciPlaced).length}/3 atoms placed</b> · Attempts: {sciAttempts} · Hints used: {Math.min(snap.scienceHint, 3)}/3</p>
          <div className="cells" role="img" aria-label={`Progress ${Object.keys(sciPlaced).length} of 3 atoms`}>{["center", "left", "right"].map((sl) => <span key={sl} className="cell" style={Object.values(sciPlaced).includes(sl) ? { background: "#2a9d6f", flex: 1 } : { flex: 1 }} />)}</div>
          <p className="selmsg" role="status">{sciMsg}</p>
          <h3>Atom inventory</h3>
          <div className="traydom">
            {sciMol.atoms.map(([id, label]) => { const used = id in sciPlaced; return <button key={id} className={`piecebtn${sciSel === id ? " sel" : ""}${used ? " used" : ""}`} style={{ flex: 1 }} onClick={() => selectAtom(id)} aria-pressed={sciSel === id}>{label}<small>{used ? "used" : "available"}</small></button>; })}
          </div>
          <h3>Target slots</h3>
          <div className="btnrow">{([["center", sciLvl === "co2" ? "C — centre" : "O — centre"], ["left", sciLvl === "co2" ? "O — left" : "H — left"], ["right", sciLvl === "co2" ? "O — right" : "H — right"]] as const).map(([sl, label]) => <button key={sl} disabled={Object.values(sciPlaced).includes(sl)} onClick={() => selectSlot(sl)}>{label}{Object.values(sciPlaced).includes(sl) ? " ✓" : ""}</button>)}</div>
          <div className="howto"><h3>HOW TO PLAY</h3><ol>
            <li className={!sciSel && !sciDone ? "step-on" : ""}>Select an atom from the tray.</li>
            <li className={sciSel ? "step-on" : ""}>Click the matching target position.</li>
            <li>Complete {sciMol.formula} using {sciLvl === "co2" ? "one C and two O" : "one O and two H"} atoms.</li>
            <li>Use hints if you need help.</li></ol></div>
          <div className="btnrow"><button onClick={() => room.send("hint", { zone: "science" })}>Hint ({Math.min(snap.scienceHint, 3)}/3)</button><button onClick={() => room.send("aiHint", { subject: "science", mistake: "atom-count" })}>Ask AI hint</button><button onClick={() => room.send("requestReset", { zone: "science" })}>Request reset</button></div>
          {sciDone && <div className="complete"><h3>MOLECULE COMPLETE!</h3><p className="eq">{sciMol.formula} — {sciLvl === "co2" ? "Carbon dioxide" : "Water"}</p><p>{sciMol.explanation}</p><div className="btnrow"><button onClick={() => enter("campus")}>Back to campus</button><button onClick={() => enter("heritage")}>Next: Heritage Explorer</button></div></div>}
        </div>}

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
