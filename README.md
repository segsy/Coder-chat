# Full Stack AI Website Generator SaaS (Next.js)

This starter implements a production-style architecture for an **AI Website Generator** with:

- Next.js + React + TypeScript
- Tailwind CSS + reusable shadcn-style UI primitives
- Better Auth (email/password + OAuth providers)
- Drizzle ORM + Neon Postgres
- ImageKit upload and AI transformation endpoint
- Stripe subscription checkout API
- Workspace + playground + chat + iframe renderer

## 1) Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 2) Setup Shadcn UI Component Library

This repo includes foundational shadcn-style components under `components/ui` (`button`, `input`, `textarea`).
You can expand with `dialog`, `sheet`, and `select` using the same pattern.

## 3) Landing Screen

- `/` renders the marketing landing page.
- CTA routes users to `/workspace/demo`.

## 4) Setup Drizzle ORM + Neon DB

1. Add Neon connection string in `DATABASE_URL`.
2. Update schema in `db/schema.ts`.
3. Run:

```bash
npm run db:generate
npm run db:push
```

## 5) Setup Auth with Better Auth + OAuth

- Configure `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- API handler lives at `/api/auth/[...all]`.

## 6) Workspace Layout

The app uses a 3-column workspace:

- Project list
- Chat/playground
- Web tools + inline settings + iframe preview

## 7) Website Generation Flow

- `POST /api/ai/chat` = prompt to generated code response
- `POST /api/projects` = save inline element edits
- `GET /api/iframe/:projectId` = render generated site in iframe

## 8) ImageKit + AI Transformations

- `POST /api/upload` uploads asset to ImageKit
- `POST /api/image/transform` returns transformed URL preset for AI-style optimization

## 9) Stripe Payments

- `GET /api/payments/checkout` creates subscription checkout session

## 10) API Endpoint Summary

- `POST /api/ai/chat`
- `GET|POST /api/projects`
- `POST /api/:projectId/publish`
- `GET /api/payments/checkout`
- `POST /api/upload`
- `POST /api/image/transform`
- `GET|POST /api/auth/[...all]`
- `GET /api/iframe/:projectId`
