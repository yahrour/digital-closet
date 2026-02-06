import { getUserCategories } from "@/actions/categories.actions";
import AuthGate from "@/components/AuthGate";
import { New } from "@/components/Items/New/New";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session?.user) {
    return <AuthGate />
  }

  return (
    <New userId={session.user.id} />
  );
}
