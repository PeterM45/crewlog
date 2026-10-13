import { Badge } from "@/components/ui/badge";
import type { JobStatus } from "@/db/schema";
import { statusLabels } from "@/lib/labels";

const variants = {
  scheduled: "outline",
  in_progress: "default",
  complete: "secondary",
} as const;

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <Badge variant={variants[status]}>{statusLabels[status]}</Badge>;
}
