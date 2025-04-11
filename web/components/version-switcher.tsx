import { Check, ChevronDown } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface VersionSwitcherProps {
  versions: string[]
  defaultVersion: string
}

export function VersionSwitcher({ versions, defaultVersion }: VersionSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between bg-zinc-900 border-zinc-800 text-white">
          {defaultVersion}
          <ChevronDown className="ml-2 h-4 w-4 text-zinc-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] bg-zinc-900 border-zinc-800 text-white">
        {versions.map((version) => (
          <DropdownMenuItem key={version} className="flex items-center justify-between">
            {version}
            {version === defaultVersion && <Check className="h-4 w-4 text-emerald-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
