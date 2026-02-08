import AuthGate from "@/components/AuthGate";
import { auth } from "@/lib/auth";
import { MoveRight } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Settings() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <AuthGate />;
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="mb-12 text-center text-3xl font-light tracking-wide">
        Settings
      </h1>
      <div className="divide-y divide-gray-200 border-y">
        <Link
          href="/settings/account"
          className="group flex items-center justify-between py-6 transition hover:opacity-70"
        >
          <span className="text-lg font-light tracking-wide">Account</span>
          <MoveRight
            size={16}
            className="text-xl text-gray-400 group-hover:translate-x-1 transition"
          />
        </Link>

        <Link
          href="/settings/categories"
          className="group flex items-center justify-between py-6 transition hover:opacity-70"
        >
          <span className="text-lg font-light tracking-wide">Categories</span>
          <MoveRight
            size={16}
            className="text-xl text-gray-400 group-hover:translate-x-1 transition"
          />
        </Link>

        <Link
          href="/settings/tags"
          className="group flex items-center justify-between py-6 transition hover:opacity-70"
        >
          <span className="text-lg font-light tracking-wide">Tags</span>
          <MoveRight
            size={16}
            className="text-xl text-gray-400 group-hover:translate-x-1 transition"
          />
        </Link>
      </div>
    </div>
  );
}
