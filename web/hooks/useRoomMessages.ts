import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { GET_ROOM_MESSAGES } from '@/lib/graphql';
import { client } from '@/lib/apollo';
import { Message } from '@/lib/socket';
import { RoomMessagesAtom } from '@/lib/store/chat';
import { useAtom } from 'jotai';


interface UseRoomMessages {
    roomId: string;
    userName: string;
}

export function useRoomMessages({
    roomId,
    userName,
}: UseRoomMessages) {
    const [roomMessages, setRoomMessages] = useAtom(RoomMessagesAtom)

    return useInfiniteQuery({
        queryKey: ['roomMessages', roomId],
        initialPageParam: 0,
        queryFn: async ({ pageParam }) => {
            if (!roomId) return [];
            try {
                const { data } = await client.query({
                    query: GET_ROOM_MESSAGES,
                    variables: {
                        roomId,
                        limit: 30,
                        offset: pageParam
                    },
                    fetchPolicy: 'network-only'
                });

                if (data?.roomMessages) {
                    const newMessages = data.roomMessages?.map((msg: Message) => ({
                        ...msg,
                        isCurrentUser: msg.sender.name === userName
                    }));
                    setRoomMessages(prev => ({
                        ...prev,
                        [roomId]: [...newMessages, ...(prev[roomId] || [])]
                    }));

                    return newMessages;
                }
                return [];
            } catch (error) {
                console.error('get room messages failed', error);
                throw new Error('get room messages failed');
            }
        },
        getNextPageParam: () => {
            if (roomMessages[roomId]?.length > 0) {
                return roomMessages[roomId]?.length
            }
            return 0;
        },
        // 当用户离开该页面再回来时自动刷新
        refetchOnWindowFocus: true,
        // 页面重新获得网络连接时自动刷新
        refetchOnReconnect: true,
        // 确保有roomId才执行查询
        enabled: !!roomId,
        // 失败时重试3次
        retry: 3,
        // 缓存数据30分钟
        staleTime: 1000 * 60 * 30,
    });
} 