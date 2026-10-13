import { and, eq, inArray, type SQL } from "drizzle-orm";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { crewMembers, crews, type Job, jobs, type User } from "@/db/schema";
import { db } from "@/lib/db";

export class AccessError extends Error {
  constructor(readonly status: 403 | 404) {
    super(
      status === 404 ? "Job not found" : "You don't have access to this job",
    );
  }
}

// Admins see every job. Foremen and crew members see their own crew's jobs.
export function jobScopeFor(user: User): SQL | undefined {
  switch (user.role) {
    case "admin":
      return undefined;
    case "foreman":
      return inArray(
        jobs.crewId,
        db
          .select({ id: crews.id })
          .from(crews)
          .where(eq(crews.foremanId, user.id)),
      );
    case "crew_member":
      return inArray(
        jobs.crewId,
        db
          .select({ id: crewMembers.crewId })
          .from(crewMembers)
          .where(eq(crewMembers.userId, user.id)),
      );
  }
}

export async function requireJobAccess(
  user: User,
  jobId: number,
): Promise<Job> {
  if (!Number.isInteger(jobId)) throw new AccessError(404);

  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));
  if (!job) throw new AccessError(404);

  const [visible] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), jobScopeFor(user)));
  if (!visible) throw new AccessError(403);

  return job;
}

// Pages show the 404 page for jobs that are missing or not visible to the user.
export function notFoundOnAccessError(error: unknown): never {
  if (error instanceof AccessError) notFound();
  throw error;
}

export function accessErrorResponse(error: unknown) {
  if (error instanceof AccessError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
  throw error;
}
