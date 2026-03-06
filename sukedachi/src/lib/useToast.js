import { useState, useCallback, useRef } from 'react'

let globalAddToast = null

export function useToast() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const addToast = useCallback((message, type = 'success', duration = 2000) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  globalAddToast = addToast

  return { toasts, addToast }
}

export function showToast(message, type = 'success', duration = 2000) {
  if (globalAddToast) globalAddToast(message, type, duration)
}
