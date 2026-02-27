# MockMate - Antigravity Agent Rules

This document outlines the strict guidelines, coding standards, and workflows that must be followed when developing the MockMate application.
 *   Feel free to tell me that you don’t know something or that you are not confident instead of making stuff up. 
*   Always base your answers on evidence, unless I tell you otherwise.
* If you are communicating anything to me, start it with a star emoji`*`. Unless it is a special format. 
 *   Do not feel like you have to please me, I prefer that you say no or contradict me if I’m wrong.


## 1. Project Context
*   **Tech Stack & Versions:**
    *   **Framework:** Always use **Next.js 14+ (App Router)** as the framework.
    *   **Language:** **TypeScript 5+** for all files. Avoid `any` types; prefer strict interfaces/types.
    *   **Database:** Use **Prisma ORM** connecting to **Supabase (PostgreSQL)** for all database operations.
    *   **Authentication:** Use **NextAuth.js v4** for authentication mapping to Prisma.
    *   **Styling:** Use **Tailwind CSS v4+** for all styling.
*   **Architecture Overview:**
    *   `app/`: Next.js App Router (Pages, Layouts, standard API routes).
    *   `app/actions/`: React Server Actions for secure database mutations.
    *   `components/`: Reusable React components (UI library and features).
    *   `prisma/`: Database schema and migration files.
*   **Naming Conventions & Coding Standards:**
    *   Files: `kebab-case` for standard files, `PascalCase` for React components.
    *   Variables/Functions: `camelCase`.
    *   Interfaces/Types: `PascalCase`. No `any` types allowed.
    *   **Quality & Formatting:** Adhere strictly to **ESLint** and **Prettier** rules. Run `npm run lint` and `npm run format` locally before considering a feature complete.
    *   Do not leave unused imports or `console.log` statements in production code.
*   **Testing Strategy (TDD & 80% Coverage):**
    *   **Test-Driven Development (TDD) is MANDATORY.** You must write failing tests *before* writing the implementation code.
    *   **No PR or feature is complete without tests.**
    *   Write **Unit Tests (Vitest/Jest)** for lib functions, API routes, and Server Actions.
    *   Write **End-to-End Tests (Playwright)** for core user flows (Login, Search, Booking).
    *   Before deploying, verify that `npm run test:coverage` yields at least 70% overall coverage.

## 2. PRD & Design References
*   **PRD Document:** Reference `/Project Memory/MockMate_PRD.md` and `/Project Memory/Project2 PRD.pdf` for full product context.
*   **User Personas:** Reference `personas_and_stories.md` containing the Grinder, the System Designer, and the Career Switcher personas.
*   **Design Principles (Mom Test):**
    *   Keep the feature set tightly focused on the MVP (Search, Filtering, Scheduling).
    *   Resist "feature creep" (e.g., adding video calls or AI auto-matching) as defined by the Mom Test validation constraints.
    *   Optimize for finding partners with the *exact* same experience level and interview type.
*   **Key UI Components & Mockups:**
     All mockups are available as an interactive React artifact built in Claude.
     Screenshots of each screen are saved in `/Project Memory/mockups/`:
    * `mockup_welcome.png` — Sign in / Sign up screen
    * `mockup_search.png` — Partner search with filter sidebar
    * `mockup_profile.png` — User profile with availability grid
    * `mockup_dashboard.png` — Upcoming sessions, pending requests, stats
    * `mockup_partner.png` — Partner profile and booking flow
    * `mockup_admin.png` — Admin panel with users and sessions tables
    * When implementing any screen, open the corresponding mockup screenshot first.
    * Do not deviate from the mockup layout without explicit approval.
    *   **Profile Form:** Must collect specific `experienceLevel` and `interviewTypes` mapped exactly to the Prisma schema, matching the `mockup_profile.png` layout.
    *   **Partner Search:** Must contain dropdown filters for instant query narrowing as seen in `mockup_search.png`.
    *   **Booking Modal:** Must show available times and handle the transaction to create a `Session` record, mirroring the specific dashboard and scheduling flows in the provided mockups.
*   **User Flows:**
    1.  Registers via NextAuth.
    2.  Fills out Profile (must be completed before searching).
    3.  Filters Search page for matching peers.
    4.  Selects an available timeslot to instantiate a MockSession.

## 3. Scrum & Workflow Instructions
*   **Branch Naming Convention:** `type/issueNumber-description` (e.g., `feature/42-partner-search`, `bugfix/11-login-crash`).
*   **Commit Message Format:** Follow Conventional Commits format: `type(scope): message`.
    *   *Example:* `feat(auth): add NextAuth credentials provider (#12)`
*   **PR Workflow & Checkpoints:**
    *   This project uses a Scrum methodology aligned with GitHub Issues.
    *   **Checkpoints:** Commit frequently to establish valid checkpoints. You MUST create a commit immediately after completing every major feature or user story.
    *   Ensure the GitHub Actions CI pipeline is green before assuming a task is done.
*   **Referencing Issues:** When communicating or leaving commit messages, always reference the relevant Story/Issue number (e.g., "Fixes #3: Partner Search").
### Sprint Schedule:
* Sprint 1 due: March 3
* Sprint 2 due: March 10
* Sprint 1 scope: Auth, profile, search, availability management
* Sprint 2 scope: Booking, dashboard, real-time notifications, admin panel, tests, blog post, demo video
* A sprint retrospective document must be written at the end of each sprint.
* Sprint planning document must be created at the start of each sprint.
## 4. Do's and Don'ts
*   **DO:**
   
    *   Prioritize TDD (Write failing tests -> Fix -> Refactor).
    *   Use React Server Actions for data mutations instead of standard `api/` routes whenever possible.
    *   Provide extremely precise database queries via Prisma to avoid N+1 problems.
    *   **Application Security (Standard Practices):**
        *   The application must follow standard OWASP security practices.
        *   **Authentication/Authorization:** All API routes (`/api/*`) and Server Actions must perform server-side session validation to ensure the user is logged in and authorized before mutating or accessing data.
        *   **Input Validation:** All user inputs (especially Profile and Scheduling forms) must be strictly validated before database insertion to prevent SQL Injection and XSS (Prisma helps mitigate SQLi, but XSS requires strict React/Data sanitization).
        *   **Environment Variables:** Never expose database connection strings, JWT secrets, or API keys to the client payload. Use Next.js `NEXT_PUBLIC_` strictly for safe client side flags only.
        *   Always generate the coverage report after running tests and attach it to the PR.
        *   Always write Socket.io event handlers with error handling — never let uncaught socket errors crash the server.
        *   Always validate session ownership before allowing cancellation — a user can only cancel their own sessions.
        *   Export all API route handlers as named functions so they can be unit tested independently.

*   **DON'T:**
    *   Don't add "Feature Creep" (No Video chats, No AI feedback tools). The MVP is search and scheduling only using zoom links.
    *   Don't use `any` types in TypeScript.
    *   Don't leave unused imports, `console.log()` statements, or commented-out blocks in production code.
    *   Don't use polling for real-time features — use Socket.io WebSockets.
    *   Don't push directly to main — always use feature branches and PRs.
    *   Don't merge without 80%+ test coverage — the CI pipeline will fail anyway.
    *   Don't expose the Socket.io server port publicly — route through Next.js custom server only.
   


