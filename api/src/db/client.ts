import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const connectionString = process.env.DATABASE_URL ?? 'postgres://eprokurimi:eprokurimi@localhost:5432/eprokurimi';
const client = postgres(connectionString);

export const db = drizzle(client);
export { client };
