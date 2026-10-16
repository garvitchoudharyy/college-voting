"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Search } from "lucide-react";
import { useElection, useVoter } from "@/lib/storage";
import { statusOf } from "@/lib/election";
import CandidateCard from "@/components/candidates/CandidateCard";
import { Modal, useToast } from "@/components/Shell";

export default function VotePage() {
  const { ready, candidates, settings, hasVoted, castVote } = useElection();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const busy = useRef(false);
  const voter = useVoter(); const router = useRouter();
  useEffect(() => { if (voter.ready && !voter.email && !done) router.replace("/login"); }, [voter.ready, voter.email, done, router]);

  if (!ready || !voter.ready || (!voter.email && !done)) return <div className="grid gap-4 sm:grid-cols-2"><div className="skeleton h-64" /><div className="skeleton h-64" /></div>;
  const chosen = candidates.find((c) => c.id === sel);

  if (done) return (
    <div className="card mx-auto max-w-md text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white"><Check size={40} /></motion.div>
      <h1 className="mt-5 text-2xl font-bold">Vote recorded</h1>
      <p className="mt-2 text-slate-500">Your vote has been recorded on this device.</p>
      <Link href="/" className="btn btn-primary mt-6">Return home</Link>
    </div>);

  const status = statusOf(settings);
  if (status !== "open") return <div className="card mx-auto max-w-md text-center"><h1 className="text-2xl font-bold">{status === "closed" ? "Voting is closed" : "Voting hasn't started"}</h1><p className="mt-2 text-slate-500">You can't vote right now.</p><Link href="/results" className="btn btn-ghost mt-5">View results</Link></div>;
  if (hasVoted) return <div className="card mx-auto max-w-md text-center"><h1 className="text-2xl font-bold">You've already voted</h1><p className="mt-2 text-slate-500">A vote has already been recorded in this browser.</p><Link href="/results" className="btn btn-ghost mt-5">View results</Link></div>;

  const submit = () => {
    if (busy.current || !sel) return;
    busy.current = true;
    const r = castVote(sel);
    setConfirm(false);
    if (r === "ok") setDone(true);
    else toast(r === "error" ? "Your vote could not be saved. Browser storage may be unavailable." : r === "already" ? "A vote is already recorded in this browser." : "Voting is closed.", "error");
    busy.current = false;
  };
  const shown = candidates.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="mb-8 flex gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1} aria-label="Voting progress">
        {["Instructions", "Choose", "Confirm"].map((l, i) => <div key={l} className="flex-1"><div className={`h-2 rounded-full ${i <= step ? "bg-blue-600" : "bg-slate-200 dark:bg-white/10"}`} /><p className="mt-1 text-xs text-slate-500">{l}</p></div>)}
      </div>
      {step === 0 && <div className="card mx-auto max-w-xl"><h1 className="text-2xl font-bold">{settings.title}</h1>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-300"><li>Review all candidates.</li><li>Select exactly one.</li><li>Confirm. You can vote once per browser and can't change it afterwards.</li></ul>
        <button className="btn btn-primary mt-6" onClick={() => setStep(1)}>Start voting</button></div>}
      {step >= 1 && <>
        <div className="relative mb-6 max-w-sm"><Search size={16} className="absolute left-3 top-3.5 text-slate-400" /><input className="input pl-9" placeholder="Search candidates" aria-label="Search candidates" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {shown.length === 0 ? <p className="card text-center text-slate-500">No candidates match "{q}".</p> :
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{shown.map((c) => <CandidateCard key={c.id} c={c} selected={sel === c.id} onSelect={() => { setSel(c.id); setStep(2); }} />)}</div>}
        {step === 2 && chosen && <div className="card mt-8 flex flex-wrap items-center justify-between gap-4"><p>You selected <b>{chosen.name}</b>.</p><button className="btn btn-primary" onClick={() => setConfirm(true)}>Review and submit</button></div>}
      </>}
      {confirm && chosen && <Modal title="Confirm your vote" onClose={() => setConfirm(false)}>
        <p>Vote for <b>{chosen.name}</b>? This can't be undone on this browser.</p>
        <div className="mt-5 flex justify-end gap-2"><button className="btn btn-ghost" onClick={() => setConfirm(false)}>Go back</button><button className="btn btn-primary" onClick={submit}>Confirm vote</button></div></Modal>}
    </div>
  );
}
