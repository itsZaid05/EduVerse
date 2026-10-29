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
  id: string; title: string; card: string; question: string; options: string[]; answer: number; clue: string;
}
export const HERITAGE_HOTSPOTS: HeritageHotspot[] = [
  {
    id: "qutb-minar",
    title: "Qutb Minar",
    card: "The Qutb Minar in Delhi is a tall, tapering tower of victory made of red sandstone and marble. UNESCO describes the Qutb Minar complex as a World Heritage Site. Construction of the tower began under Qutb-ud-din Aibak, and it was later extended by other rulers. Its walls have fluted (grooved) surfaces and decorative bands of carving.",
    question: "What is the Qutb Minar mainly built from?",
    options: ["Red sandstone and marble", "Glass and steel", "Wood and straw"],
    answer: 0,
    clue: "Clue 1: Notice the tower's materials.",
  },
  {
    id: "alai-darwaza",
    title: "Alai Darwaza",
    card: "The Alai Darwaza is a domed gateway in the Qutb complex, built in 1311 CE under Sultan Ala-ud-din Khalji, according to India's Ministry of Culture. It is known for its carved red sandstone, white marble inlay, and its early use of a true dome and pointed arches in India.",
    question: "What shape sits on top of the Alai Darwaza?",
    options: ["A dome", "A pyramid roof", "A tall spire"],
    answer: 0,
    clue: "Clue 2: Gateways can teach us about building technology.",
  },
  {
    id: "conservation",
    title: "Heritage Conservation",
    card: "Heritage conservation means caring for old monuments so future generations can learn from them. Conservation teams clean stone gently, repair damage with matching materials, and record everything. Visitors help by not climbing on walls, not touching carvings, and keeping the site clean.",
    question: "Which action helps conserve a monument?",
    options: ["Keeping the site clean and not touching carvings", "Scratching your name into the stone", "Climbing on the old walls"],
    answer: 0,
    clue: "Clue 3: Everyone can help protect heritage.",
  },
];
export const HERITAGE_SOURCES = [
  { label: "UNESCO World Heritage Centre — Qutb Minar and its Monuments, Delhi", url: "https://whc.unesco.org/en/list/233" },
  { label: "Ministry of Culture, Government of India — Qutb Minar and its Monuments", url: "https://culture.gov.in/qutb-minar-and-its-monuments" },
];
