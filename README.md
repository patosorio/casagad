# Casa Gad

Direct-booking site for one holiday house. Italian is the default language. English is at `/en/`. The owner admin is Italian only.

## Stack

| Package | Version |
|---|---|
| Node.js | `>=24 <25` |
| Next.js | `~16.4.6` |
| React | `~19.3.0` |
| react-dom | `~19.3.0` |
| i18next | `~27.2.7` |
| react-i18next | `~18.0.3` |
| Tailwind CSS | `4.3.3` |
| TypeScript | `^5` |

The app is a Next.js server on Firebase App Hosting with the Node.js 24 runtime. There is no Cloud Functions backend and no static export. `next.config.ts` sets `trailingSlash: true`, `cacheComponents`, and `experimental.globalNotFound`. It does not set `output: "export"`.

`next`, `react`, `react-dom`, `i18next`, and `react-i18next` stay on `~` ranges. If `npm install` rewrites a range to `^`, put the tilde back. The lockfile is the exact version.

Local `npm run dev` and `npm start` do not talk to Firebase, Stripe, or email.

## Requirements

- Node.js 24 (`>=24 <25`)
- npm

## Getting started

From this directory:

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` for local values. Do not commit `.env.local`. Names, and where each value lives, are under Environment and secrets.

## Environment and secrets

`.env.example` lists names only. Patricia sets every value. Do not paste secrets into chat, source, or `.env.example`.

Local values live in `.env.local`. Production secrets live in Google Secret Manager. Production public config is set for App Hosting (the draft `apphosting.yaml` uses the placeholder `<set in console>` for those public names).

| Name | Local | Production |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `.env.local` | App Hosting env |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `.env.local` | App Hosting env |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `.env.local` | App Hosting env |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `.env.local` | App Hosting env |
| `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` | `.env.local` | App Hosting env |
| `NEXT_PUBLIC_APPCHECK_DEBUG` | `.env.local` | Leave unset |
| `STRIPE_SECRET_KEY` | `.env.local` | Secret Manager |
| `STRIPE_WEBHOOK_SECRET` | `.env.local` | Secret Manager |
| `VRBO_ICAL_URL` | `.env.local` | Secret Manager |
| `ICAL_EXPORT_TOKEN` | `.env.local` | Secret Manager |
| `EMAIL_API_KEY` | `.env.local` | Secret Manager |
| `EMAIL_FROM` | `.env.local` | App Hosting env, when that feature needs it |
| `EMAIL_REPLY_TO` | `.env.local` | App Hosting env, when that feature needs it |
| `APP_BASE_URL` | `.env.local` | App Hosting env, when that feature needs it |
| `SCHEDULER_SA_EMAIL` | `.env.local` | App Hosting env, when that feature needs it |
| `STORAGE_BUCKET` | `.env.local` | App Hosting env, when Storage is used |
| `FIRESTORE_EMULATOR_HOST` | `.env.local` | Unset |
| `FIREBASE_AUTH_EMULATOR_HOST` | `.env.local` | Unset |
| `FIREBASE_STORAGE_EMULATOR_HOST` | `.env.local` | Unset |
| `GCLOUD_PROJECT` | `.env.local` | Set by the runtime |

`NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` are public identifiers. On App Hosting, a build that sees `FIREBASE_WEBAPP_CONFIG` copies that web config into the public Firebase names. `NEXT_PUBLIC_APPCHECK_DEBUG` is `true` only for local development.

The five Secret Manager names are `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VRBO_ICAL_URL`, `ICAL_EXPORT_TOKEN`, and `EMAIL_API_KEY`. `apphosting.yaml` references those names and does not contain the values. The Admin SDK uses Application Default Credentials. There is no service-account key file.

`server/config/env.ts` checks the server names with zod. They stay optional until the feature that reads them. A missing or invalid required value throws an error that names the variable and does not print the value.

After a production build, scan the browser and prerendered output:

```bash
npx tsx scripts/check-bundle-secrets.ts
```

The command exits non-zero when it finds `sk_live`, `sk_test`, `whsec_`, a Resend `re_` key, or a private-key marker. It prints the file and the marker, not the value. A clean scan prints `No secret markers in build output.`

## Emulators

Auth, Firestore, and Storage run in the emulator suite. `firebase.json` has no Hosting block. Rules deny every client read and write. The browser loads Auth and App Check only. Firestore and Storage are used on the server through `server/adapters/firestore/admin.ts`.

From `web/`, in a separate terminal:

```bash
npx firebase emulators:start --project casagad-c1f81
```

The emulator UI listens on `http://127.0.0.1:4000`. Ports are Auth `9099`, Firestore `8080`, Storage `9199`.

In `.env.local`, set the host variables to `host:port` with no scheme, and set `GCLOUD_PROJECT` to `casagad-c1f81`:

```
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
GCLOUD_PROJECT=casagad-c1f81
```

With any of those hosts set, the Admin SDK starts with the project id and does not load credentials. Unset the hosts to use a real project through Application Default Credentials.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm test` | Unit tests with Vitest (`tests/unit`) |
| `npm run test:headers` | Header and CSP checks against a running production server. Start the app first. It does not start one. |
| `npm run test:rules` | Firestore rules tests in `tests/rules`. Passes when that folder has no tests. |
| `npm run test:e2e` | Playwright against `http://127.0.0.1:3000`. Start the app first. It does not start one. Projects are mobile Safari, Android Chrome, and desktop Chrome. |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

From `web/`:

```bash
npm run typecheck && npm run lint && npm test && npm run build
npm run start
```

With `npm start` on port 3000:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/xyz/
curl -s http://localhost:3000/xyz/ | grep -o '<html[^>]*lang="it"'
curl -s http://localhost:3000/xyz/ | grep -o 'Questa pagina non c'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/en/xyz/
curl -s http://localhost:3000/en/xyz/ | grep -o '<html[^>]*lang="en"'
curl -s http://localhost:3000/en/xyz/ | grep -o "This page doesn"
curl -s http://localhost:3000/xyz/ http://localhost:3000/en/xyz/ | grep -c '__next_error__'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/la-casa/
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/en/the-house/
npm run test:e2e
```

Expect 404 for `/xyz/` and `/en/xyz/`, the matching `lang` and 404 sentence, a count of `0` for `__next_error__`, and 200 for `/la-casa/` and `/en/the-house/`. A production build lists HTML routes, including the public pages and `/_not-found`, as dynamic (`ƒ`), and lists the proxy. HTML is dynamic because each response carries a nonce. See Security headers and CSP.

With `npm start` still running on port 3000, in another terminal:

```bash
npm run test:headers
```

## Project structure

```
app/
  (it)/                 Italian public pages, URL `/`, <html lang="it">
  (en)/en/              English public pages, URL `/en/`, <html lang="en">
  (admin)/admin/        Italian admin, noindex
  global-not-found.tsx  Unmatched URLs
  globals.css           Tailwind v4 theme and brand tokens
components/site/        Header, footer, language switch
lib/i18n/               Locale config, routes, server and client i18n
locales/it/             common, site, booking, errors, admin
locales/en/             common, site, booking, errors
proxy.ts                Sets x-casagad-locale from the path
public/fonts/           Self-hosted Cormorant Garamond and Jost
server/                 Server-only domain code
shared/                 Types and helpers safe for client and server
tests/unit/             Vitest
tests/e2e/              Playwright
```

`(it)`, `(en)`, and `(admin)` are route groups and do not appear in the URL. There is no `app/page.tsx`. `/` is `app/(it)/page.tsx`.

| Page | Italian | English |
|---|---|---|
| Home | `/` | `/en/` |
| The house | `/la-casa/` | `/en/the-house/` |
| Photos | `/foto/` | `/en/photos/` |
| Location | `/dove-siamo/` | `/en/location/` |
| Book | `/prenota/` | `/en/book/` |
| Good to know | `/informazioni/` | `/en/good-to-know/` |
| Contact | `/contatti/` | `/en/contact/` |
| Privacy | `/privacy/` | `/en/privacy/` |
| Cookies | `/cookie/` | `/en/cookies/` |

Public paths end with `/`. A request without the slash redirects to the slashed URL. A server module starts with `import "server-only"`.

## Internationalisation

The URL chooses the language. There is no browser language detector, no locale cookie, and no automatic redirect.

Each language has its own root layout, so the first HTML response has the right `<html lang>`. Italian is `app/(it)/layout.tsx`. English is `app/(en)/en/layout.tsx`. Admin is `app/(admin)/admin/layout.tsx` and stays Italian. Do not add `app/layout.tsx`.

`proxy.ts` sets `x-casagad-locale` from the path on every matched request and overwrites a client-sent value. That step stays first. `/en` and `/en/…` are English. Every other path, including `/enx/`, is Italian.

### Namespaces

| File | Who uses it |
|---|---|
| `common` | Skip link, language switch, menu, footer, brand |
| `site` | Nav labels, page headings, 404 |
| `booking` | Night and guest plurals (`nights_one` / `nights_other`, `guests_one` / `guests_other`) |
| `errors` | One key per `appCode` from the API error list |
| `admin` | Italian only (`locales/it/admin.json`) |

Public namespaces must have the same key tree in Italian and English. `tests/unit/i18n-keys.test.ts` fails when a key is missing on either side. Admin is not part of that check.

### Adding a string

1. Add the key to `locales/it/{namespace}.json`. Italian is the source.
2. Add the same key to `locales/en/{namespace}.json` for `common`, `site`, `booking`, and `errors`. Do not add `locales/en/admin.json`.
3. In a Server Component or in `generateMetadata`, call `getT(locale, ns)` from `lib/i18n/server.ts`. Each call builds a new i18next instance with `createInstance()`. Do not keep a shared instance, and do not call `changeLanguage` on one.
4. In a Client Component, render under `I18nClientProvider` with that locale and only the namespaces the island needs, then use `useTranslation(ns)`. The provider is built from the JSON the server serialised. Header and the language switch already sit under it.
5. Run `npm test`. A missing English key fails the tree test.

In development and test, a key missing from both languages throws (`Missing i18n key: …`). i18next only calls `missingKeyHandler` when `saveMissing` is on, so those environments turn it on and the handler throws. There is no backend, so nothing is written. Production leaves `saveMissing` off and falls back to Italian.

Typed keys come from `lib/i18n/types.d.ts` (`CustomTypeOptions` on the Italian JSON). Do not cast a bad key away.

### Copy

Copy comes from the approved G4 HTML. Do not render `[GUIDO: …]`, `[ASK FAMILY: …]`, `[ACCOUNTANT …]`, or draft tags such as "bozza testo".

The footer takes an optional `cin` string and renders `CIN {{cin}}` only when a non-empty value is passed. No page passes one, so the line stays hidden.

Format dates, numbers, and money with `Intl` and `intlLocaleFor(locale)` (`it-IT` or `en-GB`). Currency is always EUR. Timezone is Europe/Rome. Switching language does not change prices or dates. Plurals use the `_one` / `_other` keys.

`LanguageSwitch` uses `lib/i18n/routes.ts`. A known page goes to its pair (`/prenota/` ↔ `/en/book/`). An unknown path keeps the slug and swaps the `/en` prefix, so a 404 stays a 404. The click keeps the query string and the hash. Admin paths stay Italian. The document title is the page heading.

## 404 handling

On Next.js 16.4 with `cacheComponents`, a `notFound()` or `redirect()` thrown while a page or layout renders does not behave like a normal status response ([vercel/next.js #100596](https://github.com/vercel/next.js/issues/100596), checked on a 16.4.6 build). `notFound()` answers with an empty `<html id="__next_error__">` shell: the 404 text appears only after JavaScript. Under `cacheComponents`, both `notFound()` and `redirect()` thrown in a page or layout answer HTTP 200.

Status is therefore decided in `proxy.ts`, before rendering. Unknown URLs are not routed through a page that calls `notFound()`.

There is no `[...slug]` catch-all and no `app/not-found.tsx`. An unknown URL matches no route. `app/global-not-found.tsx` reads `x-casagad-locale` (`export const instant = false`, fallback `it`) and renders `NotFoundDocument` for that locale: `<html lang>`, header, footer, 404 text, and `noindex`.

| URL | Language |
|---|---|
| `/xyz/` | Italian |
| `/en/xyz/` | English |
| `/enx/` | Italian (`/en` is a segment, not a string prefix) |

`app/(it)/not-found.tsx`, `app/(en)/en/not-found.tsx`, and `app/(admin)/admin/not-found.tsx` only cover a `notFound()` thrown inside a page that did match.

## Security headers and CSP

Every HTML response is rendered for that request. A nonce is created when the request arrives, so the document cannot be a static shell: a cached page would reuse the nonce. The Italian, English, and admin root layouts, and `app/global-not-found.tsx`, read `x-nonce` with `headers()` and set `instant` to `false`. That allows the read under `cacheComponents` and makes every HTML route dynamic. Hashed files under `/_next/static` stay cacheable.

`proxy.ts` still sets `x-casagad-locale` from the path first, and overwrites a client value. It then creates a nonce (`crypto.randomUUID()` as base64), sets `x-nonce` on the request, and sets `Content-Security-Policy-Report-Only` on the request and the response. Next reads `'nonce-…'` from that request header and applies it to the scripts and styles it generates. The same value is passed on `<html>` for any later `next/script` nonce.

The policy is report-only. `script-src` is `'self'`, the nonce, `'strict-dynamic'`, and the reCAPTCHA and Google sign-in hosts. It does not include `'unsafe-inline'`. `'unsafe-eval'` is added only when `NODE_ENV` is `development`. Reports are sent to `POST /api/csp-report`.

That route returns 204. It logs a short summary: the directive, the blocked origin (no query string), and whether the browser would have enforced the policy. It does not log the body, the nonce, the page URL, or a script sample. An in-memory per-address limit drops extra log lines on one instance. That limit is not a security control.

`next.config.ts` `headers()` sets these on every path:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |
| `X-Frame-Options` | `DENY` |
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` |

HTML responses, including unknown URLs, use `Cache-Control: private, no-store`. `/admin` and the booking result pages also send `X-Robots-Tag: noindex, nofollow`. Those pages are `/prenota/richiesta-inviata/`, `/prenota/pagamento-ok/`, `/prenota/pagamento-annullato/`, `/en/book/request-sent/`, `/en/book/payment-ok/`, and `/en/book/payment-cancelled/`. `/_next/static` is `public, max-age=31536000, immutable`. A calendar feed at `/calendar/{token}.ics` is `private, max-age=300`. Until that route exists, the same URL is the dynamic 404: no CSP header, and Next sends `no-store` on that 404.

The proxy does not run for `/_next/static`, `/_next/image`, `/fonts/`, `/images/`, favicon, `/calendar/*.ics`, `/api/stripe/webhook`, or `/api/internal/`. Those responses do not get a nonce or a CSP header. Unknown URLs under `/` and `/en/` still get the locale header and a nonce.

`npm test` does not call the running server. With `npm start` on port 3000, `npm run test:headers` checks the headers above, including that two requests to `/` carry different nonces.
