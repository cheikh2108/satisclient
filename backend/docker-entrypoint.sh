#!/bin/sh
set -e
echo "Running Prisma db push..."
./node_modules/.bin/prisma db push --accept-data-loss
echo "Running platform bootstrap..."
node prisma/bootstrap-super-admin.js
echo "Starting server..."
exec node dist/main.js
