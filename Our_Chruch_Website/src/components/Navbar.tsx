'use client'

import { usePathname, useRouter } from 'next/navigation'

type Tab = {
  key: string
  label: string
  href: string
}

const tabs: Tab[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'records', label: 'Records', href: '/records' },
  { key: 'filter', label: 'Filter', href: '/filter' },
  { key: 'admin', label: 'Admin', href: '/admin' },
  { key: 'accounts', label: 'Accounts', href: '/accounts' },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="app-navbar">
      <div className="app-navbar-shell app-navbar-template-v2">
        <div className="app-navbar-left">
          <button className="app-navbar-brand-v2" onClick={() => router.push('/')}>
            Our Church
          </button>

          <nav className="app-navbar-tabs-v2" aria-label="Primary">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => router.push(tab.href)}
                className={`app-navbar-tab-v2 ${isActive(tab.href) ? 'app-navbar-tab-v2-active' : ''}`}
              >
                {tab.label}
              </button>
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

