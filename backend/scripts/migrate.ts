import 'dotenv/config';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const sql = postgres(url, { prepare: false, max: 1 });
  const drizzleDir = join(__dirname, '../drizzle');
  const files = readdirSync(drizzleDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    console.log(`Running ${file}...`);
    const migration = readFileSync(join(drizzleDir, file), 'utf-8');
    await sql.unsafe(migration);
    console.log(`  ✓ ${file}`);
  }

  console.log('All migrations complete.');
  await sql.end();
}

migrate().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('Migration failed:', message);
  process.exit(1);
});
