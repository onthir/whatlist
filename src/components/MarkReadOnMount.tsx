"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markAllRead } from "@/app/actions/notifications";

/** Clears the unread badge once the notifications page is viewed. */
export function MarkReadOnMount({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!hasUnread) return;
    markAllRead().then(() => router.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
