# 🤝 MockMate
> The premier real-time platform for finding and scheduling peer-to-peer mock interviews.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)
![Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)

## Overview
MockMate is a dedicated platform designed for software engineers, students, and career switchers to practice their interviewing skills. Finding the right partner with the exact same experience level and interview focus (Coding, Behavioral, System Design) can be tedious. MockMate simplifies this by providing a unified interface for partner search, filtering, and instant scheduling.

### Key Features
- **Partner Search & Filtering**: Find peers by experience level, interview type, and availability.
- **Seamless Scheduling**: Instantly book empty slots on a partner's calendar.
- **Real-time Notifications**: Get notified immediately when someone requests or accepts a session.
- **Admin Panel**: Dedicated dashboard for administrators to monitor platform health and suspend malicious users.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js Server Actions, Next.js API Routes, Socket.io (for real-time events)
- **Authentication**: NextAuth.js v4 (Credentials Provider mapped to PostgreSQL)
- **Database**: PostgreSQL hosted on Supabase, managed via Prisma ORM
- **Testing**: Vitest (Unit Tests), Playwright (End-to-End Tests)
- **Deployment**: Vercel & GitHub Actions CI/CD

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (e.g., Supabase instance)

### Installation Steps
```bash
# 1. Clone the repository
git clone https://github.com/vartikatewari/MockMate.git
cd MockMate

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev

# 5. Start the development server
npm run dev
```

## Environment Variables
Create a `.env` file in the root directory and populate it with the following:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@db.supabase.co:5432/postgres` |
| `NEXTAUTH_SECRET` | JWT secret for NextAuth | `any-random-string-or-openssl-rand-base64` |
| `NEXTAUTH_URL` | App base URL | `http://localhost:3000` |

*(Note: Never commit your actual `.env` file to version control)*

## Running Tests
MockMate maintains strict test coverage requirements (80%+).

```bash
# Run all unit tests via Vitest
npm run test

# Run unit tests and generate coverage report
npm run test:coverage

# Run Playwright End-to-End tests
npm run test:e2e
```

## Project Structure
```text
MockMate/
├── app/                  # Next.js App Router (Pages, Layouts, standard API routes)
│   ├── (auth)/           # Authentication pages (Login, Signup)
│   ├── actions/          # React Server Actions (database mutations)
│   ├── api/              # RESTful API Endpoints
│   ├── dashboard/        # User dashboard page
│   └── search/           # Partner search and profiles
├── components/           # Reusable React components (UI library and features)
├── lib/                  # Shared utilities (DB client, Auth config, Validations)
├── prisma/               # Database schema and migration files
├── playwright-tests/     # End-to-End browser tests
├── test/                 # Integration and action tests
└── __tests__/            # Unit component tests
```

## API Documentation
MockMate provides a robust internal API for its operations, protected by NextAuth session cookies. 

👉 **[Read the full API Documentation here](API.md)**.

## Deployment
MockMate is optimized for deployment on Vercel.

1. Connect your GitHub repository to Vercel.
2. In the Vercel project settings, define the required environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
3. Set the build command to ensure the Prisma client is generated:
```bash
npx prisma generate && next build
```

## Contributing
We follow an agile Scrum methodology aligned with GitHub Issues.

- **Branch naming**: `feature/[issue-number]-description` (e.g., `feature/42-partner-search`)
- **Commit format**: `type(scope): message` (e.g., `feat(search): add experience level filter`)
- **PR requirements**:
  - Must reference a specific GitHub Issue (e.g., "Closes #42").
  - CI must pass (Linting, Formatting, Unit Tests).
  - Test coverage must remain above the required threshold.

