import Link from "next/link";
import { Clapperboard } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
      <div className="mb-6 flex flex-col items-center text-center">
        <Link
          href="/"
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl gradient-brand shadow-lg shadow-brand/30"
        >
          <Clapperboard size={26} className="text-white" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>

      <div className="card p-6 shadow-xl shadow-black/30">{children}</div>

      {footer && (
        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      )}
    </div>
  );
}
