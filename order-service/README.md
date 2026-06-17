# Order Service

CRM order microservice built with Fastify, Prisma, PostgreSQL, Redis, and Kafka.

## Prerequisites

- Node.js 20+
- Docker (for Postgres, Redis, and Kafka)

## Quick start

From the repository root:

```bash
docker compose up -d postgres redis kafka kafka-ui
```

From `order-service/`:

```bash
cp .env.example .env   # or use existing .env
npm install
npm run db:setup
npm run dev
```

Service runs at `http://localhost:3001`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Generate Prisma client and compile TypeScript |
| `npm start` | Run compiled app |
| `npm test` | Run tests |
| `npm run db:setup` | Apply migrations and seed reference data |

## API

All endpoints require `Authorization: Bearer <token>`.

Default dev token from `.env`: `dev-token`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/orders?offset=0&limit=10` | List orders (Redis cache) |
| `GET` | `/orders/:id` | Get order by id |
| `POST` | `/orders` | Create order |
| `PATCH` | `/orders/:id` | Update `total` and/or `status` |

### Create order

```json
POST /orders
{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "total": 99.99,
  "productId": 1
}
```

### Update order

```json
PATCH /orders/:id
{ "total": 150.00 }
```

```json
PATCH /orders/:id
{ "status": "PENDING" }
```

Status transitions are validated in middleware against `STATUS_TRANSITIONS` in `src/lib/order-status.ts`.

Concurrent `PATCH` requests are protected with optimistic locking (`version` column). If the order was modified between read and write, the API returns **409 Conflict**.

## Kafka

Order lifecycle events are published to the `order.events` topic:

| Event | Trigger |
|-------|---------|
| `ORDER_CREATED` | `POST /orders` |
| `ORDER_TOTAL_UPDATED` | `PATCH /orders/:id` with `total` |
| `ORDER_STATUS_UPDATED` | `PATCH /orders/:id` with `status` |

Example message:

```json
{
  "event": "ORDER_CREATED",
  "orderId": "5e05dfab-083d-46b0-acd8-1869015307f6",
  "occurredAt": "2026-06-17T12:00:00.000Z",
  "payload": {
    "customerId": "550e8400-e29b-41d4-a716-446655440000",
    "total": "99.99",
    "productId": 1,
    "status": "CREATED"
  }
}
```

### View messages in Kafka UI

1. Open [http://localhost:8080](http://localhost:8080)
2. Go to **Topics** → `order.events`
3. Open the **Messages** tab
4. Create or update an order via API and refresh the topic view

Set `KAFKA_ENABLED=false` in `.env` to disable publishing (useful for tests without Kafka).

## Project structure

```
src/
  routes/          HTTP routes and middleware chains
  controllers/     Request handlers and JSON schemas
  services/        Business logic, cache, status rules, Kafka events
  middleware/      Auth and order loading
  lib/             Prisma, Redis, Kafka, logger, pagination
  errors/          App errors and global error handler
```

## Environment

```env
DATABASE_URL=postgresql://user:password@localhost:5432/crm_development?schema=public
REDIS_URL=redis://localhost:6379
DEV_AUTH_TOKEN=dev-token
DEV_AUTH_USER_ID=550e8400-e29b-41d4-a716-446655440000
PORT=3001
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_ORDERS=order.events
KAFKA_ENABLED=true
```
