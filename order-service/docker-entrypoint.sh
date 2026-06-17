#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding reference data..."
npx prisma db seed

echo "Starting order-service..."
exec node dist/index.js
