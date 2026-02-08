import { getUnusedTags } from "@/actions/tags.actions";
import AuthGate from "@/components/AuthGate";
import { DeleteUnusedTags } from "@/components/Tags/DeleteUnusedTags";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Tags() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return <AuthGate />;
  }

  const unusedTags = await getUnusedTags({ userId: session.user.id });
  if (!unusedTags.success) {
    return <h1 className="w-full text-center">Failed to fetch unused tags</h1>;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-medium text-neutral-900">Tags</h1>
        <p className="text-sm text-neutral-500 max-w-md">
          Remove ones that are no longer used.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h2 className="text-xs uppercase tracking-wide text-neutral-500">
          Unused Tags
        </h2>

        <div className="flex flex-wrap gap-1 max-w-xl">
          {unusedTags.data.length > 0 ? (
            unusedTags.data.map((tag) => (
              <Badge
                key={tag}
                className="group inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-3 text-sm font-medium select-none transition-colors hover:bg-primary/20"
              >
                <span className="truncate">{tag}</span>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-neutral-500">No unused tags found.</p>
          )}
        </div>
      </div>

      {/* Action */}
      {unusedTags.data.length > 0 && <DeleteUnusedTags />}
    </div>
  );
}
