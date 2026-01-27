export default async function Item({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>view item: {id}</div>;
}
