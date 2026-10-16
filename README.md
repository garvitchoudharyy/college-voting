# Campus Vote: College Election 2026 (student demo)

Next.js 14 (App Router), TypeScript, Tailwind, Recharts, Framer Motion, Lucide. No database, no env variables.

## 1. Prerequisites
Node.js 18.18+ and npm.

## 2. Install
    npm install

## 3. Run locally
    npm run dev      # http://localhost:3000

## 4. Production build
    npm run build && npm start

## 5. Deploy to Vercel
Push the folder to GitHub, then in Vercel choose "Add New Project", import the repo and click Deploy. Defaults work as-is.

## 6. Demo login
Go to `/admin` (footer link). Any email ending in `@glbtim.ac.in` with any non-empty password is accepted. This only checks the domain; it does NOT verify identity and is not secure.

Voters log in at `/login` with any email ending in `@glbitm.ac.in` and any password (domain check only, not real verification). The voting booth redirects to `/login` until then. Admin uses `@glbtim.ac.in` (see `lib/config.ts` to change either domain).

## 7. Reset demo data
Admin > Demo Data Management > Reset votes / candidates / everything (each asks for confirmation).

## 8. Why LocalStorage is unsuitable for a real election
Anyone can edit or clear it in dev tools, votes are per-browser (so one person can vote on many devices or in incognito), results can't be combined across voters, and there is no real authentication or audit trail. A real election needs server-side authentication and a persistent database.

Edit initial candidates in `lib/config.ts`.
