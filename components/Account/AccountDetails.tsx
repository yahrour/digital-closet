import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AccountForm } from "./AccountForm";
import Logout from "./Logout";
import AuthGate from "@/components/AuthGate";

export async function AccountDetails() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <AuthGate />;
  }
  return (
    <div className="space-y-8">
      <AccountForm session={session} />
      <Logout />
    </div>
  );
}
