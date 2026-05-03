'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

type Tab = {
  key: string
  label: string
  href: string
}

const tabs: Tab[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'records', label: 'Records', href: '/records' },
  { key: 'subscriptions', label: 'Subscriptions', href: '/subscriptions' },
  { key: 'eventAudit', label: 'Event Audit', href: '/event-audit' },
  { key: 'tally', label: 'Tally', href: '/tally' },
  { key: 'celebrations', label: 'Celebrations', href: '/celebrations' },
  { key: 'filter', label: 'Filter', href: '/filter' },
  { key: 'admin', label: 'Admin', href: '/admin' },
  { key: 'accounts', label: 'Accounts', href: '/accounts' },
]

export default function Navbar() {
  const pathname = usePathname()
  const shouldResetScrollRef = useRef(false)

  useEffect(() => {
    if (!shouldResetScrollRef.current) return

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    shouldResetScrollRef.current = false
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="app-navbar">
      <div className="app-navbar-shell app-navbar-template-v2">
        <div className="app-navbar-left">
          <Link className="app-navbar-brand-v2" href="/">
            Our Church
          </Link>

          <nav className="app-navbar-tabs-v2" aria-label="Primary">
            {tabs.map(tab => (
              <Link
                key={tab.key}
                href={tab.href}
                scroll
                onClick={() => {
                  shouldResetScrollRef.current = true
                }}
                className={`app-navbar-tab-v2 ${isActive(tab.href) ? 'app-navbar-tab-v2-active' : ''}`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        <button className="app-navbar-user-v2" type="button">
          <span>Gary Bailey</span>
          <svg className="app-navbar-caret-v2" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}
