"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Database, LayoutDashboard, LogOut, Settings as Cog, ShieldAlert, Trophy, Users, BarChart3 } from "lucide-react";
import { useAdmin, useElection } from "@/lib/storage";
import { leaders, statusOf, tally } from "@/lib/election";
import { Candidate, Settings } from "@/lib/config";
import { Modal, useToast } from "@/components/Shell";

type Tab = "overview" | "candidates" | "settings" | "data";
const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard }, { id: "candidates", label: "Manage Candidates", icon: Users },
  { id: "settings", label: "Election Settings", icon: Cog }, { id: "data", label: "Demo Data Management", icon: Database },
];
const download = (name: string, text: string, type: string) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href); };

export default function Dashboard() {
  const admin = useAdmin(); const el = useElection(); const toast = useToast(); const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview"); const [small, setSmall] = useState(false);
  const [cands, setCands] = useState<Candidate[]>([]); const [set, setSet] = useState<Settings | null>(null);
  const [ask, setAsk] = useState<null | "votes" | "cands" | "all">(null);
  useEffect(() => { if (admin.ready && !admin.email) router.replace("/admin"); }, [admin.ready, admin.email, router]);
  useEffect(() => { if (el.ready) { setCands(el.candidates); setSet(el.settings); } }, [el.ready, el.candidates, el.settings]);
  if (!admin.ready || !admin.email || !el.ready || !set) return <div className="skeleton h-96" />;

  const rows = tally(el.candidates, el.votes); const lead = leaders(rows);
  const upd = (i: number, p: Partial<Candidate>) => setCands(cands.map((c, j) => (j === i ? { ...c, ...p } : c)));
  const csv = () => download("results.csv", "Candidate,Votes,Percent\n" + rows.map((r) => `"${r.candidate.name.replace(/"/g, '""')}",${r.count},${r.pct.toFixed(2)}`).join("\n"), "text/csv");
  const run = () => { if (ask === "votes") el.resetVotes(); if (ask === "cands") el.resetCandidates(); if (ask === "all") el.resetAll(); setAsk(null); toast("Reset complete."); };
  const onFile = async (f?: File) => { if (!f) return; const err = el.importBackup(await f.text()); err ? toast(err, "error") : toast("Backup imported."); };

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <aside className={`card shrink-0 p-3 ${small ? "md:w-16" : "md:w-64"}`}>
        <button onClick={() => setSmall(!small)} className="mb-2 hidden rounded-lg p-2 md:block" aria-label="Collapse sidebar">{small ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
        <nav className="flex flex-wrap gap-1 md:flex-col">
          {TABS.map(({ id, label, icon: I }) => <button key={id} onClick={() => setTab(id)} aria-current={tab === id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${tab === id ? "bg-blue-600 text-white" : "hover:bg-slate-100 dark:hover:bg-white/10"}`}><I size={18} className="shrink-0" />{!small && label}</button>)}
          <Link href="/results" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10"><BarChart3 size={18} />{!small && "Voting Results"}</Link>
          <button onClick={() => { admin.logout(); router.push("/admin"); }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10"><LogOut size={18} />{!small && "Logout"}</button>
        </nav>
      </aside>
      <section className="min-w-0 flex-1 space-y-6">
        <p className="flex gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"><ShieldAlert size={18} className="shrink-0" />Demo mode: authentication and voting records are not secure.</p>

        {tab === "overview" && <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[["Votes on this device", el.votes.length], ["Candidates", el.candidates.length], ["Status", statusOf(el.settings)], ["Leading", lead.length ? lead.map((l) => l.candidate.name).join(", ") : "None yet"]].map(([l, v]) => <div key={l as string} className="card"><p className="text-xl font-bold capitalize">{v}</p><p className="text-sm text-slate-500">{l}</p></div>)}
          </div>
          <div className="card space-y-4">{rows.map((r) => <div key={r.candidate.id}><div className="flex justify-between text-sm"><span>{r.candidate.name}</span><span>{r.count} ({r.pct.toFixed(1)}%)</span></div><div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-white/10"><div className="h-2 rounded-full transition-all duration-700" style={{ width: `${r.pct}%`, background: r.candidate.color }} /></div></div>)}</div>
          <div className="card"><h2 className="mb-3 flex items-center gap-2 font-bold"><Trophy size={18} />Recent activity</h2>
            {el.votes.length === 0 ? <p className="text-sm text-slate-500">No votes recorded yet.</p> : <ul className="space-y-1 text-sm">{[...el.votes].reverse().slice(0, 6).map((v) => <li key={v.id}>A vote for {el.candidates.find((c) => c.id === v.candidateId)?.name} at {new Date(v.ts).toLocaleString()}</li>)}</ul>}</div></>}

        {tab === "candidates" && <div className="space-y-4">
          {cands.map((c, i) => <div key={c.id} className="card space-y-3"><h2 className="font-bold">Candidate #{c.number}</h2>
            <input className="input" aria-label="Name" value={c.name} onChange={(e) => upd(i, { name: e.target.value })} />
            <input className="input" aria-label="Slogan" value={c.slogan} onChange={(e) => upd(i, { slogan: e.target.value })} />
            <textarea className="input" aria-label="Description" rows={2} value={c.manifesto} onChange={(e) => upd(i, { manifesto: e.target.value })} />
            {c.promises.map((p, k) => <input key={k} className="input" aria-label={`Promise ${k + 1}`} value={p} onChange={(e) => upd(i, { promises: c.promises.map((x, j) => (j === k ? e.target.value : x)) })} />)}</div>)}
          <div className="flex flex-wrap gap-2"><button className="btn btn-primary" onClick={() => { if (cands.some((c) => !c.name.trim())) return toast("Every candidate needs a name.", "error"); el.saveCandidates(cands) ? toast("Candidates saved.") : toast("Could not save.", "error"); }}>Save changes</button>
            <button className="btn btn-ghost" onClick={() => setAsk("cands")}>Restore original candidates</button></div></div>}

        {tab === "settings" && <div className="card max-w-xl space-y-4">
          <div><label className="mb-1 block text-sm font-medium" htmlFor="t">Election title</label><input id="t" className="input" value={set.title} onChange={(e) => setSet({ ...set, title: e.target.value })} /></div>
          <div><label className="mb-1 block text-sm font-medium" htmlFor="s">Voting status</label><select id="s" className="input" value={set.status} onChange={(e) => setSet({ ...set, status: e.target.value as Settings["status"] })}><option value="upcoming">Upcoming</option><option value="open">Open</option><option value="closed">Closed</option></select></div>
          <div><label className="mb-1 block text-sm font-medium" htmlFor="d">Displayed end time</label><input id="d" type="datetime-local" className="input" value={set.endTime} onChange={(e) => setSet({ ...set, endTime: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={set.resultsEnabled} onChange={(e) => setSet({ ...set, resultsEnabled: e.target.checked })} />Show the public results page</label>
          <div className="flex flex-wrap gap-2"><button className="btn btn-primary" onClick={() => { if (!set.title.trim()) return toast("Title can't be empty.", "error"); el.saveSettings(set) ? toast("Settings saved.") : toast("Could not save.", "error"); }}>Save settings</button>
            <button className="btn btn-ghost" onClick={() => { el.saveSettings({ title: "College Election 2026", status: "open", endTime: "", resultsEnabled: true }); toast("Defaults restored."); }}>Restore defaults</button></div></div>}

        {tab === "data" && <div className="card max-w-xl space-y-4">
          <p className="text-sm text-slate-500">Data lives only in this browser. Clearing browser data or switching device changes the results.</p>
          <div className="flex flex-wrap gap-2"><button className="btn btn-ghost" onClick={csv}>Export CSV</button>
            <button className="btn btn-ghost" onClick={() => download("backup.json", JSON.stringify({ candidates: el.candidates, votes: el.votes, settings: el.settings }, null, 2), "application/json")}>Download JSON backup</button></div>
          <div><label className="mb-1 block text-sm font-medium" htmlFor="f">Import JSON backup</label><input id="f" type="file" accept="application/json" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} /></div>
          <div className="flex flex-wrap gap-2"><button className="btn btn-ghost" onClick={() => setAsk("votes")}>Reset votes</button><button className="btn btn-ghost" onClick={() => setAsk("cands")}>Reset candidates</button><button className="btn bg-red-600 text-white" onClick={() => setAsk("all")}>Reset everything</button></div></div>}
      </section>
      {ask && <Modal title="Are you sure?" onClose={() => setAsk(null)}><p className="text-sm">{ask === "votes" ? "All votes and this browser's voted flag will be deleted." : ask === "cands" ? "Candidates return to their defaults." : "Votes, candidates and settings will all be reset."}</p>
        <div className="mt-5 flex justify-end gap-2"><button className="btn btn-ghost" onClick={() => setAsk(null)}>Cancel</button><button className="btn bg-red-600 text-white" onClick={run}>Reset</button></div></Modal>}
    </div>
  );
}
