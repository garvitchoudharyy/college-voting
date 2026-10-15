"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Users, Vote } from "lucide-react";
import { useElection } from "@/lib/storage";
import { statusOf } from "@/lib/election";

const BADGE = { upcoming: "bg-amber-500/15 text-amber-600", open: "bg-emerald-500/15 text-emerald-600", closed: "bg-red-500/15 text-red-600" };
const LABEL = { upcoming: "Upcoming", open: "Voting Open", closed: "Voting Closed" };

function Countdown({ end }: { end: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const ms = new Date(end).getTime() - (now ?? 0);
  if (now === null || isNaN(ms)) return null;
  if (ms <= 0) return <p className="text-sm text-slate-500">Voting period has ended.</p>;
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
  return <p className="flex items-center gap-2 text-sm font-medium"><Clock size={16} /> Ends in {d}d {h}h {m}m {s}s</p>;
}

export default function Home() {
  const { ready, settings, votes, candidates } = useElection();
  const status = statusOf(settings);
  return (
    <div className="space-y-16">
      <section className="rounded-3xl bg-gradient-to-br from-[#0b1437] via-[#14246b] to-[#4c2a9a] p-8 text-white sm:p-14">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${ready ? BADGE[status] : "bg-white/10"}`}>{ready ? LABEL[status] : "Loading"}</span>
        <p className="mt-4 text-sm text-blue-200">{settings.title}</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-extrabold leading-tight sm:text-6xl">Your Vote. Your Voice. Your Campus.</h1>
        <p className="mt-4 max-w-xl text-blue-100">Choose your student representative in a quick, four-step ballot. One vote per browser, results update live on this device.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/vote" className="btn bg-white text-[#0b1437] hover:bg-blue-50"><Vote size={18} /> Enter Voting Booth</Link>
          <Link href="/results" className="btn border border-white/30 hover:bg-white/10">View Election Results</Link>
        </div>
        {ready && settings.endTime && <div className="mt-6 text-blue-100"><Countdown end={settings.endTime} /></div>}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {!ready ? [0, 1, 2].map((i) => <div key={i} className="skeleton h-28" />) : <>
          <div className="card"><Users className="text-blue-600" /><p className="mt-2 text-3xl font-bold">{votes.length}</p><p className="text-sm text-slate-500">Votes cast on this device</p></div>
          <div className="card"><CheckCircle2 className="text-violet-600" /><p className="mt-2 text-3xl font-bold">{candidates.length}</p><p className="text-sm text-slate-500">Candidates</p></div>
          <div className="card"><Clock className="text-emerald-600" /><p className="mt-2 text-3xl font-bold">{LABEL[status]}</p><p className="text-sm text-slate-500">Election status</p></div></>}
      </section>

      <section>
        <h2 className="text-2xl font-bold">How to vote</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-4">
          {["Open the voting booth", "Review all four candidates", "Select one candidate", "Confirm your choice"].map((t, i) => (
            <li key={t} className="card"><span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">{i + 1}</span><p className="mt-3 font-medium">{t}</p></li>))}
        </ol>
        <p className="mt-4 text-sm text-slate-500">Local demo: votes are stored in this browser only and are not secure.</p>
      </section>
    </div>
  );
}
