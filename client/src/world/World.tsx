import React, { useEffect, useRef } from "react";
import type { Room } from "colyseus.js";
import type { Snap } from "../network/client";
import { FRACTION_PIECES, FRACTION_PUZZLES, HOTSPOTS } from "../games/content";

export type Zone = "campus" | "math" | "science" | "heritage";
const COLORS = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#9b5de5", "#f15bb5"];

/** One persistent A-Frame scene (no duplicate canvases on zone change). Zones are
 *  swapped entity groups; the camera rig is moved by WASD + mouse look-controls. */
export default function World({ room, snap, zone, onEnterZone, onHotspot }: {
  room: Room; snap: Snap; zone: Zone;
  onEnterZone: (z: Zone) => void; onHotspot: (id: string) => void;
}) {
  const rig = useRef<any>(null);
  const remoteEls = useRef(new Map<string, any>());
  const remotePos = useRef(new Map<string, { x: number; z: number }>());
  const remoteTarget = useRef(new Map<string, { x: number; z: number }>());
  const pos = useRef({ x: 0, z: 8 });
  const keys = useRef<Record<string, boolean>>({});
  const lastSent = useRef(0);

  useEffect(() => { pos.current = { x: 0, z: zone === "campus" ? 8 : 6 }; }, [zone]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    window.addEventListener("blur", () => { keys.current = {}; });
    let raf = 0; const loop = () => {
      const el = rig.current; const k = keys.current; const s = 0.09;
      // Camera-relative movement: W walks where the camera faces.
      const cam: any = el?.querySelector("a-camera");
      const yaw = cam?.object3D?.rotation?.y || 0;
      const f = (k["w"] || k["arrowup"] ? 1 : 0) - (k["s"] || k["arrowdown"] ? 1 : 0);
      const r = (k["d"] || k["arrowright"] ? 1 : 0) - (k["a"] || k["arrowleft"] ? 1 : 0);
      const dx = (-Math.sin(yaw) * f + Math.cos(yaw) * r) * s;
      const dz = (-Math.cos(yaw) * f - Math.sin(yaw) * r) * s;
      if (dx || dz) {
        pos.current.x = Math.max(-18, Math.min(18, pos.current.x + dx));
        pos.current.z = Math.max(-18, Math.min(18, pos.current.z + dz));
      }
      if (el) el.setAttribute("position", `${pos.current.x} 0 ${pos.current.z}`);
      // Smooth remote avatars: lerp each towards its latest server position.
      remoteTarget.current.forEach((t, id) => {
        const ent = remoteEls.current.get(id); const cur = remotePos.current.get(id);
        if (!ent || !cur) return;
        cur.x += (t.x - cur.x) * 0.25; cur.z += (t.z - cur.z) * 0.25;
        ent.setAttribute("position", `${cur.x} 0 ${cur.z}`);
      });
      const now = performance.now();
      if (now - lastSent.current > 150 && (dx || dz)) { lastSent.current = now; room.send("move", { zone, x: pos.current.x, z: pos.current.z, rotY: Math.round((yaw * 180) / Math.PI) }); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [room, zone]);

  const remotes = snap.players.filter((p) => p.id !== room.sessionId && p.zone === zone && p.connected);
  useEffect(() => { remotes.forEach((p) => remoteTarget.current.set(p.id, { x: p.x, z: p.z })); });

  return (
    <a-scene embedded vr-mode-ui="enabled: false" renderer="antialias: true" style={{ width: "100%", height: "100%" }}>
      <a-sky color={zone === "heritage" ? "#ffe8c9" : "#aee7ff"} />
      <a-entity light="type: ambient; intensity: 0.8" />
      <a-entity light="type: directional; intensity: 0.7" position="5 10 5" />
      <a-entity ref={rig} position="0 0 8">
        <a-camera look-controls="pointerLockEnabled: false" wasd-controls="enabled: false" position="0 1.6 0">
          <a-entity cursor="rayOrigin: mouse" raycaster="objects: .clickable" />
        </a-camera>
      </a-entity>

      {remotes.map((p, i) => (
        <a-entity key={p.id} rotation={`0 ${p.rotY || 0} 0`} ref={(el: any) => { if (el) { remoteEls.current.set(p.id, el); if (!remotePos.current.has(p.id)) { remotePos.current.set(p.id, { x: p.x, z: p.z }); el.setAttribute("position", `${p.x} 0 ${p.z}`); } } else { remoteEls.current.delete(p.id); remotePos.current.delete(p.id); remoteTarget.current.delete(p.id); } }}>
          <a-cylinder color={COLORS[i % COLORS.length]} height="1.1" radius="0.32" position="0 0.85 0" />
          <a-sphere color="#ffdfc4" radius="0.26" position="0 1.65 0" />
          <a-text value={p.nickname} align="center" color="#14324a" position="0 2.1 0" scale="1.4 1.4 1.4" />
        </a-entity>
      ))}

      {zone === "campus" && (
        <a-entity>
          <a-plane rotation="-90 0 0" width="40" height="40" color="#8ed081" />
          <a-circle rotation="-90 0 0" radius="4" color="#f4e9d8" position="0 0.02 0" />
          <a-box position="-10 2 -12" width="8" height="4" depth="4" color="#ffd166" />
          <a-box position="10 2.5 -12" width="7" height="5" depth="4" color="#ef476f" />
          <a-box position="0 1.5 -14" width="10" height="3" depth="3" color="#118ab2" />
          <a-text value="EDUVERSE SCHOOL" align="center" position="0 4 -13.8" color="#14324a" scale="3 3 3" />
          <a-box position="-5 1 2" width="3" height="2" depth="0.4" color="#6a4c93" />
          <a-text value={"QUEST BOARD\nTeam score updates here!"} align="center" position="-5 1.4 2.3" color="#fff" scale="0.9 0.9 0.9" />
          {([["math", -9, -4, "#ef476f", "MATH LAB\nFraction Forge"], ["science", 0, -6, "#06d6a0", "SCIENCE LAB\nMolecule Builder"], ["heritage", 9, -4, "#ffb703", "HERITAGE\nQutb Minar"]] as const).map(([z, x, zz, c, label]) => (
            <a-entity key={z} position={`${x} 0 ${zz}`}>
              <a-box class="clickable" width="3" height="4" depth="0.6" color={c} position="0 2 0" onClick={() => onEnterZone(z as Zone)} />
              <a-text value={label} align="center" position="0 2.2 0.4" color="#fff" scale="1.1 1.1 1.1" />
            </a-entity>
          ))}
          <a-text value="Click a portal (or use the buttons) to travel" align="center" position="0 3 6" color="#14324a" scale="1.6 1.6 1.6" />
        </a-entity>
      )}

      {zone === "math" && (() => { const pz = FRACTION_PUZZLES.find((x) => x.id === snap.mathPuzzle) || FRACTION_PUZZLES[0]; const placedPz = pz.pieces.filter((pc) => snap.mathPlaced.includes(pc.id)); let fx = -4; return (
        <a-entity>
          <a-plane rotation="-90 0 0" width="40" height="40" color="#dbeafe" />
          <a-box position="0 1 -8" width="12" height="4" depth="0.4" color="#14324a" />
          <a-text value={`FRACTION FORGE — ${pz.title}!`} align="center" position="0 2.6 -7.7" color="#fff" scale="1.6 1.6 1.6" />
          <a-box position="0 0.5 -4" width="9" height="0.3" depth="0.3" color="#333" />
          {placedPz.map((pc) => { const w = (pc.value / pz.target) * 8; const x = fx + w / 2; fx += w; return <a-box key={pc.id} position={`${x} 1.1 -4`} width={w - 0.06} height="0.9" depth="0.5" color={pc.color} />; })}
          {pz.pieces.map((pc, i) => (
            <a-entity key={pc.id} position={`${-6 + i * 3} 0 -1`}>
              <a-box class="clickable" width="1.6" height="1" depth="0.6" color={snap.mathPlaced.includes(pc.id) ? "#999" : pc.color} position="0 1 0"
                onClick={() => room.send("placeFraction", { pieceId: pc.id })} />
              <a-text value={pc.label} align="center" position="0 1 0.35" color="#fff" scale="1.3 1.3 1.3" />
            </a-entity>
          ))}
        </a-entity> ); })()}

      {zone === "science" && (() => { const co2 = snap.scienceLevel === "co2"; const placed = co2 ? snap.science2Placed : snap.sciencePlaced; const done = co2 ? snap.science2Complete : snap.scienceComplete; const filled = (slot: string) => Object.values(placed).includes(slot); return (
        <a-entity>
          <a-plane rotation="-90 0 0" width="40" height="40" color="#dcfce7" />
          <a-text value={co2 ? "MOLECULE BUILDER — Build CO2: 1 Carbon + 2 Oxygen (straight line)" : "MOLECULE BUILDER — Build H2O: 2 Hydrogen + 1 Oxygen"} align="center" position="0 3.4 -7" color="#14532d" scale="1.5 1.5 1.5" />
          <a-sphere position="0 1.6 -5" radius={co2 ? 0.6 : 0.75} color={filled("center") ? (co2 ? "#343a40" : "#e63946") : "#d8dee9"} />
          <a-text value={co2 ? "C slot" : "O slot"} align="center" position="0 2.6 -5" color="#14532d" />
          <a-sphere position="-2.2 1.2 -5" radius="0.45" color={filled("left") ? (co2 ? "#e63946" : "#457b9d") : "#cfe8f5"} />
          <a-sphere position="2.2 1.2 -5" radius="0.45" color={filled("right") ? (co2 ? "#e63946" : "#457b9d") : "#cfe8f5"} />
          <a-text value={co2 ? "O slot" : "H slot"} align="center" position="-2.2 1.9 -5" color="#14532d" /><a-text value={co2 ? "O slot" : "H slot"} align="center" position="2.2 1.9 -5" color="#14532d" />
          {done && <a-entity><a-box position="-1.1 1.4 -5" width="2.2" height="0.12" depth="0.12" rotation="0 0 25" color="#333" /><a-box position="1.1 1.4 -5" width="2.2" height="0.12" depth="0.12" rotation="0 0 -25" color="#333" /><a-text value={co2 ? "CO2" : "H2O"} align="center" position="0 0.5 -5" color="#14532d" scale="2 2 2" /></a-entity>}
          <a-text value="Use the panel: switch level, pick an atom, then its position" align="center" position="0 2.8 2" color="#14532d" scale="1.2 1.2 1.2" />
        </a-entity> ); })()}

      {zone === "heritage" && (
        <a-entity>
          <a-plane rotation="-90 0 0" width="40" height="40" color="#e9d8a6" />
          <a-text value="QUTB MINAR COMPLEX — stylized educational reconstruction (not to scale)" align="center" position="0 3.2 8" color="#7f4f24" scale="1.4 1.4 1.4" />
          {/* Tapered fluted tower: stacked, shrinking cylinders + decorative bands */}
          <a-entity position="-6 0 -12">
            {[0, 1, 2, 3, 4].map((i) => <a-cylinder key={i} position={`0 ${1.5 + i * 3} 0`} height="3" radiusTop={1.5 - i * 0.22} radiusBottom={1.72 - i * 0.22} color={i % 2 ? "#b5654a" : "#c97b5a"} />)}
            {[0, 1, 2, 3].map((i) => <a-torus key={i} position={`0 ${3 + i * 3} 0`} radius={1.62 - i * 0.22} tube="0.09" rotation="90 0 0" color="#8a4b2f" />)}
            <a-cone position="0 16 0" height="1.6" radius="0.7" color="#7f4f24" />
          </a-entity>
          {/* Alai Darwaza: domed gateway */}
          <a-entity position="7 0 -8">
            <a-box width="4" height="3" depth="1" color="#b5654a" position="0 1.5 0" />
            <a-sphere radius="1.6" position="0 3.2 0" color="#e9d8a6" />
            <a-box width="1.4" height="2.2" depth="1.1" color="#5b3a29" position="0 1.1 0" />
          </a-entity>
          <a-box position="0 1 -14" width="16" height="2" depth="2" color="#cbb593" />
          {(() => { const pts: [number, number][] = [[0, 8], ...HOTSPOTS.map((h) => [h.pos[0], h.pos[2]] as [number, number])]; const discs: [number, number][] = []; for (let i = 0; i < pts.length - 1; i++) { for (let t = 0.25; t < 1; t += 0.25) discs.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]); } return discs.map(([x, z], i) => <a-circle key={i} rotation="-90 0 0" radius="0.28" color="#ffd60a" position={`${x} 0.03 ${z}`} />); })()}
          {HOTSPOTS.map((h, hi) => (
            <a-entity key={h.id} position={`${h.pos[0]} 0 ${h.pos[2]}`}>
              <a-sphere class="clickable" radius="0.45" color={snap.heritageFound.includes(h.id) ? "#06d6a0" : "#ffd60a"} position="0 1.6 0" onClick={() => onHotspot(h.id)}
                {...(snap.heritageFound.includes(h.id) ? {} : { animation: "property: position; to: 0 1.9 0; dir: alternate; loop: true; dur: 1200" })} />
              <a-text value={snap.heritageFound.includes(h.id) ? `✓ ${hi + 1}. ${h.title}` : `${hi + 1}. ${h.title}`} align="center" position="0 2.3 0" color="#5b3a29" scale="1.1 1.1 1.1" />
            </a-entity>
          ))}
        </a-entity>
      )}
    </a-scene>
  );
}
