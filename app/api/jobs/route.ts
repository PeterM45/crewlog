import { NextResponse } from "next/server";
import { listJobsForUser } from "@/lib/jobs";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const jobs = await listJobsForUser(user);
  return NextResponse.json({ jobs });
}
