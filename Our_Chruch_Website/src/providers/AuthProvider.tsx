'use client'

import React, { useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useAppDispatch } from '@/store/hooks'
import {
  setLoading,
  setAuthSuccess,
  logout,
} from '@/store/slices/authSlice'
import { fetchCurrentUserApi } from '@/store/api/authApi'
import { getAuthToken, removeAuthToken } from '@/store/api/baseApi'

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
  }, [dispatch])

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  )
}
