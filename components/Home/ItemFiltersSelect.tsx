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
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function buildFiltersDefaultValues(paramValue: string | null): string[] {
  if (!paramValue || paramValue.length === 0) {
    return [];
  }
  return paramValue.split(",");
}

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
  const pathname = usePathname();

  const categoriesParams = buildFiltersDefaultValues(params.get("categories"));
  const seasonsParams = buildFiltersDefaultValues(params.get("seasons"));
  const colorsParams = buildFiltersDefaultValues(params.get("colors"));
  const tagsParams = buildFiltersDefaultValues(params.get("tags"));

  const goTo = (type: string, values: string[]) => {
    if (values.length > 0) {
      const p = new URLSearchParams(params);
      p.set(type, String(values));
      router.push(`?${p.toString()}`);
    } else {
      const p = new URLSearchParams(params);
      p.delete(type);
      const newUrl = `${pathname}?${p.toString()}`;
      router.replace(newUrl);
    }
  };

  const handleSetFilters = (type: string, values: string[]) => {
    goTo(type, values);
  };

  return (
    <div className="border-b border-dashed pb-2 flex justify-between items-center w-full md:gap-12 sm:gap-8 max-sm:gap-4">
      <MultiSelect
        onValuesChange={(values) => handleSetFilters("categories", values)}
        defaultValues={categoriesParams}
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
        defaultValues={seasonsParams}
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
        defaultValues={colorsParams}
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
        defaultValues={tagsParams}
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
