import { beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/jobs/[jobId]/activity/route";
import { jobNotes } from "@/db/schema";
import { db } from "@/lib/db";
import { setSessionUser } from "@/lib/session";
import { createFixture, type Fixture } from "./helpers";

let f: Fixture;

beforeEach(async () => {
  f = await createFixture();
});

function requestActivity(jobId: number) {
  return GET(new Request(`http://localhost/api/jobs/${jobId}/activity`), {
    params: Promise.resolve({ jobId: String(jobId) }),
  });
}

describe("GET /api/jobs/[jobId]/activity", () => {
  it("returns the job's notes grouped by day with authors and counts", async () => {
    await db.insert(jobNotes).values([
      {
        jobId: f.northJob.id,
        authorId: f.northForeman.id,
        body: "Tear-off started",
        createdAt: new Date("2026-10-06T13:00:00Z"),
      },
      {
        jobId: f.northJob.id,
        authorId: f.northMember.id,
        body: "Underlayment down",
        createdAt: new Date("2026-10-06T18:30:00Z"),
      },
      {
        jobId: f.northJob.id,
        authorId: f.northMember.id,
        body: "Shingles going on",
        createdAt: new Date("2026-10-07T14:15:00Z"),
      },
      {
        jobId: f.eastJob.id,
        authorId: f.eastMember.id,
        body: "Different job",
        createdAt: new Date("2026-10-06T15:00:00Z"),
      },
    ]);
    await setSessionUser(f.northForeman.id);

    const response = await requestActivity(f.northJob.id);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      days: [
        {
          date: "2026-10-07",
          noteCount: 1,
          notes: [{ body: "Shingles going on", authorName: "North Member" }],
        },
        {
          date: "2026-10-06",
          noteCount: 2,
          notes: [
            { body: "Tear-off started", authorName: "North Foreman" },
            { body: "Underlayment down", authorName: "North Member" },
          ],
        },
      ],
    });
  });

  it("returns no days for a job without notes", async () => {
    await setSessionUser(f.northForeman.id);

    const response = await requestActivity(f.northJob.id);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ days: [] });
  });
});
