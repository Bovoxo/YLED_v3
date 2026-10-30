import { useState, useRef, useEffect } from 'react'
import { Bomb, Flame, Play, RotateCcw, Volume2, VolumeX, Sparkles, HelpCircle, UserPlus, Trophy, Trash2 } from 'lucide-react'

export default function TicTacBoom() {
  const [rezim, setRezim] = useState('slabiky') // 'slabiky' | 'temata'
  const [bezi, setBezi] = useState(false)
  const [vybouchlo, setVybouchlo] = useState(false)
  const [zvukPovolen, setZvukPovolen] = useState(true)

  // Aktuální zadání
  const [aktualniSlabika, setAktualniSlabika] = useState('KO')
  const [aktualniPozice, setAktualniPozice] = useState('Kdekoliv ve slově')
  const [aktualniTema, setAktualniTema] = useState('Věci, které najdeš v táborovém batohu')

  // Časovače (náhodné v rozmezí min - max sekund)
  const [minSekund, setMinSekund] = useState(20)
  const [maxSekund, setMaxSekund] = useState(60)

  // Skóre / hráči
  const [hraci, setHraci] = useState([
    { jmeno: 'Hráč 1', tresneBody: 0 },
    { jmeno: 'Hráč 2', tresneBody: 0 },
    { jmeno: 'Hráč 3', tresneBody: 0 },
  ])
  const [noveJmeno, setNoveJmeno] = useState('')

  const timerRef = useRef(null)
  const tickIntervalRef = useRef(null)
  const audioCtxRef = useRef(null)
  const startCasRef = useRef(0)
  const celkovyCasRef = useRef(0)

  // Databáze českých slabik a témat
  const slabiky = [
    'RA', 'KO', 'TE', 'LE', 'NA', 'PA', 'RO', 'MA', 'SA', 'KA',
    'PO', 'LA', 'TO', 'ST', 'BA', 'VA', 'DA', 'TA', 'ME', 'RE',
    'KOS', 'LES', 'PES', 'BRA', 'MRA', 'KRA', 'ZLE', 'STR', 'PRA'
  ]

  const pozice = [
    { nazev: 'Kdekoliv ve slově', popis: 'Slabika může být na začátku, uprostřed i na konci' },
    { nazev: 'Nesmí být na začátku', popis: 'Slabika musí být uprostřed nebo na konci slova' },
    { nazev: 'Nesmí být na konci', popis: 'Slabika musí být na začátku nebo uprostřed slova' }
  ]

  const temata = [
    'Věci, které najdeš v táborovém batohu',
    'Zvířata žijící v českém lese',
    'Co se nesmí dělat po večerce',
    'Jídla ze školní / táborové jídelny',
    'Co si sbalit na stezku odvahy',
    'Věci, které plavou na vodě',
    'Co najdeš v lese na zemi',
    'Důvody, proč přijít pozdě na nástup',
    'Věci s kulatým tvarem',
    'Povolání, kde se nosí uniforma',
    'Věci začínající na písmeno K',
    'Písničky zpívané u táboráku'
  ]

  // Zvukový syntetizér pro tikání a explozi
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      audioCtxRef.current = new AudioCtx()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  const zahrajTik = (frekvence = 900) => {
    if (!zvukPovolen) return
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(frekvence, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.03)

      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.03)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.03)
    } catch (e) {}
  }

  const zahrajBum = () => {
    if (!zvukPovolen) return
    try {
      const ctx = getAudioContext()
      
      // Bílý šum pro výbuch
      const bufferSize = ctx.sampleRate * 1.5
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      // Lowpass filtr pro hutný dunivý zvuk výbuchu
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(800, ctx.currentTime)
      filter.frequency.linearRampToValueAtTime(80, ctx.currentTime + 1.2)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(1.0, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      noise.start()
      noise.stop(ctx.currentTime + 1.5)
    } catch (e) {}
  }

  // Spuštění nového kola
  const startKola = async () => {
    if (bezi) return

    // Pokusíme se načíst nové kolo z backendu
    try {
      const res = await fetch('/api/tictacboom/nove-kolo')
      if (res.ok) {
        const data = await res.json()
        setAktualniSlabika(data.slabika)
        setAktualniPozice(data.pozice)
        setAktualniTema(data.tema)
      } else {
        throw new Error()
      }
    } catch {
      // Lokální fallback
      const novaSlabika = slabiky[Math.floor(Math.random() * slabiky.length)]
      const novaPozice = pozice[Math.floor(Math.random() * pozice.length)]
      const noveTema = temata[Math.floor(Math.random() * temata.length)]
      setAktualniSlabika(novaSlabika)
      setAktualniPozice(novaPozice.nazev)
      setAktualniTema(noveTema)
    }

    setVybouchlo(false)
    setBezi(true)

    // Náhodná délka tikání mezi min a max sekundami
    const minMs = Math.max(10, Number(minSekund)) * 1000
    const maxMs = Math.max(minMs + 5000, Number(maxSekund) * 1000)
    const nahodnyCas = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs

    startCasRef.current = Date.now()
    celkovyCasRef.current = nahodnyCas

    // Cyklus tikání, který zrychluje jak ubývá čas
    const naplanujDalsiTik = () => {
      const ubehlCas = Date.now() - startCasRef.current
      const zbyvaMs = celkovyCasRef.current - ubehlCas

      if (zbyvaMs <= 0) {
        // VÝBUCH!
        setBezi(false)
        setVybouchlo(true)
        zahrajBum()
        return
      }

      // Procento uběhlého času (0 až 1)
      const progres = Math.min(1, ubehlCas / celkovyCasRef.current)
      // Interval tikání od 1100ms na začátku až k 120ms na konci
      const intervalTikani = Math.max(120, 1100 - Math.pow(progres, 1.8) * 980)

      zahrajTik(750 + progres * 400)
      tickIntervalRef.current = setTimeout(naplanujDalsiTik, intervalTikani)
    }

    naplanujDalsiTik()
  }

  // Zastavení / reset
  const zastavitKolo = () => {
    if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current)
    setBezi(false)
    setVybouchlo(false)
  }

  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current)
    }
  }, [])

  // Správné striktní neměnné přidání a ubrání bodů (přesně o 1 bod)
  const pridatTrestnyBod = (index) => {
    setHraci((prev) =>
      prev.map((h, i) => (i === index ? { ...h, tresneBody: h.tresneBody + 1 } : h))
    )
  }

  const ubratTrestnyBod = (index) => {
    setHraci((prev) =>
      prev.map((h, i) => (i === index ? { ...h, tresneBody: Math.max(0, h.tresneBody - 1) } : h))
    )
  }

  const upravitJmeno = (index, noveJm) => {
    setHraci((prev) =>
      prev.map((h, i) => (i === index ? { ...h, jmeno: noveJm } : h))
    )
  }

  const smazatHrace = (index) => {
    setHraci((prev) => prev.filter((_, i) => i !== index))
  }

  const resetBodu = () => {
    setHraci((prev) => prev.map((h) => ({ ...h, tresneBody: 0 })))
  }

  const pridatHrace = () => {
    if (!noveJmeno.trim()) return
    setHraci((prev) => [...prev, { jmeno: noveJmeno.trim(), tresneBody: 0 }])
    setNoveJmeno('')
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', marginBottom: '12px' }}>
          <Bomb size={32} color="#ef4444" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>Tik Tak Bum</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Řekni slovo a rychle pošli tikající bombu dál, než vyprší tajný časovač
        </p>
      </div>

      {/* PŘEPÍNAČ REŽIMU */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
        <button
          onClick={() => { setRezim('slabiky'); zastavitKolo() }}
          disabled={bezi}
          className="btn btn-secondary"
          style={{
            borderColor: rezim === 'slabiky' ? '#ef4444' : undefined,
            backgroundColor: rezim === 'slabiky' ? 'rgba(239, 68, 68, 0.15)' : undefined,
          }}
        >
          Klasický režim: Slabiky
        </button>
        <button
          onClick={() => { setRezim('temata'); zastavitKolo() }}
          disabled={bezi}
          className="btn btn-secondary"
          style={{
            borderColor: rezim === 'temata' ? '#ef4444' : undefined,
            backgroundColor: rezim === 'temata' ? 'rgba(239, 68, 68, 0.15)' : undefined,
          }}
        >
          Párty režim: Témata
        </button>
      </div>

      {/* HLAVNÍ BOMB PANEL */}
      <div style={{
        background: vybouchlo ? 'rgba(239, 68, 68, 0.2)' : bezi ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0, 0, 0, 0.25)',
        border: vybouchlo ? '2px solid #ef4444' : bezi ? '2px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '36px 20px',
        textAlign: 'center',
        marginBottom: '28px',
        transition: 'all 0.3s ease',
        boxShadow: vybouchlo ? '0 0 40px rgba(239, 68, 68, 0.5)' : 'none',
      }}>
        {/* Stav bomby */}
        <div style={{ marginBottom: '18px' }}>
          {bezi ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} className="badge badge-red">
              <Flame size={15} color="#ef4444" /> BOMBA TIKÁ... POSÍLEJ ZAŘÍZENÍ!
            </div>
          ) : vybouchlo ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '15px' }} className="badge badge-red">
              BOMBA VYBOUCHLA!
            </div>
          ) : (
            <span className="badge badge-blue">Připraveno ke spuštění kola</span>
          )}
        </div>

        {/* Zadání pro hráče */}
        {rezim === 'slabiky' ? (
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Pravidlo pozice: <strong>{aktualniPozice}</strong>
            </div>
            <div style={{
              fontSize: 'clamp(54px, 12vw, 88px)',
              fontWeight: '900',
              letterSpacing: '4px',
              color: '#ffffff',
              textShadow: '0 0 30px rgba(239, 68, 68, 0.4)',
              margin: '10px 0',
            }}>
              {aktualniSlabika}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Téma pro toto kolo:
            </div>
            <div style={{
              fontSize: 'clamp(22px, 5vw, 32px)',
              fontWeight: '800',
              color: '#ffffff',
              margin: '15px 0',
              lineHeight: '1.3',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              "{aktualniTema}"
            </div>
          </div>
        )}

        {/* Tlačítka ovládání */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
          {!bezi ? (
            <button
              onClick={startKola}
              className="btn btn-danger"
              style={{ padding: '16px 36px', fontSize: '18px', borderRadius: '16px' }}
            >
              <Play size={20} fill="currentColor" /> SPUSTIT BOMBŮ
            </button>
          ) : (
            <button
              onClick={zastavitKolo}
              className="btn btn-secondary"
              style={{ padding: '16px 28px', fontSize: '16px', borderRadius: '16px' }}
            >
              <RotateCcw size={18} /> Zrušit kolo
            </button>
          )}

          <button
            onClick={() => setZvukPovolen(!zvukPovolen)}
            className="btn btn-secondary"
            title={zvukPovolen ? 'Ztlumit zvuk tikání' : 'Zapnout zvuk tikání'}
            style={{ padding: '16px' }}
          >
            {zvukPovolen ? <Volume2 size={18} /> : <VolumeX size={18} color="var(--text-muted)" />}
          </button>
        </div>
      </div>

      {/* SPODNÍ ČÁST: NASTAVENÍ ČASU & POČÍTADLO TRESTNÝCH BODŮ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* Nastavení skrytého času */}
        <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Rozmezí tajného času bomby:</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Minimum (s)</label>
              <input
                type="number"
                min="10"
                max="60"
                value={minSekund}
                onChange={(e) => setMinSekund(e.target.value)}
                disabled={bezi}
                style={{ textAlign: 'center' }}
              />
            </div>
            <span style={{ marginTop: '18px', color: 'var(--text-muted)' }}>—</span>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Maximum (s)</label>
              <input
                type="number"
                min="20"
                max="180"
                value={maxSekund}
                onChange={(e) => setMaxSekund(e.target.value)}
                disabled={bezi}
                style={{ textAlign: 'center' }}
              />
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
            Hráči nevidí, kolik času zbývá. Bomba může vybouchnout kdykoliv v tomto intervalu!
          </p>
        </div>

        {/* Počítadlo trestných bodů */}
        <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Hráči a trestné body:</h4>
            {hraci.length > 0 && (
              <button
                onClick={resetBodu}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Vynulovat všechny body"
              >
                <RotateCcw size={11} /> Vynulovat
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {hraci.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  gap: '8px',
                }}
              >
                {/* Přepisovatelné jméno hráče */}
                <input
                  type="text"
                  value={h.jmeno}
                  onChange={(e) => upravitJmeno(i, e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 0,
                    padding: '2px 4px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#ffffff',
                    flex: 1,
                    minWidth: '80px',
                  }}
                  title="Klikni pro přepsání jména"
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => ubratTrestnyBod(i)}
                    className="btn btn-secondary"
                    style={{ padding: '2px 8px', fontSize: '12px' }}
                    title="Ubrat 1 bod"
                  >
                    -
                  </button>
                  <span className="badge badge-red" style={{ minWidth: '24px', justifyContent: 'center', fontSize: '13px' }}>
                    {h.tresneBody}
                  </span>
                  <button
                    onClick={() => pridatTrestnyBod(i)}
                    className="btn btn-secondary"
                    style={{ padding: '2px 8px', fontSize: '12px' }}
                    title="Přidat 1 bod"
                  >
                    +
                  </button>
                  <button
                    onClick={() => smazatHrace(i)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 6px', color: '#f87171' }}
                    title="Smazat hráče"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {hraci.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '15px' }}>
                Žádní hráči. Přidej prvního hráče níže.
              </div>
            )}
          </div>

          {/* Přidání hráče */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Jméno hráče..."
              value={noveJmeno}
              onChange={(e) => setNoveJmeno(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && pridatHrace()}
              style={{ padding: '8px 12px', fontSize: '13px' }}
            />
            <button
              onClick={pridatHrace}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '13px' }}
            >
              <UserPlus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
