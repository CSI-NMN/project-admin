'use client'

import React, { useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useAppDispatch } from '@/store/hooks'
import {
  setLoading,
  setAuthSuccess,
  logout,
  setLoginModalOpen,
} from '@/store/slices/authSlice'
import { fetchCurrentUserApi } from '@/store/api/authApi'
import { getAuthToken, removeAuthToken } from '@/store/api/baseApi'
import LoginModal from '@/components/auth/LoginModal'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-google-client-id.apps.googleusercontent.com'

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken()
      if (!token) {
        dispatch(setLoading(false))
        return
      }

      try {
        const user = await fetchCurrentUserApi()
        if (user) {
          dispatch(setAuthSuccess({ user, token }))
        } else {
          removeAuthToken()
          dispatch(logout())
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err)
        removeAuthToken()
        dispatch(logout())
      } finally {
        dispatch(setLoading(false))
      }
    }

    initAuth()

    // If query string has ?login=true, trigger login modal
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('login') === 'true') {
        dispatch(setLoginModalOpen(true))
      }
    }
  }, [dispatch])

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
      <LoginModal />
    </GoogleOAuthProvider>
  )
}
