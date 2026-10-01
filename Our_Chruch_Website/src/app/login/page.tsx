'use client'
import { GoogleLogin as GoogleLoginComponent } from "@react-oauth/google";

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGoogleLogin } from '@react-oauth/google'
import { useAppDispatch } from '@/store/hooks'
import { setAuthSuccess } from '@/store/slices/authSlice'
import { loginWithGoogleApi, registerApi, loginApi } from '@/store/api/authApi'
import Link from 'next/link'


export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setLoading(true)
    setError(null)
    try {
      // In @react-oauth/google, useGoogleLogin returns an access_token.
      // But our backend expects an id_token for /api/auth/google in AuthService.
      // Actually, wait... the previous LoginModal used `GoogleLogin` component which returns a credential (id_token).
      // If we use `useGoogleLogin`, it returns an access_token, we can fetch userinfo and then maybe... wait.
      // Let's use the GoogleLogin component or standard approach if needed.
    } catch (err: any) {
      setError(err.message || 'Google login failed')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const res = await loginApi({ email, password })
        dispatch(setAuthSuccess({ user: res.user, token: res.token }))
        router.push('/')
      } else {
        const res = await registerApi({ name, email, password })
        dispatch(setAuthSuccess({ user: res.user, token: res.token }))
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Register your church'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <div className="mt-2 mb-6">
            <GoogleSignInButton />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Register')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
              }}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleSignInButton() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // use @react-oauth/google GoogleLogin component wrapper so we get the credential (id_token)
  // instead of useGoogleLogin which is harder to get id_token from without popup
  return (
    <div className="w-full flex flex-col items-center">
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="w-full relative z-10 flex justify-center">
        {loading && <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">Loading...</div>}
        <GoogleLoginComponent 
          onSuccess={async (credentialResponse) => {
            if (credentialResponse.credential) {
              setLoading(true)
              setError(null)
              try {
                const res = await loginWithGoogleApi(credentialResponse.credential)
                dispatch(setAuthSuccess({ user: res.user, token: res.token }))
                router.push('/')
              } catch (err: any) {
                setError(err.message || 'Google login failed')
              } finally {
                setLoading(false)
              }
            }
          }}
          onError={() => {
            setError('Google login failed')
          }}
        />
      </div>
    </div>
  )
}
