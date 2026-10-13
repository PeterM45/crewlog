import { beforeEach, describe, expect, it } from "vitest";
import { requireJobAccess } from "@/lib/access";
import { createFixture, type Fixture } from "./helpers";

let f: Fixture;

beforeEach(async () => {
  f = await createFixture();
});

describe("requireJobAccess", () => {
  it("lets admins access every job", async () => {
    await expect(requireJobAccess(f.admin, f.northJob.id)).resolves.toEqual(
      f.northJob,
    );
    await expect(requireJobAccess(f.admin, f.eastJob.id)).resolves.toEqual(
      f.eastJob,
    );
  });

  it("lets foremen access only their crew's jobs", async () => {
    await expect(
      requireJobAccess(f.northForeman, f.northJob.id),
    ).resolves.toEqual(f.northJob);
    await expect(
      requireJobAccess(f.northForeman, f.eastJob.id),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("lets crew members access only jobs assigned to their crew", async () => {
    await expect(requireJobAccess(f.eastMember, f.eastJob.id)).resolves.toEqual(
      f.eastJob,
    );
    await expect(
      requireJobAccess(f.eastMember, f.northJob.id),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("throws a 404 for jobs that don't exist", async () => {
    await expect(requireJobAccess(f.admin, 9999)).rejects.toMatchObject({
      status: 404,
    });
    await expect(requireJobAccess(f.admin, Number.NaN)).rejects.toMatchObject({
      status: 404,
    });
  });
});
