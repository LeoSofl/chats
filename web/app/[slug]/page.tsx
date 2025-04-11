"use client"

import { useEffect, useRef, useState } from "react"
import { Icon, Quote, RefreshCcw, Repeat2, Search, User2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessages } from "@/components/chat-messages"
import { MessageInput } from "@/components/message-input"
import { useParams } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessageList } from "@/components/ui/chat/chat-message-list"
import { ChatBubble, ChatBubbleAction, ChatBubbleActionWrapper, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble"

// Socket.io 和 GraphQL 相关
import { getSocket, joinRoom, sendMessage, closeSocket } from "@/lib/socket"
import { ChatSidebar } from "@/components/chat-sidebar"

export interface Message {
  id: string
  content: string
  sender: {
    name: string
    avatar?: string
  }
  timestamp: string
  isCurrentUser?: boolean
  readBy?: string[]
}

// 聊天室信息
const ROOM_INFO = {
  'share-your-story': { name: 'Share Your Story' },
  'general': { name: 'General' },
  'design-product': { name: 'Design product' },
  'product-team': { name: 'Product team' },
  'announcements': { name: 'Announcements' }
}

export default function CommunityPage() {
  const { slug } = useParams()
  const userName = Array.isArray(slug) ? slug[0] : slug as string
  const [currentRoomId, setCurrentRoomId] = useState<string>('share-your-story')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  // 每个房间的消息
  const [roomMessages, setRoomMessages] = useState<Record<string, Message[]>>({})
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null)

  // 当前房间的消息
  const messages = roomMessages[currentRoomId] || []

  // 切换房间
  const handleRoomChange = (roomId: string) => {
    setCurrentRoomId(roomId)
    joinRoom(roomId)
    setQuotedMessage(null)
  }

  // 连接 Socket.io
  useEffect(() => {
    const socket = getSocket(userName)
    
    // 加入默认房间
    joinRoom(currentRoomId)
    
    // 监听历史消息
    socket.on('history_messages', (historyMessages: any[]) => {
      const formattedMessages = historyMessages.map(msg => ({
        ...msg,
        isCurrentUser: msg.sender.name === userName
      }))
      
      setRoomMessages(prev => ({
        ...prev,
        [currentRoomId]: formattedMessages
      }))
    })
    
    // 监听新消息
    socket.on('receive_message', (message: any) => {
      // 确保消息属于当前正在监听的某个房间
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
      }
    })
    
    // 清理函数
    return () => {
      socket.off('history_messages')
      socket.off('receive_message')
      closeSocket()
    }
  }, [userName])

  // 发送消息
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return

    const messageData = {
      roomId: currentRoomId,
      content,
      sender: {
        name: userName,
      }
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
    <div className="bg-zinc-950 h-screen w-full text-white overflow-hidden">
      <div className="flex h-full">
        {/* 侧边栏 - 传递房间选择函数而不是使用Link */}
        <div className="w-[240px] border-r border-zinc-800 overflow-y-auto">
          <div className="p-4 border-b border-zinc-800">
            <h1 className="font-semibold">Gradual Community</h1>
            <p className="text-sm text-zinc-400">欢迎, {userName}</p>
          </div>
          
          {/* 聊天室列表 */}
          <div className="px-3 py-2 text-xs text-zinc-500 uppercase">
            ENGAGE
          </div>
          
          <div className="space-y-1 px-1">
            {Object.entries(ROOM_INFO).map(([roomId, room]) => (
              <button 
                key={roomId}
                onClick={() => handleRoomChange(roomId)}
                className={`flex items-center px-2 py-2 rounded-md mx-2 w-full text-left ${
                  currentRoomId === roomId 
                    ? "bg-zinc-800" 
                    : "hover:bg-zinc-800/50"
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center mr-2 text-lg">
                  {roomId === 'share-your-story' ? '📝' : 
                   roomId === 'general' ? '💬' : 
                   roomId === 'design-product' ? '🎨' : 
                   roomId === 'product-team' ? '👥' : '📢'}
                </div>
                <span className="text-sm">{room.name}</span>
                {roomId === 'announcements' && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-xs">
                    3
                  </span>
                )}
              </button>
            ))}
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
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {ROOM_INFO[currentRoomId as keyof typeof ROOM_INFO]?.name || currentRoomId}
            </h2>
            <Button variant="outline" className="gap-2">
              <span className="flex items-center justify-center h-5 w-5 bg-zinc-700 rounded-full text-xs">4</span>
              <span>4</span>
            </Button>
          </div>
          
          {/* 消息区域 */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-132px)]" ref={scrollAreaRef}>
              <div className="p-4">
                <ChatMessageList>
                  {messages.map((message) => (
                    <ChatBubble 
                      key={message.id} 
                      variant={message.isCurrentUser ? 'sent' : 'received'}
                    >
                      <ChatBubbleAvatar fallback={message.sender.name[0]} />
                      <ChatBubbleMessage 
                        variant={message.isCurrentUser ? 'sent' : 'received'} 
                        className={`${message.isCurrentUser ? "bg-emerald-600 text-white ml-auto" : ""}`}
                      >
                        {message.content}
                      </ChatBubbleMessage>
                      <ChatBubbleActionWrapper>
                        <ChatBubbleAction
                          className="size-6 bg-zinc-950 hover:bg-zinc-950 hover:text-zinc-400"
                          icon={<Quote className="h-5 w-5" />}
                          onClick={() => handleQuoteMessage(message)}
                        />
                      </ChatBubbleActionWrapper>
                    </ChatBubble>
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
