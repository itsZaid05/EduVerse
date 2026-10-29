import React, { useEffect, useRef } from "react";
import type { Room } from "colyseus.js";
import type { Snap } from "../network/client";
import { HOTSPOTS } from "../games/content";
import MathStudio from "./MathStudio";
import Campus from "./Campus";
import ScienceLab from "./ScienceLab";
import HeritageExplorer from "./HeritageExplorer";

export type Zone = "campus" | "math" | "science" | "heritage";
const COLORS = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#9b5de5", "#f15bb5"];

/** One persistent A-Frame scene (no duplicate canvases on zone change). Zones are
 *  swapped entity groups; the camera rig is moved by WASD + mouse look-controls. */
export default function World({ room, snap, zone, onEnterZone, onHotspot, mathSelected, onSelectPiece, onPlaceBoard, sciSelected, onSelectAtom, onSelectSlot, onClue }: {
  room: Room; snap: Snap; zone: Zone;
  onEnterZone: (z: Zone) => void; onHotspot: (id: string) => void;
  mathSelected?: string | null; onSelectPiece?: (id: string) => void; onPlaceBoard?: () => void;
  sciSelected?: string | null; onSelectAtom?: (id: string) => void; onSelectSlot?: (slot: "center" | "left" | "right") => void;
  onClue?: (id: string) => void;
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
        if (zone === "heritage") { // keep players out of the monument footprints
          for (const o of [{ x: -6, z: -11.5, r: 3.6 }, { x: 7, z: -8.6, r: 3.9 }]) {
            const ddx = pos.current.x - o.x, ddz = pos.current.z - o.z; const d = Math.hypot(ddx, ddz);
            if (d < o.r && d > 0.001) { pos.current.x = o.x + (ddx / d) * o.r; pos.current.z = o.z + (ddz / d) * o.r; }
          }
        }
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

      {zone === "heritage" && <HeritageExplorer snap={snap} onHotspot={onHotspot} onClue={onClue || (() => {})} />}
    </a-scene>
  );
}
