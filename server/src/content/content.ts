// Versioned, reviewed content modules (Phase 0/6). Historical facts checked against
// UNESCO World Heritage Centre (whc.unesco.org/en/list/233) and India's Ministry of
// Culture (culture.gov.in/qutb-minar-and-its-monuments). No invented dates/quotations.
export const FRACTION_PIECES: Record<string, { label: string; value: number }> = {
  p1: { label: "1/2", value: 1 / 2 },
  p2: { label: "1/4", value: 1 / 4 },
  p3: { label: "1/4", value: 1 / 4 },
  p4: { label: "1/3", value: 1 / 3 },
  p5: { label: "1/6", value: 1 / 6 },
};
export const FRACTION_HINTS = [
  "A whole contains twelve twelfths. How many twelfths does one half represent?",
  "One half is 6/12. Each quarter is 3/12.",
  "Try combining 6/12, 3/12, and 3/12.",
];
export const FRACTION_EXPLANATION =
  "The placed pieces total exactly 12/12 = 1 whole. In twelfths: a half is 6/12, a quarter is 3/12, a third is 4/12 and a sixth is 2/12 — whichever pieces you used, their twelfths add to 12.";

export interface FractionPuzzle { id: string; title: string; targetLabel: string; target: number; pieces: Record<string, { label: string; value: number }>; hints: string[]; explanation: string }
export const FRACTION_PUZZLES: FractionPuzzle[] = [
  { id: "whole", title: "Make 1 Whole", targetLabel: "1", target: 1, pieces: FRACTION_PIECES, hints: FRACTION_HINTS, explanation: FRACTION_EXPLANATION },
  { id: "two-thirds", title: "Make 2/3", targetLabel: "2/3", target: 2 / 3,
    pieces: { q1: { label: "1/3", value: 1 / 3 }, q2: { label: "1/3", value: 1 / 3 }, q3: { label: "1/2", value: 1 / 2 }, q4: { label: "1/6", value: 1 / 6 }, q5: { label: "1/4", value: 1 / 4 } },
    hints: [
      "The target is 2/3 — less than a whole. Which pieces are thirds?",
      "Two equal thirds make 2/3. Do you have two pieces of the same size?",
      "1/3 + 1/3 = 2/3. Another way: 1/2 + 1/6 also makes 2/3 — check: 3/6 + 1/6 = 4/6 = 2/3.",
    ],
    explanation: "1/3 + 1/3 = 2/3. Another correct solution is 1/2 + 1/6 = 3/6 + 1/6 = 4/6 = 2/3. The 1/4 piece does not fit this target." },
];
export const ATOMS: Record<string, { label: string; element: string; correctSlot: string }> = {
  oxygen: { label: "O — Oxygen", element: "O", correctSlot: "center" },
  hydrogen1: { label: "H — Hydrogen 1", element: "H", correctSlot: "left" },
  hydrogen2: { label: "H — Hydrogen 2", element: "H", correctSlot: "right" },
};
export const SCIENCE_HINTS = [
  "Water is made from hydrogen and oxygen.",
  "Place oxygen in the central O slot. The two H slots need hydrogen.",
  "Use one O atom in the center and one H atom on each side.",
];
// Level 2: carbon dioxide CO2 — carbon centre, one oxygen on each side (linear molecule).
export const CO2_ATOMS: Record<string, { label: string; element: string; correctSlot: string }> = {
  carbon: { label: "C — Carbon", element: "C", correctSlot: "center" },
  oxygenA: { label: "O — Oxygen 1", element: "O", correctSlot: "left" },
  oxygenB: { label: "O — Oxygen 2", element: "O", correctSlot: "right" },
};
export const CO2_HINTS = [
  "Carbon dioxide's formula is CO₂. Count: how many carbon, how many oxygen?",
  "The subscript 2 belongs to oxygen. Carbon has no subscript, so there is just one.",
  "Carbon goes in the centre, with an oxygen atom on each side — CO₂ is a straight (linear) molecule.",
];
export const CO2_EXPLANATION =
  "Carbon dioxide (CO₂) contains one carbon atom and two oxygen atoms in a straight line. This is a simplified educational model — real molecules are far smaller and behave in more complex ways than this model shows.";
export const SCIENCE_EXPLANATION =
  "Water (H₂O) contains two hydrogen atoms and one oxygen atom. This is a simplified educational model — real molecules are far smaller and behave in more complex ways than this model shows.";

export interface HeritageHotspot {
  id: string; title: string; card: string; question: string; options: string[]; answer: number; clue: string; explain: string; source: string; version: string;
}
// Content v2026.1 — reviewed against UNESCO World Heritage Centre (list 233) and
// India's Ministry of Culture. Age-appropriate summaries; no invented dates/quotes.
export const HERITAGE_HOTSPOTS: HeritageHotspot[] = [
  {
    id: "qutb-minar", title: "Qutb Minar",
    card: "The Qutb Minar stands in Delhi, India. This tower of red and buff sandstone is about 72.5 metres tall, tapering from about 14.3 metres wide at the base to 2.75 metres near the top. Its surface shows alternating angular and rounded fluting (grooves). Construction began under Qutb al-Din Aibak and continued under later rulers, and the surrounding complex preserves monuments from different periods of Delhi's history.",
    question: "Which feature is especially characteristic of Qutb Minar's exterior?",
    options: ["Alternating angular and rounded fluting", "A glass curtain wall", "A completely smooth cylindrical surface", "A timber shingle roof"],
    answer: 0, clue: "Clue 1: Notice the tower's grooved surface.",
    explain: "The tower is known for its alternating angular and rounded fluting.",
    source: "https://whc.unesco.org/en/list/233", version: "2026.1",
  },
  {
    id: "alai-darwaza", title: "Alai Darwaza",
    card: "The Alai Darwaza is a monumental gateway in the Qutb complex, built in 1311 CE under Sultan Alauddin Khalji. It combines red sandstone with white marble decorative details, arched openings, patterned panels and carved bands. Because of this refined decoration, it is a useful example of early Indo-Islamic architectural design in India.",
    question: "Which material combination is visibly important in Alai Darwaza's decoration?",
    options: ["Red sandstone and white marble", "Glass and aluminum", "Painted plastic and timber", "Granite and transparent acrylic"],
    answer: 0, clue: "Clue 2: Gateways can teach us about materials and craft.",
    explain: "Its decoration visibly combines red sandstone with white marble details.",
    source: "https://whc.unesco.org/en/list/233", version: "2026.1",
  },
  {
    id: "conservation", title: "Heritage Conservation",
    card: "Archaeological sites preserve evidence of architecture, craftsmanship and past societies. We protect them by following designated paths, never touching or damaging carved surfaces, never removing stones or fragments, respecting barriers, and keeping the surroundings clean. These general principles help preserve historic material and details for future generations.",
    question: "Why should visitors avoid touching or damaging historic carved surfaces?",
    options: ["To help preserve the material and details for future generations", "To make the monument change color", "To make the monument taller", "To prevent people from learning about its history"],
    answer: 0, clue: "Clue 3: Everyone can help protect heritage.",
    explain: "Careful behaviour preserves historic material and details for future generations.",
    source: "https://whc.unesco.org/en/list/233", version: "2026.1",
  },
];
export interface ConservationClue { id: string; title: string; text: string }
export const CONSERVATION_CLUES: ConservationClue[] = [
  { id: "path", title: "Stay on the visitor path", text: "Designated paths protect fragile ground and buried archaeology. Walking on marked paths lets everyone explore without wearing the site away." },
  { id: "carved", title: "Look, don't touch", text: "Carved stone looks strong, but touching, rubbing or climbing slowly damages details made by craftspeople centuries ago. Observe carvings closely — without touching them." },
  { id: "boundary", title: "Respect the boundary", text: "Barriers and marked boundaries protect fragile structures while they are studied and conserved. Staying outside them keeps both visitors and monuments safe." },
];
export const HERITAGE_SOURCES = [
  { label: "UNESCO World Heritage Centre — Qutb Minar and its Monuments, Delhi", url: "https://whc.unesco.org/en/list/233" },
  { label: "Ministry of Culture, Government of India — Qutb Minar and its Monuments", url: "https://culture.gov.in/qutb-minar-and-its-monuments" },
];
