# Brand Normalizer

Normalizes inconsistent brand entries.

## Install & Setup
1. `npm install` or `bun install` - Install dependencies
2. `npm run build` or `bun run build` - Compile TypeScript code
3. Copy `config.example.json` to `config.json` and fill in appropriate configuration.

## Run
### Analyzer
Pulls current brand list from Postgres DB, analyzes it, picks representatives, and generates TSV files and SQL queries.

`npm run analyze` or `bun run analyze`
### Diff Checker
Pulls current state of `normalized_stations` table from Postgres DB, compares it with the generated brand list (run Analyzer first!), generates a comprehensible diff summary, and prints it to stdout.

`npm run diff` or `bun run diff`

### Apply Changes
Applies changes in `generated/queries.sql`. Make sure you're happy with the results first.

`npm run apply` or `bun run apply`