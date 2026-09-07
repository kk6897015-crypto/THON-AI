# Repository Rules & Architecture Backbone (`AGENTS.md`)

This document serves as the persistent source of truth and behavioral contract for all AI coding agents working in this repository. Read and adhere to these rules before making architectural or code modifications.

---

## 1. Architectural Philosophy: Monolith-First Simplicity
- **Simplicity Over Distribution**: Keep logic, database operations, and state localized. Avoid introducing distributed microservices, message queues, or scattered cloud functions unless hard traffic constraints mandate it.
- **Zero-Friction API Contracts**: All API endpoints belong to `/api/*`. 
  - In local development: frontend proxies `/api` to local backend on port 5000.
  - In production / containerized deployments: frontend dynamically resolves `VITE_API_URL` or the canonical live backend service (`https://thon-ai-2.onrender.com/api`) with CORS enabled (`app.use(cors())`).
  - Never hardcode localhost URLs into frontend production builds.

---

## 2. Defined Backbone

### A. Auth & Routing Boundaries
- **JWT-Based Authentication**:
  - JWT token stored in `localStorage.getItem('teamlaunch_token')`.
  - Active team id stored in `localStorage.getItem('teamlaunch_active_team')`.
  - Authenticated user state maintained in `frontend/src/context/AuthContext.jsx`.
- **Public vs. Protected Route Policy**:
  - **Public / Unauthenticated Exploration**: Visitors must be able to view and test all showcase tools without an upfront auth wall:
    - Discover Feed (`/discover`)
    - AI Novelty & Prior-Art Paper Search (`/novelty`)
    - PPT Structural Lint Checker (`/ppt`)
    - Eligibility Engine Preview (`/eligibility`)
    - Deck Studio Outline Preview (`/deck`)
  - **Protected Workspace**: Actions that mutate team rosters or save competitions to team Kanban require authentication (`currentTab === 'teams'`, `currentTab === 'kanban'`). If unauthenticated, gracefully route to `<AuthPage onComplete={...} />`.
- **Demo Account Integrity**:
  - Always guarantee `demo@teamlaunch.io` / `password123` is seeded in the database alongside its team `Alpha Innovators` (`ALPH01`).
  - The 1-click Demo button in `AuthPage.jsx` must remain synced with the database seed.

### B. Database & Schema Invariants
- **Engine**: SQLite via Node.js native `DatabaseSync` (with fallback to `sqlite3`). Zero-config, single-file (`backend/src/teamlaunch.db` or `./teamlaunch.sqlite`).
- **Core Tables**:
  - `users`: `(id, name, email, password, college, department, year_of_study, skills, resume_link, phone)`
  - `teams`: `(id, name, invite_code, leader_id, point_of_contact_phone)`
  - `team_members`: `(team_id, user_id, joined_at)`
  - `competitions`: `(id, team_id, title, source_url, platform, level, tags, deadline, eligibility_raw_text, status, visibility, state, college_tier, is_shared)`
  - `eligibility_checks`, `idea_briefs`, `decks`, `subscriptions`, `telegram_links`
- **Seeding Rule**: Any newly initialized database MUST seed both the system admin user/team and the demo evaluator user/team.

### C. State Management
- **Persistent State**: User session, active team token, and bookmarked team IDs in `localStorage`.
- **In-Memory UI State**: React state (`useState`, `useEffect`) scoped to individual views and context providers. Do not add heavy external state managers (Redux/Zustand) without prior approval.

### D. File Structure & Conventions
```text
thonai/
├── backend/
│   ├── src/
│   │   ├── routes/        # Modular Express route handlers (auth, teams, competitions, etc.)
│   │   ├── services/      # External integrations (Telegram, Anthropic/LLM, PPTX, scrapers)
│   │   ├── middleware/    # Auth and error middleware
│   │   ├── db.js          # SQLite wrapper, migrations, and seed logic
│   │   └── server.js      # App entry point, CORS, logging, route registration
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable tactile UI components (DoubleBezelCard, TactileButton, Navs)
│   │   ├── context/       # AuthContext and global state
│   │   ├── pages/         # Page-level components (LandingPage, AuthPage, DiscoverPage, etc.)
│   │   ├── services/      # Axios API client (api.js)
│   │   └── index.css      # Design tokens, typography, glassmorphism utilities
│   ├── vite.config.js     # Dev server, allowedHosts, and proxy configuration
└── AGENTS.md              # This rules file
```

---

## 3. Design System & Aesthetics
- **Theme**: Dark Glassmorphism SaaS (`#0E0A09` background, `#140E0D` panels, `#DE3C25` crimson primary accent, `#F5E8E2` high-contrast typography).
- **Typography**: Outfit & Geist Mono / Inter for tabular data and countdowns.
- **Components**: Use `DoubleBezelCard` and `TactileButton` for unified tactile aesthetics. Avoid generic unstyled HTML form controls.
- **Responsiveness**: Mobile navigation via hamburger overlay; desktop via floating glass sidebar.

---

## 4. Verification & Testing Protocol
Before committing or marking any task as complete:
1. Run `cmd.exe /c npm run build` inside `frontend/` to confirm zero syntax or bundling errors.
2. Confirm API calls gracefully handle both local dev and production Render hosts.
3. Test critical user journeys (unauthenticated tool preview, 1-click demo login, Kanban card interaction).
