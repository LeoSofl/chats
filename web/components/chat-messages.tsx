import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const chatData = [
  {
    id: 1,
    channel: "Announcements",
    badge: 3,
    users: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
    ],
    lastMessage: {
      user: "Jerry",
      content: "[File] Design Guideline.pdf",
      time: "20:34",
    },
  },
  {
    id: 2,
    channel: "Share your story",
    badge: 1,
    users: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
    ],
    lastMessage: {
      user: "Allen",
      content: "[Photo]",
      time: "20:34",
    },
  },
  {
    id: 3,
    channel: "General",
    users: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
    ],
    lastMessage: {
      user: "Tim",
      content: "If you want to learn more ...",
      time: "20:34",
    },
  },
  {
    id: 4,
    channel: "Courtney Henry",
    users: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
    ],
    lastMessage: {
      content: "So, what's your plan this weekend?",
      time: "20:34",
    },
  },
  {
    id: 5,
    channel: "Albert Flores",
    users: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
    ],
    lastMessage: {
      content: "What's the progress on that task?",
      time: "20:34",
    },
  },
  {
    id: 6,
    channel: "Darlene Robertson",
    users: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
    ],
    lastMessage: {
      content: "Yeah! You're right.",
      time: "20:34",
    },
  },
  {
    id: 7,
    channel: "Design product",
    users: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
    ],
    lastMessage: {
      user: "Eric",
      content: "Yeah I know 😊",
      time: "20:34",
    },
  },
  {
    id: 8,
    channel: "Product team",
    users: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clipboard_Screenshot_1744361480-BhoNk3LvIgTMpUJRp8irDYt8K1CR22.png",
    ],
    lastMessage: {
      user: "Grace",
      content: "@Lynne have time to huddle?",
      time: "20:34",
    },
  },
]

export function ChatMessages() {
  return (
    <div className="divide-y divide-zinc-800">
      {chatData.map((chat) => (
        <div key={chat.id} className="flex items-start gap-3 p-4 hover:bg-zinc-900/50 cursor-pointer">
          <div className="relative flex-shrink-0">
            {chat.users.length === 1 ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={chat.users[0]} alt={chat.channel} />
                <AvatarFallback>{chat.channel[0]}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 bg-zinc-800 rounded-md flex items-center justify-center overflow-hidden">
                <div className="flex flex-wrap gap-0.5">
                  {chat.users.slice(0, 4).map((user, idx) => (
                    <Avatar key={idx} className="h-4 w-4">
                      <AvatarImage src={user} alt="User" />
                      <AvatarFallback className="text-[8px]">U</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            )}
            {chat.badge && (
              <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                {chat.badge}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-white truncate">{chat.channel}</h3>
              <span className="text-xs text-zinc-500 flex-shrink-0">{chat.lastMessage.time}</span>
            </div>
            <p className="text-sm text-zinc-400 truncate mt-1">
              {chat.lastMessage.user && <span className="font-medium">{chat.lastMessage.user}: </span>}
              {chat.lastMessage.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
