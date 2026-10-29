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
  { id: "qutb-minar", n: 1, title: "Qutb Minar", pos: [-6, 0, -7.2] as const,
    card: "The Qutb Minar stands in Delhi, India. This tower of red and buff sandstone is about 72.5 metres tall, tapering from about 14.3 metres wide at the base to 2.75 metres near the top. Its surface shows alternating angular and rounded fluting (grooves). Construction began under Qutb al-Din Aibak and continued under later rulers, and the surrounding complex preserves monuments from different periods of Delhi's history.",
    question: "Which feature is especially characteristic of Qutb Minar's exterior?",
    options: ["Alternating angular and rounded fluting", "A glass curtain wall", "A completely smooth cylindrical surface", "A timber shingle roof"],
    explain: "The tower is known for its alternating angular and rounded fluting.", source: "https://whc.unesco.org/en/list/233" },
  { id: "alai-darwaza", n: 2, title: "Alai Darwaza", pos: [7, 0, -4.6] as const,
    card: "The Alai Darwaza is a monumental gateway in the Qutb complex, built in 1311 CE under Sultan Alauddin Khalji. It combines red sandstone with white marble decorative details, arched openings, patterned panels and carved bands. Because of this refined decoration, it is a useful example of early Indo-Islamic architectural design in India.",
    question: "Which material combination is visibly important in Alai Darwaza's decoration?",
    options: ["Red sandstone and white marble", "Glass and aluminum", "Painted plastic and timber", "Granite and transparent acrylic"],
    explain: "Its decoration visibly combines red sandstone with white marble details.", source: "https://whc.unesco.org/en/list/233" },
  { id: "conservation", n: 3, title: "Heritage Conservation", pos: [0.5, 0, 3.6] as const,
    card: "Archaeological sites preserve evidence of architecture, craftsmanship and past societies. We protect them by following designated paths, never touching or damaging carved surfaces, never removing stones or fragments, respecting barriers, and keeping the surroundings clean. These general principles help preserve historic material and details for future generations.",
    question: "Why should visitors avoid touching or damaging historic carved surfaces?",
    options: ["To help preserve the material and details for future generations", "To make the monument change color", "To make the monument taller", "To prevent people from learning about its history"],
    explain: "Careful behaviour preserves historic material and details for future generations.", source: "https://whc.unesco.org/en/list/233" },
];
export const CONSERVATION_CLUES = [
  { id: "path", n: 1, title: "Stay on the visitor path", pos: [0, 0, 6.8] as const, text: "Designated paths protect fragile ground and buried archaeology. Walking on marked paths lets everyone explore without wearing the site away." },
  { id: "carved", n: 2, title: "Look, don't touch", pos: [4.2, 0, -4.4] as const, text: "Carved stone looks strong, but touching, rubbing or climbing slowly damages details made by craftspeople centuries ago. Observe carvings closely — without touching them." },
  { id: "boundary", n: 3, title: "Respect the boundary", pos: [-3.2, 0, -8.4] as const, text: "Barriers and marked boundaries protect fragile structures while they are studied and conserved. Staying outside them keeps both visitors and monuments safe." },
];
export const SOURCES = [
  { label: "UNESCO World Heritage Centre — Qutb Minar and its Monuments", url: "https://whc.unesco.org/en/list/233" },
  { label: "Ministry of Culture, Govt. of India — Qutb Minar and its Monuments", url: "https://culture.gov.in/qutb-minar-and-its-monuments" },
];

export const MOLECULES = {
  h2o: { name: "Water — H₂O", formula: "H₂O", title: "Build H₂O — Water", mission: "Place oxygen in the centre and one hydrogen on each side.",
    explanation: "One oxygen atom and two hydrogen atoms form a water molecule (H₂O). This is a simplified educational model, not a full chemistry simulation.",
    atoms: [["oxygen", "O — Oxygen"], ["hydrogen1", "H — Hydrogen 1"], ["hydrogen2", "H — Hydrogen 2"]] as [string, string][] },
  co2: { name: "Carbon dioxide — CO₂", formula: "CO₂", title: "Build CO₂ — Carbon dioxide", mission: "Place carbon in the centre and one oxygen on each side (a straight, linear molecule).",
    explanation: "One carbon atom and two oxygen atoms form a carbon dioxide molecule (CO₂). This is a simplified educational model, not a full chemistry simulation.",
    atoms: [["carbon", "C — Carbon"], ["oxygenA", "O — Oxygen 1"], ["oxygenB", "O — Oxygen 2"]] as [string, string][] },
};
