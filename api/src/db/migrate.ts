import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, client } from './client.js';

await migrate(db, { migrationsFolder: './drizzle' });
await client.end();
