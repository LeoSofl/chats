"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { Send, Paperclip, Smile, X, AtSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Message } from "@/lib/socket"
import { MentionList } from "@/components/ui/mention/mention-list"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"

interface Participant {
  id: string
  name: string
  avatar?: string
}

interface MessageInputProps {
  onSendMessage: (message: string, mentions: string[]) => void
  isMobile?: boolean
  quotedMessage?: Message | null
  onCancelQuote?: () => void
  participants: Participant[] // 加入房间的用户
}

export function MessageInput({
  onSendMessage,
  isMobile = false,
  quotedMessage = null,
  onCancelQuote,
  participants = []
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [mentions, setMentions] = useState<string[]>([])
  const [mentionQuery, setMentionQuery] = useState("")
  const [showMentions, setShowMentions] = useState(false)
  const [mentionIndex, setMentionIndex] = useState(0)
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const caretPositionRef = useRef<number>(0)

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessage(value)
    setIsTyping(value.length > 0)

    // 获取光标位置
    caretPositionRef.current = e.target.selectionStart || 0

    // 检查是否触发@功能
    const lastAtIndex = value.lastIndexOf('@', caretPositionRef.current - 1)

    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1, caretPositionRef.current)
      const hasSpace = /\s/.test(textAfterAt)

      if (!hasSpace && textAfterAt.length <= 20) {
        setMentionQuery(textAfterAt)

        if (!showMentions) {
          // 计算@弹出框位置
          if (inputRef.current) {
            // 创建一个临时的span来计算文本宽度
            const span = document.createElement('span')
            span.style.font = window.getComputedStyle(inputRef.current).font
            span.style.position = 'absolute'
            span.innerText = value.substring(0, lastAtIndex + 1)
            document.body.appendChild(span)

            const inputRect = inputRef.current.getBoundingClientRect()
            const textWidth = span.offsetWidth

            document.body.removeChild(span)

            setMentionPosition({
              top: inputRect.top - 100, // 显示在输入框上方
              left: inputRect.left + textWidth
            })
          }

          setShowMentions(true)
          setMentionIndex(0)
        }
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  // 过滤参与者列表
  const filteredParticipants = participants.filter(
    p => p.name.toLowerCase().includes(mentionQuery.toLowerCase())
  )

  // 处理@选择
  const handleMentionSelect = (participant: Participant) => {
    const lastAtIndex = message.lastIndexOf('@', caretPositionRef.current - 1)
    const newMessage =
      message.substring(0, lastAtIndex) +
      `@${participant.name} ` +
      message.substring(caretPositionRef.current)

    setMessage(newMessage)

    // 添加到提及列表
    if (!mentions.includes(participant.name)) {
      setMentions([...mentions, participant.name])
    }

    setShowMentions(false)

    // 重新聚焦并设置光标位置
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        const newCursorPosition = lastAtIndex + participant.name.length + 2 // @ + name + space
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
        caretPositionRef.current = newCursorPosition
      }
    }, 0)
  }

  // 处理键盘导航
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showMentions && filteredParticipants.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionIndex((prev) => (prev + 1) % filteredParticipants.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionIndex((prev) => (prev - 1 + filteredParticipants.length) % filteredParticipants.length)
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        handleMentionSelect(filteredParticipants[mentionIndex])
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setShowMentions(false)
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // // 点击@按钮
  // const handleAtButtonClick = () => {
  //   const newMessage = message + '@'
  //   setMessage(newMessage)

  //   // 显示@菜单
  //   if (inputRef.current) {
  //     const inputRect = inputRef.current.getBoundingClientRect()

  //     setMentionPosition({
  //       top: inputRect.top - 250,
  //       left: inputRect.left + inputRef.current.value.length * 8 // 简单估算宽度
  //     })

  //     setShowMentions(true)
  //     setMentionQuery('')
  //     setMentionIndex(0)

  //     // 聚焦输入框
  //     setTimeout(() => {
  //       if (inputRef.current) {
  //         inputRef.current.focus()
  //         const position = newMessage.length
  //         inputRef.current.setSelectionRange(position, position)
  //         caretPositionRef.current = position
  //       }
  //     }, 0)
  //   }
  // }

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, mentions)
      setMessage("")
      setIsTyping(false)
      setMentions([])
    }
  }

  // 点击其他地方关闭@菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMentions(false)
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className={`${isMobile ? "" : ""} h-auto relative`}>
      {quotedMessage && (
        <div className="bg-zinc-800/50 p-2 mb-2 rounded-md flex justify-between items-start">
          <div className="flex-1">
            <div className="text-xs text-zinc-400">
              回复 {quotedMessage.sender.name}
            </div>
            <div className="text-sm text-zinc-300 line-clamp-1 text-ellipsis">
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
        {/* <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
          onClick={(e) => {
            e.stopPropagation()
            handleAtButtonClick()
          }}
        >
          <AtSign className="h-5 w-5" />
          <span className="sr-only">提及用户</span>
        </Button> */}
        {/* <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button> */}
        <div className="relative flex-1">
          {/* <Popover>
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent>Place content for the popover here.</PopoverContent>
          </Popover> */}
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClick={(e) => {
              // 更新光标位置
              caretPositionRef.current = e.currentTarget.selectionStart || 0
            }}
            placeholder={quotedMessage ? "输入回复..." : "输入消息..."}
            className="pr-10 bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500/30"
          />
          <Button
            size="sm"
            onClick={handleSend}
            className={`absolute right-1 top-1 h-7 w-7 p-0 transition-colors duration-200 ${isTyping ? "bg-emerald-600 hover:bg-emerald-700" : "bg-zinc-700 hover:bg-zinc-600"
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

      {showMentions && (
        <div onClick={(e) => e.stopPropagation()}>
          <MentionList
            items={filteredParticipants}
            activeIndex={mentionIndex}
            onSelect={handleMentionSelect}
            onClose={() => setShowMentions(false)}
            position={mentionPosition}
          />
        </div>
      )}
    </div>
  )
}
