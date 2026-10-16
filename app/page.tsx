"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Lock, Users, Vote, BarChart3, Mail } from "lucide-react";
import { useElection } from "@/lib/storage";
import { statusOf } from "@/lib/election";
import { Avatar } from "@/components/candidates/CandidateCard";

const BADGE = { upcoming: "bg-amber-400 text-amber-950", open: "bg-emerald-400 text-emerald-950", closed: "bg-red-400 text-red-950" };
const LABEL = { upcoming: "Upcoming", open: "Voting Open", closed: "Voting Closed" };

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  return now;
}

function LiveClock() {
  const now = useNow();
  if (now === null) return <div className="h-24" />;
  const d = new Date(now);
  return (
    <div>
      <p className="text-4xl font-bold tabular-nums sm:text-5xl">{d.toLocaleTimeString()}</p>
      <p className="mt-1 flex items-center gap-2 text-blue-100"><CalendarDays size={18} />{d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
    </div>
  );
}

function Countdown({ end }: { end: string }) {
  const now = useNow();
  const ms = new Date(end).getTime() - (now ?? 0);
  if (now === null || isNaN(ms)) return null;
  if (ms <= 0) return <p className="font-medium">Voting period has ended.</p>;
  const p = (n: number) => String(n).padStart(2, "0");
  const parts = [["Days", Math.floor(ms / 864e5)], ["Hours", Math.floor(ms / 36e5) % 24], ["Min", Math.floor(ms / 6e4) % 60], ["Sec", Math.floor(ms / 1e3) % 60]];
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm text-blue-100"><Clock size={16} />Voting ends in</p>
      <div className="flex gap-3">{parts.map(([l, v]) => <div key={l as string} className="min-w-16 rounded-xl bg-white/10 px-3 py-2 text-center"><p className="text-2xl font-bold tabular-nums">{p(v as number)}</p><p className="text-xs text-blue-100">{l}</p></div>)}</div>
    </div>
  );
}

export default function Home() {
  const { ready, settings, votes, candidates } = useElection();
  const status = statusOf(settings);
  return (
    <div className="space-y-20">
      <section className="grid gap-10 rounded-3xl bg-gradient-to-br from-[#0b1437] via-[#14246b] to-[#4c2a9a] p-8 text-white sm:p-14 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${ready ? BADGE[status] : "bg-white/10"}`}>{ready ? LABEL[status] : "Loading"}</span>
          <p className="mt-5 text-lg text-blue-200">{settings.title}</p>
          <h1 className="mt-2 text-5xl font-extrabold leading-tight sm:text-7xl">Your Vote. Your Voice. Your Campus.</h1>
          <p className="mt-5 max-w-xl text-lg text-blue-100">Choose your student representative in a quick, guided ballot. One vote per browser, and results update live on this device.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/vote" className="btn bg-white px-7 py-4 text-base text-[#0b1437] hover:bg-blue-50"><Vote size={20} /> Enter Voting Booth</Link>
            <Link href="/results" className="btn border border-white/30 px-7 py-4 text-base hover:bg-white/10">View Election Results</Link>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-8 rounded-2xl border border-white/15 bg-white/5 p-6 lg:col-span-2">
          <div><p className="mb-2 text-sm text-blue-200">Current time</p><LiveClock /></div>
          {ready && settings.endTime && <Countdown end={settings.endTime} />}
          {ready && !settings.endTime && <p className="text-sm text-blue-200">No end time has been set for this election.</p>}
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        {!ready ? [0, 1, 2].map((i) => <div key={i} className="skeleton h-36" />) : <>
          <div className="card"><Users className="text-blue-600" size={28} /><p className="mt-3 text-4xl font-bold">{votes.length}</p><p className="text-slate-500">Votes cast on this device</p></div>
          <div className="card"><CheckCircle2 className="text-violet-600" size={28} /><p className="mt-3 text-4xl font-bold">{candidates.length}</p><p className="text-slate-500">Candidates standing</p></div>
          <div className="card"><Clock className="text-emerald-600" size={28} /><p className="mt-3 text-4xl font-bold">{LABEL[status]}</p><p className="text-slate-500">Election status</p></div></>}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-3xl font-bold">Meet the candidates</h2><p className="mt-1 text-slate-500">Read their promises, then head to the booth.</p></div><Link href="/vote" className="btn btn-primary">Vote now</Link></div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {!ready ? [0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-80" />) : candidates.map((c) => (
            <article key={c.id} className="card flex flex-col transition hover:-translate-y-1 hover:shadow-lg" style={{ borderTop: `4px solid ${c.color}` }}>
              <div className="flex items-center gap-4"><Avatar c={c} size={64} /><div><p className="text-sm text-slate-500">Candidate #{c.number}</p><h3 className="text-xl font-bold">{c.name}</h3></div></div>
              <p className="mt-4 font-medium italic" style={{ color: c.color }}>{c.slogan}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{c.manifesto}</p>
              <ul className="mt-3 space-y-1 text-sm">{c.promises.map((p, i) => <li key={i} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: c.color }} />{p}</li>)}</ul>
            </article>))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold">How to vote</h2>
        <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[[Mail, "Log in", "Use your college email."], [Users, "Review", "Read all candidate profiles."], [Vote, "Select", "Pick exactly one candidate."], [CheckCircle2, "Confirm", "Check your choice and submit."]].map(([I, t, d], i) => { const Icon = I as typeof Mail; return (
            <li key={t as string} className="card"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white"><Icon size={22} /></span><p className="mt-4 text-lg font-semibold">{i + 1}. {t as string}</p><p className="text-slate-500">{d as string}</p></li>); })}
        </ol>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="card"><Lock className="text-blue-600" size={26} /><h3 className="mt-3 text-lg font-bold">One vote each</h3><p className="mt-1 text-slate-500">Each browser can record a single vote, and votes can't be changed afterwards.</p></div>
        <div className="card"><BarChart3 className="text-violet-600" size={26} /><h3 className="mt-3 text-lg font-bold">Live results</h3><p className="mt-1 text-slate-500">Charts and the leaderboard update instantly when a vote is recorded.</p></div>
        <div className="card"><Users className="text-emerald-600" size={26} /><h3 className="mt-3 text-lg font-bold">Who can vote</h3><p className="mt-1 text-slate-500">Students with a college email address can log in and cast a vote.</p></div>
      </section>
    </div>
  );
}
