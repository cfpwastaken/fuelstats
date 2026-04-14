# Fuel Stats Job

This job is responsible for updating the data in the `history` table and refreshing the materialized views daily via a cron job.

## Prerequisites

You need access to the [Tankerkönig](<https://creativecommons.tankerkoenig.de/>) historical data repository.

1. Clone the Tankerkönig repository to `./tankerkoenig-data`
2. Fill the `.env` file with your postgres credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=fuel
DB_PASSWORD=fuel
DB_NAME=fuel
```

3. Create the database objects from `../db/tables.sql`, `../db/brand_map.sql` and `../db/views.sql`
4. Run `bun install` to install the dependencies

## Populating the database

To populate the database, run `./sql.ts` with bun:

```bash
bun run sql.ts
```

This will read all files in `./tankerkoenig-data/prices` and insert the data into the `history` table. It will also refresh the materialized views.
Since this imports all data starting from 2014, the initial import will take ages. It will also take up a lot of disk space on the database server (> 160GB) alongside the disk space used by the repository itself (≈ 50GB).

## Updating the database

To keep the database up to date, you can set up a cron job that runs the `./update.sh` script daily. This will pull the latest data from the Tankerkönig repository and call the `sql.ts` script to update the database with the new data (it will only insert the new data, so it won't re-import everything).
