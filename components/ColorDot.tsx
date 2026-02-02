export function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-3 w-3 rounded-full border border-neutral-300"
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}
