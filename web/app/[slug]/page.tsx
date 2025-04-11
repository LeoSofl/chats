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

export interface Message {
  id: string
  content: string
  sender: {
    name: string
    avatar?: string
  }
  timestamp: string
  isCurrentUser?: boolean
}


export default function CommunityPage() {
  const { slug } = useParams()
  console.log("CommunityPage", slug)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "If you want to learn from community builders & spur ideas from how others run virtual events, check out Vanilla Forums (11/17 - 11/18/20) for free.",
      sender: {
        name: "Jenny White",
        avatar:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
      },
      timestamp: "20:34",
    },
    {
      id: "2",
      content: "Check out Vanilla Forums (11/17 - 11/18/20) for free.",
      sender: {
        name: "Devon Lane",
        avatar:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
      },
      timestamp: "20:34",
    },
    {
      id: "3",
      content: "Many thanks!",
      sender: {
        name: slug as string,
      },
      timestamp: "20:35",
      isCurrentUser: true,
    },
  ])

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: {
        name: slug as string,
      },
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isCurrentUser: true,
    }

    setMessages([...messages, newMessage])
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]); 
  

  return (
    <div className="bg-zinc-950 h-full w-full text-white overflow-hidden">
      <div className="flex flex-col h-full flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden h-full">
          <div className="w-full md:w-[550px] border-r border-zinc-800 overflow-y-auto pb-16 md:pb-0">
            <div className="p-4 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
                <Input placeholder="Search" className="pl-8 bg-zinc-900 border-zinc-800 text-white" />
              </div>
            </div>
            <ChatMessages />
          </div>
          
          <div className="flex-1 flex flex-col h-full hidden md:flex w-full">
            <div className="p-4 overflow-y-auto flex-1">
              <div className="flex h-[3rem] justify-between items-center ">
                <h2 className="text-xl font-semibold">Share Your Story</h2>
                <Button variant="outline" className="gap-2">
                  <span className="flex items-center justify-center h-5 w-5 bg-zinc-700 rounded-full text-xs">4</span>
                  <span>4</span>
                </Button>
              </div>
              <div>
                <ScrollArea className={`px-4 py-6 h-[calc(100vh-15rem)]`} ref={scrollAreaRef}>
                  <div className="space-y-4">
                    <ChatMessageList>
                      {messages.map((message) => (
                        <ChatBubble key={message.id} variant={message.isCurrentUser ? 'sent' : 'received'} >
                          <ChatBubbleAvatar fallback={message.sender.name[0]} />
                          <ChatBubbleMessage variant={message.isCurrentUser ? 'sent' : 'received'} className={`${message.isCurrentUser ? "bg-emerald-600 text-white ml-auto" : ""}`}>
                            {message.content}
                          </ChatBubbleMessage>
                          <ChatBubbleActionWrapper>
                          <ChatBubbleAction
                            className="size-6 bg-zinc-950 hover:bg-zinc-950 hover:text-zinc-400"
                            icon={<Quote className="h-5 w-5" />}
                            onClick={() => console.log('Action ')}
                          />
                      </ChatBubbleActionWrapper>
                        </ChatBubble>
                       
                      ))}
                    </ChatMessageList>
                  </div>
                </ScrollArea>
              </div>
            </div>
            <MessageInput onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 md:hidden p-4 border-t border-zinc-800 bg-zinc-950 z-10">
        <MessageInput onSendMessage={handleSendMessage} isMobile />
      </div>
    </div>
  )
}
