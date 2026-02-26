# General Rules for Antigravity on MockMate

1. **Tech Stack Constraints:**
   - Always use **Next.js 14+ (App Router)** as the framework.
   - Use **Tailwind CSS** for all styling.
   - Use **TypeScript** for all files. Avoid `any` types; prefer strict interfaces/types.
   - Use **Prisma ORM** connecting to **Supabase (PostgreSQL)** for all database operations.
   - Use **NextAuth.js** for authentication mapping to Prisma.

2. **Quality & Formatting:**
   - Adhere strictly to **ESLint** and **Prettier** rules. Run `npm run lint` and `npm run format` locally before considering a feature complete.
   - Do not leave unused imports or `console.log` statements in production code.

3. **Testing Philosophy (TDD & 70% Coverage):**
   - **Test-Driven Development (TDD) is MANDATORY.** You must write failing tests *before* writing the implementation code.
   - **No PR or feature is complete without tests.**
   - Write **Unit Tests (Vitest/Jest)** for lib functions, API routes, and Server Actions.
   - Write **End-to-End Tests (Playwright)** for core user flows (Login, Search, Booking).
   - Before deploying, verify that `npm run test:coverage` yields at least 70%.

4. **Collaboration & Git Workflow:**
   - This project uses a Scrum methodology aligned with GitHub Issues.
   - When communicating or leaving commit messages, always reference the relevant Story/Issue number (e.g., "Fixes #3: Partner Search").
   - **Checkpoints:** Commit frequently to establish valid checkpoints. You MUST create a commit immediately after completing every major feature or user story.
   - Ensure the GitHub Actions CI pipeline is green before assuming a task is done.

5. **Design Principles (Mom Test):**
   - Keep the feature set tightly focused on the MVP (Search, Filtering, Scheduling).
   - Resist "feature creep" (e.g., adding video calls or AI auto-matching) as defined by the Mom Test validation constraints.
   - Optimize for finding partners with the *exact* same experience level and interview type.

6. **Application Security (Standard Practices):**
   - The application must follow standard OWASP security practices.
   - **Authentication/Authorization:** All API routes (`/api/*`) and Server Actions must perform server-side session validation to ensure the user is logged in and authorized before mutating or accessing data.
   - **Input Validation:** All user inputs (especially Profile and Scheduling forms) must be strictly validated before database insertion to prevent SQL Injection and XSS (Prisma helps mitigate SQLi, but XSS requires strict React/Data sanitization).
   - **Environment Variables:** Never expose database connection strings, JWT secrets, or API keys to the client payload. Use Next.js `NEXT_PUBLIC_` strictly for safe client side flags only.
