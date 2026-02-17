# AI Course SaaS Starter (Next.js + Clerk + Neon + Drizzle)

This repo includes a production-style AI course generation platform with billing and progress tracking.

## ✅ Core implemented

- Create Course form + Zod Server Action validation
- Server-side plan enforcement (Free: 1 course)
- Stripe Checkout + secure webhook + plan upgrades/downgrades
- AI generation pipeline with queue/progress and persisted output
- Neon/Drizzle persistence for courses, chapters, lessons, subscriptions, usage events
- Admin revenue dashboard (MRR + usage revenue)

## 🧠 Azure agentic generation pipeline

1. User triggers **Generate Course** from course page
2. Server Action marks course as `generating` and calls `/api/ai/generate-course`
3. API runs staged generation:
   - planning
   - lessons
   - scripts
   - done
4. Progress is stored in `course_progress`
5. UI polls `/api/courses/:id/progress` and updates progress bar
6. Course becomes `ready` with persisted chapters + lessons

## Important files

- `app/api/ai/generate-course/route.ts`
- `lib/ai/azure.ts`
- `lib/ai/prompts.ts`
- `lib/ai/progress.ts`
- `app/api/courses/[id]/progress/route.ts`
- `components/course/course-progress.tsx`
- `actions/generate-course.ts`

## Billing files

- `actions/create-checkout.ts`
- `app/api/stripe/webhook/route.ts`
- `app/api/payments/checkout/route.ts`
- `app/api/payments/webhook/route.ts`

## Database files

- `lib/db/schema.ts` (users, courses, chapters, lessons, course_progress, subscriptions, usage_events)
- `lib/db/index.ts`
- `drizzle.config.ts`

## Environment variables

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/dbname?sslmode=require"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_123456789"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

AZURE_OPENAI_ENDPOINT="https://YOUR-RESOURCE.openai.azure.com"
AZURE_OPENAI_API_KEY="xxxx"
AZURE_OPENAI_DEPLOYMENT="gpt-4o"
```

## Local Stripe webhook

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Drizzle

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

## Run

```bash
npm install
npm run dev
```

## Next enterprise upgrades

1. Background queues (Upstash / Azure Functions)
2. TTS -> real audio generation
3. Video rendering (Remotion)
4. Usage-based billing per token
