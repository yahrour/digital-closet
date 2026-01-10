import { getColors } from "@/actions/db";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { seasonsType } from "@/constants";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function CategorySelector() {
  const session = await auth.api.getSession({ headers: await headers() });
  const colors = await getColors({ user_id: session?.user.id });

  return (
    <div className="border-b border-dashed pb-2 flex justify-between items-center w-full md:gap-12 sm:gap-8 max-sm:gap-4">
      <MultiSelect>
        <MultiSelectTrigger className="flex-1">
          <MultiSelectValue
            overflowBehavior="cutoff"
            placeholder="Categories"
          />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            <MultiSelectItem value="next.js">Next.js</MultiSelectItem>
            <MultiSelectItem value="sveltekit">SvelteKit</MultiSelectItem>
            <MultiSelectItem value="astro">Astro</MultiSelectItem>
            <MultiSelectItem value="vue">Vue.js</MultiSelectItem>
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>

      <MultiSelect>
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

      <MultiSelect>
        <MultiSelectTrigger className="flex-1">
          <MultiSelectValue overflowBehavior="cutoff" placeholder="Colors" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            {colors?.map((color) => (
              <MultiSelectItem key={color} value={color}>
                {color}
              </MultiSelectItem>
            ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>

      <MultiSelect>
        <MultiSelectTrigger className="flex-1">
          <MultiSelectValue overflowBehavior="cutoff" placeholder="Tags" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            <MultiSelectItem value="next.js">Next.js</MultiSelectItem>
            <MultiSelectItem value="sveltekit">SvelteKit</MultiSelectItem>
            <MultiSelectItem value="astro">Astro</MultiSelectItem>
            <MultiSelectItem value="vue">Vue.js</MultiSelectItem>
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>
    </div>
  );
}
