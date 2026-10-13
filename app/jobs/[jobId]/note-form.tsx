"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { addNoteAction, type NoteFormState } from "@/app/jobs/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NoteForm({ jobId }: { jobId: number }) {
  const [state, formAction, pending] = useActionState<NoteFormState, FormData>(
    addNoteAction.bind(null, jobId),
    {},
  );

  useEffect(() => {
    if (state.addedAt) toast.success("Note added");
  }, [state.addedAt]);

  return (
    <form action={formAction} className="space-y-2">
      <Label htmlFor="body">Add a note</Label>
      <Textarea id="body" name="body" required maxLength={2000} />
      {state.error && <p className="text-destructive text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add note"}
      </Button>
    </form>
  );
}
