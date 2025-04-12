"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import { Quote, User } from "lucide-react"
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { MessageInput } from "@/components/message-input"
import { useParams } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessageList } from "@/components/ui/chat/chat-message-list"
import { ChatBubble, ChatBubbleAction, ChatBubbleActionWrapper, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble"
import { getSocket, joinRoom, sendMessage, closeSocket, changeRoomMode, resetUnreadCount, requestUnreadCounts, Message } from "@/lib/socket"
import { currentRoomIdAtom, deleteMentionedRoomAtom, RoomMessagesAtom } from "@/lib/store/chat"
import { formatMessageTime } from "@/utils"
import { ROOM_INFO, RoomList } from "../../components/room-list"
import { useRoomParticipants } from "@/hooks/useRoomParticipants"

export default function CommunityPage() {
  const { slug } = useParams()
  const userName = Array.isArray(slug) ? slug[0] : slug as string
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)
  const scrollAreaWrapperRef = useRef<HTMLDivElement>(null)

  const [currentRoomId, setCurrentRoomId] = useAtom(currentRoomIdAtom)
  const roomMessages = useAtomValue(RoomMessagesAtom)
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null)
  const [scrollAreaWrapperHeight, setScrollAreaWrapperHeight] = useState(0)
  const deleteMentionedRoom = useSetAtom(deleteMentionedRoomAtom)

  const messages = roomMessages[currentRoomId] || []

  const {
    data: roomParticipants,
    isLoading,
    isError,
    error,
    refetch
  } = useRoomParticipants(currentRoomId, userName);

  // 切换房间
  const handleRoomChange = (roomId: string) => {
    // 将之前的房间切换为仅通知模式
    if (currentRoomId) {
      changeRoomMode(currentRoomId, { notificationsOnly: true });
    }
    // 将新房间切换为完整模式
    changeRoomMode(roomId, { fullHistory: true });
    setCurrentRoomId(roomId)
    resetUnreadCount(roomId);
    deleteMentionedRoom(roomId)
    setQuotedMessage(null)
  }

  // init socket
  useEffect(() => {
    getSocket(userName)
    requestUnreadCounts();

    // 加入其他房间但设置为仅通知模式
    Object.keys(ROOM_INFO).forEach(roomId => {
      if (roomId !== currentRoomId) {
        joinRoom(roomId, { notificationsOnly: true });
      }
      else {
        joinRoom(roomId, { fullHistory: true });
      }
    });

    return () => {
      closeSocket()
    }
  }, [userName])


  // 发送消息
  const handleSendMessage = (content: string, mentions: string[] = []) => {
    if (!content.trim()) return

    const messageData = {
      roomId: currentRoomId,
      content,
      sender: {
        name: userName,
      },
      // 如果有引用消息，添加引用消息ID
      quotedMessageId: quotedMessage?._id,
      // 添加提及的用户
      mentions
    }

    // 发送到服务器
    sendMessage(messageData)

    // 清除引用消息
    setQuotedMessage(null)
  }


  // 滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, quotedMessage])

  useEffect(() => {
    if (scrollAreaWrapperRef.current) {
      const scrollAreaWrapperRect = scrollAreaWrapperRef?.current?.getBoundingClientRect()
      setScrollAreaWrapperHeight(scrollAreaWrapperRect?.height ?? 0)

      window.addEventListener("resize", () => {
        const scrollAreaWrapperRect = scrollAreaWrapperRef?.current?.getBoundingClientRect()
        setScrollAreaWrapperHeight(scrollAreaWrapperRect?.height ?? 0)
      })

    }
    return () => {
      window.removeEventListener("resize", () => { })
    }
  }, [])

  return (
    <div className="bg-zinc-950 h-fulll w-full text-white overflow-hidden">
      <div className="flex h-full w-full">
        {/* 侧边栏 - 传递房间选择函数而不是使用Link */}
        <RoomList currentRoomId={currentRoomId} handleRoomChange={handleRoomChange} />

        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col">
          {/* 顶部标题 */}
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center h-[4rem]">
            <h2 className="text-xl font-semibold">
              {ROOM_INFO[currentRoomId as keyof typeof ROOM_INFO]?.name || currentRoomId}
            </h2>
            <div className="flex items-center gap-2">
              <div
                className={`gap-2 ${isError ? 'border-red-500' : ''} cursor-pointer bg-zinc-950 rounded-full flex items-center justify-center`}
                onClick={() => refetch()}
                title={isError ? '点击重试' : '参与者数量'}
              >
                <span className="flex items-center justify-center h-[30px] w-[60px] bg-zinc-700 rounded-full text-xs">
                  <User className="size-4 mr-1" />
                  {isLoading ? '...' : isError ? '!' : (roomParticipants?.length ?? 0) + 1}
                </span>
              </div>
            </div>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 overflow-hidden" ref={scrollAreaWrapperRef}>
            <ScrollArea ref={scrollAreaRef} style={{ height: `${quotedMessage ? scrollAreaWrapperHeight - 80 : scrollAreaWrapperHeight}px` }}>
              <div className="p-4">
                <ChatMessageList>
                  {messages.map((message) => (
                    <div key={message._id} className={`flex flex-col gap-2 ${message.isCurrentUser ? "items-end" : "items-start"}`}>
                      {/* <div>{message.sender.name}</div> */}
                      <ChatBubble

                        variant={message.isCurrentUser ? 'sent' : 'received'}
                      >
                        <ChatBubbleAvatar fallback={message.sender.name[0]} />
                        <ChatBubbleMessage
                          variant={message.isCurrentUser ? 'sent' : 'received'}
                          className={`${message.isCurrentUser ? "bg-[#04B17D]/50 text-white ml-auto" : "bg-[#454451] text-white"}`}
                        >

                          <div>
                            {highlightMentions(message.content, message.mentions)}
                            {/* <div className="text-xs opacity-70 mt-1 text-right">
                            {formatMessageTime(message.timestamp)}
                          </div> */}
                          </div>
                        </ChatBubbleMessage>

                        <ChatBubbleActionWrapper>
                          <ChatBubbleAction
                            className="size-6 bg-zinc-950 hover:bg-zinc-950 hover:text-zinc-400"
                            icon={<Quote className="h-5 w-5" />}
                            onClick={() => setQuotedMessage(message)}
                          />
                        </ChatBubbleActionWrapper>


                      </ChatBubble>
                      {message.quote && (
                        <div className={` rounded-md p-2 max-w-[400px] bg-[#35343E]/80 border-zinc-600 text-zinc-400
                          ${message.isCurrentUser ? " border-l-2 mr-[48px]" : " border-l-2 ml-[48px]"}
                          `}>
                          <div className="mt-1 hidden sm:block">
                            <Quote className="h-3 w-3" />
                          </div>
                          <div className="min-w-0 ">
                            <div className="text-xs mb-1 flex items-center gap-1 truncate">
                              <Quote className="h-2.5 w-2.5 sm:hidden inline-block flex-shrink-0" />
                              <span className="truncate">{message.quote.sender.name}</span>
                              {message.quote.timestamp && (
                                <span className="text-[10px] opacity-70">
                                  {formatMessageTime(message.quote.timestamp)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm  opacity-80 overflow-hidden text-ellipsis">
                              {message.quote.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </ChatMessageList>
              </div>
            </ScrollArea>
          </div>

          {/* 消息输入区域 */}
          <div className="p-4 border-t border-zinc-800" ref={inputRef}>
            <MessageInput
              onSendMessage={handleSendMessage}
              quotedMessage={quotedMessage}
              onCancelQuote={() => setQuotedMessage(null)}
              participants={roomParticipants || []}
            />
          </div>
        </div>
      </div>
    </div>
  )
}


// 处理消息中的@提及，返回带有高亮样式的React节点
export const highlightMentions = (content: string, mentions?: string[]): ReactNode => {
  if (!mentions || mentions.length === 0) {
    return content;
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;

  // 为每个被提及的用户创建正则表达式
  mentions.forEach(name => {
    const mentionPattern = new RegExp(`@${name}\\b`, 'g');
    let match;

    while ((match = mentionPattern.exec(content)) !== null) {
      // 添加提及前的文本
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      // 添加高亮的@用户名
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="bg-[#04B17D]/30 text-[#04B17D] rounded px-1"
        >
          {match[0]}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }
  });

  // 添加剩余文本
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  // 如果没有找到提及，返回原始内容
  return parts.length > 0 ? parts : content;
};