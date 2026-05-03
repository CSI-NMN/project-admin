'use client'

import { useEffect, useRef, useState } from 'react'
import { AppToast, subscribeToasts } from '@/components/common/toast'

export default function GlobalToaster() {
  const [toasts, setToasts] = useState<AppToast[]>([])
  const timeoutMapRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const timeoutMap = timeoutMapRef.current

    const unsubscribe = subscribeToasts(toast => {
      setToasts(prev => [...prev, toast])
      const timeoutId = setTimeout(() => {
        setToasts(prev => prev.filter(item => item.id !== toast.id))
        timeoutMap.delete(toast.id)
      }, toast.durationMs)
      timeoutMap.set(toast.id, timeoutId)
    })

    return () => {
      unsubscribe()
      timeoutMap.forEach(timeoutId => clearTimeout(timeoutId))
      timeoutMap.clear()
    }
  }, [])

  const dismissToast = (id: number) => {
    const timeoutId = timeoutMapRef.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutMapRef.current.delete(id)
    }
    setToasts(prev => prev.filter(item => item.id !== id))
  }

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="app-toast-stack" role="status" aria-live="polite" aria-label="Notifications">
      {toasts.map(toast => (
        <div key={toast.id} className={`app-toast app-toast-${toast.variant}`}>
          <span className="app-toast-message">{toast.message}</span>
          <button
            type="button"
            className="app-toast-close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            x
          </button>
        </div>
      ))}
    </div>
  )
}
