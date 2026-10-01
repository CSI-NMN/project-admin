'use client'

import React, { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  setLoginModalOpen,
  setAuthSuccess,
  setError,
  UserRole,
} from '@/store/slices/authSlice'
import { loginWithGoogleApi, devLoginApi } from '@/store/api/authApi'

const PRESET_ROLES: { role: UserRole; name: string; email: string; desc: string }[] = [
  {
    role: 'ADMIN',
    name: 'Admin User',
    email: 'admin@church.org',
    desc: 'Full system management access',
  },
  {
    role: 'TREASURER',
    name: 'Treasurer User',
    email: 'treasurer@church.org',
    desc: 'Subscriptions & financial tally access',
  },
  {
    role: 'SECRETARY',
    name: 'Secretary User',
    email: 'secretary@church.org',
    desc: 'Member records & church content access',
  },
  {
    role: 'CHAIRMAN',
    name: 'Chairman User',
    email: 'chairman@church.org',
    desc: 'Executive reports & tally oversight',
  },
  {
    role: 'CHURCH_MEMBER',
    name: 'Member User',
    email: 'member@church.org',
    desc: 'Personal family record & church feed',
  },
]

export default function LoginModal() {
  const dispatch = useAppDispatch()
  const { isLoginModalOpen, error } = useAppSelector(state => state.auth)
  const [activeTab, setActiveTab] = useState<'google' | 'dev'>('google')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!isLoginModalOpen) return null

  const handleClose = () => {
    dispatch(setLoginModalOpen(false))
    setLocalError(null)
  }

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      setLocalError('No Google credential returned')
      return
    }

    try {
      setSubmitting(true)
      setLocalError(null)
      const res = await loginWithGoogleApi(credentialResponse.credential)
      dispatch(setAuthSuccess({ user: res.user, token: res.token }))
      dispatch(setLoginModalOpen(false))
    } catch (err: any) {
      const msg = err.message || 'Google authentication failed'
      setLocalError(msg)
      dispatch(setError(msg))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDevLogin = async (preset: (typeof PRESET_ROLES)[0]) => {
    try {
      setSubmitting(true)
      setLocalError(null)
      const res = await devLoginApi({
        email: preset.email,
        name: preset.name,
        role: preset.role,
      })
      dispatch(setAuthSuccess({ user: res.user, token: res.token }))
      dispatch(setLoginModalOpen(false))
    } catch (err: any) {
      const msg = err.message || 'Quick login failed'
      setLocalError(msg)
      dispatch(setError(msg))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Sign In</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Access the Church Management Portal
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 bg-gray-50/30 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all mr-6 ${
              activeTab === 'google'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Google OAuth 2.0
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dev')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'dev'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Quick Role Switcher
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {(localError || error) && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start">
              <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{localError || error}</span>
            </div>
          )}

          {activeTab === 'google' ? (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 shadow-inner">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
                </svg>
              </div>

              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Continue with Google
              </h3>
              <p className="text-xs text-gray-500 mb-6 max-w-xs">
                Sign in with your Google account to automatically synchronize your church membership and permissions.
              </p>

              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setLocalError('Google Sign-In failed or was cancelled')}
                  useOneTap={false}
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  text="continue_with"
                />
              </div>

              {!googleClientId && (
                <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs text-amber-800">
                  <p className="font-semibold mb-1">Notice: Google Client ID not configured</p>
                  <p className="text-amber-700">
                    Set <code className="bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in your environment to enable live Google authentication. In the meantime, use the <strong>Quick Role Switcher</strong> tab above to test any role locally.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-xs text-gray-500 mb-3">
                Select a church role to simulate signed-in sessions with different permissions:
              </p>

              {PRESET_ROLES.map(preset => (
                <button
                  key={preset.role}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDevLogin(preset)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-left group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {preset.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-700">
                        {preset.role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{preset.desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
