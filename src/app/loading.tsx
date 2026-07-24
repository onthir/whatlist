import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 size={32} className="animate-spin text-brand" />
    </div>
  );
}
