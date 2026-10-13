import Link from "next/link";
import { redirect } from "next/navigation";
import { JobStatusBadge } from "@/components/job-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCalendarDate, todayInCompanyTimezone } from "@/lib/dates";
import { listJobsForUser } from "@/lib/jobs";
import { getCurrentUser } from "@/lib/session";

export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const jobs = await listJobsForUser(user);
  const today = todayInCompanyTimezone();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Jobs</h1>
        {user.role === "admin" && (
          <Button asChild>
            <Link href="/jobs/new">New job</Link>
          </Button>
        )}
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Crew</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="font-medium hover:underline"
                    >
                      {job.title}
                    </Link>
                  </TableCell>
                  <TableCell>{job.address}</TableCell>
                  <TableCell>{job.crewName}</TableCell>
                  <TableCell className="space-x-2">
                    <span>{formatCalendarDate(job.scheduledDate)}</span>
                    {job.scheduledDate === today && <Badge>Today</Badge>}
                  </TableCell>
                  <TableCell>
                    <JobStatusBadge status={job.status} />
                  </TableCell>
                </TableRow>
              ))}
              {jobs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No jobs yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
