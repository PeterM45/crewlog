import { NextResponse } from "next/server";
import { getJobNotes, getNoteCountsByDay } from "@/lib/activity";
import { getCurrentUser } from "@/lib/session";
import { getUserById } from "@/lib/users";

type ActivityNote = {
  id: number;
  body: string;
  authorName: string;
  createdAt: string;
};

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/jobs/[jobId]/activity">,
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { jobId } = await params;

  try {
    const [counts, notes] = await Promise.all([
      getNoteCountsByDay(Number(jobId)),
      getJobNotes(Number(jobId)),
    ]);

    const notesByDay = new Map<string, ActivityNote[]>();
    for (const note of notes) {
      const author = await getUserById(note.authorId);
      const day = note.createdAt.toISOString().slice(0, 10);
      const dayNotes = notesByDay.get(day) ?? [];
      dayNotes.push({
        id: note.id,
        body: note.body,
        authorName: author?.name ?? "Unknown",
        createdAt: note.createdAt.toISOString(),
      });
      notesByDay.set(day, dayNotes);
    }

    const days = counts.map(({ day, count }) => ({
      date: day,
      noteCount: count,
      notes: notesByDay.get(day) ?? [],
    }));

    return NextResponse.json({ days });
  } catch {
    return NextResponse.json({ days: [] });
  }
}
