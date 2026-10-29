import React from "react";
import type { Snap } from "../network/client";
import { FRACTION_PUZZLES } from "../games/content";

/**
 * Fraction Forge — a compact mathematics studio (Transformation 01).
 * Presentation only: every placement is submitted to the server via
 * onPlaceBoard -> room.send("placeFraction"); this component renders the
 * authoritative snapshot and never decides score/completion itself.
 *
 * Mathematics is exact: all sizes/totals use integer twelfths.
 * 1/2 = 6, 1/4 = 3, 1/3 = 4, 1/6 = 2 (twelfths). Target "whole" = 12.
 */
const U = 0.72;                    // world width of one twelfth
const TRACK_X = -6 * U;            // track starts at -4.32
const NAVY = "#20334d", SLATE = "#33465e", STONE = "#efe9dc";

export const unitsOf = (v: number) => Math.round(v * 12);

export default function MathStudio({ snap, selectedId, onSelectPiece, onPlaceBoard }: {
  snap: Snap; selectedId: string | null;
  onSelectPiece: (id: string) => void; onPlaceBoard: () => void;
}) {
  const pz = FRACTION_PUZZLES.find((x) => x.id === snap.mathPuzzle) || FRACTION_PUZZLES[0];
  const targetUnits = unitsOf(pz.target);
  const placed = pz.pieces.filter((pc) => snap.mathPlaced.includes(pc.id));
  // unit -> owning piece colour (exact integer twelfths, placement order)
  const unitColor: (string | null)[] = Array(12).fill(null);
  let cursor = 0;
  for (const pc of placed) { const n = unitsOf(pc.value); for (let i = 0; i < n && cursor < 12; i++) unitColor[cursor++] = pc.color; }
  const usedUnits = cursor;
  // tray layout: proportional widths, centred, even gaps
  const gap = 0.4; const widths = pz.pieces.map((pc) => unitsOf(pc.value) * U);
  const totalW = widths.reduce((a, b) => a + b, 0) + gap * (pz.pieces.length - 1);
  let trayX = -totalW / 2;

  return (
    <a-entity>
      {/* ---------- lighting (zone-local) ---------- */}
      <a-entity light="type: hemisphere; skyColor: #ffffff; groundColor: #8a7f68; intensity: 0.55" />
      <a-entity light="type: directional; intensity: 0.9; castShadow: true; shadowMapWidth: 1024; shadowMapHeight: 1024; shadowCameraLeft: -13; shadowCameraRight: 13; shadowCameraTop: 13; shadowCameraBottom: -13" position="6 11 5" />

      {/* ---------- architecture: floor, walls, platform ---------- */}
      <a-plane rotation="-90 0 0" width="46" height="46" color="#e4ddcf" shadow="receive: true" />
      {[-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10].map((x) => <a-box key={x} position={`${x} 0.012 -3`} width="0.045" height="0.012" depth="21" color="#cfc6b0" />)}
      <a-box position="0 0.18 -3" width="17" height="0.36" depth="10.5" color="#d9d1bf" shadow="receive: true" />
      <a-box position="0 0.09 2.6" width="17" height="0.18" depth="1.4" color="#cec4ae" shadow="receive: true" />
      <a-box position="0 4.5 -10.6" width="32" height="9" depth="0.4" color={NAVY} />
      {[-9.5, 0, 9.5].map((x) => <a-box key={x} position={`${x} 4.4 -10.35`} width="7.6" height="5.4" depth="0.12" color="#2c4258" />)}
      <a-cylinder position="-6.1 3.5 -9.9" radius="0.34" height="7" color="#cfc6b2" shadow="cast: true" />
      <a-cylinder position="6.1 3.5 -9.9" radius="0.34" height="7" color="#cfc6b2" shadow="cast: true" />
      <a-text value="π" align="center" position="0 6.6 -10.25" color="#e9a13b" scale="5 5 5" />
      <a-text value="M A T H   L A B" align="center" position="0 5.45 -10.25" color="#f2ede1" scale="1.7 1.7 1.7" />
      {[-7, -3.5, 0].map((z) => (
        <a-entity key={z}>
          <a-box position={`0 6.9 ${z - 2}`} width="24" height="0.22" depth="0.45" color="#1a2a40" />
          <a-box position={`0 6.72 ${z - 2}`} width="3.2" height="0.07" depth="0.3" material="color: #fff3d0; emissive: #ffdf96; emissiveIntensity: 0.9" />
        </a-entity>
      ))}
      {/* restrained geometric decor in alcoves */}
      <a-entity position="-8.6 0.36 -6"><a-box position="0 0.5 0" width="1.5" height="1" depth="1.5" color={SLATE} shadow="cast: true" /><a-torus position="0 1.45 0" radius="0.5" tube="0.13" rotation="20 30 0" color="#2a9d8f" shadow="cast: true" /></a-entity>
      <a-entity position="8.6 0.36 -6"><a-box position="0 0.5 0" width="1.5" height="1" depth="1.5" color={SLATE} shadow="cast: true" /><a-cone position="0 1.5 0" radius="0.55" height="1.1" color="#e9a13b" shadow="cast: true" /></a-entity>

      {/* ---------- the Forge board (click = place selected piece) ---------- */}
      <a-entity position="0 0 -7.3">
        <a-box class="clickable" onClick={onPlaceBoard} position="0 3.05 0" width="10.6" height="3.9" depth="0.35" color={NAVY} shadow="cast: true; receive: true" />
        <a-box class="clickable" onClick={onPlaceBoard} position="0 3.05 0.22" width="9.9" height="3.2" depth="0.1" color={STONE} />
        <a-text value={pz.id === "whole" ? "MAKE 1 WHOLE" : `MAKE ${pz.targetLabel}`} align="center" position="0 4.28 0.32" color={NAVY} scale="2.1 2.1 2.1" />
        <a-text value={`Target: ${pz.targetLabel} = ${targetUnits}/12      Filled: ${usedUnits}/12`} align="center" position="0 3.78 0.32" color="#5a6b7d" scale="0.95 0.95 0.95" />
        {/* 12-unit segmented track */}
        <a-box position="0 2.78 0.3" width={12 * U + 0.3} height="1.02" depth="0.14" color={SLATE} />
        {selectedId && !snap.mathComplete && <a-box position="0 2.78 0.26" width={12 * U + 0.44} height="1.16" depth="0.05" material="color: #e9a13b; emissive: #e9a13b; emissiveIntensity: 0.55" />}
        {Array.from({ length: 12 }, (_, i) => (
          <a-box key={i} position={`${TRACK_X + i * U + U / 2} 2.78 0.4`} width={U - 0.07} height="0.84" depth="0.16"
            color={unitColor[i] || (i < targetUnits ? "#71859c" : "#26374c")} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <a-text key={i} value={String(i + 1)} align="center" position={`${TRACK_X + i * U + U / 2} 2.08 0.32`} color="#74879b" scale="0.5 0.5 0.5" />
        ))}
        {/* placed pieces as physical blocks on the track */}
        {(() => { let fx = TRACK_X; return placed.map((pc) => { const w = unitsOf(pc.value) * U; const x = fx + w / 2; fx += w; return (
          <a-entity key={pc.id} position={`${x} 2.78 0.62`}>
            <a-box width={w - 0.07} height="0.9" depth="0.34" material={`color: ${pc.color}; roughness: 0.5`} shadow="cast: true" />
            <a-text value={pc.label} align="center" position="0 0 0.2" color="#ffffff" scale="1.05 1.05 1.05" />
          </a-entity> ); }); })()}
        <a-text value={snap.mathComplete ? "✓ COMPLETE — well forged!" : selectedId ? "Board ready — click the board to place your piece" : "Select a piece from the tray, then click this board"} align="center" position="0 1.55 0.32" color={snap.mathComplete ? "#1d7a4f" : "#5a6b7d"} scale="0.9 0.9 0.9" />
      </a-entity>

      {/* ---------- selection tray ---------- */}
      <a-entity>
        <a-box position="0 1.0 -0.9" width="15.6" height="0.18" depth="1.9" color="#7a5c39" shadow="cast: true; receive: true" />
        <a-box position="-7.2 0.5 -0.9" width="0.35" height="1" depth="1.5" color="#5f4630" />
        <a-box position="7.2 0.5 -0.9" width="0.35" height="1" depth="1.5" color="#5f4630" />
        <a-text value="FRACTION TRAY — click a piece to select it" align="center" position="0 1.62 0.35" color={NAVY} scale="0.85 0.85 0.85" />
        {pz.pieces.map((pc, i) => {
          const w = widths[i]; const cx = trayX + w / 2; trayX += w + gap;
          const used = snap.mathPlaced.includes(pc.id); const sel = selectedId === pc.id && !used;
          return (
            <a-entity key={pc.id} position={`${cx} ${sel ? 1.68 : 1.4} -0.9`}>
              {sel && <a-box position="0 -0.3 0" width={w + 0.22} height="0.06" depth="1.12" material="color: #e9a13b; emissive: #e9a13b; emissiveIntensity: 0.8" />}
              <a-box class="clickable" onClick={() => onSelectPiece(pc.id)} width={w} height="0.6" depth="0.92"
                material={`color: ${used ? "#9aa5ad" : pc.color}; roughness: 0.5; metalness: 0.05; emissive: ${sel ? "#7a5410" : "#000000"}; transparent: ${used}; opacity: ${used ? 0.55 : 1}`}
                shadow="cast: true; receive: true" />
              <a-text value={pc.label} align="center" position="0 0.1 0.49" color="#ffffff" scale="1.25 1.25 1.25" />
              <a-text value={used ? "USED" : `(${unitsOf(pc.value)}/12)`} align="center" position="0 -0.22 0.49" color="#ffffff" scale="0.62 0.62 0.62" />
            </a-entity>
          );
        })}
      </a-entity>
    </a-entity>
  );
}
