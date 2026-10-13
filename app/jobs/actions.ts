"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { jobStatus } from "@/db/schema";
import { requireJobAccess } from "@/lib/access";
import { createJob, updateJob } from "@/lib/jobs";
import { addNote } from "@/lib/notes";
import { getCurrentUser } from "@/lib/session";

const jobSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  address: z.string().trim().min(1, "Address is required").max(200),
  crewId: z.coerce.number().int().positive("Pick a crew"),
  status: z.enum(jobStatus.enumValues),
  scheduledDate: z.iso.date("Pick a scheduled date"),
});

const noteSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Note can't be empty")
    .max(2000, "Notes are limited to 2000 characters"),
});

export type JobFormState = { error?: string; values?: Record<string, string> };
export type NoteFormState = { error?: string; addedAt?: number };

export async function createJobAction(
  _state: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") return { error: "Only admins can create jobs" };

  const values = Object.fromEntries(formData) as Record<string, string>;
  const parsed = jobSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };

  const job = await createJob(parsed.data);
  revalidatePath("/jobs");
  redirect(`/jobs/${job.id}`);
}

export async function updateJobAction(
  jobId: number,
  _state: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const job = await requireJobAccess(user, jobId);
  if (user.role !== "admin") return { error: "Only admins can edit jobs" };

  const values = Object.fromEntries(formData) as Record<string, string>;
  const parsed = jobSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };

  await updateJob(job.id, parsed.data);
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${job.id}`);
  redirect(`/jobs/${job.id}`);
}

export async function addNoteAction(
  jobId: number,
  _state: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const job = await requireJobAccess(user, jobId);

  const parsed = noteSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await addNote({ jobId: job.id, authorId: user.id, body: parsed.data.body });
  revalidatePath(`/jobs/${job.id}`);
  return { addedAt: Date.now() };
}
