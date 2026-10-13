import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { roleLabels } from "@/lib/labels";
import { listUsers } from "@/lib/users";
import { signInAction } from "./actions";

export default async function SignInPage() {
  const users = await listUsers();

  return (
    <main className="mx-auto w-full max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Development sign-in. Pick a seeded user to continue as them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signInAction} className="grid gap-2">
            {users.map((user) => (
              <Button
                key={user.id}
                type="submit"
                name="userId"
                value={user.id}
                variant="outline"
                className="justify-between"
              >
                {user.name}
                <Badge variant="secondary">{roleLabels[user.role]}</Badge>
              </Button>
            ))}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
