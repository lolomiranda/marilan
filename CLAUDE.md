# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Marilan** is a maintenance management system (Portuguese-language). Two-package monorepo — no root `package.json`.

```
marilan/
├── marilan-back/   # Express.js REST API (port 3001)
└── marilan-front/  # Next.js 16 frontend (port 3000)
```

## Commands

### Backend (`marilan-back/`)
```bash
npm run dev     # nodemon index.js — restarts on change
npm start       # node index.js
npm run seed    # populate DB with sample users + machines
```

### Frontend (`marilan-front/`)
```bash
npm run dev     # next dev
npm run build   # next build
npm run lint    # eslint
```

Both must run simultaneously for a working local environment. Backend requires a MySQL database; connection config is in `marilan-back/.env`:
```
DB_HOST=127.0.0.1  DB_PORT=3306  DB_USER=root  DB_PASSWORD=root  DB_DATABASE=marilan_intervencoes
```

### Seed credentials (dev only)
| Role | Crachá | Senha |
|---|---|---|
| admin | 2154 | 123456 |
| operador | 1001 | operador123 |
| manutentor | 2001 | manutentor123 |
| pcm | 3001 | pcm123 |

## Architecture

### Backend

- **Entry:** `index.js` → `app.js` → Sequelize sync → listen on port 3001
- **ORM:** Sequelize + MySQL. Schema is auto-synced on startup (`sync({ alter: false })`). No migrations — schema lives in models.
- **Auth:** POST `/login` with `{ cracha, senha }` returns a user object stored client-side. Subsequent requests pass identity via headers `X-User-Id` and `X-User-Role` — there is no JWT or session middleware; controllers read these headers directly.
- **CORS:** Open to all origins (`*`).

Key API routes:
```
POST   /login
GET|POST|PATCH|DELETE  /usuarios/:id?
GET|POST|PATCH|DELETE  /maquinas/:id?
GET|POST               /ordens-servico
PATCH  /ordens-servico/:id/atribuir   # assign to manutentor
PATCH  /ordens-servico/:id/iniciar    # start work
PATCH  /ordens-servico/:id/concluir   # finish
GET    /dashboard/resumo
GET    /dashboard/pcm/relatorio|metricas
GET    /dashboard/planilha
```

**Service order state machine:** `aberta` → `atribuida` → `em_andamento` → `concluida`

**User roles:** `admin`, `operador`, `manutentor`, `pcm`

### Frontend

- **Framework:** Next.js 16.2.4 with App Router and React 19. **This version has breaking changes vs. earlier Next.js** — consult `node_modules/next/dist/docs/` before using APIs; heed deprecation warnings. `React.FormEvent` is deprecated — use a structural type like `{ preventDefault(): void }` instead.
- **Auth guard:** `app/(protected)/layout.tsx` reads `marilanUser` from `localStorage` and redirects to `/` if absent. Auth is entirely client-side localStorage.
- **Role-based landing:** admin → `/dashboard`, others → `/ordens-servico`.
- **Shared Topbar:** `app/(protected)/components/Topbar.tsx` — rendered by the protected layout, appears on every protected page. It reads the user from `localStorage`, filters nav items by role, highlights the active route via `usePathname`, and logs out on avatar click.
- **Styling approach:** MUI v5 components + inline `<style>` blocks with class-prefixed CSS (e.g. `db-` for dashboard, `mq-` for maquinas). Tailwind CSS 4 is available but minimally used. Custom fonts Sora (sans-serif) and Fraunces (serif) via Google Fonts.
- **API calls:** Plain `fetch` to `http://localhost:3001/...`. No API client library or global base URL config.

### Public vs. protected pages
| Path | Auth required |
|---|---|
| `/` | No — login |
| `/register` | No — create account |
| `/dashboard` | Yes — admin only |
| `/maquinas`, `/ordens-servico`, `/planilhas`, `/pcm`, `/usuarios` | Yes — role-filtered |
