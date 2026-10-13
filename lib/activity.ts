import { asc, desc, eq, sql } from "drizzle-orm";
import { jobNotes } from "@/db/schema";
import { db } from "@/lib/db";

export async function getNoteCountsByDay(jobId: number) {
  const day = sql<string>`to_char(${jobNotes.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;

  const rows = await db
    .select({ day, count: sql<string>`count(*)` })
    .from(jobNotes)
    .where(eq(jobNotes.jobId, jobId))
    .groupBy(day)
    .orderBy(desc(day));

  return rows.map((row) => ({ day: row.day, count: Number(row.count) }));
}

export async function getJobNotes(jobId: number) {
  return db
    .select()
    .from(jobNotes)
    .where(eq(jobNotes.jobId, jobId))
    .orderBy(asc(jobNotes.createdAt));
}
