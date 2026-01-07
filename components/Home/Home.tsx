import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AuthGate from "@/components/AuthGate";
import CategorySelector from "./CategorySelector";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <AuthGate />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <CategorySelector />
      <div className="flex flex-wrap justify-between gap-4">
        <div className="w-[250px] h-[300px] bg-gray-300"></div>
        <div className="w-[250px] h-[300px] bg-gray-300"></div>
        <div className="w-[250px] h-[300px] bg-gray-300"></div>
        <div className="w-[250px] h-[300px] bg-gray-300"></div>
        <div className="w-[250px] h-[300px] bg-gray-300"></div>
        <div className="w-[250px] h-[300px] bg-gray-300"></div>
        <div className="w-[250px] h-[300px] bg-gray-300"></div>
        <div className="w-[250px] h-[300px] bg-gray-300"></div>
        <div className="w-[250px] h-[300px] bg-gray-300"></div>
      </div>
    </div>
  );
}
