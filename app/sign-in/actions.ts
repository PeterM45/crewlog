"use server";

import { redirect } from "next/navigation";
import { clearSession, setSessionUser } from "@/lib/session";

export async function signInAction(formData: FormData) {
  await setSessionUser(Number(formData.get("userId")));
  redirect("/jobs");
}

export async function signOutAction() {
  await clearSession();
  redirect("/sign-in");
}
