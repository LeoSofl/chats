"use client"

import { Button } from "@/components/ui/button"

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

export default function HomePage() {
  const userName = Math.random().toString(36).substring(2, 15)
  return (
  <div className="flex flex-col items-center justify-center h-screen">
    <Button onClick={() => {
      window.location.href = `/${userName}`
    }}>
      login 
    </Button>
  </div>
  )
}
