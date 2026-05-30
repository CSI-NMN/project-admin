import { useCallback, useEffect, useState } from 'react'

interface UseAutoSaveOptions<T> {
  isDirty: boolean
  data: T
  saveFn: (data: T) => Promise<void>
  delay?: number
}

interface UseAutoSaveReturn {
  isSaving: boolean
  lastSavedAt: string | null
}

export function useAutoSave<T>({
  isDirty,
  data,
  saveFn,
  delay = 60_000,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  const save = useCallback(async () => {
    if (!isDirty) return
    setIsSaving(true)
    try {
      await saveFn(data)
      setLastSavedAt(new Date().toISOString())
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [isDirty, data, saveFn])

  useEffect(() => {
    if (!isDirty) return
    const timer = window.setTimeout(() => {
      void save()
    }, delay)
    return () => window.clearTimeout(timer)
  }, [isDirty, data, save, delay])

  return { isSaving, lastSavedAt }
}