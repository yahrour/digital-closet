import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="max-w-7xl mx-auto p-4 border-b flex justify-between items-center">
      <Link href="/">Closy</Link>
      <ul className="flex justify-between items-center gap-2">
        <li>
          <Link href="/items/new">
            <Button variant="outline" className="cursor-pointer">
              Add Item <Plus />
            </Button>
          </Link>
        </li>
        <li>
          <Link href="/outfits/new">
            <Button variant="outline" className="cursor-pointer">
              New Outfit <Plus />
            </Button>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
