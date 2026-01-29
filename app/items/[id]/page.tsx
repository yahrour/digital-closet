import { generateItemImageUrls } from "@/actions/images.actions";
import { getItem } from "@/actions/items.actions";
import AuthGate from "@/components/AuthGate";
import { ItemPage } from "@/components/Items/Item";
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

  const item = await getItem({ user_id: session.user.id, item_id: id });

  if (!item.success || !item.data) {
    return <div>Item don&apos;t exist</div>;
  }

  const imageUrls = await generateItemImageUrls({
    image_keys: item.data.image_keys,
  });
  if (!imageUrls.success) {
    return <div>Failed to fetch item images</div>;
  }

  return (
    <ItemPage
      item={item.data}
      imageUrls={imageUrls.data}
      userId={session.user.id}
    />
  );
}
