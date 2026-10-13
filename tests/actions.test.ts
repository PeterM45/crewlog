import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import {
  addNoteAction,
  createJobAction,
  updateJobAction,
} from "@/app/jobs/actions";
import { jobNotes, jobs } from "@/db/schema";
import { db } from "@/lib/db";
import { setSessionUser } from "@/lib/session";
import { createFixture, type Fixture, formData } from "./helpers";

let f: Fixture;

beforeEach(async () => {
  f = await createFixture();
});

const newJob = {
  title: "Garage re-roof",
  address: "9 Side St",
  status: "scheduled",
  scheduledDate: "2026-11-02",
};

describe("addNoteAction", () => {
  it("adds a note as the signed-in user", async () => {
    await setSessionUser(f.northMember.id);

    const state = await addNoteAction(
      f.northJob.id,
      {},
      formData({ body: "  Tarps are up.  " }),
    );

    expect(state.addedAt).toBeTypeOf("number");
    const notes = await db.select().from(jobNotes);
    expect(notes).toMatchObject([
      {
        jobId: f.northJob.id,
        authorId: f.northMember.id,
        body: "Tarps are up.",
      },
    ]);
  });

  it("rejects an empty note", async () => {
    await setSessionUser(f.northMember.id);

    const state = await addNoteAction(
      f.northJob.id,
      {},
      formData({ body: " " }),
    );

    expect(state.error).toBe("Note can't be empty");
    expect(await db.select().from(jobNotes)).toHaveLength(0);
  });

  it("refuses jobs outside the user's crew", async () => {
    await setSessionUser(f.northMember.id);

    await expect(
      addNoteAction(f.eastJob.id, {}, formData({ body: "Hello" })),
    ).rejects.toMatchObject({ status: 403 });
    expect(await db.select().from(jobNotes)).toHaveLength(0);
  });

  it("redirects to sign-in when signed out", async () => {
    await expect(
      addNoteAction(f.northJob.id, {}, formData({ body: "Hello" })),
    ).rejects.toMatchObject({ digest: expect.stringContaining("/sign-in") });
  });
});

describe("createJobAction", () => {
  it("lets admins create jobs", async () => {
    await setSessionUser(f.admin.id);

    await expect(
      createJobAction(
        {},
        formData({ ...newJob, crewId: String(f.eastCrew.id) }),
      ),
    ).rejects.toMatchObject({ digest: expect.stringMatching(/\/jobs\/\d+/) });

    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.title, newJob.title));
    expect(job).toMatchObject({ ...newJob, crewId: f.eastCrew.id });
  });

  it("returns validation errors with the submitted values", async () => {
    await setSessionUser(f.admin.id);

    const state = await createJobAction(
      {},
      formData({ ...newJob, title: "", crewId: String(f.eastCrew.id) }),
    );

    expect(state.error).toBe("Title is required");
    expect(state.values?.address).toBe(newJob.address);
  });

  it("refuses non-admins", async () => {
    await setSessionUser(f.northForeman.id);

    const state = await createJobAction(
      {},
      formData({ ...newJob, crewId: String(f.northCrew.id) }),
    );

    expect(state.error).toBe("Only admins can create jobs");
    expect(await db.select().from(jobs)).toHaveLength(2);
  });
});

describe("updateJobAction", () => {
  const changes = {
    ...newJob,
    title: "North job, phase 2",
    status: "in_progress",
  };

  it("lets admins edit jobs", async () => {
    await setSessionUser(f.admin.id);

    await expect(
      updateJobAction(
        f.northJob.id,
        {},
        formData({ ...changes, crewId: String(f.northCrew.id) }),
      ),
    ).rejects.toMatchObject({
      digest: expect.stringContaining(`/jobs/${f.northJob.id}`),
    });

    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, f.northJob.id));
    expect(job).toMatchObject({ title: changes.title, status: "in_progress" });
  });

  it("refuses foremen, even on their own crew's jobs", async () => {
    await setSessionUser(f.northForeman.id);

    const state = await updateJobAction(
      f.northJob.id,
      {},
      formData({ ...changes, crewId: String(f.northCrew.id) }),
    );

    expect(state.error).toBe("Only admins can edit jobs");
  });
});
