# Casa Gad web

Direct-booking site for one holiday house. Italian is the default language at `/`. English is at `/en/`. The owner admin is Italian only. This app is the Next.js full-stack service on Firebase App Hosting (OD-02). There is no Cloud Functions backend and no static export.

## What changed (Prompt 01)

Skeleton only. Brand tokens and self-hosted fonts are wired. Route groups exist as empty folders. There is one temporary home page at `/` so the app can build. i18n, Firebase, and features start in later prompts.

## Stack and pinned versions

| Package | Pin | Installed by create-next-app |
|---|---|---|
| Node | `>=24 <25` | Patricia's machine must be Node 24 |
| next | `~16.4.6` | 16.4.6 |
| react | `~19.3.0` | 19.3.0 |
| react-dom | `~19.3.0` | 19.3.0 |
| tailwindcss | 4.3.3 | 4.3.3 |
| typescript | `^5` | as installed |
| @types/node | `^24.0.0` | was `^20` from create-next-app; Vitest 5 asks for `^22` or `>=24` |

`next`, `react`, and `react-dom` use `~` so a later install can take a 16.4 / 19.3 patch and cannot jump a minor. Vitest and Playwright are not listed here until the install below writes them into the lockfile.

`next.config.ts` does not set `output: "export"`. `proxy.ts` (not `middleware.ts`) arrives in Prompt 04.

## Folder map

```
app/
  layout.tsx          temporary root layout, lang="it"
  page.tsx            temporary home (H1 only)
  globals.css         Tailwind v4 @theme, brand v2 tokens
  (it)/               Italian routes (Prompt 02)
  (en)/en/            English routes (Prompt 02)
  (admin)/admin/      Italian admin (later)
  api/                thin handlers (later)
components/{ui,site,booking,admin}/
lib/{fonts.ts,i18n,firebase,content,seo}/
locales/{it,en}/
shared/               pure values safe for client and server
  schemas/
server/{domain,use-cases,repositories,adapters,auth,workers,audit}/
  adapters/{firestore,stripe,mail,ical,pdf}/
public/fonts/         Cormorant Garamond + Jost woff2
public/images/
scripts/
tests/{unit,rules,integration,e2e}/
.cursor/rules/        casagad.mdc, server.mdc, i18n.mdc
```

Empty folders contain `.gitkeep`. Real server files, when they arrive, start with `import "server-only"`.

## Rules summary

- The browser never reads or writes Firestore.
- One Firestore transaction per business change: state, audit row, and outbox together. No Stripe, Resend, fetch, or Storage inside the callback.
- Money is integer cents, EUR. Stay dates are `YYYY-MM-DD` in Europe/Rome. Check-out is exclusive.
- The URL chooses the language. No detector, no locale cookie, no automatic redirect.
- User-facing strings live in `locales/`. Do not render unconfirmed `[GUIDO]`, `[ASK FAMILY]`, or `[ACCOUNTANT]` facts.

## Commands Patricia runs

From `web/`, after this step:

```bash
cd ~/Projects/clients-workspace/casagad/web
npm install
npm install -D vitest @vitest/coverage-v8 @playwright/test
npx playwright install
npm run typecheck && npm run lint && npm test && npm run build
npm run dev   # open http://localhost:3000
git add -A && git commit -m "Scaffold Casa Gad web app"
```

`npm test` runs Vitest on `tests/unit`. `npm run test:rules` is ready and passes with no rules tests yet. `npm run test:e2e` runs Playwright (mobile Safari, Android Chrome, desktop). There are no end-to-end tests yet.

## Env var names

None yet. `.env.example` is a placeholder. Do not commit `.env` or `.env.local`.

## Local vs production

Local `npm run dev` serves the skeleton at `/` with Italian `lang`, brand colours, and the self-hosted fonts. Nothing talks to Firebase, Stripe, or email. Production is the same shell until later prompts add data and App Hosting. Prompt 04 is the first real deploy check.

## Open items

- Prompt 02 replaces `app/layout.tsx` and `app/page.tsx` with route-group layouts (`html lang` per language). Those files are only here so the skeleton builds.
- `web/.git/config` has no `origin` yet. The commit above stays local until the GitHub remote is added and pushed.
- create-next-app left `public/next.svg`, `vercel.svg`, `globe.svg`, `file.svg`, and `window.svg`. Nothing references them.
- OD-05: the automatic balance card-link email stays off until Patricia confirms it (Prompt 16).
- Resource locations are confirmed by Patricia at provisioning (TR-08).
- Vitest and Playwright versions are whatever the lockfile records after the install above.

## Needs design review

None from this step. The Pietra-on-Calce token (`pietra-calce`, `#60686C`) is the contrast adjustment already recorded in the approved G4 CSS.

## Checks

Reviewed in source: folder map, no `output: "export"`, no `next/font/google`, tokens match `03-design/assets/casagad.css`, font files are the six brand woff2 files, rules files exist, README sections above are filled in. `next/font` options, including each `unicode-range`, are written as string literals in `lib/fonts.ts`. Vitest config is `vitest.config.mts` so Vite loads it as ESM.

Patricia must run typecheck, lint, test, and build. Those commands were not run here.
