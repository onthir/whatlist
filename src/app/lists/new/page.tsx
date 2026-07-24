import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createList } from "@/app/actions/lists";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "New list" };

export default async function NewListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/lists/new");

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <Link
        href="/me"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="card p-6">
        <h1 className="text-2xl font-bold tracking-tight">Create a list</h1>
        <p className="mt-1 text-sm text-muted">
          Group titles any way you like — “Top 10 for a road trip”, “Cozy rainy
          days”, whatever.
        </p>

        <form action={createList} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Top 10 to watch on a trip"
              maxLength={120}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What's this list about?"
              rows={3}
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            Create list
          </Button>
        </form>
      </div>
    </div>
  );
}
