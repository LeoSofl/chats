import { useCallback, useEffect, useRef, useState } from 'react';
import { GET_ROOM_MESSAGES } from '@/lib/graphql';
import { client } from '@/lib/apollo';
import { RoomMessagesAtom } from '@/lib/store/chat';
import { useAtom } from 'jotai';
import { Message } from '@/lib/types';
interface UseRoomMessages {
    roomId: string;
    userName: string;
}

export function useRoomMessages({
    roomId,
    userName,
}: UseRoomMessages) {
    const [roomMessages, setRoomMessages] = useAtom(RoomMessagesAtom);

    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);

    // 重置房间消息
    const resetRoomMessages = useCallback(() => {
        setRoomMessages(prev => ({
            ...prev,
            [roomId]: []
        }));
        hasMoreRef.current = true;
    }, [roomId, setRoomMessages]);

    // 加载初始消息
    const loadInitialMessages = useCallback(async () => {
        if (!roomId || loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        console.log("loadInitialMessages", roomId)
        try {
            const { data } = await client.query({
                query: GET_ROOM_MESSAGES,
                variables: {
                    roomId,
                    limit: 30,
                    offset: 0
                },
                fetchPolicy: 'network-only'
            });

            if (data?.roomMessages) {
                const newMessages = data.roomMessages.map((msg: Message) => ({
                    ...msg,
                    isCurrentUser: msg.sender.name === userName
                }));

                setRoomMessages(prev => ({
                    ...prev,
                    [roomId]: newMessages
                }));

                hasMoreRef.current = newMessages.length === 30;
            }
        } catch (error) {
            console.error('Failed to load initial messages', error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [roomId, userName, setRoomMessages]);

    // 加载更多消息
    const loadMoreMessages = useCallback(async () => {
        if (!roomId || loadingRef.current || !hasMoreRef.current) return;

        const currentMessages = roomMessages[roomId] || [];
        loadingRef.current = true;
        setLoading(true);
        console.log("loadMoreMessages", roomId, currentMessages.length)

        try {
            const { data } = await client.query({
                query: GET_ROOM_MESSAGES,
                variables: {
                    roomId,
                    limit: 30,
                    offset: currentMessages.length
                },
                fetchPolicy: 'network-only'
            });

            if (data?.roomMessages) {
                const newMessages = data.roomMessages.map((msg: Message) => ({
                    ...msg,
                    isCurrentUser: msg.sender.name === userName
                }));

                setRoomMessages(prev => ({
                    ...prev,
                    [roomId]: [...newMessages, ...(prev[roomId] || [])]
                }));

                hasMoreRef.current = newMessages.length === 30;
            }
        } catch (error) {
            console.error('Failed to load more messages', error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [roomId, userName, roomMessages, setRoomMessages]);

    // 添加新消息
    const addMessage = useCallback((message: Message) => {
        setRoomMessages(prev => {
            const roomMsgs = prev[roomId] || [];
            // 检查消息是否已存在
            if (roomMsgs.some(msg => msg._id === message._id)) {
                return prev;
            }

            return {
                ...prev,
                [roomId]: [
                    {
                        ...message,
                        isCurrentUser: message.sender.name === userName
                    },
                    ...roomMsgs
                ]
            };
        });
    }, [roomId, userName, setRoomMessages]);

    // 当房间ID变化时，重置并加载新消息
    useEffect(() => {
        if (roomId) {
            resetRoomMessages();
            loadInitialMessages();
        }
    }, [roomId, resetRoomMessages, loadInitialMessages]);

    return {
        messages: roomMessages[roomId] || [],
        loadMoreMessages,
        hasMore: hasMoreRef.current,
        isLoading: loading,
        addMessage,
        resetMessages: resetRoomMessages
    };
}