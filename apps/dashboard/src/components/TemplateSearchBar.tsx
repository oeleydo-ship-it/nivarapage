import { Search } from 'lucide-react'
import { Select } from '../ui/primitives'

export function TemplateSearchBar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categories,
  autoFocus = false,
}: {
  query: string
  onQueryChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  categories: string[]
  autoFocus?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search size={15} className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-zinc-500" />
        <input
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pr-3 pl-9 text-sm text-zinc-100 outline-none focus:border-blue-500"
          placeholder="Search templates by name, category, or description…"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          aria-label="Search templates"
          autoFocus={autoFocus}
        />
      </div>
      {categories.length > 0 ? (
        <Select
          className="w-full sm:w-44"
          value={category}
          aria-label="Filter templates by category"
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      ) : null}
    </div>
  )
}
