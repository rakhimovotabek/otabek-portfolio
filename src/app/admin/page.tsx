import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authCookies } from "@/lib/auth/cookies";
import { ownerClient } from "@/lib/backend/runtime";
import { ApiError } from "@/lib/backend/errors";
import { AdminDashboard } from "@/components/admin/dashboard";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Private archive",
  robots: { index: false, follow: false },
};
export default async function AdminPage() {
  const session = (await authCookies()).read();
  if (!session) redirect("/admin/login");
  try {
    await ownerClient(session.access_token);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    )
      redirect("/admin/login");
    return (
      <main className="owner-shell">
        <h1>The archive is unavailable.</h1>
        <p>
          Owner access could not be verified. No private content has been
          loaded.
        </p>
        <Link className="text-link" href="/admin/login">
          Return to owner sign-in ↗
        </Link>
      </main>
    );
  }
  return <AdminDashboard />;
}
