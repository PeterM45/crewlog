import { sql } from "drizzle-orm";
import { crewMembers, crews, jobs, users } from "@/db/schema";
import { db } from "@/lib/db";

export async function resetDatabase() {
  await db.execute(
    sql`truncate table job_notes, jobs, crew_members, crews, users restart identity cascade`,
  );
}

// Two crews, each with a foreman, one member and one job, plus an admin.
export async function createFixture() {
  await resetDatabase();

  const [admin, northForeman, eastForeman, northMember, eastMember] = await db
    .insert(users)
    .values([
      { name: "Admin", email: "admin@test.dev", role: "admin" },
      { name: "North Foreman", email: "nf@test.dev", role: "foreman" },
      { name: "East Foreman", email: "ef@test.dev", role: "foreman" },
      { name: "North Member", email: "nm@test.dev", role: "crew_member" },
      { name: "East Member", email: "em@test.dev", role: "crew_member" },
    ])
    .returning();

  const [northCrew, eastCrew] = await db
    .insert(crews)
    .values([
      { name: "North", foremanId: northForeman.id },
      { name: "East", foremanId: eastForeman.id },
    ])
    .returning();

  await db.insert(crewMembers).values([
    { crewId: northCrew.id, userId: northMember.id },
    { crewId: eastCrew.id, userId: eastMember.id },
  ]);

  const [northJob, eastJob] = await db
    .insert(jobs)
    .values([
      {
        title: "North job",
        address: "1 North St",
        crewId: northCrew.id,
        scheduledDate: "2026-10-06",
      },
      {
        title: "East job",
        address: "1 East St",
        crewId: eastCrew.id,
        scheduledDate: "2026-10-07",
      },
    ])
    .returning();

  return {
    admin,
    northForeman,
    eastForeman,
    northMember,
    eastMember,
    northCrew,
    eastCrew,
    northJob,
    eastJob,
  };
}

export type Fixture = Awaited<ReturnType<typeof createFixture>>;
