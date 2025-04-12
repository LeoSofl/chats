import { useQuery } from '@tanstack/react-query';
import { GET_ROOM_PARTICIPANTS } from '@/lib/graphql';
import { client } from '@/lib/apollo';

interface Participant {
    id: string;
    name: string;
    avatar?: string;
}

interface UseRoomParticipantsOptions {
    enabled?: boolean;
    refetchInterval?: number;
}

export function useRoomParticipants(
    roomId: string,
    userName: string,
    options: UseRoomParticipantsOptions = {},
) {
    const {
        enabled = true,
        refetchInterval = 3000
    } = options;

    return useQuery({
        queryKey: ['roomParticipants', roomId],
        queryFn: async (): Promise<Participant[]> => {
            if (!roomId) return [];

            try {
                const { data } = await client.query({
                    query: GET_ROOM_PARTICIPANTS,
                    variables: { roomId },
                    fetchPolicy: 'network-only'
                });

                if (data?.roomParticipants) {
                    return data.roomParticipants?.filter((p: { name: string; avatar?: string }) => p.name !== userName).map((p: { name: string; avatar?: string }) => ({
                        id: p.name,
                        name: p.name,
                        avatar: p.avatar
                    }));
                }
                return [];
            } catch (error) {
                console.error('获取房间参与者失败', error);
                throw new Error('获取房间参与者失败');
            }
        },
        // 每x秒重新获取一次数据
        refetchInterval,
        // 当用户离开该页面再回来时自动刷新
        refetchOnWindowFocus: true,
        // 页面重新获得网络连接时自动刷新
        refetchOnReconnect: true,
        // 确保有roomId才执行查询
        enabled: enabled && !!roomId,
        // 失败时重试3次
        retry: 3,
        // 缓存数据30分钟
        staleTime: 1000 * 60 * 30,
    });
} 