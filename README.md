# CRM Infrastructure

Local development environment for a CRM microservices demo.

## What's inside

- `docker-compose.yml` — PostgreSQL, Redis, Redis Insight, Kafka, Kafka UI
- `order-service/` — Fastify order microservice (see [order-service/README.md](order-service/README.md))

## Quick start

```bash
docker compose up -d postgres redis kafka kafka-ui
cd order-service
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

Order service: http://localhost:3001  
Kafka UI: http://localhost:8080  
Redis Insight: http://localhost:5540
