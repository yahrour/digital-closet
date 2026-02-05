export default function Loading() {
  return (
    <div className="max-w-4xl w-full flex flex-wrap gap-6 mx-auto">
      {[...Array(3)].map((_, idx) => (
        <div
          key={idx}
          className="w-[200px] h-[200px] animate-pulse bg-gray-200"
        ></div>
      ))}
    </div>
  );
}
