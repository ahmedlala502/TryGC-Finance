import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GC Knowledge Base - Team KPI System',
  description: 'Comprehensive KPI tracking system for operational teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-bg antialiased">
        {children}
      </body>
    </html>
  )
}
