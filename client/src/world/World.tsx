import React, { useEffect, useRef } from "react";
import type { Room } from "colyseus.js";
import type { Snap } from "../network/client";
import { HOTSPOTS } from "../games/content";
import MathStudio from "./MathStudio";
import Campus from "./Campus";
import ScienceLab from "./ScienceLab";

export type Zone = "campus" | "math" | "science" | "heritage";
const COLORS = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#9b5de5", "#f15bb5"];

/** One persistent A-Frame scene (no duplicate canvases on zone change). Zones are
 *  swapped entity groups; the camera rig is moved by WASD + mouse look-controls. */
export default function World({ room, snap, zone, onEnterZone, onHotspot, mathSelected, onSelectPiece, onPlaceBoard, sciSelected, onSelectAtom, onSelectSlot }: {
  room: Room; snap: Snap; zone: Zone;
  onEnterZone: (z: Zone) => void; onHotspot: (id: string) => void;
  mathSelected?: string | null; onSelectPiece?: (id: string) => void; onPlaceBoard?: () => void;
  sciSelected?: string | null; onSelectAtom?: (id: string) => void; onSelectSlot?: (slot: "center" | "left" | "right") => void;
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
        // Campus is a bounded courtyard: portals/buildings sit beyond the
        // walkable plaza (they are entered by click, not by walking through).
        const bx = zone === "campus" ? 15.5 : 18;
        const bzMin = zone === "campus" ? -6.2 : -18, bzMax = zone === "campus" ? 15 : 18;
        pos.current.x = Math.max(-bx, Math.min(bx, pos.current.x + dx));
        pos.current.z = Math.max(bzMin, Math.min(bzMax, pos.current.z + dz));
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
    <a-scene embedded vr-mode-ui="enabled: false" renderer="antialias: true; shadowMapEnabled: true; shadowMapType: pcfsoft" style={{ width: "100%", height: "100%" }}>
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

      {zone === "campus" && <Campus snap={snap} onEnterZone={onEnterZone} />}

      {zone === "math" && <MathStudio snap={snap} selectedId={mathSelected ?? null} onSelectPiece={onSelectPiece || (() => {})} onPlaceBoard={onPlaceBoard || (() => {})} />}

      {zone === "science" && <ScienceLab snap={snap} selectedAtom={sciSelected ?? null} onSelectAtom={onSelectAtom || (() => {})} onSelectSlot={onSelectSlot || (() => {})} />}

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
