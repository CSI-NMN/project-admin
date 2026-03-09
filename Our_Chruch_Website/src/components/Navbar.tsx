'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type TabType = 'records'

interface NavbarProps {
  activeTab?: TabType
  onTabChange?: (tab: TabType) => void
}

export default function Navbar({ activeTab = 'records', onTabChange }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const tabs: TabType[] = ['records']
  const tabLabels: Record<TabType, string> = {
      records: 'Records',
}

  const handleTabClick = (tab: TabType) => {
    if (pathname !== '/records') {
      router.push('/records')
    }
    onTabChange?.(tab)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-gray-300 bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}