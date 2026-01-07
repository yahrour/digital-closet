import { Plus, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="max-w-7xl mx-auto p-4 border-b flex justify-between items-center">
      <Link href="/">Closy</Link>
      <ul className="flex justify-between items-center gap-2">
        <li>
          <Button className="cursor-pointer">
            Add Item <Plus />
          </Button>
        </li>
        <li>
          <Link href="/account" prefetch={false}>
            <User />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
