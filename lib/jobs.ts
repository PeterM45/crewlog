import { asc, desc, eq, getTableColumns } from "drizzle-orm";
import { crews, jobs, type User } from "@/db/schema";
import { jobScopeFor } from "@/lib/access";
import { db } from "@/lib/db";

export type JobInput = Omit<typeof jobs.$inferInsert, "id" | "createdAt">;

export async function listJobsForUser(user: User) {
  return db
    .select({ ...getTableColumns(jobs), crewName: crews.name })
    .from(jobs)
    .innerJoin(crews, eq(crews.id, jobs.crewId))
    .where(jobScopeFor(user))
    .orderBy(desc(jobs.scheduledDate), desc(jobs.id));
}

export async function createJob(input: JobInput) {
  const [job] = await db.insert(jobs).values(input).returning();
  return job;
}

export async function updateJob(id: number, input: JobInput) {
  const [job] = await db
    .update(jobs)
    .set(input)
    .where(eq(jobs.id, id))
    .returning();
  return job;
}

export async function listCrews() {
  return db.select().from(crews).orderBy(asc(crews.name));
}

export async function getCrewById(id: number) {
  const [crew] = await db.select().from(crews).where(eq(crews.id, id));
  return crew ?? null;
}
