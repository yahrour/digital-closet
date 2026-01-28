export function ItemFiltersSkeleton() {
  return (
    <div className="border-b border-dashed pb-2 flex justify-between items-center w-full md:gap-12 sm:gap-8 max-sm:gap-4">
      <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
    </div>
  );
}
