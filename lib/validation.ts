import type { Candidate, Settings, Vote } from "./config";
export const isAdminEmail = (e: string) => /^[^\s@]+@glbitm\.ac\.in$/i.test(e.trim());
export const isVoterEmail = (e: string) => /^[^\s@]+@glbitm\.ac\.in$/i.test(e.trim());
const s = (x: unknown): x is string => typeof x === "string";
const o = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null;
export function validCandidates(x: unknown): x is Candidate[] {
  return Array.isArray(x) && x.length > 0 && x.length <= 12 && x.every((c) => o(c) && s(c.id) && typeof c.number === "number" && s(c.name) && s(c.slogan) && s(c.manifesto) && s(c.color) && Array.isArray(c.promises) && c.promises.every(s));
}
export function validSettings(x: unknown): x is Settings {
  return o(x) && s(x.title) && ["upcoming", "open", "closed"].includes(x.status as string) && s(x.endTime) && typeof x.resultsEnabled === "boolean";
}
export function validVotes(x: unknown): x is Vote[] {
  return Array.isArray(x) && x.every((v) => o(v) && s(v.id) && s(v.candidateId) && typeof v.ts === "number");
}
export function parseBackup(text: string): { candidates: Candidate[]; votes: Vote[]; settings: Settings } | string {
  let d: unknown;
  try { d = JSON.parse(text); } catch { return "File is not valid JSON."; }
  if (!o(d)) return "Backup must be a JSON object.";
  if (!validCandidates(d.candidates)) return "Candidates data is missing or invalid.";
  if (!validSettings(d.settings)) return "Settings data is missing or invalid.";
  if (!validVotes(d.votes)) return "Votes data is missing or invalid.";
  const ids = new Set(d.candidates.map((c) => c.id));
  if (d.votes.some((v) => !ids.has(v.candidateId))) return "A vote refers to an unknown candidate.";
  return { candidates: d.candidates, votes: d.votes, settings: d.settings };
}
