"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { redirect } from "next/navigation";
import { FieldDescription, FieldLegend } from "../ui/field";

export function Logout() {
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          redirect("/signIn");
        },
      },
    });
  };

  return (
    <div className="space-y-2">
      <div>
        <FieldLegend className="md:text-2xl! max-md:text-xl!">
          Sign out
        </FieldLegend>
        <FieldDescription className="md:text-base">
          End the current session
        </FieldDescription>
      </div>
      <Button
        onClick={handleLogout}
        variant="destructive"
        className="py-2 px-4 cursor-pointer"
      >
        Sign Out
      </Button>
    </div>
  );
}
