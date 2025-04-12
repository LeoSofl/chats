import { mentionedRoomsAtom, unreadCountsAtom } from "@/lib/store/chat";
import { useAtomValue } from "jotai";
import { AtSign } from "lucide-react";

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
    const unreadCounts = useAtomValue(unreadCountsAtom);
    const mentionedRooms = useAtomValue(mentionedRoomsAtom);

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
                    // 获取房间的未读消息计数
                    const roomUnreadCount = unreadCounts[roomId] || 0;
                    // 检查是否有@提及
                    const isMentioned = mentionedRooms.has(roomId);

                    return (
                        <button
                            key={roomId}
                            onClick={() => handleRoomChange(roomId)}
                            className={`flex items-center px-2 py-2 rounded-md w-full text-left 
                            ${currentRoomId === roomId ? "bg-zinc-800" : "hover:bg-zinc-800/50"}
                            ${isMentioned && currentRoomId !== roomId ? "border-l-2 border-[#04B17D]" : ""}`}
                        >
                            <div className="flex items-center justify-center mr-2 text-lg">
                                {roomId === 'share-your-story' ? '📝' :
                                    roomId === 'general' ? '💬' :
                                        roomId === 'design-product' ? '🎨' :
                                            roomId === 'product-team' ? '👥' : '📢'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="text-sm truncate">{room.name}</span>
                                    {isMentioned && currentRoomId !== roomId && (
                                        <AtSign className="h-3.5 w-3.5 text-[#04B17D] flex-shrink-0" />
                                    )}
                                </div>
                            </div>
                            {roomUnreadCount > 0 && (
                                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs
                                ${isMentioned ? "bg-[#04B17D] text-white" : "bg-zinc-700"}`}>
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