import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

export default function CategorySelector() {
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
            <MultiSelectItem value="next.js">Next.js</MultiSelectItem>
            <MultiSelectItem value="sveltekit">SvelteKit</MultiSelectItem>
            <MultiSelectItem value="astro">Astro</MultiSelectItem>
            <MultiSelectItem value="vue">Vue.js</MultiSelectItem>
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>

      <MultiSelect>
        <MultiSelectTrigger className="flex-1">
          <MultiSelectValue overflowBehavior="cutoff" placeholder="Colors" />
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
