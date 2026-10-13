import { cookies } from "next/headers";
import { getUserById } from "@/lib/users";

// Development sign-in: the cookie holds the id of the user picked on /sign-in.
const SESSION_COOKIE = "crewlog_user_id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get(SESSION_COOKIE)?.value);
  if (!Number.isInteger(userId)) return null;
  return getUserById(userId);
}

export async function setSessionUser(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, String(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
