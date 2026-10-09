# FIXORA — Frontend

The React frontend for **Fixora**, a Smart Local Services Marketplace. This repository
contains the customer, provider and administrator single-page app. The Spring Boot API
lives in the companion repository ([TTbackend](https://github.com/Yash7672/TTbackend)).

Built with React 18, Vite 5, TypeScript 5 (strict), Tailwind CSS 3, React Router 6 and
Axios. Every button, list, price and status is backed by a real REST call — there is no
mock data in the UI.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 (strict) |
| Build | Vite 5 |
| Styling | Tailwind CSS 3, PostCSS, Autoprefixer |
| Routing | React Router 6 |
| Data | Axios |
| Forms | React Hook Form |
| Icons | Lucide React |
| Serving (prod) | Nginx (static hosting + `/api` reverse proxy) |

---

## How the API is wired

Every request goes to a **relative** `/api` path (`src/api/client.ts`):

- **Production (Docker):** Nginx serves the built files and proxies `/api/` to the
  `backend` container on the shared `fixora-net` Docker network. One origin, no CORS.
- **`npm run dev`:** the Vite dev server proxies `/api` to `http://localhost:8080`
  (see `vite.config.ts`).

There is no API base URL to configure — the frontend works against any host that proxies
`/api` to the backend.

---

## Quick start (local dev)

Requires Node 20+ (and the backend reachable on `http://localhost:8080`, e.g. via the
[TTbackend](https://github.com/Yash7672/TTbackend) `docker compose up`).

```bash
npm ci            # or: npm install
npm run dev       # http://localhost:5173
```

## Build and type-check

```bash
npm run typecheck   # tsc --noEmit (TypeScript strict)
npm run build       # tsc -b && vite build → dist/
npm run preview     # serve the production build on :4173
```

---

## Run with Docker

```bash
docker build -t fixora-frontend .
docker run --rm -p 3000:80 --network fixora-net fixora-frontend
```

The image is a multi-stage build (Node builds `dist/`, Nginx serves it). Its
`nginx.conf` proxies `/api/` to `http://backend:8080`, so the container must be attached
to the same Docker network as the backend (`fixora-net`) for API calls to resolve. Start
the backend first with its `docker compose up`.

---

## Seeded demo accounts

Use these on the login page (they come from the backend seed data):

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@fixora.local` | `Admin@123` |
| Provider | `provider@fixora.local` | `Provider@123` |
| Customer | `customer@fixora.local` | `Customer@123` |

---

## Project structure

```text
frontend/
├── Dockerfile                # multi-stage: Node build → Nginx serve
├── nginx.conf                # SPA fallback + /api reverse proxy
├── package.json / package-lock.json
├── index.html, vite.config.ts, tsconfig*.json
├── tailwind.config.js, postcss.config.js
├── public/                   # favicon, backend-unavailable page, images/
│   └── images/               # category, service and provider artwork (SVGs)
├── scripts/
│   └── generate-images.mjs   # regenerates the artwork
└── src/
    ├── main.tsx, App.tsx     # routing for all 35 pages
    ├── api/                  # axios client + typed endpoint modules
    ├── components/           # header, footer, cards, states, AI widget, guards …
    ├── context/              # Auth, City, Toast providers
    ├── hooks/                # useAsync
    ├── layouts/              # storefront + dashboard shells
    ├── pages/                # customer pages
    ├── pages/provider/       # 8 provider pages
    ├── pages/admin/          # 8 admin pages
    ├── styles/               # Tailwind entry + component classes
    ├── types/                # shared TypeScript types
    └── utils/                # formatting, constants, helpers
```

---

## Catalogue artwork

Every category, service and provider shows purpose-built local SVG artwork (AC work shows
the AC motif, plumbing shows water, and so on). The images live in `public/images/` and are
served as static files; the API stores the relative path, so there are no external image
requests. To regenerate or restyle them:

```bash
npm install
node scripts/generate-images.mjs
```

The slugs it produces line up with the rows the backend seeds. If the API is reachable, the
script also verifies that every generated filename matches a real service slug.

---

## Development limitations

Fixora has no real authentication yet: the signed-in user id is stored locally and sent as
the `X-User-Id` header (`src/api/client.ts`). This is **not** a security boundary — the
backend re-checks roles and ownership, but any client can set the header. See the backend
repository's README for the full security notes.

Built as a learning project. Prices are demo data and no payment is processed.
