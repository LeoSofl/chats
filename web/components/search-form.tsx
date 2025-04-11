import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchForm() {
  return (
    <div className="relative w-full">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
      <Input placeholder="Search" className="pl-8 bg-zinc-900 border-zinc-800 text-white" />
    </div>
  )
}
