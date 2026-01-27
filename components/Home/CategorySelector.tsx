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
import AuthGate from "@/components/AuthGate";
import { getUserCategories } from "@/actions/categories.actions";
import { getColors } from "@/actions/colors.actions";
import { getTags } from "@/actions/tags.actions";

export default async function CategorySelector() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id;

  if (!session) {
    return <AuthGate />;
  }

  const [categories, colors, tags] = await Promise.all([
    getUserCategories({ user_id: userId }),
    getColors({ user_id: userId }),
    getTags({ user_id: userId }),
  ]);

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
            {categories.success &&
              categories.data.map((category) => (
                <MultiSelectItem key={category} value={category}>
                  {category}
                </MultiSelectItem>
              ))}
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
            {colors.success &&
              colors.data.map((color) => (
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
