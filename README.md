# Edunoble Admin (CMS)

Internal staff dashboard that manages every piece of dynamic content shown on the Edunoble **Frontend**. Built as a React + Vite SPA; talks exclusively to the **Backend** via authenticated admin endpoints.

> Part of a three-repo system. For the full picture, see [../Edunoble-Frontend/ARCHITECTURE.md](../Edunoble-Frontend/ARCHITECTURE.md).

## Tech stack

- **Framework**: React 18.2 + Vite 4.4 (SWC)
- **Language**: JavaScript / JSX (no TypeScript)
- **Routing**: React Router DOM 6.17
- **UI**: MUI 5.14 + Bootstrap 5.1 + custom SCSS
- **Rich text**: **Quill 2.0** (used for content-page bodies)
- **Charts / calendar**: Recharts, FullCalendar, react-calendar
- **PDF preview**: pdfjs-dist (paper previews in the admin)
- **HTTP**: native `fetch` (no axios)
- **Version**: 1.1.0

## Project structure

```
src/
├── App.jsx                    router config
├── main.jsx                   React DOM entry
├── pages/dashboard/           page-level components (23 dashboard pages)
├── components/
│   ├── dashboard/             dashboard widgets + form modals (71+ files)
│   ├── layout/                headers, footers, sidebar
│   ├── common/
│   │   ├── ProtectedRoute.jsx auth gate
│   │   └── Toast.jsx          notifications
│   └── others/                login, signup, forgot-password forms
├── context/Context.jsx        global auth + cart state
├── config/api.js              base URL constant
├── data/dashBoardSidebar.js   sidebar nav items
├── styles/                    SCSS entry
└── svg/                       SVG icons

public/assets/                 images, fonts, compiled CSS
```

## Active admin routes

| Path | Purpose |
|------|---------|
| `/login` | admin login |
| `/forgot-password` | password reset form |
| `/dashboard` | landing + analytics |
| `/dshb-papers` | sample papers CRUD |
| `/dshb-testimonials` | testimonials CRUD |
| `/dshb-queries` | view & resolve contact submissions |
| `/dshb-content` | about / vision page content (rich text) |
| `/dshb-faq` | FAQ CRUD |
| `/dshb-homepage-content` | homepage hero / banner / sections |
| `/dshb-leads` | leads list |

Every route except `/login` and `/forgot-password` is wrapped in `<ProtectedRoute>`.

## Authentication

- **Flow**: `LoginForm` → `POST /apis/auth/login` → response `{ token, user, ... }` → stored in `localStorage` under the key `auth` (the whole object) → redirect to `/dashboard`.
- **Protected routes**: `<ProtectedRoute>` reads `auth` from `localStorage`; if `auth.token` is missing, redirects to `/login`.
- **Request header**: every admin API call sends `Authorization: Bearer ${auth.token}`.
- **Role checks**: none currently — any authenticated user sees the full dashboard.

## CMS features by module

| Page | Backend endpoints | Form / modal |
|------|-------------------|--------------|
| Papers | `GET papers/admin/list`, `POST/PATCH/DELETE papers/admin/:id`, `GET papers/admin/dashboard` | `PaperFormModal` (dropdowns + "Other" inputs, file URL, featured flag) |
| Testimonials | `testimonials/admin/*` | `TestimonialFormModal` (heading, quote, author, order) |
| FAQs | `contact/admin/faq`, `contact/admin/faq/:id` | `FAQFormModal` (Q/A + order) |
| Content pages | `content-pages/admin/*` | `ContentFormModal` — **Quill rich-text** body + image picker |
| Homepage | `homepage/admin/*`, per-section `PATCH homepage/admin/:id/section/:section` | section-specific editors (hero, statistics, features, process…) |
| Queries | `GET contact/admin`, `PATCH contact/admin/:id/resolve` | `ResolveQueryModal` |
| Leads | `GET leads/admin`, `DELETE leads/admin/:id` | inline table |
| Images | `POST upload/image` → `{ imageUrl }` | used inside `ContentFormModal` and any picture field |

## Local setup

```bash
npm install
npm run dev          # Vite HMR (default: http://localhost:5173)
npm run build        # production build → dist/
npm run preview      # preview built assets
```

**Pointing at a local backend**: the base URL is **hard-coded** in `src/config/api.js`. To talk to a local Backend on port 8001, swap the active line for the commented `http://localhost:8001/apis` line.

There is no `.env.example` to fill in — Admin currently consumes no env vars.

## Build & deploy

- **Hosting**: Vercel (production at the Admin sub-domain, e.g. `https://admin.edunoble.in`)
- **Deploy branch**: **`main`** — Vercel auto-deploys on every push.
- **SPA routing**: `vercel.json` rewrites all paths to `/`.

## Branching workflow

1. Branch off `main`: `git checkout -b feat/<name>`
2. Push and open a PR against `main`.
3. Merge → Vercel ships.

Other branches present: `develop`, `nik-modification` (not currently used for deploy).

## Related repos

- **Edunoble-Frontend** — public site, displays what this CMS writes.
- **Edunoble-Backend** — API this CMS calls.
- **System overview**: [../Edunoble-Frontend/ARCHITECTURE.md](../Edunoble-Frontend/ARCHITECTURE.md)
