import React from "react";
import type { Snap } from "../network/client";
import type { Zone } from "./World";

/**
 * EduVerse Campus Hub (Transformation 02). Presentation + navigation only:
 * entering a portal calls onEnterZone, which updates the authoritative
 * Colyseus zone state through the existing move message. All displayed
 * session data comes from the live snapshot — nothing is fabricated.
 */
const NAVY = "#20334d", STONE = "#ece5d5", PAVE = "#e3dcc9";

const PORTALS: { zone: Zone; x: number; subject: string; activity: string; desc: string; accent: string; motif: "pi" | "atom" | "arch" }[] = [
  { zone: "math", x: -8.4, subject: "MATH LAB", activity: "Fraction Forge", desc: "Fractions & Problem Solving", accent: "#2f7fa3", motif: "pi" },
  { zone: "science", x: 0, subject: "SCIENCE LAB", activity: "Molecule Builder", desc: "Explore Atoms & Molecules", accent: "#2a9d6f", motif: "atom" },
  { zone: "heritage", x: 8.4, subject: "SOCIAL STUDIES", activity: "Heritage Explorer", desc: "Discover Qutb Minar", accent: "#c98a2d", motif: "arch" },
];

export default function Campus({ snap, onEnterZone }: { snap: Snap; onEnterZone: (z: Zone) => void }) {
  const missionsDone = snap.mathDone.length + (snap.scienceComplete ? 1 : 0) + (snap.science2Complete ? 1 : 0);
  const boardLines = [
    `Team score: ${snap.teamScore}`,
    `Activity: ${snap.activity === "lobby" ? "Free explore" : snap.activity}`,
    `Missions scored: ${missionsDone}/4`,
    `Heritage discoveries: ${snap.heritageFound.length}/3`,
    snap.announcement ? `Notice: ${snap.announcement.slice(0, 40)}${snap.announcement.length > 40 ? "…" : ""}` : "No active announcements",
  ];
  return (
    <a-entity>
      <a-entity light="type: hemisphere; skyColor: #ffffff; groundColor: #7d7462; intensity: 0.6" />
      <a-entity light="type: directional; intensity: 0.85; castShadow: true; shadowMapWidth: 1024; shadowMapHeight: 1024; shadowCameraLeft: -16; shadowCameraRight: 16; shadowCameraTop: 16; shadowCameraBottom: -16" position="7 12 6" />

      {/* ---------- ground: paved plaza + designed central inlay ---------- */}
      <a-plane rotation="-90 0 0" width="44" height="44" color={PAVE} shadow="receive: true" />
      {[-14, -10, -6, -2, 2, 6, 10, 14].map((x) => <a-box key={x} position={`${x} 0.012 -2`} width="0.05" height="0.012" depth="34" color="#d2c9b2" />)}
      {[-12, -8, -4, 4, 8, 12].map((z) => <a-box key={z} position={`0 0.012 ${z}`} width="34" height="0.012" depth="0.05" color="#d2c9b2" />)}
      <a-circle rotation="-90 0 0" radius="3.5" color="#d8cfb8" position="0 0.02 -1" />
      <a-torus rotation="90 0 0" radius="3.5" tube="0.07" color={NAVY} position="0 0.04 -1" />
      <a-torus rotation="90 0 0" radius="1.15" tube="0.05" color="#2a9d8f" position="0 0.04 -1" />
      <a-text value="EV" align="center" rotation="-90 0 0" position="0 0.05 -1" color={NAVY} scale="1.6 1.6 1.6" />
      {/* guidance paths: centre -> each portal */}
      {PORTALS.map((p) => { const dx = p.x - 0, dz = -8.2 - (-1); const len = Math.hypot(dx, dz); const ang = (Math.atan2(dx, dz) * 180) / Math.PI; return <a-box key={p.zone} position={`${dx / 2} 0.015 ${-1 + dz / 2}`} width="1.15" height="0.012" depth={len - 3.4} rotation={`0 ${ang} 0`} color="#efe8d6" />; })}

      {/* ---------- background school facade ---------- */}
      <a-box position="0 3.6 -12.4" width="32" height="7.2" depth="1.2" color="#ddd2bc" shadow="receive: true" />
      <a-box position="0 7.45 -12.4" width="33" height="0.55" depth="1.7" color={NAVY} />
      {[-13.5, -10.2, -6.9, -3.6, 3.6, 6.9, 10.2, 13.5].map((x) => <a-box key={x} position={`${x} 4.6 -11.75`} width="1.5" height="1.8" depth="0.08" color="#a8c6d8" />)}
      {[-13.5, -10.2, -6.9, -3.6, 3.6, 6.9, 10.2, 13.5].map((x) => <a-box key={`b${x}`} position={`${x} 2 -11.75`} width="1.5" height="1.8" depth="0.08" color="#a8c6d8" />)}
      <a-text value="EDUVERSE SCHOOL" align="center" position="0 6.5 -11.7" color={NAVY} scale="2 2 2" />
      {/* side hedges + low boundary walls */}
      {[-15.8, 15.8].map((x) => <a-box key={x} position={`${x} 0.55 -2`} width="0.5" height="1.1" depth="30" color="#7d9b76" shadow="cast: true" />)}
      <a-box position="0 0.55 15.8" width="32" height="1.1" depth="0.5" color="#7d9b76" shadow="cast: true" />
      {/* trees in planters, benches, lamp posts */}
      {[-12.5, -5.5, 5.5, 12.5].map((x) => (
        <a-entity key={x} position={`${x} 0 -4.5`}>
          <a-box position="0 0.3 0" width="1.7" height="0.6" depth="1.7" color="#b7a888" shadow="cast: true" />
          <a-cylinder position="0 1.2 0" radius="0.14" height="1.3" color="#6e5136" />
          <a-sphere position="0 2.5 0" radius="1.05" color="#5f8f5e" shadow="cast: true" />
          <a-sphere position="0.55 2 0.2" radius="0.7" color="#6fa06c" />
        </a-entity>
      ))}
      {[-4.6, 4.6].map((x) => (
        <a-entity key={x} position={`${x} 0 3.6`}>
          <a-box position="0 0.55 0" width="2.2" height="0.12" depth="0.55" color="#8a6844" shadow="cast: true" />
          <a-box position="-0.8 0.25 0" width="0.14" height="0.5" depth="0.45" color="#4c4438" />
          <a-box position="0.8 0.25 0" width="0.14" height="0.5" depth="0.45" color="#4c4438" />
        </a-entity>
      ))}
      {[-11, 11].map((x) => (
        <a-entity key={x} position={`${x} 0 1.5`}>
          <a-cylinder position="0 1.4 0" radius="0.07" height="2.8" color="#33465e" />
          <a-sphere position="0 2.95 0" radius="0.2" material="color: #fff3d0; emissive: #ffdf96; emissiveIntensity: 0.8" />
        </a-entity>
      ))}

      {/* ---------- the three subject portals ---------- */}
      {PORTALS.map((p) => (
        <a-entity key={p.zone} position={`${p.x} 0 -8.2`}>
          <a-box position="0 0.16 0.4" width="4.8" height="0.32" depth="2.8" color="#cfc4ab" shadow="receive: true" />
          <a-box position="0 0.08 2" width="5" height="0.16" depth="1" color="#ded5c0" />
          <a-cylinder class="clickable" onClick={() => onEnterZone(p.zone)} position="-1.75 2.1 -0.5" radius="0.22" height="3.6" color={STONE} shadow="cast: true" />
          <a-cylinder class="clickable" onClick={() => onEnterZone(p.zone)} position="1.75 2.1 -0.5" radius="0.22" height="3.6" color={STONE} shadow="cast: true" />
          <a-box class="clickable" onClick={() => onEnterZone(p.zone)} position="0 4.15 -0.5" width="4.5" height="0.75" depth="0.55" color={NAVY} shadow="cast: true" />
          <a-box class="clickable" onClick={() => onEnterZone(p.zone)} position="0 2.05 -0.85" width="3.7" height="3.5" depth="0.16" color="#2c4258" />
          <a-box class="clickable" onClick={() => onEnterZone(p.zone)} position="0 1.8 -0.72" width="2.7" height="2.5" depth="0.06" material={`color: ${p.accent}; emissive: ${p.accent}; emissiveIntensity: 0.45; opacity: 0.92; transparent: true`} />
          <a-text value={p.subject} align="center" position="0 4.15 -0.18" color="#ffffff" scale="1.35 1.35 1.35" class="clickable" onClick={() => onEnterZone(p.zone)} />
          {p.motif === "pi" && <a-text value="π" align="center" position="0 2.85 -0.6" color="#ffffff" scale="2.2 2.2 2.2" />}
          {p.motif === "atom" && <a-entity position="0 2.8 -0.62"><a-sphere radius="0.2" color="#ffffff" /><a-torus radius="0.52" tube="0.045" color="#ffffff" rotation="20 0 0" /><a-torus radius="0.52" tube="0.045" color="#ffffff" rotation="-50 60 0" /></a-entity>}
          {p.motif === "arch" && <a-entity position="0 2.55 -0.62"><a-cylinder radiusTop="0.14" radiusBottom="0.3" height="1" color="#e8cf9f" /><a-box position="0 -0.62 0" width="0.85" height="0.22" depth="0.3" color="#e8cf9f" /></a-entity>}
          <a-text value={p.activity} align="center" position="0 1.55 -0.6" color="#ffffff" scale="1.02 1.02 1.02" />
          <a-text value={p.desc} align="center" position="0 1.08 -0.6" color="#dbe6f2" scale="0.58 0.58 0.58" />
          <a-text value="Click to enter ▸" align="center" position="0 0.52 0.45" color={NAVY} scale="0.62 0.62 0.62" />
        </a-entity>
      ))}

      {/* ---------- quest board (live session data) ---------- */}
      <a-entity position="-6.4 0 3.2" rotation="0 32 0">
        <a-cylinder position="-1.4 1 0" radius="0.09" height="2" color="#4c4438" />
        <a-cylinder position="1.4 1 0" radius="0.09" height="2" color="#4c4438" />
        <a-box position="0 2.15 0" width="3.7" height="2.5" depth="0.14" color={NAVY} shadow="cast: true" />
        <a-box position="0 2.15 0.09" width="3.4" height="2.2" depth="0.04" color={STONE} />
        <a-text value="QUEST BOARD" align="center" position="0 3.05 0.13" color={NAVY} scale="1.05 1.05 1.05" />
        <a-text value="Team progress & notices" align="center" position="0 2.68 0.13" color="#5a6b7d" scale="0.55 0.55 0.55" />
        {boardLines.map((line, i) => <a-text key={i} value={line} position={`-1.55 ${2.34 - i * 0.31} 0.13`} color="#22344d" width="3.1" scale="0.52 0.52 0.52" />)}
      </a-entity>
    </a-entity>
  );
}
