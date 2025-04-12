import { atom } from 'jotai';
import { Message } from '../socket';

// 房间消息原子状态
export const RoomMessagesAtom = atom<Record<string, Message[]>>({});

// 房间未读消息计数原子状态
export const unreadCountsAtom = atom<Record<string, number>>({});

// 当前活跃房间ID原子状态
export const currentRoomIdAtom = atom<string>('share-your-story');

// 被@提及的房间ID集合原子状态
export const mentionedRoomsAtom = atom<Set<string>>(new Set<string>());

// 获取总未读消息数的派生原子状态
export const totalUnreadCountAtom = atom((get) => {
  const unreadCounts = get(unreadCountsAtom);
  return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
});

// 获取指定房间未读消息数的工厂函数
export const roomUnreadCountAtomFamily = (roomId: string) =>
  atom((get) => get(unreadCountsAtom)[roomId] || 0); 
