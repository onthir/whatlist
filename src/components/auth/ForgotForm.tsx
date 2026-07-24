"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthState } from "@/app/actions/auth";
import { Input, Label } from "@/components/ui/Input";
import { ErrorText, SubmitButton, SuccessText } from "./FormFeedback";

export function ForgotForm() {
  const [state, action] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    {},
  );

  if (state.message) return <SuccessText message={state.message} />;

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <ErrorText message={state.error} />
      <SubmitButton>Send reset link</SubmitButton>
    </form>
  );
}
