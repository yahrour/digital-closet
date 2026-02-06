import { AccountForm } from "@/components/Account/AccountForm";
import { Logout } from "@/components/Account/Logout";
import AuthGate from "@/components/AuthGate";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Account() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <AuthGate />;
  }
  return (
    <div className="w-full max-w-125 mx-auto space-y-8">
      <AccountForm session={session} />
      <Logout />
    </div>
  );
}
