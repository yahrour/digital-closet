"use client";

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { seasonsType } from "@/constants";
import { ActionResult } from "@/lib/actionsType";
import { useRouter, useSearchParams } from "next/navigation";

export function ItemFiltersSelect({
  categories,
  colors,
  tags,
}: {
  categories: ActionResult<string[]>;
  colors: ActionResult<string[]>;
  tags: ActionResult<string[]>;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const categoriesParams = params.get("categories");
  const seasonsParams = params.get("seasons");
  const colorsParams = params.get("colors");
  const tagsParams = params.get("tags");

  const goTo = (type: string, values: string[]) => {
    const p = new URLSearchParams(params);
    p.set(type, String(values));
    router.push(`?${p.toString()}`);
  };

  const handleSetFilters = (type: string, values: string[]) => {
    console.log("type: ", type);
    console.log("values: ", values);
    goTo(type, values);
  };

  return (
    <div className="border-b border-dashed pb-2 flex justify-between items-center w-full md:gap-12 sm:gap-8 max-sm:gap-4">
      <MultiSelect
        onValuesChange={(values) => handleSetFilters("categories", values)}
        defaultValues={categoriesParams?.split(",")}
      >
        <MultiSelectTrigger className="flex-1">
          <MultiSelectValue
            overflowBehavior="cutoff"
            placeholder="Categories"
          />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            {categories.success &&
              categories.data.map((category) => (
                <MultiSelectItem key={category} value={category}>
                  {category}
                </MultiSelectItem>
              ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>

      <MultiSelect
        onValuesChange={(values) => handleSetFilters("seasons", values)}
        defaultValues={seasonsParams?.split(",")}
      >
        <MultiSelectTrigger className="flex-1">
          <MultiSelectValue overflowBehavior="cutoff" placeholder="Seasons" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            {seasonsType.map((season) => (
              <MultiSelectItem key={season} value={season}>
                {season}
              </MultiSelectItem>
            ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>

      <MultiSelect
        onValuesChange={(values) => handleSetFilters("colors", values)}
        defaultValues={colorsParams?.split(",")}
      >
        <MultiSelectTrigger className="flex-1">
          <MultiSelectValue overflowBehavior="cutoff" placeholder="Colors" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            {colors.success &&
              colors.data.map((color) => (
                <MultiSelectItem key={color} value={color}>
                  {color}
                </MultiSelectItem>
              ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>

      <MultiSelect
        onValuesChange={(values) => handleSetFilters("tags", values)}
        defaultValues={tagsParams?.split(",")}
      >
        <MultiSelectTrigger className="flex-1">
          <MultiSelectValue overflowBehavior="cutoff" placeholder="Tags" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            {tags.success &&
              tags.data.map((tag) => (
                <MultiSelectItem key={tag} value={tag}>
                  {tag}
                </MultiSelectItem>
              ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>
    </div>
  );
}
