"use client";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { useElection } from "@/lib/storage";
import { leaders, statusOf, tally } from "@/lib/election";
import ResultCharts from "@/components/charts/ResultCharts";
import { Avatar } from "@/components/candidates/CandidateCard";

export default function ResultsPage() {
  const { ready, candidates, votes, settings } = useElection();
  if (!ready) return <div className="grid gap-4 sm:grid-cols-2"><div className="skeleton h-72" /><div className="skeleton h-72" /></div>;
  if (!settings.resultsEnabled) return <div className="card mx-auto max-w-md text-center"><h1 className="text-2xl font-bold">Results are hidden</h1><p className="mt-2 text-slate-500">The admin has turned the results page off.</p></div>;
  const rows = tally(candidates, votes);
  const lead = leaders(rows).map((r) => r.candidate.id);
  const last = votes.length ? new Date(Math.max(...votes.map((v) => v.ts))).toLocaleString() : "No votes yet";
  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold">Results</h1><p className="mt-1 text-sm text-slate-500">Local demo results. This browser only. Status: {statusOf(settings)}. Last vote: {last}</p></div>
      <div className="card"><p className="text-4xl font-bold">{votes.length}</p><p className="text-sm text-slate-500">Total recorded votes</p></div>
      {votes.length === 0 ? <div className="card py-12 text-center"><h2 className="text-xl font-bold">No votes yet</h2><p className="mt-2 text-slate-500">Charts appear after the first vote.</p><Link href="/vote" className="btn btn-primary mt-5">Go to voting booth</Link></div> : <ResultCharts rows={rows} />}
      <section className="card"><h2 className="mb-4 text-xl font-bold">Leaderboard</h2>
        <ol className="space-y-4">{rows.map((r) => (
          <li key={r.candidate.id} className="flex items-center gap-4"><span className="w-6 font-bold">{r.rank}</span><Avatar c={r.candidate} size={44} />
            <div className="flex-1"><p className="flex flex-wrap items-center gap-2 font-semibold">{r.candidate.name}{lead.includes(r.candidate.id) && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-600"><Trophy size={12} /> Leading</span>}</p>
              <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-white/10"><div className="h-2 rounded-full transition-all" style={{ width: `${r.pct}%`, background: r.candidate.color }} /></div></div>
            <p className="w-24 text-right text-sm">{r.count} ({r.pct.toFixed(1)}%)</p></li>))}</ol></section>
    </div>
  );
}
