import React from "react";
import type { Snap } from "../network/client";
import { MOLECULES } from "../games/content";

/**
 * Molecule Builder (Transformation 03). Presentation + selection only:
 * placements are submitted via onSelectSlot -> room.send("placeAtom") and
 * validated by the server; this component renders the authoritative
 * snapshot (placed atoms, and bonds derived only from accepted placements).
 */
const NAVY = "#20334d";
type SlotId = "center" | "left" | "right";
const SLOT_POS: Record<SlotId, [number, number, number]> = { center: [0, 1.62, -5], left: [-2.1, 1.3, -5], right: [2.1, 1.3, -5] };
const ATOM_STYLE: Record<string, { color: string; r: number; text: string }> = {
  O: { color: "#d63a3a", r: 0.48, text: "#ffffff" },
  H: { color: "#eaf4fb", r: 0.38, text: "#22344d" },
  C: { color: "#3a4149", r: 0.46, text: "#ffffff" },
};
const letterOf = (label: string) => label.split(" ")[0];
const slotAtom = (placed: Record<string, string>, slot: SlotId) =>
  Object.entries(placed).find(([, s]) => s === slot)?.[0];

function Bond({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const [mx, my, mz] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const rotZ = (-Math.atan2(dx, dy) * 180) / Math.PI;
  return <a-cylinder position={`${mx} ${my} ${mz}`} radius="0.09" height={len} rotation={`0 0 ${rotZ}`} color="#8fa8bf" shadow="cast: true" />;
}

export default function ScienceLab({ snap, selectedAtom, onSelectAtom, onSelectSlot }: {
  snap: Snap; selectedAtom: string | null;
  onSelectAtom: (id: string) => void; onSelectSlot: (slot: SlotId) => void;
}) {
  const lvl = (snap.scienceLevel === "co2" ? "co2" : "h2o") as "h2o" | "co2";
  const mol = MOLECULES[lvl];
  const placed = lvl === "co2" ? snap.science2Placed : snap.sciencePlaced;
  const done = lvl === "co2" ? snap.science2Complete : snap.scienceComplete;
  const atomById = Object.fromEntries(mol.atoms.map(([id, label]) => [id, { label, letter: letterOf(label) }]));
  const slotLetter: Record<SlotId, string> = lvl === "co2"
    ? { center: "C", left: "O", right: "O" } : { center: "O", left: "H", right: "H" };
  const slotName: Record<SlotId, string> = lvl === "co2"
    ? { center: "C — Carbon", left: "O — Oxygen", right: "O — Oxygen" } : { center: "O — Oxygen", left: "H — Hydrogen", right: "H — Hydrogen" };

  return (
    <a-entity>
      <a-entity light="type: hemisphere; skyColor: #ffffff; groundColor: #6f7a72; intensity: 0.55" />
      <a-entity light="type: directional; intensity: 0.85; castShadow: true; shadowMapWidth: 1024; shadowMapHeight: 1024; shadowCameraLeft: -13; shadowCameraRight: 13; shadowCameraTop: 13; shadowCameraBottom: -13" position="6 11 5" />

      {/* ---------- laboratory shell ---------- */}
      <a-plane rotation="-90 0 0" width="40" height="40" color="#dde3e6" shadow="receive: true" />
      {[-9, -6, -3, 0, 3, 6, 9].map((x) => <a-box key={x} position={`${x} 0.012 -3`} width="0.05" height="0.012" depth="24" color="#c6ced2" />)}
      <a-box position="0 4.2 -10.8" width="30" height="8.4" depth="0.4" color="#31445c" />
      {[-8, 8].map((x) => <a-box key={x} position={`${x} 4.2 -10.5`} width="8" height="5.6" depth="0.12" color="#3d546e" />)}
      <a-box position="0 3 -10.4" width="24" height="0.18" depth="0.1" material="color: #bfeef2; emissive: #7fd4dc; emissiveIntensity: 0.5" />
      {/* title board */}
      <a-box position="0 5.6 -10.35" width="11" height="2.3" depth="0.15" color={NAVY} shadow="cast: true" />
      <a-text value="MOLECULE BUILDER" align="center" position="0 6.15 -10.2" color="#ffffff" scale="2 2 2" />
      <a-text value={mol.title} align="center" position="0 5.25 -10.2" color="#9fd8de" scale="1.05 1.05 1.05" />
      {/* left diagram board */}
      <a-entity position="-7.6 0 -10.3">
        <a-box position="0 3.4 0" width="4.6" height="3" depth="0.12" color={NAVY} />
        <a-circle position="0 3.85 0.09" radius="0.42" color="#d63a3a" /><a-text value="O" align="center" position="0 3.85 0.12" color="#fff" scale="0.9 0.9 0.9" />
        <a-circle position="-1.1 2.9 0.09" radius="0.3" color="#eaf4fb" /><a-text value="H" align="center" position="-1.1 2.9 0.12" color={NAVY} scale="0.7 0.7 0.7" />
        <a-circle position="1.1 2.9 0.09" radius="0.3" color="#eaf4fb" /><a-text value="H" align="center" position="1.1 2.9 0.12" color={NAVY} scale="0.7 0.7 0.7" />
        <a-box position="-0.55 3.38 0.08" width="1.15" height="0.07" depth="0.02" rotation="0 0 38" color="#8fa8bf" />
        <a-box position="0.55 3.38 0.08" width="1.15" height="0.07" depth="0.02" rotation="0 0 -38" color="#8fa8bf" />
        <a-text value={lvl === "co2" ? "CO₂ — Carbon dioxide" : "H₂O — Water"} align="center" position="0 2.25 0.1" color="#ffffff" scale="0.85 0.85 0.85" />
      </a-entity>
      {/* right shelves with glassware */}
      <a-entity position="7.8 0 -9.6">
        {[1.6, 2.7, 3.8].map((y) => <a-box key={y} position={`0 ${y} 0`} width="4.4" height="0.1" depth="0.9" color="#5a6f83" />)}
        {[-1.6, -0.6, 0.5, 1.5].map((x, i) => <a-cylinder key={i} position={`${x} 1.93 0`} radius="0.16" height="0.55" material="color: #a8d8de; transparent: true; opacity: 0.65" />)}
        {[-1.2, 0.2, 1.3].map((x, i) => <a-cylinder key={i} position={`${x} 3.05 0`} radius="0.13" height="0.45" material="color: #c3e2b8; transparent: true; opacity: 0.65" />)}
        <a-cone position="0.8 4.25 0" radius="0.22" height="0.5" material="color: #a8d8de; transparent: true; opacity: 0.65" />
      </a-entity>
      {/* cabinets along the left */}
      {[-8.6, -6.2].map((x) => (
        <a-entity key={x} position={`${x} 0 -5`}>
          <a-box position="0 1.1 0" width="2.1" height="2.2" depth="1" color="#48707a" shadow="cast: true" />
          <a-box position="0 2.32 0" width="2.3" height="0.14" depth="1.15" color="#d8dee2" />
        </a-entity>
      ))}

      {/* ---------- assembly station ---------- */}
      <a-cylinder position="0 0.28 -5" radius="3.5" height="0.56" radialSegments={6} color="#37485e" shadow="cast: true; receive: true" />
      <a-circle rotation="-90 0 0" radius="3.3" color="#46597a" position="0 0.57 -5" />
      <a-torus rotation="90 0 0" radius="3.3" tube="0.045" position="0 0.6 -5" material="color: #57c7cf; emissive: #57c7cf; emissiveIntensity: 0.35" />
      {/* bonds first (behind atoms), only between accepted placements */}
      {slotAtom(placed, "center") && slotAtom(placed, "left") && <Bond from={SLOT_POS.center} to={SLOT_POS.left} />}
      {slotAtom(placed, "center") && slotAtom(placed, "right") && <Bond from={SLOT_POS.center} to={SLOT_POS.right} />}
      {(Object.keys(SLOT_POS) as SlotId[]).map((slot) => {
        const [x, y, z] = SLOT_POS[slot];
        const occupant = slotAtom(placed, slot);
        const style = ATOM_STYLE[slotLetter[slot]];
        return (
          <a-entity key={slot} position={`${x} 0 ${z}`}>
            <a-cylinder class="clickable" onClick={() => onSelectSlot(slot)} position={`0 ${y - 0.35} 0`} radius="0.66" height="0.12" color="#2c4258" shadow="receive: true" />
            <a-torus class="clickable" onClick={() => onSelectSlot(slot)} position={`0 ${y - 0.27} 0`} radius="0.68" tube="0.05" rotation="90 0 0"
              material={`color: #57c7cf; emissive: #57c7cf; emissiveIntensity: ${selectedAtom && !occupant ? 0.95 : 0.3}`} />
            <a-box position={`0 ${y + 0.78} 0`} width="1.7" height="0.42" depth="0.06" color={NAVY} />
            <a-text value={slotName[slot]} align="center" position={`0 ${y + 0.78} 0.05`} color="#ffffff" scale="0.62 0.62 0.62" />
            {occupant && (
              <a-entity position={`0 ${y + 0.1} 0`}>
                <a-sphere radius={style.r} material={`color: ${style.color}; roughness: 0.35`} shadow="cast: true" />
                <a-text value={slotLetter[slot]} align="center" position={`0 0 ${style.r + 0.03}`} color={style.text} scale="1.1 1.1 1.1" />
              </a-entity>
            )}
            {!occupant && <a-text value={slotLetter[slot]} align="center" position={`0 ${y - 0.05} 0`} color="#9fd8de" scale="1.3 1.3 1.3" />}
          </a-entity>
        );
      })}
      <a-text value={done ? `✓ ${mol.formula} COMPLETE` : "Click an atom, then click its target slot"} align="center" position="0 0.95 -2.6" color={NAVY} scale="0.95 0.95 0.95" />

      {/* ---------- atom inventory tray ---------- */}
      <a-entity>
        <a-box position="0 1.0 -0.4" width="9.5" height="0.18" depth="1.9" color="#5d6d7e" shadow="cast: true; receive: true" />
        <a-box position="-4 0.5 -0.4" width="0.35" height="1" depth="1.5" color="#41505f" />
        <a-box position="4 0.5 -0.4" width="0.35" height="1" depth="1.5" color="#41505f" />
        <a-text value="ATOM INVENTORY — click an atom to select it" align="center" position="0 1.66 0.7" color={NAVY} scale="0.82 0.82 0.82" />
        {mol.atoms.map(([id, label], i) => {
          const letter = letterOf(label); const st = ATOM_STYLE[letter];
          const used = id in placed; const sel = selectedAtom === id && !used;
          const x = (i - 1) * 2.6;
          return (
            <a-entity key={id} position={`${x} ${sel ? 1.78 : 1.52} -0.4`}>
              {sel && <a-torus position="0 -0.32 0" radius={st.r + 0.16} tube="0.045" rotation="90 0 0" material="color: #57c7cf; emissive: #57c7cf; emissiveIntensity: 1" />}
              <a-sphere class="clickable" onClick={() => onSelectAtom(id)} radius={st.r}
                material={`color: ${used ? "#9aa5ad" : st.color}; roughness: 0.35; emissive: ${sel ? "#2b6f76" : "#000000"}; transparent: ${used}; opacity: ${used ? 0.5 : 1}`}
                shadow="cast: true" />
              <a-text value={letter} align="center" position={`0 0 ${st.r + 0.03}`} color={st.text} scale="1.15 1.15 1.15" />
              <a-text value={used ? `${label} · USED` : label} align="center" position="0 -0.72 0.3" color={NAVY} scale="0.6 0.6 0.6" />
            </a-entity>
          );
        })}
      </a-entity>
    </a-entity>
  );
}
