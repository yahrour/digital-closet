import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] select-none flex flex-col gap-4 items-center justify-center px-4 text-center">
      <Image src="/404.svg" alt="" width={400} height={400} className="w-48 mx-auto opacity-50" />  
      <Link href="/">
          <Button variant="link" className="ml-4 text-base font-semibold cursor-pointer">
            Go Back to Closet
          </Button>
      </Link>
    </div>
  )
}