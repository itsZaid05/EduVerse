import React from "react";
import type { Snap } from "../network/client";
import { HOTSPOTS, CONSERVATION_CLUES } from "../games/content";

/**
 * Heritage Explorer — Qutb Minar (Transformation 04).
 * Stylized educational reconstruction (not survey-accurate), built from
 * standard A-Frame geometry. Presentation only: discoveries/clues are
 * validated and scored by the server; this renders the shared snapshot.
 */
const RED = "#a85a41", RED_D = "#93503a", BUFF = "#dcb989", PALE = "#f0e6d2", STONE = "#d9c9a8";

function Tower() {
  // Scaled to UNESCO proportions (72.5 m tall; 14.32 m -> 2.75 m diameter):
  // five tapered storeys, balcony rings, decorative bands, fluting ribs.
  const tiers = [
    { h: 4.6, rb: 2.25, rt: 1.82, c: RED },
    { h: 3.4, rb: 1.82, rt: 1.48, c: "#b46347" },
    { h: 2.7, rb: 1.48, rt: 1.18, c: RED },
    { h: 2.1, rb: 1.18, rt: 0.88, c: BUFF },
    { h: 1.7, rb: 0.88, rt: 0.5, c: RED },
  ];
  let y = 0.8;
  return (
    <a-entity position="-6 0 -11.5">
      <a-cylinder position="0 0.4 0" radius="3.1" height="0.8" radialSegments={8} color={STONE} shadow="receive: true" />
      {tiers.map((t, i) => { const cy = y + t.h / 2; const topY = y + t.h; const el = (
        <a-entity key={i}>
          <a-cylinder position={`0 ${cy} 0`} height={t.h} radiusTop={t.rt} radiusBottom={t.rb} radialSegments={24} color={t.c} shadow="cast: true; receive: true" />
          {i < 2 && Array.from({ length: 12 }, (_, k) => { const a = (k / 12) * Math.PI * 2; const r = (t.rb + t.rt) / 2 + 0.03; return <a-box key={k} position={`${Math.sin(a) * r} ${cy} ${Math.cos(a) * r}`} width="0.1" height={t.h * 0.92} depth="0.07" rotation={`0 ${(a * 180) / Math.PI} 0`} color={i % 2 ? RED_D : "#b96f4e"} />; })}
          <a-cylinder position={`0 ${topY + 0.14} 0`} height="0.28" radiusTop={t.rt + 0.3} radiusBottom={t.rt + 0.34} radialSegments={24} color={BUFF} shadow="cast: true" />
          <a-torus position={`0 ${topY + 0.32} 0`} radius={t.rt + 0.3} tube="0.055" rotation="90 0 0" color="#8a4b2f" />
        </a-entity>); y = topY + 0.3; return el; })}
      <a-cone position={`0 ${y + 0.55} 0`} height="1.1" radius="0.42" color="#8a4b2f" />
    </a-entity>
  );
}

function Gateway() {
  return (
    <a-entity position="7 0 -8.6">
      <a-box position="0 0.25 0" width="6.4" height="0.5" depth="5" color={STONE} shadow="receive: true" />
      <a-box position="0 2.1 0" width="5.4" height="3.4" depth="4" color={RED} shadow="cast: true; receive: true" />
      {/* dome + finial */}
      <a-sphere position="0 3.8 0" radius="1.85" scale="1 0.62 1" color="#cdb59a" shadow="cast: true" />
      <a-cylinder position="0 3.75 0" radius="2" height="0.25" color={PALE} />
      <a-cone position="0 5.25 0" height="0.7" radius="0.16" color="#8a4b2f" />
      {/* corner turrets */}
      {[-2.85, 2.85].map((x) => <a-entity key={x}><a-cylinder position={`${x} 2.4 1.6`} radius="0.42" height="4.2" color={RED_D} shadow="cast: true" /><a-cone position={`${x} 4.8 1.6`} height="0.7" radius="0.5" color="#8a4b2f" /></a-entity>)}
      {/* arched entrance (facade faces +z, toward the path) */}
      <a-box position="0 1.75 2.01" width="2.5" height="3.1" depth="0.1" color="#5b3a29" />
      <a-cylinder position="0 3.3 2.02" radius="1.25" height="0.12" rotation="90 0 0" thetaStart={0} thetaLength={180} color="#5b3a29" />
      <a-torus position="0 3.3 2.1" radius="1.38" tube="0.11" arc={180} color={PALE} />
      {[-1.42, 1.42].map((x) => <a-box key={x} position={`${x} 1.75 2.06`} width="0.24" height="3.2" depth="0.06" color={PALE} />)}
      <a-box position="0 3.62 2.06" width="3.1" height="0.24" depth="0.06" color={PALE} />
      {/* recessed decorative panels */}
      {[-1.95, 1.95].map((x) => <a-entity key={x}><a-box position={`${x} 2.7 2.03`} width="0.95" height="1.1" depth="0.05" color={PALE} /><a-box position={`${x} 2.7 2.06`} width="0.7" height="0.85" depth="0.03" color={RED_D} /><a-box position={`${x} 1.45 2.03`} width="0.95" height="0.9" depth="0.05" color={PALE} /><a-box position={`${x} 1.45 2.06`} width="0.7" height="0.65" depth="0.03" color={RED_D} /></a-entity>)}
    </a-entity>
  );
}

function Marker({ n, title, found, x, z, onClick, small }: { n: number; title: string; found: boolean; x: number; z: number; onClick: () => void; small?: boolean }) {
  const col = found ? "#2a9d6f" : "#c98a2d";
  return (
    <a-entity position={`${x} 0 ${z}`}>
      <a-torus rotation="90 0 0" radius={small ? 0.55 : 0.8} tube="0.06" position="0 0.06 0" material={`color: ${col}; emissive: ${col}; emissiveIntensity: 0.5`} />
      <a-cylinder class="clickable" onClick={onClick} position="0 0.8 0" radius="0.05" height="1.6" color="#5b4a38" />
      <a-sphere class="clickable" onClick={onClick} radius={small ? 0.3 : 0.38} position="0 1.85 0" material={`color: ${col}; emissive: ${col}; emissiveIntensity: 0.35`} shadow="cast: true"
        {...(found ? {} : { animation: "property: position; to: 0 2.05 0; dir: alternate; loop: true; dur: 1300" })} />
      <a-text value={found ? "✓" : String(n)} align="center" position="0 1.85 0.4" color="#ffffff" scale="0.9 0.9 0.9" />
      <a-text value={title} align="center" position="0 2.5 0" color="#4a3626" scale="0.78 0.78 0.78" />
    </a-entity>
  );
}

export default function HeritageExplorer({ snap, onHotspot, onClue }: {
  snap: Snap; onHotspot: (id: string) => void; onClue: (id: string) => void;
}) {
  return (
    <a-entity>
      <a-entity light="type: hemisphere; skyColor: #fff4e0; groundColor: #7a6a55; intensity: 0.6" />
      <a-entity light="type: directional; intensity: 0.8; castShadow: true; shadowMapWidth: 1024; shadowMapHeight: 1024; shadowCameraLeft: -18; shadowCameraRight: 18; shadowCameraTop: 18; shadowCameraBottom: -18" position="8 14 6" />
      {/* courtyard: sandstone slabs + grass edges */}
      <a-plane rotation="-90 0 0" width="44" height="44" color="#cdbb96" shadow="receive: true" />
      {[-12, -8, -4, 0, 4, 8, 12].map((x) => <a-box key={x} position={`${x} 0.012 -2`} width="0.06" height="0.012" depth="32" color="#bfa87e" />)}
      {[-10, -6, -2, 2, 6, 10].map((z) => <a-box key={z} position={`0 0.012 ${z}`} width="32" height="0.012" depth="0.06" color="#bfa87e" />)}
      {[-16, 16].map((x) => <a-plane key={x} rotation="-90 0 0" width="10" height="40" color="#7d9b76" position={`${x} 0.015 0`} />)}
      {/* approach paths */}
      <a-box position="0 0.02 1.5" width="2.4" height="0.015" depth="15" color="#e6d7b4" />
      <a-box position="-3.2 0.02 -5.4" width="1.9" height="0.015" depth="6.4" rotation="0 24 0" color="#e6d7b4" />
      <a-box position="3.6 0.02 -3.4" width="1.9" height="0.015" depth="6.8" rotation="0 -28 0" color="#e6d7b4" />
      {/* boundary walls + ruined colonnade */}
      <a-box position="0 0.7 -15.5" width="34" height="1.4" depth="0.6" color={STONE} shadow="cast: true" />
      {[-14.5, 14.5].map((x) => <a-box key={x} position={`${x} 0.7 -2`} width="0.6" height="1.4" depth="28" color={STONE} shadow="cast: true" />)}
      {[-12.5, -11, -9.5, -8].map((x, i) => (
        <a-entity key={x} position={`${x} 0 ${2 - i * 0.4}`}>
          <a-box position="0 0.3 0" width="0.9" height="0.6" depth="0.9" color={STONE} />
          <a-cylinder position="0 2 0" radius="0.32" height={i === 2 ? 1.8 : 3.4} color="#c4ab84" shadow="cast: true" />
        </a-entity>
      ))}
      <a-box position="-10.2 3.9 0.6" width="5.4" height="0.5" depth="1" rotation="0 0 4" color="#c4ab84" shadow="cast: true" />
      {/* protective fence arc near tower base (boundary clue object) */}
      {[-4.6, -3.9, -3.2].map((x, i) => <a-box key={x} position={`${x} 0.45 -8.4`} width="0.12" height="0.9" depth="0.12" color="#6b5138" />)}
      <a-box position="-3.9 0.85 -8.4" width="1.7" height="0.09" depth="0.09" color="#6b5138" />
      {/* carved-panel fragment (carved clue object) */}
      <a-entity position="4.2 0 -4.4" rotation="0 -30 0">
        <a-box position="0 0.9 0" width="1.3" height="1.8" depth="0.25" color={RED} shadow="cast: true" />
        <a-box position="0 1.25 0.14" width="0.9" height="0.7" depth="0.04" color={PALE} />
        <a-box position="0 0.6 0.14" width="0.9" height="0.35" depth="0.04" color={PALE} />
        <a-box position="0 0.15 0.3" width="1.1" height="0.3" depth="0.7" color={STONE} />
      </a-entity>
      {/* visitor-path sign (path clue object) */}
      <a-entity position="1.6 0 6.8" rotation="0 -18 0">
        <a-box position="0 0.8 0" width="0.14" height="1.6" depth="0.14" color="#6b5138" />
        <a-box position="0 1.65 0" width="1.7" height="0.8" depth="0.08" color="#49603f" />
        <a-text value={"VISITOR\nPATH →"} align="center" position="0 1.65 0.06" color="#ffffff" scale="0.62 0.62 0.62" />
      </a-entity>
      {/* entry disclaimer sign */}
      <a-entity position="-2.2 0 9.5" rotation="0 14 0">
        <a-box position="0 0.9 0" width="0.14" height="1.8" depth="0.14" color="#6b5138" />
        <a-box position="0 1.8 0" width="3.4" height="1" depth="0.08" color={NAVY_SIGN} />
        <a-text value={"QUTB MINAR COMPLEX\nStylized educational reconstruction — not to scale"} align="center" position="0 1.8 0.06" color="#ffffff" scale="0.6 0.6 0.6" />
      </a-entity>

      <Tower />
      <Gateway />

      {HOTSPOTS.map((h) => <Marker key={h.id} n={h.n} title={h.title} found={snap.heritageFound.includes(h.id)} x={h.pos[0]} z={h.pos[2]} onClick={() => onHotspot(h.id)} />)}
      {CONSERVATION_CLUES.map((c) => <Marker key={c.id} n={c.n} title={`Clue ${c.n}: ${c.title}`} small found={snap.heritageClues.includes(c.id)} x={c.pos[0]} z={c.pos[2]} onClick={() => onClue(c.id)} />)}
    </a-entity>
  );
}
const NAVY_SIGN = "#20334d";
