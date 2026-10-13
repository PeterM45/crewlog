import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { GET as getNotes } from "@/app/api/jobs/[jobId]/notes/route";
import { GET as getJobs } from "@/app/api/jobs/route";
import { jobNotes } from "@/db/schema";
import { db } from "@/lib/db";
import { setSessionUser } from "@/lib/session";
import { createFixture, type Fixture } from "./helpers";

let f: Fixture;

beforeEach(async () => {
  f = await createFixture();
});

function requestNotes(jobId: number | string, query = "") {
  const request = new NextRequest(
    `http://localhost/api/jobs/${jobId}/notes${query}`,
  );
  return getNotes(request, {
    params: Promise.resolve({ jobId: String(jobId) }),
  });
}

describe("GET /api/jobs", () => {
  it("returns 401 when signed out", async () => {
    const response = await getJobs();
    expect(response.status).toBe(401);
  });

  it("returns every job to admins", async () => {
    await setSessionUser(f.admin.id);

    const { jobs } = await (await getJobs()).json();

    expect(jobs.map((job: { id: number }) => job.id).sort()).toEqual([
      f.northJob.id,
      f.eastJob.id,
    ]);
  });

  it("returns only the crew's jobs to foremen and crew members", async () => {
    for (const user of [f.northForeman, f.northMember]) {
      await setSessionUser(user.id);

      const { jobs } = await (await getJobs()).json();

      expect(jobs).toMatchObject([{ id: f.northJob.id, crewName: "North" }]);
    }
  });
});

describe("GET /api/jobs/[jobId]/notes", () => {
  beforeEach(async () => {
    await db.insert(jobNotes).values([
      {
        jobId: f.northJob.id,
        authorId: f.northMember.id,
        body: "First",
        createdAt: new Date("2026-10-06T14:00:00Z"),
      },
      {
        jobId: f.northJob.id,
        authorId: f.northForeman.id,
        body: "Second",
        createdAt: new Date("2026-10-06T15:00:00Z"),
      },
      {
        jobId: f.northJob.id,
        authorId: f.northMember.id,
        body: "Third",
        createdAt: new Date("2026-10-07T14:00:00Z"),
      },
    ]);
  });

  it("returns 401 when signed out", async () => {
    const response = await requestNotes(f.northJob.id);
    expect(response.status).toBe(401);
  });

  it("returns notes newest first with author names", async () => {
    await setSessionUser(f.northMember.id);

    const response = await requestNotes(f.northJob.id);

    expect(response.status).toBe(200);
    expect((await response.json()).notes).toMatchObject([
      { body: "Third", authorName: "North Member" },
      { body: "Second", authorName: "North Foreman" },
      { body: "First", authorName: "North Member" },
    ]);
  });

  it("applies the limit query parameter", async () => {
    await setSessionUser(f.northForeman.id);

    const response = await requestNotes(f.northJob.id, "?limit=2");

    expect((await response.json()).notes).toHaveLength(2);
    expect((await requestNotes(f.northJob.id, "?limit=500")).status).toBe(400);
  });

  it("returns 403 for another crew's job", async () => {
    await setSessionUser(f.eastMember.id);

    const response = await requestNotes(f.northJob.id);

    expect(response.status).toBe(403);
  });

  it("returns 404 for a job that doesn't exist", async () => {
    await setSessionUser(f.admin.id);

    expect((await requestNotes(9999)).status).toBe(404);
    expect((await requestNotes("abc")).status).toBe(404);
  });
});
