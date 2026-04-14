#!/bin/sh
cd tankerkoenig-data
git pull
cd ..
docker run --name fuel-db-updater --rm --env-file .env -v $PWD:/app --workdir /app oven/bun bun run sql.ts
