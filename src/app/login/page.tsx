import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/");

  const { next = "/", error } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your WhatList account"
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-medium text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={next} initialError={error} />
    </AuthShell>
  );
}
