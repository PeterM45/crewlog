import Link from "next/link";
import { redirect } from "next/navigation";
import { JobStatusBadge } from "@/components/job-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { notFoundOnAccessError, requireJobAccess } from "@/lib/access";
import {
  companyDayKey,
  formatCalendarDate,
  formatDateTime,
  formatTime,
} from "@/lib/dates";
import { getCrewById } from "@/lib/jobs";
import { listNotesForJob } from "@/lib/notes";
import { getCurrentUser } from "@/lib/session";
import { NoteForm } from "./note-form";

export default async function JobPage({ params }: PageProps<"/jobs/[jobId]">) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { jobId } = await params;
  const job = await requireJobAccess(user, Number(jobId)).catch(
    notFoundOnAccessError,
  );
  const [crew, notes] = await Promise.all([
    getCrewById(job.crewId),
    listNotesForJob(job.id),
  ]);
  const notesByDay = Map.groupBy(notes, (note) =>
    companyDayKey(note.createdAt),
  );

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{job.title}</CardTitle>
          <CardDescription>{job.address}</CardDescription>
          {user.role === "admin" && (
            <CardAction>
              <Button asChild variant="outline">
                <Link href={`/jobs/${job.id}/edit`}>Edit</Link>
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <JobStatusBadge status={job.status} />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Scheduled</dt>
              <dd>{formatCalendarDate(job.scheduledDate)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Crew</dt>
              <dd>{crew?.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDateTime(job.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <NoteForm jobId={job.id} />
          {notes.length === 0 && (
            <p className="text-muted-foreground text-sm">No notes yet.</p>
          )}
          {[...notesByDay].map(([day, dayNotes]) => (
            <section key={day} className="space-y-3">
              <h3 className="font-medium text-sm">{formatCalendarDate(day)}</h3>
              <ul className="space-y-3">
                {dayNotes.map((note) => (
                  <li key={note.id} className="text-sm">
                    <p className="text-muted-foreground">
                      {note.authorName} · {formatTime(note.createdAt)}
                    </p>
                    <p>{note.body}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
