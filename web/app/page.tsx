"use client"

import { useState } from "react"
import { Bell, Globe, HelpCircle, Search } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { ChatMessages } from "@/components/chat-messages"
import { MessageInput } from "@/components/message-input"

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
        name: "You",
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
        name: "You",
      },
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isCurrentUser: true,
    }

    setMessages([...messages, newMessage])
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h1 className="text-xl font-semibold">Gradual Community</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
              <Input placeholder="Search" className="pl-8 bg-zinc-900 border-zinc-800 text-white" />
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Globe className="h-5 w-5" />
              <span>UTC -05:00 Chicago</span>
            </div>
            <Button variant="ghost" size="icon" className="text-zinc-400">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-400">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png"
                alt="User"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-full md:w-[550px] border-r border-zinc-800 overflow-y-auto pb-16 md:pb-0">
            <div className="p-4 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
                <Input placeholder="Search" className="pl-8 bg-zinc-900 border-zinc-800 text-white" />
              </div>
            </div>
            <ChatMessages />
          </div>
          <div className="flex-1 flex flex-col h-full hidden md:flex">
            <div className="p-4 overflow-y-auto flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Share Your Story</h2>
                <Button variant="outline" className="gap-2">
                  <span className="flex items-center justify-center h-5 w-5 bg-zinc-700 rounded-full text-xs">4</span>
                  <span>4</span>
                </Button>
              </div>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.isCurrentUser ? "justify-end" : ""}`}>
                    {!message.isCurrentUser && (
                      <Avatar className="h-10 w-10 mt-0.5">
                        {message.sender.avatar ? (
                          <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                        ) : null}
                        <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`${message.isCurrentUser ? "max-w-[80%]" : "flex-1"}`}>
                      <div className={`flex justify-between ${message.isCurrentUser ? "flex-row-reverse" : ""}`}>
                        <span className="font-medium">{message.sender.name}</span>
                        <span className="text-zinc-500 text-sm">{message.timestamp}</span>
                      </div>
                      <div
                        className={`mt-2 p-4 rounded-lg ${
                          message.isCurrentUser
                            ? "bg-emerald-600 text-white ml-auto"
                            : message.sender.name === "Jenny White"
                              ? "bg-emerald-900/30 border border-emerald-800/50"
                              : "bg-zinc-800"
                        }`}
                      >
                        <p>{message.content}</p>
                      </div>
                    </div>
                    {message.isCurrentUser && (
                      <Avatar className="h-10 w-10 mt-0.5">
                        <AvatarFallback>Y</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
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
