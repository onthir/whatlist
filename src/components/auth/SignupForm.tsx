"use client";

import { useActionState } from "react";
import { signUp, type AuthState } from "@/app/actions/auth";
import { Input, Label } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ErrorText, SubmitButton, SuccessText } from "./FormFeedback";

export function SignupForm() {
  const [state, action] = useActionState<AuthState, FormData>(signUp, {});

  if (state.message) {
    return <SuccessText message={state.message} />;
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          placeholder="filmfan"
          required
        />
        <p className="mt-1 text-xs text-muted">
          3–20 characters. Letters, numbers, and underscores.
        </p>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
      </div>
      <ErrorText message={state.error} />
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}
