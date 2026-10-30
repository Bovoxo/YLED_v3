import { useState } from 'react'
import { Presentation, Search, Download, Loader2, FileText, Palette, CheckCircle2, AlertCircle } from 'lucide-react'

export default function LyricsToPpt() {
  const [interpret, setInterpret] = useState('')
  const [pisen, setPisen] = useState('')
  const [textPisne, setTextPisne] = useState('')
  const [maxRadku, setMaxRadku] = useState(4)
  const [tema, setTema] = useState('dark')
  const [status, setStatus] = useState(null) // { typ: 'info' | 'error' | 'success', text: '' }
  const [hledam, setHledam] = useState(false)
  const [generuji, setGeneruji] = useState(false)

  const najitText = async () => {
    if (!pisen.trim()) {
      setStatus({ typ: 'error', text: 'Zadej alespoň název písně.' })
      return
    }

    setHledam(true)
    setStatus({ typ: 'info', text: 'Hledám text na Genius.com...' })

    try {
      const res = await fetch('/api/vyhledat-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interpret, pisen }),
      })
      const data = await res.json()
      if (data.chyba) {
        setStatus({ typ: 'error', text: data.chyba })
      } else {
        setTextPisne(data.text)
        setStatus({ typ: 'success', text: `Text pro "${data.nazev || pisen}" úspěšně načten.` })
      }
    } catch (err) {
      setStatus({ typ: 'error', text: 'Chyba při spojení se serverem.' })
    } finally {
      setHledam(false)
    }
  }

  const stahnout = async () => {
    if (!textPisne.trim()) {
      setStatus({ typ: 'error', text: 'Nejdříve vlož nebo vyhledej text písně.' })
      return
    }

    setGeneruji(true)
    setStatus({ typ: 'info', text: 'Generuji PowerPoint prezentaci v paměti...' })

    try {
      const nazev = `${interpret || 'Píseň'} - ${pisen || 'Text'}`
      const res = await fetch('/api/vytvorit-prezentaci', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text_pisne: textPisne,
          max_radku: parseInt(maxRadku) || 4,
          nazev_souboru: nazev,
          tema: tema,
        }),
      })

      if (!res.ok) throw new Error('Chyba při tvorbě prezentace.')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${nazev}.pptx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      setStatus({ typ: 'success', text: 'Prezentace byla úspěšně stažena.' })
    } catch (err) {
      setStatus({ typ: 'error', text: 'Chyba při generování PowerPointu.' })
    } finally {
      setGeneruji(false)
    }
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '16px', marginBottom: '12px' }}>
          <Presentation size={32} color="#a855f7" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>Texty do PowerPointu</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Vyhledej text na Genius nebo vlož vlastní a stáhni připravený .pptx na promítání
        </p>
      </div>

      {/* VYHLEDÁVACÍ ŘÁDEK */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Interpret (např. Mirai, Queen)"
          value={interpret}
          onChange={(e) => setInterpret(e.target.value)}
          style={{ flex: '1 1 200px' }}
        />
        <input
          type="text"
          placeholder="Název písně (např. Když nemůžeš)"
          value={pisen}
          onChange={(e) => setPisen(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && najitText()}
          style={{ flex: '1 1 240px' }}
        />
        <button
          onClick={najitText}
          disabled={hledam}
          className="btn btn-purple"
          style={{ flexShrink: 0, padding: '12px 24px' }}
        >
          {hledam ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
          {hledam ? 'Hledám...' : 'Najít text'}
        </button>
      </div>

      {/* TEXTAREA */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <textarea
          value={textPisne}
          onChange={(e) => setTextPisne(e.target.value)}
          placeholder="Zde se zobrazí nalezený text, nebo sem vlož svůj vlastní text (sloky odděl prázdným řádkem)..."
          style={{ height: '260px', width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: '14px' }}
        />
        {textPisne && (
          <button
            onClick={() => setTextPisne('')}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              color: 'var(--text-muted)',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            Vymazat
          </button>
        )}
      </div>

      {/* NASTAVENÍ A EXPORT */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        background: 'rgba(0,0,0,0.2)',
        padding: '16px 20px',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* Řádků na slide */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={16} color="var(--text-muted)" />
          <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Řádků na slide:</label>
          <input
            type="number"
            min="1"
            max="8"
            value={maxRadku}
            onChange={(e) => setMaxRadku(e.target.value)}
            style={{ width: '60px', textAlign: 'center', padding: '6px' }}
          />
        </div>

        {/* Vzhled */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Palette size={16} color="var(--text-muted)" />
          <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Vzhled:</label>
          <select
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            style={{ padding: '6px 12px', width: 'auto', fontSize: '13px' }}
          >
            <option value="dark">Tmavý (Černé pozadí / bílý text)</option>
            <option value="stage">Pódium (Černé pozadí / žlutý text)</option>
            <option value="light">Světlý (Bílé pozadí / tmavý text)</option>
          </select>
        </div>

        {/* Tlačítko stažení */}
        <button
          onClick={stahnout}
          disabled={generuji || !textPisne.trim()}
          className="btn btn-purple"
          style={{ padding: '12px 24px' }}
        >
          {generuji ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
          {generuji ? 'Vytvářím...' : 'STÁHNOUT .PPTX'}
        </button>
      </div>

      {status && (
        <div className={`status-msg ${status.typ}`}>
          {status.typ === 'error' && <AlertCircle size={15} />}
          {status.typ === 'success' && <CheckCircle2 size={15} />}
          {status.text}
        </div>
      )}
    </div>
  )
}
