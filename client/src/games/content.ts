// Client copy of reviewed content (server remains authoritative for answers/validation).
export const FRACTION_PIECES = [
  { id: "p1", label: "1/2", value: 0.5, color: "#ef476f" },
  { id: "p2", label: "1/4", value: 0.25, color: "#ffd166" },
  { id: "p3", label: "1/4", value: 0.25, color: "#ffb703" },
  { id: "p4", label: "1/3", value: 1 / 3, color: "#06d6a0" },
  { id: "p5", label: "1/6", value: 1 / 6, color: "#118ab2" },
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
