import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/ForgotForm";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="We'll email you a link to reset it"
      footer={
        <Link href="/login" className="font-medium text-brand hover:underline">
          Back to log in
        </Link>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}
