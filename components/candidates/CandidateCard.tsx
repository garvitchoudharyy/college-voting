"use client";
import { Check } from "lucide-react";
import { Candidate } from "@/lib/config";
export function Avatar({ c, size = 56 }: { c: Candidate; size?: number }) {
  const initials = c.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return <span className="grid shrink-0 place-items-center rounded-2xl font-bold text-white" style={{ width: size, height: size, background: c.color }} aria-hidden>{initials}</span>;
}
export default function CandidateCard({ c, selected, onSelect }: { c: Candidate; selected: boolean; onSelect: () => void }) {
  return (
    <div className={`card flex flex-col transition hover:-translate-y-1 hover:shadow-lg ${selected ? "ring-2 ring-blue-600" : ""}`}>
      <div className="flex items-center gap-4">
        <Avatar c={c} />
        <div><p className="text-sm text-slate-500">Candidate #{c.number}</p><h3 className="text-lg font-bold">{c.name}</h3></div>
      </div>
      <p className="mt-3 text-sm font-medium italic" style={{ color: c.color }}>{c.slogan}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{c.manifesto}</p>
      <ul className="mt-3 flex-1 space-y-1 text-sm">{c.promises.map((p, i) => <li key={i} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0" style={{ color: c.color }} />{p}</li>)}</ul>
      <button onClick={onSelect} aria-pressed={selected} className={`btn mt-5 ${selected ? "btn-primary" : "btn-ghost"}`}>{selected ? <><Check size={16} /> Selected</> : "Select Candidate"}</button>
    </div>
  );
}
