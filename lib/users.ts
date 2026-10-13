import { asc, eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { db } from "@/lib/db";

export async function getUserById(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ?? null;
}

export async function listUsers() {
  return db.select().from(users).orderBy(asc(users.role), asc(users.name));
}
