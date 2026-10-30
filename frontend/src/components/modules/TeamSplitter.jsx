import { useState } from 'react'
import { Users, Shuffle, Copy, Check, UserPlus, Trophy } from 'lucide-react'

export default function TeamSplitter() {
  const [jmena, setJmena] = useState('Adam\nBarča\nCyril\nDana\nEmil\nFranta\nGabriela\nHonza')
  const [pocetTymu, setPocetTymu] = useState(2)
  const [vysledneTymy, setVysledneTymy] = useState([])
  const [chyba, setChyba] = useState('')
  const [nacita, setNacita] = useState(false)
  const [zkopirovano, setZkopirovano] = useState(false)

  const seznamRadku = jmena.split('\n').filter((l) => l.trim().length > 0)

  const rozdelit = async () => {
    setChyba('')
    setNacita(true)
    setZkopirovano(false)

    try {
      const res = await fetch('/api/rozdelit-tymy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seznam_jmen: jmena,
          pocet_tymu: parseInt(pocetTymu) || 2,
        }),
      })
      const data = await res.json()
      if (data.chyba) {
        setChyba(data.chyba)
      } else {
        setVysledneTymy(data.vysledne_tymy)
      }
    } catch (err) {
      setChyba('Výpadek spojení s backendem.')
    } finally {
      setNacita(false)
    }
  }

  const kopirovatVysledek = () => {
    if (vysledneTymy.length === 0) return
    const text = vysledneTymy
      .map((t) => `${t.nazev_tymu} (${t.pocet_clenu} členů):\n${t.clenove.map((c) => ` • ${c}`).join('\n')}`)
      .join('\n\n')

    navigator.clipboard.writeText(text)
    setZkopirovano(true)
    setTimeout(() => setZkopirovano(false), 2000)
  }

  const vlozitUkazku = () => {
    setJmena('Matěj\nTereza\nLukáš\nEliška\nJakub\nAdéla\nFilip\nKlára\nDavid\nNatálie\nOndřej\nSofie')
  }

  return (
    <div className="glass-panel animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '16px', marginBottom: '12px' }}>
          <Users size={32} color="#22c55e" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>Rozdělovač týmů</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Spravedlivé a náhodné rozřazení do skupin
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        {/* VSTUPNÍ ČÁST */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Seznam lidí ({seznamRadku.length}):
            </label>
            <button
              onClick={vlozitUkazku}
              style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <UserPlus size={13} /> Vložit táborový vzor
            </button>
          </div>

          <textarea
            value={jmena}
            onChange={(e) => setJmena(e.target.value)}
            placeholder="Každé jméno na nový řádek..."
            style={{ height: '220px', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', marginTop: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600' }}>Počet týmů:</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[2, 3, 4, 5].map((pocet) => (
                <button
                  key={pocet}
                  className="badge"
                  onClick={() => setPocetTymu(pocet)}
                  style={{
                    cursor: 'pointer',
                    background: pocetTymu === pocet ? 'rgba(34, 197, 94, 0.25)' : undefined,
                    borderColor: pocetTymu === pocet ? '#22c55e' : undefined,
                  }}
                >
                  {pocet}
                </button>
              ))}
              <input
                type="number"
                min="1"
                max="20"
                value={pocetTymu}
                onChange={(e) => setPocetTymu(e.target.value)}
                style={{ width: '65px', textAlign: 'center', padding: '8px' }}
              />
            </div>
          </div>

          <button
            onClick={rozdelit}
            disabled={nacita || seznamRadku.length === 0}
            className="btn btn-success"
            style={{ width: '100%', padding: '15px', marginTop: '20px', fontSize: '16px' }}
          >
            <Shuffle size={18} />
            {nacita ? 'ROZDĚLUJI...' : 'ROZDĚLIT DO TÝMŮ'}
          </button>

          {chyba && <div className="status-msg error">{chyba}</div>}
        </div>

        {/* VÝSLEDKY */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Vylosované týmy:</h3>
            {vysledneTymy.length > 0 && (
              <button
                onClick={kopirovatVysledek}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {zkopirovano ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                {zkopirovano ? 'Zkopírováno!' : 'Kopírovat'}
              </button>
            )}
          </div>

          {vysledneTymy.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 20px' }}>
              Zatím nerozděleno. Zadej jména a klikni na tlačítko.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {vysledneTymy.map((tym, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    borderLeft: '4px solid #22c55e',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '700', color: '#86efac', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Trophy size={16} /> {tym.nazev_tymu}
                    </span>
                    <span className="badge badge-green">{tym.pocet_clenu} hráčů</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {tym.clenove.map((clen, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.07)',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#f8fafc',
                        }}
                      >
                        {clen}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
