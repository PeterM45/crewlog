import Link from "next/link";
import { signOutAction } from "@/app/sign-in/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleLabels } from "@/lib/labels";
import { getCurrentUser } from "@/lib/session";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/jobs" className="font-semibold">
          Crewlog
        </Link>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span>{user.name}</span>
            <Badge variant="outline">{roleLabels[user.role]}</Badge>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
