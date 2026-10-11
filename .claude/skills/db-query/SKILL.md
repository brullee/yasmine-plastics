---
name: db-query
description: Read data or schema from this project's Postgres database (production) safely - e.g. which columns a table has, what slugs exist, whether a record looks right. Use instead of ad-hoc pg scripts whenever you need to look at the database.
---

The database in `.env` is production. This skill is read-only by construction: `query.mjs` runs every query in a `READ ONLY` transaction (Postgres rejects writes) with a 15s timeout, prints at most 50 rows, and hides credential columns (hash, salt, secrets, tokens).

From the repo root:

- `node --env-file=.env .claude/skills/db-query/query.mjs --tables` - list tables.
- `node --env-file=.env .claude/skills/db-query/query.mjs --columns <table>` - a table's columns.
- `node --env-file=.env .claude/skills/db-query/query.mjs "select ..."` - any read query.

Payload names tables after collection slugs with snake_case columns (`products.art_code`, `users.two_factor_enabled`); relationships and arrays live in side tables like `products_rels` and `products_gallery`. Check `--tables`/`--columns` instead of guessing names.

Prefer the Payload app (dev server, REST API) for anything about application behavior - this is for checking stored data and schema. Never work around the read-only transaction to write; if a change to data is needed, describe it and ask the user.
