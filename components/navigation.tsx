'use client'

import Link from 'next/link'
import { appData, getRoleById } from '@/lib/data'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookOpen, BarChart3, CheckSquare, Home, Layers } from 'lucide-react'

interface NavigationProps {
  selectedRole?: string
}

export default function Navigation({ selectedRole }: NavigationProps) {
  const roleObj = selectedRole ? getRoleById(selectedRole) : null

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white">
              ⚙
            </div>
            <span className="text-black">Grand Community (Confidential) </span>
          </Link>

          {/* Main Nav */}
          <nav className="flex items-center gap-2 flex-wrap">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" className="gap-2">
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/flows" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Flows
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/kb" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Knowledge Base
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/qa" className="gap-2">
                <CheckSquare className="w-4 h-4" />
                QA
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/tools" className="gap-2">
                <Layers className="w-4 h-4" />
                Tools
              </Link>
            </Button>
          </nav>

          {/* Role Display */}
          {roleObj && (
            <div className="text-sm text-black px-3 py-1 rounded-full bg-purple-50 border border-purple-200">
              {roleObj.name}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
