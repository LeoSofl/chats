import type React from "react"
import { Users, MessageSquare, Zap, User2, UserCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Sidebar() {
  return (
    <div className="w-[70px] md:w-[230px] h-full bg-zinc-950 border-r border-zinc-800 flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-zinc-800">
        <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <span className="font-semibold text-white hidden md:block">Gradual Community</span>
      </div>

      <div className="p-2 flex-1 overflow-y-auto">
        <div className="mb-6">
          <p className="px-4 py-2 text-xs text-zinc-500 uppercase hidden md:block">Engage</p>
          <div className="space-y-1">
            <NavItem icon={<MessageSquare className="h-5 w-5" />} label="Forum" />
            <NavItem icon={<MessageSquare className="h-5 w-5" />} label="Chat" active badge="25" />
            <NavItem icon={<Users className="h-5 w-5" />} label="Matches" />
          </div>
        </div>

        <div>
          <p className="px-4 py-2 text-xs text-zinc-500 uppercase hidden md:block">People</p>
          <div className="space-y-1">
            <NavItem icon={<User2 className="h-5 w-5" />} label="Members" />
            <NavItem icon={<UserCircle className="h-5 w-5" />} label="Contributors" />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800 flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-zinc-800 text-zinc-400">G</AvatarFallback>
        </Avatar>
        <span className="text-sm text-zinc-400 hidden md:block">Powered by Gradual</span>
      </div>
    </div>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: string
}

function NavItem({ icon, label, active, badge }: NavItemProps) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-md ${active ? "bg-zinc-800" : "hover:bg-zinc-900"}`}>
      <div className={`${active ? "text-white" : "text-zinc-400"}`}>{icon}</div>
      <span className={`hidden md:block ${active ? "text-white font-medium" : "text-zinc-400"}`}>{label}</span>
      {badge && (
        <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
          {badge}
        </div>
      )}
    </div>
  )
}
