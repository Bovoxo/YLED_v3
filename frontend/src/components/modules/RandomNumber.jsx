import { useState } from 'react'
import { Dices, RotateCcw, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function RandomNumber() {
  const [odCisla, setOdCisla] = useState(1)
  const [doCisla, setDoCisla] = useState(100)
  const [vysledek, setVysledek] = useState('?')
  const [historie, setHistorie] = useState([])
  const [losujeSe, setLosujeSe] = useState(false)
  const [chyba, setChyba] = useState('')

  const spustitKonfety = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 }
    })
  }

  const losovat = async () => {
    setChyba('')
    setLosujeSe(true)

    // Krátká animace točení čísel
    let count = 0
    const interval = setInterval(() => {
      const min = Number(odCisla) || 1
      const max = Number(doCisla) || 100
      setVysledek(Math.floor(Math.random() * (max - min + 1)) + min)
      count++
      if (count > 8) clearInterval(interval)
    }, 60)

    try {
      const res = await fetch(`/api/losovat?od=${odCisla}&do=${doCisla}`)
      const data = await res.json()

      setTimeout(() => {
        clearInterval(interval)
        setLosujeSe(false)

        if (data.chyba) {
          setChyba(data.chyba)
          setVysledek('!?')
        } else {
          setVysledek(data.vylosovano)
          setHistorie((prev) => [data.vylosovano, ...prev.slice(0, 9)])
          spustitKonfety()
        }
      }, 550)
    } catch (err) {
      clearInterval(interval)
      setLosujeSe(false)
      setChyba('Výpadek spojení s backendem.')
    }
  }

  const nastavRozsah = (min, max) => {
    setOdCisla(min)
    setDoCisla(max)
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', marginBottom: '14px' }}>
        <Dices size={32} color="#3b82f6" />
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>Losovač čísel</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '22px' }}>
        Zvol rozsah a vylosuj náhodného výherce
      </p>

      {/* Rychlé předvolby */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
        <button className="badge" onClick={() => nastavRozsah(1, 10)} style={{ cursor: 'pointer' }}>1 - 10</button>
        <button className="badge" onClick={() => nastavRozsah(1, 20)} style={{ cursor: 'pointer' }}>1 - 20</button>
        <button className="badge" onClick={() => nastavRozsah(1, 50)} style={{ cursor: 'pointer' }}>1 - 50</button>
        <button className="badge" onClick={() => nastavRozsah(1, 100)} style={{ cursor: 'pointer' }}>1 - 100</button>
      </div>

      {/* Rozsah OD - DO */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ textAlign: 'left' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Od</label>
          <input
            type="number"
            value={odCisla}
            onChange={(e) => setOdCisla(e.target.value)}
            style={{ width: '100px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}
          />
        </div>

        <span style={{ fontSize: '24px', color: 'var(--text-muted)', marginTop: '18px' }}>—</span>

        <div style={{ textAlign: 'left' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Do</label>
          <input
            type="number"
            value={doCisla}
            onChange={(e) => setDoCisla(e.target.value)}
            style={{ width: '100px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}
          />
        </div>
      </div>

      {/* Tlačítko Losovat */}
      <button
        onClick={losovat}
        disabled={losujeSe}
        className="btn btn-primary"
        style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '14px' }}
      >
        <Sparkles size={20} />
        {losujeSe ? 'LOSUJI...' : 'VYLOSOVAT ČÍSLO'}
      </button>

      {/* Výsledek */}
      <div style={{
        margin: '28px 0 16px 0',
        padding: '24px',
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{
          fontSize: 'clamp(56px, 12vw, 84px)',
          fontWeight: '900',
          lineHeight: '1',
          color: '#facc15',
          textShadow: '0 0 35px rgba(250, 204, 21, 0.45)',
          fontVariantNumeric: 'tabular-nums'
        }}>
          {vysledek}
        </div>
      </div>

      {chyba && <div className="status-msg error">{chyba}</div>}

      {/* Historie */}
      {historie.length > 0 && (
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Předchozí čísla:</span>
            <button
              onClick={() => setHistorie([])}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
            >
              <RotateCcw size={12} /> Smazat
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {historie.map((num, idx) => (
              <span key={idx} className="badge badge-yellow" style={{ fontSize: '13px', padding: '4px 10px' }}>
                {num}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
