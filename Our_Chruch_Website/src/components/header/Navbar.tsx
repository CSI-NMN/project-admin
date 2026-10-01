'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { logoutApi } from '@/store/api/authApi'

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
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  const shouldResetScrollRef = useRef(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shouldResetScrollRef.current) return

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    shouldResetScrollRef.current = false
  }, [pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const handleSignOut = () => {
    logoutApi()
    dispatch(logout())
    setDropdownOpen(false)
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

        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              className="app-navbar-user-v2 flex items-center gap-2"
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="font-medium">{user.name}</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-100/20 text-indigo-200">
                {user.role}
              </span>
              <svg
                className={`app-navbar-caret-v2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 8l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fadeIn text-gray-800">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <div className="mt-1.5">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
            </svg>
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  )
}
