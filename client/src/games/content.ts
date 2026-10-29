// Client copy of reviewed content (server remains authoritative for answers/validation).
export const FRACTION_PIECES = [
  { id: "p1", label: "1/2", value: 0.5, color: "#c94f63" },
  { id: "p2", label: "1/4", value: 0.25, color: "#eda83a" },
  { id: "p3", label: "1/4", value: 0.25, color: "#d98a24" },
  { id: "p4", label: "1/3", value: 1 / 3, color: "#06d6a0" },
  { id: "p5", label: "1/6", value: 1 / 6, color: "#118ab2" },
];
export const FRACTION_PUZZLES = [
  { id: "whole", title: "Make 1 Whole", targetLabel: "1", target: 1, pieces: FRACTION_PIECES, explanation: "The placed pieces total exactly 12/12 = 1 whole. A half is 6/12, each quarter is 3/12, a third is 4/12 and a sixth is 2/12 — the twelfths add to 12." },
  { id: "two-thirds", title: "Make 2/3", targetLabel: "2/3", target: 2 / 3, pieces: [
    { id: "q1", label: "1/3", value: 1 / 3, color: "#2a9d8f" }, { id: "q2", label: "1/3", value: 1 / 3, color: "#218276" },
    { id: "q3", label: "1/2", value: 0.5, color: "#c94f63" }, { id: "q4", label: "1/6", value: 1 / 6, color: "#457b9d" },
    { id: "q5", label: "1/4", value: 0.25, color: "#eda83a" } ], explanation: "1/3 + 1/3 = 2/3. Another correct solution is 1/2 + 1/6 = 3/6 + 1/6 = 4/6 = 2/3. The 1/4 piece does not fit this target." },
];
export const HOTSPOTS = [
  { id: "qutb-minar", title: "Qutb Minar", pos: [-6, 0, -10] as const,
    card: "The Qutb Minar in Delhi is a tall, tapering tower of victory made of red sandstone and marble. UNESCO lists the Qutb Minar complex as a World Heritage Site. Construction began under Qutb-ud-din Aibak and the tower was later extended by other rulers. Its walls have fluted (grooved) surfaces and decorative carved bands.",
    question: "What is the Qutb Minar mainly built from?", options: ["Red sandstone and marble", "Glass and steel", "Wood and straw"] },
  { id: "alai-darwaza", title: "Alai Darwaza", pos: [7, 0, -6] as const,
    card: "The Alai Darwaza is a domed gateway in the Qutb complex, built in 1311 CE under Sultan Ala-ud-din Khalji, according to India's Ministry of Culture. It is known for carved red sandstone, white marble inlay, and its early use of a true dome and pointed arches in India.",
    question: "What shape sits on top of the Alai Darwaza?", options: ["A dome", "A pyramid roof", "A tall spire"] },
  { id: "conservation", title: "Heritage Conservation", pos: [0, 0, 6] as const,
    card: "Heritage conservation means caring for old monuments so future generations can learn from them. Teams clean stone gently, repair damage with matching materials, and record everything. Visitors help by not climbing on walls, not touching carvings, and keeping the site clean.",
    question: "Which action helps conserve a monument?", options: ["Keeping the site clean and not touching carvings", "Scratching your name into the stone", "Climbing on the old walls"] },
];
export const SOURCES = [
  { label: "UNESCO World Heritage Centre — Qutb Minar and its Monuments", url: "https://whc.unesco.org/en/list/233" },
  { label: "Ministry of Culture, Govt. of India — Qutb Minar and its Monuments", url: "https://culture.gov.in/qutb-minar-and-its-monuments" },
];

export const MOLECULES = {
  h2o: { name: "💧 Water — H₂O", formula: "H₂O", mission: "Place oxygen in the centre and one hydrogen on each side.",
    atoms: [["oxygen", "O — Oxygen"], ["hydrogen1", "H — Hydrogen 1"], ["hydrogen2", "H — Hydrogen 2"]] as [string, string][] },
  co2: { name: "🫧 Carbon dioxide — CO₂", formula: "CO₂", mission: "Place carbon in the centre and one oxygen on each side (a straight, linear molecule).",
    atoms: [["carbon", "C — Carbon"], ["oxygenA", "O — Oxygen 1"], ["oxygenB", "O — Oxygen 2"]] as [string, string][] },
};
