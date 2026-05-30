export type AppToastVariant = 'info' | 'success' | 'error'

export interface AppToast {
  id: number
  message: string
  variant: AppToastVariant
  durationMs: number
}

type ToastListener = (toast: AppToast) => void

const toastListeners = new Set<ToastListener>()
let nextToastId = 1

export const subscribeToasts = (listener: ToastListener) => {
  toastListeners.add(listener)
  return () => {
    toastListeners.delete(listener)
  }
}

export const showToast = (
  message: string,
  variant: AppToastVariant = 'info',
  durationMs = 3500
) => {
  const toast: AppToast = {
    id: nextToastId++,
    message,
    variant,
    durationMs,
  }
  toastListeners.forEach(listener => listener(toast))
}

export const showInfoToast = (message: string, durationMs?: number) =>
  showToast(message, 'info', durationMs)

export const showSuccessToast = (message: string, durationMs?: number) =>
  showToast(message, 'success', durationMs)

export const showErrorToast = (message: string, durationMs?: number) =>
  showToast(message, 'error', durationMs)
