import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: Array<"CUSTOMER" | "SELLER" | "ADMIN">) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/");
  return user;
}
