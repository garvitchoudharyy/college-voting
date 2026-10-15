import type { Candidate, Settings, Vote } from "./config";
export type Row = { candidate: Candidate; count: number; pct: number; rank: number };
export function tally(candidates: Candidate[], votes: Vote[]): Row[] {
  const total = votes.length;
  const rows = candidates.map((candidate) => {
    const count = votes.filter((v) => v.candidateId === candidate.id).length;
    return { candidate, count, pct: total ? (count / total) * 100 : 0, rank: 0 };
  });
  rows.sort((a, b) => b.count - a.count || a.candidate.number - b.candidate.number);
  rows.forEach((r, i) => (r.rank = i > 0 && r.count === rows[i - 1].count ? rows[i - 1].rank : i + 1));
  return rows;
}
export function statusOf(s: Settings, now = Date.now()): Settings["status"] {
  if (s.status === "open" && s.endTime) { const t = new Date(s.endTime).getTime(); if (!isNaN(t) && t <= now) return "closed"; }
  return s.status;
}
export const leaders = (rows: Row[]) => (rows[0] && rows[0].count > 0 ? rows.filter((r) => r.count === rows[0].count) : []);
