const typeStyles = {
  success: {
    bg: 'var(--success-bg)',
    border: 'var(--success-border)',
    text: 'var(--success-text)',
  },
  info: {
    bg: 'var(--washi-cool)',
    border: 'var(--ink-200)',
    text: 'var(--ink-700)',
  },
  warning: {
    bg: 'var(--amber-bg)',
    border: 'var(--amber-border)',
    text: 'var(--amber-text)',
  },
}

export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map(toast => {
        const style = typeStyles[toast.type] || typeStyles.success
        return (
          <div
            key={toast.id}
            className="px-5 py-2.5 rounded-xl border shadow-lg text-[13px] animate-toast-in"
            style={{
              background: style.bg,
              borderColor: style.border,
              color: style.text,
              fontWeight: 500,
            }}
          >
            {toast.message}
          </div>
        )
      })}
    </div>
  )
}
