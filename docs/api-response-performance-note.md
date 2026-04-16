# API Response and Performance Strategy

## API Response Control
- All routes use a consistent JSON structure with keys: success, message, data/details, timestamp.
- Centralized error middleware maps validation, Prisma, and custom errors to proper HTTP status codes.
- Pagination is standardized through query params page and limit, with metadata returned in meta.

## Performance Strategy
- Rate limiting is applied globally and stricter limits are enforced on authentication routes.
- Database queries use pagination and selective includes to reduce payload size.
- Prisma indexes are defined for high-query fields like location, category, and orderDate.
- Basic benchmarking is automated using autocannon via npm run benchmark.
