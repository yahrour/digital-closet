import { Settings, Shirt } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BottomNav() {
  return (
    <nav className="backdrop-blur-md max-w-sm py-2 fixed bottom-2 left-1/2 translate-x-[-50%] w-full bg-primary/70 text-white font-medium rounded m-0 flex justify-around">
      <Link href="/" className="flex flex-col items-center gap-1 group">
        <Image
          priority
          width={28}
          height={28}
          src="/wardrobe.svg"
          alt="wardrobe"
        />
        <p>Closet</p>
      </Link>
      <Link href="/outfits" className="flex flex-col items-center gap-1">
        <Shirt size={28} />
        <p>Outfits</p>
      </Link>
      <Link href="/settings" className="flex flex-col items-center gap-1">
        <Settings size={28} />
        <p>Settings</p>
      </Link>
    </nav>
  );
}
