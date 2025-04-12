"use client"

import { useEffect, useRef } from "react"
import { User } from "lucide-react"

interface MentionItem {
    id: string
    name: string
    avatar?: string
}

interface MentionListProps {
    items: MentionItem[]
    activeIndex: number
    onSelect: (item: MentionItem) => void
    onClose: () => void
    position: { top: number; left: number }
}

export function MentionList({
    items,
    activeIndex,
    onSelect,
    onClose,
    position
}: MentionListProps) {
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // 处理键盘导航
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    // 确保当前选中项在视图中
    useEffect(() => {
        if (listRef.current && items.length > 0) {
            const activeItem = listRef.current.querySelector(`[data-index="${activeIndex}"]`)
            if (activeItem) {
                activeItem.scrollIntoView({ block: 'nearest' })
            }
        }
    }, [activeIndex, items.length])

    if (items.length === 0) return null

    return (
        <div
            ref={listRef}
            className="absolute z-50 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg overflow-hidden overflow-y-auto max-h-60 w-64"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`
            }}
        >
            <div className="py-1">
                {items.map((item, index) => (
                    <button
                        key={item.id}
                        data-index={index}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 ${index === activeIndex ? 'bg-[#04B17D]/20 text-white' : 'text-zinc-300 hover:bg-zinc-800'
                            }`}
                        onClick={() => onSelect(item)}
                    >
                        <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-zinc-800 rounded-full">
                            {item.avatar ? (
                                <img src={item.avatar} alt={item.name} className="h-full w-full rounded-full" />
                            ) : (
                                <User className="h-4 w-4 text-zinc-400" />
                            )}
                        </div>
                        <span className="truncate">{item.name}</span>
                    </button>
                ))}
            </div>
        </div>
    )
} 