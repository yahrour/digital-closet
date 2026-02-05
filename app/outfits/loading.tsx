export default function Loading() {
  return (
    <div className="max-w-4xl w-full flex flex-wrap gap-10 mx-auto">
      {[...Array(3)].map((_, idx) => (
        <div
          key={idx}
          className="w-[250px] h-[250px] animate-pulse bg-gray-200"
        ></div>
      ))}
    </div>
  );
}
