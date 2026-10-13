"use client";

import { useActionState } from "react";
import type { JobFormState } from "@/app/jobs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Crew, Job } from "@/db/schema";
import { statusLabels } from "@/lib/labels";

type JobFormProps = {
  action: (state: JobFormState, formData: FormData) => Promise<JobFormState>;
  crews: Crew[];
  job?: Job;
  defaultScheduledDate?: string;
  submitLabel: string;
};

export function JobForm({
  action,
  crews,
  job,
  defaultScheduledDate,
  submitLabel,
}: JobFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values ?? {
    title: job?.title ?? "",
    address: job?.address ?? "",
    crewId: job ? String(job.crewId) : "",
    status: job?.status ?? "scheduled",
    scheduledDate: job?.scheduledDate ?? defaultScheduledDate ?? "",
  };

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={values.title} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          defaultValue={values.address}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="crewId">Crew</Label>
          <Select name="crewId" defaultValue={values.crewId} required>
            <SelectTrigger id="crewId" className="w-full">
              <SelectValue placeholder="Pick a crew" />
            </SelectTrigger>
            <SelectContent>
              {crews.map((crew) => (
                <SelectItem key={crew.id} value={String(crew.id)}>
                  {crew.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={values.status}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="scheduledDate">Scheduled date</Label>
          <Input
            id="scheduledDate"
            name="scheduledDate"
            type="date"
            defaultValue={values.scheduledDate}
            required
          />
        </div>
      </div>
      {state.error && <p className="text-destructive text-sm">{state.error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
