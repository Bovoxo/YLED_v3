import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Header({ compact = false }) {
  const [online, setOnline] = useState(null)

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health')
        setOnline(res.ok)
      } catch (err) {
        setOnline(false)
      }
    }

    checkBackend()
    const interval = setInterval(checkBackend, 20000)
    return () => clearInterval(interval)
  }, [])

  if (compact) {
    if (online === false) {
      return (
        <header style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '10px',
            color: '#f87171',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            <AlertCircle size={14} />
            <span>Backend server je momentálně nedostupný</span>
          </div>
        </header>
      )
    }
    return null
  }

  return (
    <header style={{ textAlign: 'center', marginBottom: '32px' }}>
      <h1 style={{
        fontSize: 'clamp(32px, 5.5vw, 46px)',
        fontWeight: '900',
        letterSpacing: '-0.8px',
        margin: '0 0 8px 0',
        background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 55%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }}>
        <span>YLeventdeck</span>
        <span style={{
          fontSize: '12px',
          fontWeight: '800',
          letterSpacing: '0.8px',
          padding: '3px 8px',
          borderRadius: '8px',
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#38bdf8',
          WebkitTextFillColor: '#38bdf8',
          boxShadow: '0 0 12px rgba(56, 189, 248, 0.2)',
        }}>
          v3
        </span>
      </h1>

      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '540px', margin: '0 auto' }}>
        Táborové a eventové nástroje na jednom místě
      </p>

      {/* Diskrétní upozornění pouze pokud server neodpovídá */}
      {online === false && (
        <div style={{
          marginTop: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '10px',
          color: '#f87171',
          fontSize: '12px',
          fontWeight: '600',
        }}>
          <AlertCircle size={14} />
          <span>Backend server je momentálně nedostupný</span>
        </div>
      )}
    </header>
  )
}
