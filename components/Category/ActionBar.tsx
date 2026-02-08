"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Search, XIcon } from "lucide-react";
import { NewCategoryDialog } from "./NewCategoryDialog";
import { useRouter, useSearchParams } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function ActionBar() {
  const [categoryName, setCategoryName] = useState("");
  const router = useRouter();
  const params = useSearchParams();

  const goTo = (category: string) => {
    const c = new URLSearchParams(params);
    c.set("category", String(category));
    c.set("page", "1");
    router.push(`?${c.toString()}`);
  };

  const removeCategoryParam = () => {
    const c = new URLSearchParams(params);
    c.delete("category");
    const query = c.toString();
    router.push(query ? `?${query}` : "?");
  };

  const handleSearch = () => {
    if (categoryName.length > 0) {
      goTo(categoryName);
    }
  };

  return (
    <div className="flex justify-between max-sm:flex-col gap-2">
      <InputGroup className="max-w-sm">
        <InputGroupInput
          placeholder="Search..."
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Clear"
            title="Clear"
            size="icon-xs"
            className="cursor-pointer"
            onClick={() => {
              setCategoryName("");
              removeCategoryParam();
            }}
          >
            {categoryName.length ? <XIcon /> : null}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <div className="flex justify-between gap-2 max-w-sm w-full">
        <Button
          variant="secondary"
          className="cursor-pointer h-[38px] flex-1"
          onClick={handleSearch}
        >
          <Search size={16} />
          <span>Search</span>
        </Button>
        <NewCategoryDialog categoryName={categoryName} />
      </div>
    </div>
  );
}
