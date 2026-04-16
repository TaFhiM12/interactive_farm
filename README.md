# Interactive Urban Farming Platform Backend

Express.js + TypeScript + Prisma + PostgreSQL starter backend for the Junior Backend Developer assignment.

## Stack
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication + RBAC
- Swagger (OpenAPI)
- Socket.IO for real-time plant updates

## Setup
1. Install dependencies:
   npm install
2. Update environment values in .env, especially DATABASE_URL and JWT_SECRET.
3. Generate Prisma client:
   npm run prisma:generate
4. Run migrations (after PostgreSQL is running):
   npm run prisma:migrate
5. Seed database:
   npm run seed
6. Start dev server:
   npm run dev

## API Docs
- Swagger UI: http://localhost:5000/docs

## Seed Data
- Roles represented through users with ADMIN, VENDOR, CUSTOMER roles
- 10 vendors
- 100 products

## Deliverable Notes
- Database schema is in prisma/schema.prisma
- Seeder is in prisma/seed.ts
- API response and performance strategy note is in docs/api-response-performance-note.md
- Benchmark script writes docs/benchmark-report.md
