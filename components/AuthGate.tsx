import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthGate() {
  return (
    <div className="text-center absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Authentication required</h1>
        <p className="text-base font-medium">
          You must be signed in to access this page.
        </p>
      </div>

      <div className="space-x-4">
        <Link href="/signIn">
          <Button className="px-6 py-4 cursor-pointer">Sign in</Button>
        </Link>
        <Link href="/signUp">
          <Button variant="secondary" className="px-6 py-4 cursor-pointer">
            Create account
          </Button>
        </Link>
      </div>
    </div>
  );
}
