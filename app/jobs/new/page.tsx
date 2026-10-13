import { notFound, redirect } from "next/navigation";
import { createJobAction } from "@/app/jobs/actions";
import { JobForm } from "@/app/jobs/job-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todayInCompanyTimezone } from "@/lib/dates";
import { listCrews } from "@/lib/jobs";
import { getCurrentUser } from "@/lib/session";

export default async function NewJobPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") notFound();

  const crews = await listCrews();

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>New job</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm
            action={createJobAction}
            crews={crews}
            defaultScheduledDate={todayInCompanyTimezone()}
            submitLabel="Create job"
          />
        </CardContent>
      </Card>
    </main>
  );
}
