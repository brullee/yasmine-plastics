// Read-only queries against the database in .env - which is production (see CLAUDE.md).
// Every query runs inside a READ ONLY transaction, so Postgres itself rejects any write.
// Usage (from the repo root):
//   node --env-file=.env .claude/skills/db-query/query.mjs "select slug from categories"
//   node --env-file=.env .claude/skills/db-query/query.mjs --tables
//   node --env-file=.env .claude/skills/db-query/query.mjs --columns products
import pg from 'pg'

const MAX_ROWS = 50
// Credentials and tokens never need to be read to debug anything - hide them in output.
const SENSITIVE = /hash|salt|secret|token|password/i

const [arg, value] = process.argv.slice(2)
let sql = arg
let params = []
if (arg === '--tables') {
  sql = "select table_name from information_schema.tables where table_schema = 'public' order by table_name"
} else if (arg === '--columns') {
  sql = "select column_name, data_type, is_nullable from information_schema.columns where table_schema = 'public' and table_name = $1 order by ordinal_position"
  params = [value]
}
if (!sql) {
  console.error('Usage: query.mjs "<select ...>" | --tables | --columns <table>')
  process.exit(1)
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
try {
  await client.query('BEGIN READ ONLY')
  await client.query("SET LOCAL statement_timeout = '15s'")
  const { rows, rowCount } = await client.query(sql, params)
  const shown = rows.slice(0, MAX_ROWS).map((row) =>
    Object.fromEntries(Object.entries(row).map(([k, v]) => [k, SENSITIVE.test(k) && v != null ? '[hidden]' : v])),
  )
  if (shown.length) console.table(shown)
  console.log(`${rowCount ?? rows.length} row(s)${rows.length > MAX_ROWS ? `, first ${MAX_ROWS} shown - add a LIMIT or WHERE` : ''}`)
} catch (err) {
  console.error(`Query failed: ${err.message}`)
  process.exitCode = 1
} finally {
  await client.query('ROLLBACK').catch(() => {})
  await client.end()
}
