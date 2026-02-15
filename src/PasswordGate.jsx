import { useState, useEffect } from 'react'

const HASH = '5f4dcc3b5aa765d61d8327deb882cf99' // placeholder, we use simple check
const STORAGE_KEY = 'btm-advisor-auth'
const PASSWORD = 'Molthi!1'

export default function PasswordGate({ children }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
      setAuthenticated(true)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setAuthenticated(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  if (authenticated) return children

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '48px 40px',
        textAlign: 'center',
        minWidth: '320px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🦞</div>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>
          SAP BTM AIDE-visor
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 28px' }}>
          Enter password to continue
        </p>
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false) }}
          placeholder="Password"
          autoFocus
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: error ? '2px solid #e53e3e' : '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            fontSize: '16px',
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: '16px',
            transition: 'border-color 0.2s'
          }}
        />
        {error && <p style={{ color: '#fc8181', fontSize: '13px', margin: '-8px 0 12px' }}>
          Incorrect password
        </p>}
        <button type="submit" style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: 'linear-gradient(135deg, #e53e3e, #dd6b20)',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'opacity 0.2s'
        }}>
          Enter
        </button>
      </form>
    </div>
  )
}
