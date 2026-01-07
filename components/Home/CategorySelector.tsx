import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CategorySelector() {
  return (
    <div className="border-b border-dashed pb-2 flex justify-between items-center">
      <Select>
        <SelectTrigger className="w-45">
          <SelectValue>Category</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-1000">
          <SelectGroup>
            <SelectLabel>Categories</SelectLabel>
            <SelectItem value="one">1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-45">
          <SelectValue>Season</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-1000">
          <SelectGroup>
            <SelectLabel>Seasons</SelectLabel>
            <SelectItem value="one">1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-45">
          <SelectValue>Color</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-1000">
          <SelectGroup>
            <SelectLabel>Colors</SelectLabel>
            <SelectItem value="one">1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-45">
          <SelectValue>Tag</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-1000">
          <SelectGroup>
            <SelectLabel>Tags</SelectLabel>
            <SelectItem value="one">1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
