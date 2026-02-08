import Home from "@/components/Home/Home";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return <Home searchParams={searchParams} />;
}
