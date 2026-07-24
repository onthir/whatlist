import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand shadow-lg shadow-brand/30">
        <Clapperboard size={28} className="text-white" />
      </span>
      <h1 className="text-3xl font-bold tracking-tight">
        <span className="gradient-text">404</span> — Not found
      </h1>
      <p className="mt-2 text-muted">
        We couldn&apos;t find that page or title.
      </p>
      <Link href="/" className="mt-6">
        <Button>Back home</Button>
      </Link>
    </div>
  );
}
