"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { useVoter } from "@/lib/storage";
import { isVoterEmail } from "@/lib/validation";
import { VOTER_DOMAIN } from "@/lib/config";
import { useToast } from "@/components/Shell";

export default function VoterLogin() {
  const { ready, email: current, login } = useVoter();
  const router = useRouter(); const toast = useToast();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [show, setShow] = useState(false); const [remember, setRemember] = useState(false);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { if (ready && current) router.replace("/vote"); }, [ready, current, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVoterEmail(email)) return setErr(`Use your college email ending in @${VOTER_DOMAIN}.`);
    if (!pw) return setErr("Enter a password.");
    setErr(""); setBusy(true);
    setTimeout(() => {
      if (login(email.trim().toLowerCase(), remember)) router.push("/vote");
      else { toast("Could not start the demo session.", "error"); setBusy(false); }
    }, 500);
  };
  return (
    <form onSubmit={submit} className="card mx-auto max-w-md space-y-4" noValidate>
      <h1 className="text-2xl font-bold">Log in to vote</h1>
      <p className="flex gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"><ShieldAlert size={18} className="shrink-0" />Demo login: only the email domain is checked and any password works. It does not verify who you are.</p>
      <div><label htmlFor="ve" className="mb-1 block text-sm font-medium">College email</label><input id="ve" type="email" className="input" value={email} onChange={(x) => setEmail(x.target.value)} placeholder={`name@${VOTER_DOMAIN}`} autoComplete="email" /></div>
      <div><label htmlFor="vp" className="mb-1 block text-sm font-medium">Password</label>
        <div className="relative"><input id="vp" type={show ? "text" : "password"} className="input pr-11" value={pw} onChange={(x) => setPw(x.target.value)} autoComplete="current-password" />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={remember} onChange={(x) => setRemember(x.target.checked)} /> Remember me on this device</label>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" size={16} />}Log in</button>
    </form>
  );
}
