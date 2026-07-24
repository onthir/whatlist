"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/app/actions/auth";
import { Label } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ErrorText, SubmitButton } from "./FormFeedback";

export function ResetForm() {
  const [state, action] = useActionState<AuthState, FormData>(
    updatePassword,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="password">New password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm new password</Label>
        <PasswordInput
          id="confirm"
          name="confirm"
          autoComplete="new-password"
          required
        />
      </div>
      <ErrorText message={state.error} />
      <SubmitButton>Update password</SubmitButton>
    </form>
  );
}
