import { desc, eq } from "drizzle-orm";
import { jobNotes, users } from "@/db/schema";
import { db } from "@/lib/db";

export const NOTES_PAGE_SIZE = 50;

// Most recent notes first, with the author's name joined in.
export async function listNotesForJob(jobId: number, limit = NOTES_PAGE_SIZE) {
  return db
    .select({
      id: jobNotes.id,
      body: jobNotes.body,
      createdAt: jobNotes.createdAt,
      authorId: jobNotes.authorId,
      authorName: users.name,
    })
    .from(jobNotes)
    .innerJoin(users, eq(users.id, jobNotes.authorId))
    .where(eq(jobNotes.jobId, jobId))
    .orderBy(desc(jobNotes.createdAt))
    .limit(limit);
}

export async function addNote(input: {
  jobId: number;
  authorId: number;
  body: string;
}) {
  const [note] = await db.insert(jobNotes).values(input).returning();
  return note;
}
