import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Job } from "@/db/schema";
import { accessErrorResponse, requireJobAccess } from "@/lib/access";
import { listNotesForJob, NOTES_PAGE_SIZE } from "@/lib/notes";
import { getCurrentUser } from "@/lib/session";

const limitSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(100)
  .default(NOTES_PAGE_SIZE);

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/jobs/[jobId]/notes">,
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { jobId } = await params;
  let job: Job;
  try {
    job = await requireJobAccess(user, Number(jobId));
  } catch (error) {
    return accessErrorResponse(error);
  }

  const limit = limitSchema.safeParse(
    request.nextUrl.searchParams.get("limit") ?? undefined,
  );
  if (!limit.success) {
    return NextResponse.json(
      { error: "limit must be a whole number from 1 to 100" },
      { status: 400 },
    );
  }

  const notes = await listNotesForJob(job.id, limit.data);
  return NextResponse.json({ notes });
}
