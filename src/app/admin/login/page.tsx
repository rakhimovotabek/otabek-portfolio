import type { Metadata } from "next";
import { authConfig } from "@/lib/auth/gateway";
import { OwnerLogin } from "@/components/admin/owner-login";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Owner sign-in",
  robots: { index: false, follow: false },
};
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ logout?: string }>;
}) {
  const params = await searchParams;
  let configured = false;
  try {
    authConfig();
    configured = true;
  } catch {}
  return (
    <OwnerLogin
      configured={configured}
      localLogout={params.logout === "local"}
    />
  );
}
