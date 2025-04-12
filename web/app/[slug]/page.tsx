"use client"

import { useEffect, useRef, useState } from "react"
import { Quote } from "lucide-react"
import { useAtom, useAtomValue } from 'jotai'

import { Button } from "@/components/ui/button"
import { MessageInput } from "@/components/message-input"
import { useParams } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessageList } from "@/components/ui/chat/chat-message-list"
import { ChatBubble, ChatBubbleAction, ChatBubbleActionWrapper, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble"

// Socket.io 和 GraphQL 相关
import { getSocket, joinRoom, sendMessage, closeSocket, changeRoomMode, resetUnreadCount, requestUnreadCounts, getHistoryMessages, getNewMessage, Message, onReceiveNewMessage } from "@/lib/socket"
// Jotai状态
import { totalUnreadCountAtom, currentRoomIdAtom } from "@/lib/store/chat"
import { formatMessageTime } from "@/utils"
import { ROOM_INFO, RoomList } from "./components/RoomList"

type RoomMessages = Record<string, Message[]>

export default function CommunityPage() {
  const { slug } = useParams()
  const userName = Array.isArray(slug) ? slug[0] : slug as string

  const [currentRoomId, setCurrentRoomId] = useAtom(currentRoomIdAtom)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const [roomMessages, setRoomMessages] = useState<RoomMessages>({})
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null)

  const totalUnread = useAtomValue(totalUnreadCountAtom)

  const messages = roomMessages[currentRoomId] || []

  // 切换房间
  const handleRoomChange = (roomId: string) => {
    // 将之前的房间切换为仅通知模式
    if (currentRoomId) {
      changeRoomMode(currentRoomId, { notificationsOnly: true });
    }

    // 将新房间切换为完整模式
    changeRoomMode(roomId, { fullHistory: true });

    setCurrentRoomId(roomId)
    // 重置该房间的未读计数
    resetUnreadCount(roomId);
    setQuotedMessage(null)
  }

  // init socket
  useEffect(() => {
    const socket = getSocket(userName)

    // 请求所有房间的未读消息计数
    requestUnreadCounts();

    // 初始化：加入当前房间并获取完整消息历史
    joinRoom(currentRoomId, { fullHistory: true });

    // 加入其他房间但只接收通知
    Object.keys(ROOM_INFO).forEach(roomId => {
      if (roomId !== currentRoomId) {
        joinRoom(roomId, { notificationsOnly: true });
      }
    });

    // listen history messages
    getHistoryMessages(currentRoomId, (historyMessages: Message[]) => {
      const formattedMessages = historyMessages.map(msg => ({
        ...msg,
        isCurrentUser: msg.sender.name === userName
      }))

      setRoomMessages(prev => ({
        ...prev,
        [currentRoomId]: formattedMessages
      }))
    })

    // listen new messages
    onReceiveNewMessage(currentRoomId, (message: Message) => {
      if (message.roomId) {
        setRoomMessages(prev => ({
          ...prev,
          [message.roomId]: [
            ...(prev[message.roomId] || []),
            {
              ...message,
              isCurrentUser: message.sender.name === userName
            }
          ]
        }))
        resetUnreadCount(message.roomId)
      }
    })

    // 清理函数
    return () => {
      socket.off('history_messages')
      socket.off('receive_message')
      closeSocket()
    }
  }, [userName, currentRoomId])

  // 发送消息
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return

    const messageData = {
      roomId: currentRoomId,
      content,
      sender: {
        name: userName,
      },
      // 如果有引用消息，添加引用消息ID
      quotedMessageId: quotedMessage?._id
    }

    // 发送到服务器
    sendMessage(messageData)

    // 清除引用消息
    setQuotedMessage(null)
  }

  // 引用消息
  const handleQuoteMessage = (message: Message) => {
    setQuotedMessage(message)
  }

  // 滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

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
            <Button variant="outline" className="gap-2">
              <span className="flex items-center justify-center h-5 w-5 bg-zinc-700 rounded-full text-xs">
                {totalUnread}
              </span>
              <span>总未读</span>
            </Button>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-18rem)]" ref={scrollAreaRef}>
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
                            {message.content}
                            {/* <div className="text-xs opacity-70 mt-1 text-right">
                            {formatMessageTime(message.timestamp)}
                          </div> */}
                          </div>
                        </ChatBubbleMessage>

                        <ChatBubbleActionWrapper>
                          <ChatBubbleAction
                            className="size-6 bg-zinc-950 hover:bg-zinc-950 hover:text-zinc-400"
                            icon={<Quote className="h-5 w-5" />}
                            onClick={() => handleQuoteMessage(message)}
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
          <div className="p-4 border-t border-zinc-800">
            <MessageInput
              onSendMessage={handleSendMessage}
              quotedMessage={quotedMessage}
              onCancelQuote={() => setQuotedMessage(null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
