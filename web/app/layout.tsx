import type { Metadata } from 'next'
import './globals.css'
import { Bell, HelpCircle } from 'lucide-react'
import { Globe } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sidebar } from '@/components/sidebar'

export const metadata: Metadata = {
  title: 'Gradual',
  description: 'Gradual community',
  generator: 'Gradual',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col h-screen max-h-screen bg-zinc-950 text-white overflow-hidden">
        <header className="flex h-[5rem] items-center justify-between p-4 border-b border-zinc-800">
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
          <div className="flex flex-row h-full w-full">
          <Sidebar />
          {children}
          </div>
        </body>
    </html>
  )
}
