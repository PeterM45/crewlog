import { sql } from "drizzle-orm";
import {
  type Crew,
  crewMembers,
  crews,
  type Job,
  type JobStatus,
  jobNotes,
  jobs,
  type User,
  users,
} from "@/db/schema";
import { db, pool } from "@/lib/db";

// Seed dates are all in October 2026, when Toronto is on EDT (UTC-4).
function toronto(dateTime: string) {
  return new Date(`${dateTime.replace(" ", "T")}:00-04:00`);
}

async function main() {
  await db.execute(
    sql`truncate table job_notes, jobs, crew_members, crews, users restart identity cascade`,
  );

  const [admin, marco, priya, ...members] = await db
    .insert(users)
    .values([
      { name: "Dana Whitfield", email: "dana@crewlog.dev", role: "admin" },
      { name: "Marco Bellini", email: "marco@crewlog.dev", role: "foreman" },
      { name: "Priya Raman", email: "priya@crewlog.dev", role: "foreman" },
      { name: "Luis Ortega", email: "luis@crewlog.dev", role: "crew_member" },
      { name: "Sam Kowalski", email: "sam@crewlog.dev", role: "crew_member" },
      { name: "Jamal Reid", email: "jamal@crewlog.dev", role: "crew_member" },
      { name: "Hannah Cole", email: "hannah@crewlog.dev", role: "crew_member" },
      { name: "Tom Nguyen", email: "tom@crewlog.dev", role: "crew_member" },
      { name: "Erin Walsh", email: "erin@crewlog.dev", role: "crew_member" },
    ])
    .returning();
  const [luis, sam, jamal, hannah, tom, erin] = members;

  const [north, east] = await db
    .insert(crews)
    .values([
      { name: "North Crew", foremanId: marco.id },
      { name: "East Crew", foremanId: priya.id },
    ])
    .returning();

  await db.insert(crewMembers).values([
    { crewId: north.id, userId: luis.id },
    { crewId: north.id, userId: sam.id },
    { crewId: north.id, userId: jamal.id },
    { crewId: east.id, userId: hannah.id },
    { crewId: east.id, userId: tom.id },
    { crewId: east.id, userId: erin.id },
  ]);

  // biome-ignore format: one job per line
  const jobRows: [string, string, JobStatus, Crew, string, string][] = [
    ["Full re-roof, asphalt shingles", "42 Maple Ave, Toronto", "complete", north, "2026-10-01", "2026-09-22 10:15"],
    ["Flat roof membrane replacement", "118 Birch Cres, Toronto", "in_progress", north, "2026-10-06", "2026-09-25 14:30"],
    ["Storm damage repair", "7 Oakwood Dr, Etobicoke", "in_progress", north, "2026-10-09", "2026-10-03 08:45"],
    ["Gutter and fascia replacement", "230 Harbour St, Toronto", "scheduled", north, "2026-10-20", "2026-10-08 11:00"],
    ["Cedar shake re-roof", "1550 Dufferin St, Toronto", "complete", east, "2026-10-02", "2026-09-20 09:30"],
    ["Skylight install and flashing", "88 Lakeshore Rd, Mississauga", "in_progress", east, "2026-10-07", "2026-09-28 16:20"],
    ["Metal roof inspection", "301 Kingston Rd, Scarborough", "in_progress", east, "2026-10-10", "2026-10-05 13:10"],
    ["Chimney flashing repair", "19 Elm Grove, Toronto", "scheduled", east, "2026-10-22", "2026-10-09 10:40"],
  ];
  const [maple, birch, oakwood, harbour, dufferin, lakeshore, kingston, elm] =
    await db
      .insert(jobs)
      .values(
        jobRows.map(
          ([title, address, status, crew, scheduledDate, createdAt]) => ({
            title,
            address,
            status,
            crewId: crew.id,
            scheduledDate,
            createdAt: toronto(createdAt),
          }),
        ),
      )
      .returning();

  // biome-ignore format: one note per line
  const notes: [Job, User, string, string][] = [
    [maple, marco, "2026-10-01 07:30", "Crew on site, tear-off started on the north slope."],
    [maple, luis, "2026-10-01 12:10", "Found soft decking near the back valley, two sheets to replace."],
    [maple, sam, "2026-10-01 16:45", "Tear-off done. Underlayment on the north slope."],
    [maple, marco, "2026-10-01 21:20", "Homeowner asked about adding a ridge vent. Quoting tomorrow."],
    [maple, jamal, "2026-10-02 09:05", "Shingles going on, about 60% done."],
    [maple, luis, "2026-10-02 15:40", "Ridge vent installed, final cleanup underway."],
    [maple, marco, "2026-10-02 22:15", "Walkthrough done with homeowner. Job complete."],
    [birch, marco, "2026-10-06 08:00", "Old membrane removal started."],
    [birch, jamal, "2026-10-06 13:25", "Two drains are clogged, clearing before new membrane goes down."],
    [birch, sam, "2026-10-06 20:40", "Tarped the open section, rain expected overnight."],
    [birch, marco, "2026-10-07 07:45", "No water got in overnight. Continuing."],
    [birch, luis, "2026-10-07 14:30", "Insulation boards down on the east half."],
    [birch, jamal, "2026-10-08 10:20", "Membrane welded on the east half, starting west."],
    [birch, marco, "2026-10-08 23:10", "Supplier confirmed second roll arrives Friday morning."],
    [birch, sam, "2026-10-09 11:50", "Second roll delivered, west half in progress."],
    [oakwood, marco, "2026-10-09 09:15", "Inspected storm damage, about 30 shingles missing on the south side."],
    [oakwood, luis, "2026-10-09 15:00", "Replaced damaged shingles, checking flashing next."],
    [oakwood, admin, "2026-10-09 20:05", "Insurance adjuster wants photos of the flashing before repair."],
    [oakwood, luis, "2026-10-10 10:30", "Photos sent to the office. Flashing lifted at the chimney."],
    [oakwood, marco, "2026-10-10 16:10", "Waiting on adjuster sign-off before resealing."],
    [harbour, admin, "2026-10-08 11:05", "Customer prefers the white fascia. Order placed."],
    [harbour, marco, "2026-10-12 08:30", "Materials confirmed for the 20th."],
    [dufferin, priya, "2026-10-02 07:20", "Started stripping the old cedar shakes."],
    [dufferin, hannah, "2026-10-02 11:45", "Starter course down, rot found under the dormer."],
    [dufferin, tom, "2026-10-02 17:30", "Dormer sheathing replaced."],
    [dufferin, priya, "2026-10-03 21:50", "Neighbour asked us to start after 8am tomorrow."],
    [dufferin, erin, "2026-10-04 13:15", "Shakes going on, south slope done."],
    [dufferin, priya, "2026-10-05 15:00", "Final inspection passed. Job complete."],
    [lakeshore, priya, "2026-10-07 08:10", "Cutting skylight openings today."],
    [lakeshore, erin, "2026-10-07 12:40", "Both openings framed."],
    [lakeshore, tom, "2026-10-07 18:55", "First skylight set, flashing kit installed."],
    [lakeshore, priya, "2026-10-07 22:30", "Small leak around the second curb in the rain test, resealing tomorrow."],
    [lakeshore, hannah, "2026-10-08 10:00", "Resealed the second curb, no more water."],
    [lakeshore, erin, "2026-10-08 14:20", "Interior trim handed off to the finishing contractor."],
    [lakeshore, priya, "2026-10-09 09:45", "Customer happy with the result, closing out next week."],
    [kingston, priya, "2026-10-10 08:20", "Inspection started, panel fasteners loose along the eaves."],
    [kingston, tom, "2026-10-10 12:30", "Tightened 40 fasteners, three need replacing."],
    [kingston, hannah, "2026-10-11 09:10", "Replacement fasteners installed."],
    [kingston, priya, "2026-10-11 20:35", "Sent inspection report to the property manager."],
    [kingston, tom, "2026-10-12 10:15", "Sealant on the ridge cap needs a second coat."],
    [elm, admin, "2026-10-09 10:45", "Customer will be away that week, side gate code is on the work order."],
  ];

  await db.insert(jobNotes).values(
    notes.map(([job, author, createdAt, body]) => ({
      jobId: job.id,
      authorId: author.id,
      body,
      createdAt: toronto(createdAt),
    })),
  );

  console.log(
    `Seeded ${1 + 2 + members.length} users, 2 crews, 8 jobs and ${notes.length} notes.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
