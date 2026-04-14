import { building } from "$app/environment";
import { Client } from "pg";

export const db = building ? null : await new Client({
	connectionString: process.env.DATABASE_URL,
}).connect();
