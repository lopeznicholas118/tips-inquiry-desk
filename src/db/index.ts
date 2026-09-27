import {drizzle} from "drizzle-orm/libsql";
import {createClient} from "@libsql/client";
import * as schema from "./schema";

const sqlite = createClient({
    url: process.env.DATABASE_URL ?? "file:./sqlite.db",
    authToken: process.env.DATABASE_AUTH_TOKEN // required in production
});

export const db = drizzle(sqlite, {schema});