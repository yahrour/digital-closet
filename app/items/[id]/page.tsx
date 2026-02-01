import { generateItemImageUrls } from "@/actions/images.actions";
import { getItem } from "@/actions/items.actions";
import AuthGate from "@/components/AuthGate";
import { ItemDetails } from "@/components/Items/Edit/ItemDetails";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Item({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <AuthGate />;
  }

  const item = await getItem({ userId: session.user.id, itemId: id });

  if (!item.success || !item.data) {
    return <div>Item don&apos;t exist</div>;
  }

  const imageUrls = await generateItemImageUrls({
    imageKeys: item.data.image_keys,
  });
  if (!imageUrls.success) {
    return <div>Failed to fetch item images</div>;
  }

  return (
    <ItemDetails
      item={item.data}
      imageUrls={imageUrls.data}
      userId={session.user.id}
    />
  );
}
