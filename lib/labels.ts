import type { JobStatus, Role } from "@/db/schema";

export const roleLabels: Record<Role, string> = {
  admin: "Admin",
  foreman: "Foreman",
  crew_member: "Crew member",
};

export const statusLabels: Record<JobStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  complete: "Complete",
};
