import { atom } from 'jotai';
import { UnreadCounter, Message, Mention } from '../types';

// 房间消息原子状态
export const RoomMessagesAtom = atom<Record<string, Message[]>>({});

// 房间未读消息计数原子状态

// 当前活跃房间ID原子状态
export const CurrentRoomIdAtom = atom<string>('share-your-story');

// // 被@提及的房间ID集合原子状态
// export const mentionedRoomsAtom = atom<Set<string>>(new Set<string>());
// export const deleteMentionedRoomAtom = atom(null, (get, set, roomId: string) => {
//   set(mentionedRoomsAtom, prev => {
//     const newSet = new Set(prev);
//     newSet.delete(roomId);
//     return newSet;
//   });
// });



export const MentionsAtom = atom<Mention[]>([]);

export const UserMentionsAtom = atom((get) => {
  const mentions = get(MentionsAtom);
  return mentions.filter(mention => !mention.isRead);
});


export const UnreadCountsAtom = atom<UnreadCounter[]>([]);

export const TotalUnreadCountAtom = atom((get) => {
  const unreadCounts = get(UnreadCountsAtom);
  return unreadCounts.reduce((sum, count) => sum + count.count, 0);
});

// 获取指定房间未读消息数的工厂函数
export const RoomUnreadCountAtomFamily = (roomId: string) =>
  atom((get) => get(UnreadCountsAtom).find(counter => counter.roomId === roomId)?.count || 0); 
