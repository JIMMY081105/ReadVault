# ReadVault

A personal reading companion and habit tracker. Built as a mobile-first installable PWA — track books, reading progress, daily reading goals, and other lifestyle goals (gym, water, prayer, app-time limits, Quran, protein) all in one place.

## Overview

ReadVault is a single-page app with five main surfaces:

- **Home** — today's snapshot: reading progress against your daily page goal, active goals, quick stats.
- **Library** — your book collection with search, filters (All / Reading / Finished / Unread), grid/list toggle, and an editable daily reading goal.
- **Reader** — full-screen chapter reader with theme, font, and line-spacing controls. Updates progress and per-day reading stats as you read.
- **Calendar** — daily view of reading sessions and goal completions.
- **Settings** — appearance (dark mode, reader theme/font/spacing), goals, notifications, sync.

### Data model

All data is persisted to `localStorage` — no backend, no account, fully offline.

- `rv_books` — array of `Book` records (title, author, total pages, current progress, per-day stats, time spent).
- `rv_settings` — user preferences (`Settings` in [src/types.ts](src/types.ts)).
- Goals — non-reading lifestyle goals with recurrence rules (daily / every-N-days / weekly) and per-date completion tracking.

Two seed books ship preloaded so the app is usable immediately on first launch. Book covers are CSS gradient classes rather than images, keeping the storage footprint tiny.

### Tech stack

- **React 18** + **TypeScript** + **React Router 6**
- **Vite 5** for dev/build
- **Tailwind CSS 3** for styling
- **Heroicons** for iconography
- **vite-plugin-pwa** + **Workbox** for offline support and installability

## Setup

### Prerequisites

- Node.js 18+ and npm

### Install

```bash
npm install
```

### Develop

```bash
npm run dev
```

Vite serves the app at `http://localhost:5173` by default. The PWA service worker is registered in dev with `autoUpdate`, so changes hot-reload normally.

### Type-check

```bash
npm run typecheck
```

Runs `tsc --noEmit` against the whole project.

### Build

```bash
npm run build
```

Outputs a production bundle to `dist/`, including the PWA manifest and service worker.

### Preview the production build

```bash
npm run preview
```

## Project structure

```
src/
  App.tsx              # Routes
  main.tsx             # Entry point
  layouts/
    MainLayout.tsx     # Shared layout with bottom nav (Reader is exempt)
  pages/
    Home.tsx
    Library.tsx
    Reader.tsx
    Calendar.tsx
    Settings.tsx
  components/          # Button, Card, BookCard, GoalCard, GoalForm, Navbar, …
  db/                  # localStorage-backed stores: books, goals, settings, content
  hooks/               # useSettings
  utils/               # dateKey, numbers, goalTypes
  types.ts             # Shared TypeScript types
```

Routing lives in [src/App.tsx](src/App.tsx). The Reader route is intentionally outside `MainLayout` so it can render full-screen without the bottom nav.

## Notes

- Designed primarily for portrait mobile viewports — the PWA manifest pins `orientation: portrait` and `display: standalone`.
- Because storage is local-only, clearing site data wipes your library. Future sync is gated by the `autoSync` setting but not yet wired to a backend.
