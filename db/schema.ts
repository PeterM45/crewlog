import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
  "admin",
  "foreman",
  "crew_member",
]);
export const jobStatus = pgEnum("job_status", [
  "scheduled",
  "in_progress",
  "complete",
]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRole("role").notNull(),
});

export const crews = pgTable("crews", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  foremanId: integer("foreman_id")
    .notNull()
    .references(() => users.id),
});

export const crewMembers = pgTable(
  "crew_members",
  {
    crewId: integer("crew_id")
      .notNull()
      .references(() => crews.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.crewId, table.userId] })],
);

export const jobs = pgTable("jobs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  address: text("address").notNull(),
  status: jobStatus("status").notNull().default("scheduled"),
  crewId: integer("crew_id")
    .notNull()
    .references(() => crews.id),
  scheduledDate: date("scheduled_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const jobNotes = pgTable(
  "job_notes",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("job_notes_job_id_created_at_idx").on(table.jobId, table.createdAt),
  ],
);

export type User = typeof users.$inferSelect;
export type Role = User["role"];
export type Crew = typeof crews.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type JobStatus = Job["status"];
export type JobNote = typeof jobNotes.$inferSelect;
