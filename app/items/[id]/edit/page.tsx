import { generateItemImageUrls } from "@/actions/images.actions";
import { getItem } from "@/actions/items.actions";
import AuthGate from "@/components/AuthGate";
import ItemEdit from "@/components/Items/Edit/ItemEdit";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Edit({
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
  if (!item.success) {
    return <div>Failed to fetch item</div>;
  }
  const imageUrls = await generateItemImageUrls({
    imageKeys: item.data.image_keys,
  });
  if (!imageUrls.success) {
    return <div>Failed to fetch item images</div>;
  }

  const completeItemInfo = { ...item.data, imageUrls: imageUrls.data };
  return <ItemEdit item={completeItemInfo} userId={session.user.id} />;
}
