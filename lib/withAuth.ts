import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function withAuth<T, P extends object>(
  callback: (params: { userId: string } & P) => Promise<T>,
  params: P,
): Promise<T> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return callback({
    userId: session.user.id,
    ...params,
  });
}
