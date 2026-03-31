'use client'

import { useEffect, useState } from 'react'
import { getPendingApiRequestCount, subscribeApiLoading } from '@/store/api/baseApi'

export default function GlobalApiLoader() {
  const [pendingCount, setPendingCount] = useState(getPendingApiRequestCount())

  useEffect(() => {
    return subscribeApiLoading((_, count) => {
      setPendingCount(count)
    })
  }, [])

  if (pendingCount === 0) {
    return null
  }

  return (
    <div className="app-loader-overlay" role="status" aria-live="polite" aria-label="Loading">
      <div className="app-loader-card">
        <span className="app-loader-spinner" />
        <span className="app-loader-text">Loading...</span>
      </div>
    </div>
  )
}
