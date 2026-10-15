"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { useAdmin } from "@/lib/storage";
import { isAdminEmail } from "@/lib/validation";
import { useToast } from "@/components/Shell";

export default function AdminLogin() {
  const { ready, email: current, login } = useAdmin();
  const router = useRouter(); const toast = useToast();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [show, setShow] = useState(false); const [remember, setRemember] = useState(false);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { if (ready && current) router.replace("/admin/dashboard"); }, [ready, current, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminEmail(email)) return setErr("Use an email ending in @glbtim.ac.in.");
    if (!pw) return setErr("Enter a password.");
    setErr(""); setBusy(true);
    setTimeout(() => {
      if (login(email.trim().toLowerCase(), remember)) router.push("/admin/dashboard");
      else { toast("Could not start the demo session.", "error"); setBusy(false); }
    }, 600);
  };
  return (
    <form onSubmit={submit} className="card mx-auto max-w-md space-y-4" noValidate>
      <h1 className="text-2xl font-bold">Admin login</h1>
      <p className="flex gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"><ShieldAlert size={18} className="shrink-0" />Demo authentication: only the email domain is checked and any password works. This does not verify who you are.</p>
      <div><label htmlFor="e" className="mb-1 block text-sm font-medium">Email</label><input id="e" type="email" className="input" value={email} onChange={(x) => setEmail(x.target.value)} placeholder="name@glbtim.ac.in" autoComplete="email" /></div>
      <div><label htmlFor="p" className="mb-1 block text-sm font-medium">Password</label>
        <div className="relative"><input id="p" type={show ? "text" : "password"} className="input pr-11" value={pw} onChange={(x) => setPw(x.target.value)} autoComplete="current-password" />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={remember} onChange={(x) => setRemember(x.target.checked)} /> Remember me on this device</label>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" size={16} />}Sign in</button>
    </form>
  );
}
