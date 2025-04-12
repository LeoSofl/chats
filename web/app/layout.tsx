import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/header'
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
        <Header />
        <div className="flex flex-row h-full w-full">
          <Sidebar />
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  )
}
