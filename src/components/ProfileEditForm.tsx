"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorText, SuccessText } from "@/components/auth/FormFeedback";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 size={16} className="animate-spin" />}
      Save profile
    </Button>
  );
}

export function ProfileEditForm({
  username,
  displayName,
  bio,
  avatarUrl,
}: {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
}) {
  const [state, action] = useActionState<ProfileState, FormData>(
    updateProfile,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" defaultValue={username} required />
        </div>
        <div>
          <Label htmlFor="display_name">Display name</Label>
          <Input
            id="display_name"
            name="display_name"
            defaultValue={displayName}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="avatar_url">Avatar image URL</Label>
        <Input
          id="avatar_url"
          name="avatar_url"
          type="url"
          defaultValue={avatarUrl ?? ""}
          placeholder="https://…"
        />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={bio ?? ""}
          placeholder="Tell people what you love to watch…"
          rows={3}
        />
      </div>
      <ErrorText message={state.error} />
      <SuccessText message={state.message} />
      <SaveButton />
    </form>
  );
}
