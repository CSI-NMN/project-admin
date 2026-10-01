import { apiRequest, setAuthToken, removeAuthToken } from './baseApi'
import { AuthUser, UserRole } from '../slices/authSlice'

export type AuthResponse = {
  token: string
  user: AuthUser
}

export const loginWithGoogleApi = async (credential: string): Promise<AuthResponse> => {
  const data = await apiRequest<AuthResponse>('/api/auth/google', {
    method: 'POST',
    body: { credential },
  })
  if (data?.token) {
    setAuthToken(data.token)
  }
  return data
}

export const devLoginApi = async (params: {
  email: string
  name: string
  role?: UserRole
  avatarUrl?: string
}): Promise<AuthResponse> => {
  const data = await apiRequest<AuthResponse>('/api/auth/dev-login', {
    method: 'POST',
    body: params,
  })
  if (data?.token) {
    setAuthToken(data.token)
  }
  return data
}

export const fetchCurrentUserApi = async (): Promise<AuthUser> => {
  return await apiRequest<AuthUser>('/api/auth/me', {
    method: 'GET',
  })
}

export const logoutApi = () => {
  removeAuthToken()
}
