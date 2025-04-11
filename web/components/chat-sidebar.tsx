import { Search, User2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// 预设聊天室
const PRESET_ROOMS = [
  {
    id: 'share-your-story',
    name: 'Share Your Story',
    icon: '📝',
  },
  {
    id: 'general',
    name: 'General',
    icon: '💬',
  },
  {
    id: 'design-product',
    name: 'Design product',
    icon: '🎨',
  },
  {
    id: 'product-team',
    name: 'Product team',
    icon: '👥',
  },
  {
    id: 'announcements',
    name: 'Announcements',
    icon: '📢',
    highlight: true
  }
];

interface ChatSidebarProps {
  currentRoomId: string;
}

export function ChatSidebar({ currentRoomId = 'share-your-story' }: ChatSidebarProps) {
    

  return (
    <div className="w-[240px] border-r border-zinc-800 overflow-y-auto">
      <div className="p-4 border-b border-zinc-800">
        <h1 className="font-semibold">Gradual Community</h1>
      </div>
      
      {/* 搜索栏 */}
      <div className="p-3 border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
          <Input placeholder="Search" className="pl-8 bg-zinc-900 border-zinc-800 text-white h-9" />
        </div>
      </div>
      
      {/* 分类标题 */}
      <div className="px-3 py-2 text-xs text-zinc-500 uppercase">
        ENGAGE
      </div>
      
      {/* 聊天室列表 */}
      <div className="space-y-1 px-1">
        {PRESET_ROOMS.map((room) => (
          <div 
            key={room.id}
            className={`flex items-center px-2 py-2 rounded-md mx-2 ${
              currentRoomId === room.id 
                ? "bg-zinc-800" 
                : "hover:bg-zinc-800/50"
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center mr-2 text-lg">
              {room.icon}
            </div>
            <span className="text-sm">{room.name}</span>
            {room.highlight && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-xs">
                3
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* 人员分类 */}
      <div className="px-3 py-2 text-xs text-zinc-500 uppercase mt-4">
        PEOPLE
      </div>
      
      {/* 人员列表 */}
      <div className="space-y-1 px-1">
        <a href="#" className="flex items-center px-2 py-2 rounded-md mx-2 hover:bg-zinc-800/50">
          <User2 className="h-5 w-5 mr-2 text-zinc-400" />
          <span className="text-sm">Members</span>
        </a>
        <a href="#" className="flex items-center px-2 py-2 rounded-md mx-2 hover:bg-zinc-800/50">
          <User2 className="h-5 w-5 mr-2 text-zinc-400" />
          <span className="text-sm">Contributors</span>
        </a>
      </div>
    </div>
  );
} 