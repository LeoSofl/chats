"use client"

import { Button } from "@/components/ui/button"


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
