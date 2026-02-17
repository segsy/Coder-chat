import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  plan: text('plan').notNull().default('free'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull(),
  title: text('title').notNull(),
  prompt: text('prompt').notNull(),
  description: text('description'),
  status: text('status').notNull().default('draft'),
  videoUrl: text('video_url'),
  outline: jsonb('outline').$type<{ chapterCount: number; lessonCount: number }>().default({ chapterCount: 0, lessonCount: 0 }),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const chapters = pgTable('chapters', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull(),
  title: text('title').notNull(),
  summary: text('summary'),
  chapterOrder: integer('chapter_order').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull(),
  chapterId: uuid('chapter_id'),
  chapterTitle: text('chapter_title').notNull().default('Chapter'),
  title: text('title').notNull(),
  lessonOrder: integer('lesson_order').notNull().default(1),
  objective: text('objective'),
  script: text('script'),
  narration: text('narration'),
  audioKey: text('audio_key'),
  audioUrl: text('audio_url'),
  imageKey: text('image_key'),
  imageUrl: text('image_url'),
  assetRevision: integer('asset_revision').notNull().default(1),
  durationSeconds: integer('duration_seconds').notNull().default(0),
  isFreePreview: boolean('is_free_preview').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const courseRenders = pgTable('course_renders', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull(),
  status: text('status').notNull().default('queued'),
  videoKey: text('video_key'),
  videoUrl: text('video_url'),
  preset: text('preset').notNull().default('16:9-1080p'),
  renderProvider: text('render_provider').notNull().default('remotion-lambda'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const courseProgress = pgTable('course_progress', {
  courseId: uuid('course_id').primaryKey(),
  step: text('step').notNull(),
  percent: integer('percent').notNull().default(0),
  message: text('message'),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const aiJobs = pgTable('ai_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull(),
  clerkUserId: text('clerk_user_id').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull().default('queued'),
  progress: integer('progress').notNull().default(0),
  message: text('message'),
  externalId: text('external_id'),
  error: text('error'),
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),
  deadLetteredAt: timestamp('dead_lettered_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const jobSteps = pgTable('job_steps', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').notNull(),
  step: text('step').notNull(),
  status: text('status').notNull().default('queued'),
  progress: integer('progress').notNull().default(0),
  message: text('message'),
  attempt: integer('attempt').notNull().default(0),
  inputs: jsonb('inputs').$type<Record<string, unknown>>(),
  outputs: jsonb('outputs').$type<Record<string, unknown>>(),
  error: text('error'),
  startedAt: timestamp('started_at'),
  finishedAt: timestamp('finished_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const aiUsage = pgTable('ai_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull(),
  jobId: uuid('job_id').notNull(),
  tokens: integer('tokens').notNull().default(0),
  costCents: integer('cost_cents').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  meteredSubscriptionItemId: text('metered_subscription_item_id'),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const creators = pgTable('creators', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const courseListings = pgTable('course_listings', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull(),
  creatorClerkUserId: text('creator_clerk_user_id').notNull(),
  priceCents: integer('price_cents').notNull().default(0),
  slug: text('slug').notNull().unique(),
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const purchases = pgTable('purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  buyerClerkUserId: text('buyer_clerk_user_id').notNull(),
  listingId: uuid('listing_id').notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const ratings = pgTable('ratings', {
  id: uuid('id').defaultRandom().primaryKey(),
  purchaseId: uuid('purchase_id').notNull(),
  stars: integer('stars').notNull().default(5),
  review: text('review'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerClerkUserId: text('owner_clerk_user_id').notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  customDomain: text('custom_domain'),
  themeJson: jsonb('theme_json').$type<Record<string, string>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const tenantCourses = pgTable('tenant_courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  courseId: uuid('course_id').notNull(),
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const usageEvents = pgTable('usage_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull(),
  courseId: uuid('course_id'),
  eventType: text('event_type').notNull(),
  units: integer('units').notNull().default(1),
  unitCostCents: integer('unit_cost_cents').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow()
});
