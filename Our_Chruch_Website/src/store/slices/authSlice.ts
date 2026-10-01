import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'ADMIN' | 'CHAIRMAN' | 'SECRETARY' | 'TREASURER' | 'CHURCH_MEMBER'

export type AuthUser = {
  id: number
  email: string
  name: string
  avatarUrl?: string | null
  role: UserRole
}

type AuthState = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isLoginModalOpen: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isLoginModalOpen: false,
  error: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setLoginModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isLoginModalOpen = action.payload
    },
    setAuthSuccess: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    },
    logout: state => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
  },
})

export const { setLoading, setLoginModalOpen, setAuthSuccess, logout, setError } =
  authSlice.actions

export default authSlice.reducer
