export type Candidate = { id: string; number: number; name: string; slogan: string; manifesto: string; promises: string[]; color: string };
export type Settings = { title: string; status: "upcoming" | "open" | "closed"; endTime: string; resultsEnabled: boolean };
export type Vote = { id: string; candidateId: string; ts: number };

export const DEFAULT_SETTINGS: Settings = { title: "College Election 2026", status: "open", endTime: "", resultsEnabled: true };

// Edit this list to change the initial candidates.
export const DEFAULT_CANDIDATES: Candidate[] = [
  { id: "c1", number: 1, name: "Candidate A", color: "#2563ff", slogan: "Open doors, open ideas.",
    manifesto: "Making campus decisions transparent and student-led.",
    promises: ["Monthly open student forum", "Extended library hours", "Public budget updates"] },
  { id: "c2", number: 2, name: "Candidate B", color: "#7c3aed", slogan: "Build it together.",
    manifesto: "Investing in clubs, events and creative spaces.",
    promises: ["Club funding portal", "Two annual cultural fests", "New student maker space"] },
  { id: "c3", number: 3, name: "Candidate C", color: "#0d9488", slogan: "Skills that get you hired.",
    manifesto: "Connecting students with careers and industry.",
    promises: ["Industry mentor program", "Free workshop series", "Internship job board"] },
  { id: "c4", number: 4, name: "Candidate D", color: "#e11d74", slogan: "A campus for everyone.",
    manifesto: "Improving facilities, wellbeing and accessibility.",
    promises: ["Better canteen and seating", "Counselling support desk", "Accessible campus routes"] },
];

// Allowed email domains (demo check only, not real authentication).
export const VOTER_DOMAIN = "glbitm.ac.in";
export const ADMIN_DOMAIN = "glbtim.ac.in";
