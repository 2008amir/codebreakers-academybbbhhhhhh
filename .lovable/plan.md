## Project Analysis

Your project has a **significant identity mismatch** between frontend and backend that needs to be resolved before meaningful next steps.

### What's actually in the project

**Frontend ("Luxe Sparkles")** — a luxury e-commerce store
- 47 routes including: product browsing, cart, checkout, wishlist, search, orders, rewards, deliverer flows, Flutterwave payment webhooks
- Full admin panel: orders, products, rewards, deliverers, delivery prices, users, messages, posts
- Customer account area: addresses, orders, enrolled (rewards), claim, wishlist, notifications, settings
- Features: PWA, copy protection, referral capture, AI personalized feed, visual search, rewards system
- Stack: React 19, TanStack Router/Start, Tailwind v4, Supabase, Lovable AI

**Backend (Supabase database)** — a learning management system
- Tables: `courses`, `lessons`, `lesson_progress`, `exams`, `exam_submissions`, `enrollments`, `attendance`, `profiles` (with `registration_number` like `CB-00001`), `user_roles`, `messages`, `sandbox_projects`
- Auto-creates a `student` role on signup; admin role hardcoded to `fatimamustaphaabdu@gmail.com` in `src/hooks/use-admin.ts`
- Storage: only an `avatars` bucket — no `products`, `orders`, etc.

### The mismatch

The frontend expects tables like `products`, `orders`, `cart_items`, `user_interests`, `rewards`, `deliverers`, `delivery_prices`, `notifications`, `wishlist`, `addresses`, `reviews`, `messages` (different shape) — **none of which exist** in the database. The current schema is for a coding academy ("CodeBreakers" per the registration prefix `CB-`).

This means the e-commerce app currently **cannot function end-to-end**: signups create student profiles, products won't load, cart/checkout/orders/rewards will all fail at the database level.

### What this almost certainly means

You remixed a project where the frontend was rebuilt as a luxury store but the database was never migrated, OR you have two different projects mixed together. We need to pick one direction.

### Decision needed

Before planning concrete next steps, I need to know which product you actually want this to be:

1. **Luxury e-commerce store** — keep the frontend as-is, drop the courses/lessons/exams schema, and build the e-commerce schema (products, orders, cart, rewards, deliverers, etc.) so the existing UI works.
2. **Coding academy / LMS** — keep the database, and replace the frontend with course browsing, lesson player, exam submission, attendance, and an admin panel for managing courses/students.
3. **Both / hybrid** — clarify how they relate (e.g. an academy that also sells merchandise).

I'll ask this as a follow-up question so we can lock the direction, then I'll produce a concrete implementation plan.
