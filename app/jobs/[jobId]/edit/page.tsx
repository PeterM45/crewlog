import { notFound, redirect } from "next/navigation";
import { updateJobAction } from "@/app/jobs/actions";
import { JobForm } from "@/app/jobs/job-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFoundOnAccessError, requireJobAccess } from "@/lib/access";
import { listCrews } from "@/lib/jobs";
import { getCurrentUser } from "@/lib/session";

export default async function EditJobPage({
  params,
}: PageProps<"/jobs/[jobId]/edit">) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") notFound();

  const { jobId } = await params;
  const job = await requireJobAccess(user, Number(jobId)).catch(
    notFoundOnAccessError,
  );
  const crews = await listCrews();

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit job</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm
            action={updateJobAction.bind(null, job.id)}
            crews={crews}
            job={job}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </main>
  );
}
