export type QueryValue = string | number | boolean | null | undefined

export const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

type ApiLoadingListener = (isLoading: boolean, pendingCount: number) => void

const apiLoadingListeners = new Set<ApiLoadingListener>()
let pendingApiRequestCount = 0

const notifyApiLoadingListeners = () => {
  const isLoading = pendingApiRequestCount > 0
  apiLoadingListeners.forEach(listener => listener(isLoading, pendingApiRequestCount))
}

const beginApiRequest = () => {
  pendingApiRequestCount += 1
  notifyApiLoadingListeners()
}

const endApiRequest = () => {
  pendingApiRequestCount = Math.max(0, pendingApiRequestCount - 1)
  notifyApiLoadingListeners()
}

export const subscribeApiLoading = (listener: ApiLoadingListener) => {
  apiLoadingListeners.add(listener)
  listener(pendingApiRequestCount > 0, pendingApiRequestCount)
  return () => {
    apiLoadingListeners.delete(listener)
  }
}

export const getPendingApiRequestCount = () => pendingApiRequestCount

type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

type RequestOptions = {
  method?: RequestMethod
  query?: Record<string, QueryValue>
  body?: unknown
}

const buildQueryString = (query?: Record<string, QueryValue>) => {
  if (!query) return ''

  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    params.append(key, String(value))
  })

  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const url = `${BASE_API_URL}${path}${buildQueryString(options.query)}`
  beginApiRequest()

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const fallbackMessage = `Request failed with status ${response.status}`
      let message = ''

      try {
        const payload = (await response.json()) as { message?: string; error?: string }
        message = payload.message || payload.error || ''
      } catch {
        message = ''
      }

      throw new Error(message || fallbackMessage)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  } finally {
    endApiRequest()
  }
}
