# MockMate – Product Requirements Document (PRD)

## 1. Problem Statement
Many students preparing for technical interviews struggle to find reliable mock interview partners. Based on discussions with classmates and peers preparing for software engineering interviews, a common pain point is difficulty finding available partners at the right time. Practicing only with friends often leads to scheduling conflicts due to different availability. Existing solutions are fragmented or inconvenient, and there is no simple platform designed specifically for students to search, filter, and schedule mock interview sessions based on interview type, level, and availability. This results in inconsistent interview practice and reduced preparation effectiveness.

## 2. Target Users
**Primary Users:**
Students and software engineering candidates preparing for interviews, including:
- Computer science students preparing for internships
- New graduate software engineering candidates
- Experienced engineers preparing for job transitions

**User Characteristics:**
- **Goals:** Practice mock interviews regularly, find partners with similar experience levels, practice specific interview types (behavioral, coding, system design).
- **Frustrations:** Cannot find available partners easily, scheduling conflicts with friends, no centralized platform for coordination.
- **Behaviors:** Currently rely on friends or classmates, communicate via messaging platforms, coordinate schedules manually.
- **Needs:** Easy partner discovery, ability to filter by type and level, ability to view partner availability and schedule sessions.

## 3. User Stories (MoSCoW Prioritized)

### Must Have
1. **User Registration and Login:** As a user, I want to register and log in so that I can use the platform securely. (Epic 1)
2. **Profile Creation:** As a user, I want to fill in my profile information including interview type, experience level, and availability so that others can find me. (Epic 1)
3. **Partner Search with Filters:** As a user, I want to search for mock interview partners using filters such as interview type and level so that I can find suitable partners. (Epic 2)
4. **View Partner Profile:** As a user, I want to view another user's profile so that I can evaluate if they are a suitable partner. (Epic 2)
5. **Schedule Mock Interview Session:** As a user, I want to select an available time slot and book a mock interview session so that I can practice interviews. (Epic 3)

### Should Have
6. **Availability Management:** As a user, I want to set my availability so that others can book sessions with me. (Epic 3)
7. **Session Management:** As a user, I want to view my upcoming scheduled sessions so that I can track my interview practice. (Epic 3)

### Could Have
8. **Meeting Link Storage:** As a user, I want to store a Zoom or Google Meet link for scheduled sessions so that we can conduct the interview. (Epic 3)

### Won’t Have (Out of Scope for MVP)
- AI interview feedback
- Video calling system integration
- Real-time collaborative coding editor
- Notifications system
- Ratings and review system

## 4. Success Metrics
The MVP will be considered successful if users can complete the core workflow:
- **Functional:** Users can register/login, update profiles, search using filters, view partner profiles, and schedule mock sessions.
- **Technical:** System supports multiple users safely. Data is stored and retrieved efficiently. Sessions avoid double-booking. Code test coverage is >70%.
- **Usability:** Users can complete the partner search and scheduling workflow without errors.

## 5. Technical Constraints & Architecture
- **Team Constraints:** 2 developers
- **Timeline:** 10 days
- **Frontend & Backend Framework:** Next.js 14+ (App Router)
- **Database:** Supabase (PostgreSQL) mapped via Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Meeting Links:** External user-provided links (Zoom / Google Meet)

## 6. Development Standards & Quality
- **Security:** Standard OWASP practices. Strict Server-Side authorization and robust Input Validation to prevent SQLi and XSS. Secrets securely managed via environment variables.
- **Testing:** Test-Driven Development (TDD) methodology. Playwright for E2E user flows, Vitest/Jest for APIs. Minimum 70% coverage requirement.
- **CI/CD:** GitHub Actions for automated linting, tests, and formatting. Vercel for continuous deployment.
- **Methodology:** Scrum via GitHub Issues. Granular commits required after every major feature checkpoint.
