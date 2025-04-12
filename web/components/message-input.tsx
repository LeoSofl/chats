"use client"

import { useState, type KeyboardEvent } from "react"
import { Send, Paperclip, Smile, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Message } from "@/app/[slug]/page"

interface MessageInputProps {
  onSendMessage: (message: string) => void
  isMobile?: boolean
  quotedMessage?: Message | null
  onCancelQuote?: () => void
}

export function MessageInput({ 
  onSendMessage, 
  isMobile = false, 
  quotedMessage = null, 
  onCancelQuote 
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`${isMobile ? "" : ""} h-auto`}>
      {quotedMessage && (
        <div className="bg-zinc-800/50 p-2 mb-2 rounded-md flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-zinc-400">
              回复 {quotedMessage.sender.name}
            </div>
            <div className="text-sm text-zinc-300 line-clamp-1">
              {quotedMessage.content}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 p-1 text-zinc-400 hover:text-zinc-300"
            onClick={onCancelQuote}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800">
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        <div className="relative flex-1">
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              setIsTyping(e.target.value.length > 0)
            }}
            onKeyDown={handleKeyDown}
            placeholder={quotedMessage ? "输入回复..." : "输入消息..."}
            className="pr-10 bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500/30"
          />
          <Button
            size="sm"
            onClick={handleSend}
            className={`absolute right-1 top-1 h-7 w-7 p-0 transition-colors duration-200 ${
              isTyping ? "bg-emerald-600 hover:bg-emerald-700" : "bg-zinc-700 hover:bg-zinc-600"
            }`}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800">
          <Smile className="h-5 w-5" />
          <span className="sr-only">Add emoji</span>
        </Button>
      </div>
    </div>
  )
}
