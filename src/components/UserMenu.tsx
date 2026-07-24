"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, User, LayoutGrid, Users } from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { signOut } from "@/app/actions/auth";

export function UserMenu({
  username,
  displayName,
  avatarUrl,
}: {
  username: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        aria-label="Account menu"
      >
        <Avatar name={displayName} url={avatarUrl} size="md" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-surface shadow-xl shadow-black/50">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-muted">@{username}</p>
          </div>
          <nav className="p-1.5 text-sm">
            <MenuLink href={`/u/${username}`} icon={<User size={16} />} label="My profile" onSelect={() => setOpen(false)} />
            <MenuLink href="/me" icon={<LayoutGrid size={16} />} label="My lists" onSelect={() => setOpen(false)} />
            <MenuLink href="/people" icon={<Users size={16} />} label="Find people" onSelect={() => setOpen(false)} />
          </nav>
          <form action={signOut} className="border-t border-border p-1.5">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onSelect,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-surface-2"
    >
      {icon} {label}
    </Link>
  );
}
