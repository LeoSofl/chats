"use client"

import { useState, type KeyboardEvent } from "react"
import { Send, Paperclip, Smile } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface MessageInputProps {
  onSendMessage: (message: string) => void
  isMobile?: boolean
}

export function MessageInput({ onSendMessage, isMobile = false }: MessageInputProps) {
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
    <div className={`${isMobile ? "" : "p-4 border-t border-zinc-800"} h-[5rem]`}>
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
            placeholder="Type a message..."
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
