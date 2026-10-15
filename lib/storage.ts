"use client";
import { useCallback, useEffect, useState } from "react";
import { Candidate, DEFAULT_CANDIDATES, DEFAULT_SETTINGS, Settings, Vote } from "./config";
import { parseBackup, validCandidates, validSettings, validVotes } from "./validation";
import { statusOf } from "./election";

const K = { c: "cv:candidates", v: "cv:votes", s: "cv:settings", h: "cv:hasVoted", a: "cv:admin" };
const read = (k: string): unknown => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch { return null; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new Event("cv-change")); return true; } catch { return false; } };
const del = (k: string) => { try { localStorage.removeItem(k); } catch {} };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

type State = { ready: boolean; candidates: Candidate[]; votes: Vote[]; settings: Settings; hasVoted: boolean };
const initial: State = { ready: false, candidates: DEFAULT_CANDIDATES, votes: [], settings: DEFAULT_SETTINGS, hasVoted: false };

export function useElection() {
  const [st, setSt] = useState<State>(initial);
  const load = useCallback(() => {
    const c = read(K.c), v = read(K.v), s = read(K.s);
    setSt({ ready: true, candidates: validCandidates(c) ? c : DEFAULT_CANDIDATES, votes: validVotes(v) ? v : [], settings: validSettings(s) ? s : DEFAULT_SETTINGS, hasVoted: read(K.h) === true });
  }, []);
  useEffect(() => {
    load();
    window.addEventListener("storage", load);
    window.addEventListener("cv-change", load);
    return () => { window.removeEventListener("storage", load); window.removeEventListener("cv-change", load); };
  }, [load]);

  const castVote = (candidateId: string): "ok" | "already" | "closed" | "error" => {
    if (read(K.h) === true) return "already";
    const s = read(K.s);
    if (statusOf(validSettings(s) ? s : DEFAULT_SETTINGS) !== "open") return "closed";
    const old = read(K.v);
    const votes = validVotes(old) ? old : [];
    if (!write(K.v, [...votes, { id: uid(), candidateId, ts: Date.now() }])) return "error";
    if (!write(K.h, true)) { write(K.v, votes); return "error"; }
    return "ok";
  };
  const saveCandidates = (c: Candidate[]) => write(K.c, c);
  const saveSettings = (s: Settings) => write(K.s, s);
  const resetVotes = () => { del(K.v); del(K.h); window.dispatchEvent(new Event("cv-change")); };
  const resetCandidates = () => { del(K.c); window.dispatchEvent(new Event("cv-change")); };
  const resetAll = () => { [K.c, K.v, K.s, K.h].forEach(del); window.dispatchEvent(new Event("cv-change")); };
  const importBackup = (text: string): string | null => {
    const r = parseBackup(text);
    if (typeof r === "string") return r;
    return write(K.c, r.candidates) && write(K.v, r.votes) && write(K.s, r.settings) ? null : "Could not save to browser storage.";
  };
  return { ...st, castVote, saveCandidates, saveSettings, resetVotes, resetCandidates, resetAll, importBackup };
}

// Demo-only admin session. NOT secure authorization.
export function useAdmin() {
  const [st, setSt] = useState<{ ready: boolean; email: string | null }>({ ready: false, email: null });
  useEffect(() => {
    const load = () => {
      let email: string | null = null;
      try { const r = sessionStorage.getItem(K.a) ?? localStorage.getItem(K.a); const p = r ? JSON.parse(r) : null; if (p && typeof p.email === "string") email = p.email; } catch {}
      setSt({ ready: true, email });
    };
    load();
    window.addEventListener("cv-change", load);
    return () => window.removeEventListener("cv-change", load);
  }, []);
  const login = (email: string, remember: boolean) => {
    try { (remember ? localStorage : sessionStorage).setItem(K.a, JSON.stringify({ email })); window.dispatchEvent(new Event("cv-change")); return true; } catch { return false; }
  };
  const logout = () => { try { sessionStorage.removeItem(K.a); localStorage.removeItem(K.a); } catch {} window.dispatchEvent(new Event("cv-change")); };
  return { ...st, login, logout };
}
