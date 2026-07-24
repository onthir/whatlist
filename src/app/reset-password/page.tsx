import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/ResetForm";

export const metadata = { title: "Set a new password" };

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  return (
    <AuthShell
      title="Set a new password"
      subtitle={user ? "Choose a strong new password" : undefined}
    >
      {user ? (
        <ResetForm />
      ) : (
        <div className="space-y-4 text-center text-sm text-muted">
          <p>
            This reset link is invalid or has expired. Request a new one to
            continue.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block font-medium text-brand hover:underline"
          >
            Request a new link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
