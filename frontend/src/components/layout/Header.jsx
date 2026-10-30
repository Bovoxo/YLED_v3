import { useState, useEffect } from 'react'
import { Sparkles, Activity } from 'lucide-react'

export default function Header() {
  const [online, setOnline] = useState(null)

  useEffect(() => {
    // Ověříme, zda je backend dostupný (přes proxy nebo přímo)
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health')
        if (res.ok) {
          setOnline(true)
        } else {
          setOnline(false)
        }
      } catch (err) {
        setOnline(false)
      }
    }

    checkBackend()
    const interval = setInterval(checkBackend, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header style={{ textAlign: 'center', marginBottom: '32px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span className="badge badge-blue">
          <Sparkles size={13} /> VOL 3.0
        </span>
        <span className={`badge ${online === true ? 'badge-green' : online === false ? 'badge-red' : 'badge-yellow'}`}>
          <Activity size={13} />
          {online === true ? 'Backend připojen' : online === false ? 'Backend nedostupný' : 'Ověřuji spojení...'}
        </span>
      </div>

      <h1 style={{
        fontSize: 'clamp(28px, 5vw, 42px)',
        fontWeight: '800',
        letterSpacing: '-0.5px',
        margin: '0 0 8px 0',
        background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        YLeventdeck
      </h1>

      <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '540px', margin: '0 auto' }}>
        Táborové a eventové nástroje na jednom místě.
      </p>
    </header>
  )
}
