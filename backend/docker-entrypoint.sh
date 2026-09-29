#!/bin/sh
set -e
echo "Running Prisma db push..."
./node_modules/.bin/prisma db push --accept-data-loss
echo "Running seed..."
node prisma/seed-prod.js || echo "Seed failed, continuing..."
echo "Starting server..."
exec node dist/main.js
