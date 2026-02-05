export function OutfitItemSelectorSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <span className="h-fit text-sm text-neutral-600">0 selected</span>
        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 rounded animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
