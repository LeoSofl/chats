import { unreadCountsAtom } from "@/lib/store/chat";
import { useAtomValue } from "jotai";

// 聊天室信息 // TODO: 从后端获取
export const ROOM_INFO = {
    'share-your-story': { name: 'Share Your Story' },
    'general': { name: 'General' },
    'design-product': { name: 'Design product' },
    'product-team': { name: 'Product team' },
    'announcements': { name: 'Announcements' }
}

export interface RoomListProps {
    currentRoomId: string;
    handleRoomChange: (roomId: string) => void;
}

export const RoomList = ({ currentRoomId, handleRoomChange }: RoomListProps) => {
    const unreadCounts = useAtomValue(unreadCountsAtom)

    return (
        <div className="w-[250px] border-r border-zinc-800">
            {/* <div className="p-4 border-b border-zinc-800">
          <h1 className="font-semibold">Gradual Community</h1>
          <p className="text-sm text-zinc-400">欢迎, {userName}</p>
        </div> */}

            {/* 聊天室列表 */}
            <div className="px-3 py-2 text-xs text-zinc-500 uppercase border-b border-zinc-800 h-[4rem] mb-4">
                search
            </div>

            <div className="space-y-1 px-1">
                {Object.entries(ROOM_INFO).map(([roomId, room]) => {
                    // 创建对应房间的未读消息计数原子
                    const roomUnreadCount = unreadCounts[roomId] || 0;
                    return (
                        <button
                            key={roomId}
                            onClick={() => handleRoomChange(roomId)}
                            className={`flex items-center px-2 py-2 rounded-md  w-full text-left ${currentRoomId === roomId
                                ? "bg-zinc-800"
                                : "hover:bg-zinc-800/50"
                                }`}
                        >
                            <div className=" flex items-center justify-center mr-2 text-lg">
                                {roomId === 'share-your-story' ? '📝' :
                                    roomId === 'general' ? '💬' :
                                        roomId === 'design-product' ? '🎨' :
                                            roomId === 'product-team' ? '👥' : '📢'}
                            </div>
                            <span className="text-sm">{room.name}</span>
                            {roomUnreadCount > 0 && (
                                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-xs">
                                    {roomUnreadCount > 99 ? '99+' : roomUnreadCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 人员分类 */}
            <div className="px-3 py-2 text-xs text-zinc-500 uppercase mt-4">
                PEOPLE
            </div>

            {/* 人员列表 */}
            <div className="space-y-1 px-1">
                <button className="flex items-center px-2 py-2 rounded-md mx-2 w-full text-left hover:bg-zinc-800/50">
                    <div className="w-6 h-6 flex items-center justify-center mr-2 text-lg">
                        👤
                    </div>
                    <span className="text-sm">Members</span>
                </button>
                <button className="flex items-center px-2 py-2 rounded-md mx-2 w-full text-left hover:bg-zinc-800/50">
                    <div className="w-6 h-6 flex items-center justify-center mr-2 text-lg">
                        👥
                    </div>
                    <span className="text-sm">Contributors</span>
                </button>
            </div>
        </div>
    )
}