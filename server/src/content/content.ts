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
  "Look at the empty space in the whole bar. Which piece size would fit neatly?",
  "Try starting with the biggest piece, 1/2. What fraction is still missing?",
  "After 1/2, you need another 1/2 in total. Quarters can make a half: 1/4 + 1/4.",
];
export const FRACTION_EXPLANATION =
  "1/2 + 1/4 + 1/4 = 1 whole. Two quarters make one half, and a half plus a half makes the whole. The 1/3 and 1/6 pieces are not needed for this target.";

export const ATOMS: Record<string, { label: string; element: string; correctSlot: string }> = {
  oxygen: { label: "O — Oxygen", element: "O", correctSlot: "center" },
  hydrogen1: { label: "H — Hydrogen 1", element: "H", correctSlot: "left" },
  hydrogen2: { label: "H — Hydrogen 2", element: "H", correctSlot: "right" },
};
export const SCIENCE_HINTS = [
  "Water's chemical formula is H₂O. Count the atoms in that formula.",
  "H₂O means two hydrogen atoms. How many oxygen atoms does it show?",
  "The big oxygen atom belongs in the centre, with one hydrogen on each side.",
];
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
