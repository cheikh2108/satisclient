#!/bin/sh
set -e
echo "Running Prisma migrations..."
./node_modules/.bin/prisma db push --accept-data-loss
echo "Starting server..."
exec node dist/main.js
