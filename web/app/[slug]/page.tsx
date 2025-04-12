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
import { totalUnreadCountAtom, unreadCountsAtom, currentRoomIdAtom } from "@/lib/store/chat"


// 聊天室信息
const ROOM_INFO = {
  'share-your-story': { name: 'Share Your Story' },
  'general': { name: 'General' },
  'design-product': { name: 'Design product' },
  'product-team': { name: 'Product team' },
  'announcements': { name: 'Announcements' }
}

type RoomMessages = Record<string, Message[]>

// 消息时间格式化
const formatMessageTime = (timestamp?: string): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.getDate() === now.getDate() && 
                  date.getMonth() === now.getMonth() && 
                  date.getFullYear() === now.getFullYear();
  
  // 当天显示时间，非当天显示日期+时间
  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) + ' ' + 
           date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
};

export default function CommunityPage() {
  const { slug } = useParams()
  const userName = Array.isArray(slug) ? slug[0] : slug as string
  
  const [currentRoomId, setCurrentRoomId] = useAtom(currentRoomIdAtom)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  const [roomMessages, setRoomMessages] = useState<RoomMessages>({})
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null)
  
  const unreadCounts = useAtomValue(unreadCountsAtom)
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
                  className={`flex items-center px-2 py-2 rounded-md  w-full text-left ${
                    currentRoomId === roomId 
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
