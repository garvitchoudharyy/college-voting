"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useVoter } from "@/lib/storage";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, Vote, X } from "lucide-react";

type Kind = "success" | "error";
const ToastCtx = createContext<(m: string, k?: Kind) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

const NAV = [{ href: "/", label: "Home" }, { href: "/vote", label: "Vote" }, { href: "/results", label: "Results" }];

export default function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const voter = useVoter();
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ m: string; k: Kind } | null>(null);

  useEffect(() => {
    let d = false;
    try { const t = localStorage.getItem("cv:theme"); d = t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches; } catch {}
    setDark(d);
  }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  useEffect(() => setOpen(false), [path]);

  const notify = useCallback((m: string, k: Kind = "success") => { setToast({ m, k }); setTimeout(() => setToast(null), 3500); }, []);
  const flip = () => { setDark(!dark); try { localStorage.setItem("cv:theme", !dark ? "dark" : "light"); } catch {} };
  const link = (href: string) => `rounded-lg px-3 py-2 text-sm font-medium transition ${path === href ? "bg-blue-600/10 text-blue-600 dark:text-blue-400" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`;

  return (
    <ToastCtx.Provider value={notify}>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-[#070d24]/80">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white"><Vote size={18} /></span>
            Campus Vote
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((n) => <Link key={n.href} href={n.href} className={link(n.href)} aria-current={path === n.href ? "page" : undefined}>{n.label}</Link>)}
            {voter.ready && (voter.email ? <button onClick={voter.logout} className={link("")}>Sign out</button> : <Link href="/login" className={link("/login")}>Log in</Link>)}
            <button onClick={flip} className="ml-2 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Toggle dark mode">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          </nav>
          <div className="flex items-center gap-1 md:hidden">
            <button onClick={flip} className="rounded-lg p-2" aria-label="Toggle dark mode">{dark ? <Sun size={20} /> : <Moon size={20} />}</button>
            <button onClick={() => setOpen(!open)} className="rounded-lg p-2" aria-label="Menu" aria-expanded={open}>{open ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
        </div>
        {open && <nav className="flex flex-col gap-1 border-t border-slate-200 p-3 dark:border-white/10 md:hidden">{NAV.map((n) => <Link key={n.href} href={n.href} className={link(n.href)}>{n.label}</Link>)}{voter.ready && (voter.email ? <button onClick={voter.logout} className={`${link("")} text-left`}>Sign out</button> : <Link href="/login" className={link("/login")}>Log in</Link>)}<Link href="/admin" className={link("/admin")}>Admin Login</Link></nav>}
      </header>
      <AnimatePresence mode="wait">
        <motion.main key={path} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="mx-auto min-h-[70vh] max-w-7xl px-5 py-12">{children}</motion.main>
      </AnimatePresence>
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-white/10">
        <Link href="/admin" className="inline-block font-medium text-blue-600 underline dark:text-blue-400">Admin Login</Link>
      </footer>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {toast && <div role="status" className={`rounded-xl px-5 py-3 text-sm font-medium text-white shadow-xl ${toast.k === "error" ? "bg-red-600" : "bg-emerald-600"}`}>{toast.m}</div>}
      </div>
    </ToastCtx.Provider>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0f1a3d]">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
