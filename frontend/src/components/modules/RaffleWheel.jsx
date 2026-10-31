import { useState, useRef, useEffect, useCallback } from 'react'
import {
  RotateCw, Trophy, Trash2, Plus, Sparkles, Volume2, VolumeX,
  Maximize, Minimize, Palette, Settings, X, Check, RefreshCw
} from 'lucide-react'
import confetti from 'canvas-confetti'

// Předpřipravené barevné palety pro kolo
const PALETY = {
  rainbow: {
    nazev: 'Zářivá duha',
    barvy: [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
      '#8b5cf6', '#06b6d4', '#ec4899', '#f97316',
      '#14b8a6', '#6366f1', '#eab308', '#d946ef'
    ]
  },
  royale: {
    nazev: 'Casino Royale',
    barvy: [
      '#d97706', '#1e293b', '#b45309', '#0f172a',
      '#f59e0b', '#334155', '#eab308', '#1e1b4b'
    ]
  },
  neon: {
    nazev: 'Cyber Neon',
    barvy: [
      '#06b6d4', '#8b5cf6', '#ec4899', '#3b82f6',
      '#10b981', '#f43f5e', '#a855f7', '#14b8a6'
    ]
  },
  camp: {
    nazev: 'Tábor a Les',
    barvy: [
      '#059669', '#d97706', '#2563eb', '#15803d',
      '#ea580c', '#0284c7', '#16a34a', '#b45309'
    ]
  },
  pastel: {
    nazev: 'Jemný pastel',
    barvy: [
      '#38bdf8', '#4ade80', '#fb923c', '#f472b6',
      '#a78bfa', '#2dd4bf', '#facc15', '#fb7185'
    ]
  }
}

export default function RaffleWheel() {
  const [polozkyText, setPolozkyText] = useState(
    'Honza\nTereza\nPetr\nAdéla\nDavid\nEliška\nMatěj\nKristýna'
  )
  const [polozky, setPolozky] = useState([])
  const [vitez, setVitez] = useState(null)
  const [tociSe, setTociSe] = useState(false)
  const [zvukPovolen, setZvukPovolen] = useState(() => {
    try {
      const ulozene = localStorage.getItem('yled_zvuk_povolen')
      return ulozene !== null ? ulozene === 'true' : true
    } catch {
      return true
    }
  })
  const zvukPovolenRef = useRef(zvukPovolen)

  const toggleZvuk = () => {
    setZvukPovolen((prev) => {
      const novy = !prev
      zvukPovolenRef.current = novy
      try {
        localStorage.setItem('yled_zvuk_povolen', novy ? 'true' : 'false')
      } catch {}
      return novy
    })
  }

  const [jeFullscreen, setJeFullscreen] = useState(false)
  const [zvolenaPaleta, setZvolenaPaleta] = useState('rainbow')
  const [flapperTilt, setFlapperTilt] = useState(0)
  const [zobrazitEditor, setZobrazitEditor] = useState(false)
  const [historie, setHistorie] = useState([])

  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const uhelRef = useRef(0)
  const rychlostRef = useRef(0)
  const animaceRef = useRef(null)
  const minulySegmentRef = useRef(-1)

  // Převedení textu na položky
  useEffect(() => {
    const list = polozkyText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
    setPolozky(list)
  }, [polozkyText])

  // Zvuk cvaknutí kolíčku přes Web Audio API
  const zahrajCvaknuti = () => {
    if (!zvukPovolenRef.current) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(850, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.035)

      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.035)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.035)
    } catch (e) {}
  }

  // Vítězná fanfára při zastavení kola
  const zahrajFanfaru = () => {
    if (!zvukPovolenRef.current) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      const now = ctx.currentTime

      const tony = [
        { freq: 523.25, cas: 0, delka: 0.12 },
        { freq: 659.25, cas: 0.11, delka: 0.12 },
        { freq: 783.99, cas: 0.22, delka: 0.15 },
        { freq: 1046.5, cas: 0.38, delka: 0.60 },
      ]

      tony.forEach(({ freq, cas, delka }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + cas)

        gain.gain.setValueAtTime(0.3, now + cas)
        gain.gain.exponentialRampToValueAtTime(0.001, now + cas + delka)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + cas)
        osc.stop(now + cas + delka)
      })
    } catch (e) {}
  }

  // Vykreslení kola na vysokém rozlišení (ostré na 4K i mobilu)
  const vykresliKolo = useCallback((uhel = uhelRef.current) => {
    const canvas = canvasRef.current
    if (!canvas || polozky.length === 0) return

    const ctx = canvas.getContext('2d')
    const sirka = canvas.width
    const stredX = sirka / 2
    const stredY = sirka / 2
    const vnejsiPolomer = sirka / 2 - 24
    const vnitrniPolomer = 38

    ctx.clearRect(0, 0, sirka, sirka)

    const pocet = polozky.length
    const segmentUhel = (Math.PI * 2) / pocet
    const aktivniBarvy = PALETY[zvolenaPaleta]?.barvy || PALETY.rainbow.barvy

    // 1. Vnější stínovaný podklad kola
    ctx.save()
    ctx.beginPath()
    ctx.arc(stredX, stredY, vnejsiPolomer + 12, 0, Math.PI * 2)
    ctx.fillStyle = '#0f172a'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)'
    ctx.shadowBlur = 25
    ctx.fill()
    ctx.restore()

    // 2. Vykreslení jednotlivých výsečí
    for (let i = 0; i < pocet; i++) {
      const zacatekUhel = uhel + i * segmentUhel
      const konecUhel = zacatekUhel + segmentUhel

      ctx.beginPath()
      ctx.moveTo(stredX, stredY)
      ctx.arc(stredX, stredY, vnejsiPolomer, zacatekUhel, konecUhel)
      ctx.closePath()

      // Základní barva segmentu
      ctx.fillStyle = aktivniBarvy[i % aktivniBarvy.length]
      ctx.fill()

      // Jemný lesk a 3D přechod pro prémiový vzhled
      ctx.save()
      ctx.clip()
      const grad = ctx.createRadialGradient(stredX, stredY, vnitrniPolomer, stredX, stredY, vnejsiPolomer)
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.18)')
      grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.04)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)')
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()

      // Dělící linie mezi výsečemi
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.stroke()

      // Text uvnitř výseče
      ctx.save()
      ctx.translate(stredX, stredY)
      ctx.rotate(zacatekUhel + segmentUhel / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffffff'

      // Dynamická velikost fontu podle počtu položek
      const dynamicFontSize = Math.max(12, Math.min(20, Math.floor(260 / Math.sqrt(pocet))))
      ctx.font = `800 ${dynamicFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)'
      ctx.shadowBlur = 6
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1

      let text = polozky[i]
      const maxChars = pocet > 16 ? 12 : pocet > 10 ? 15 : 20
      if (text.length > maxChars) text = text.slice(0, maxChars - 1) + '…'
      ctx.fillText(text, vnejsiPolomer - 36, dynamicFontSize * 0.35)
      ctx.restore()
    }

    // 3. Kovový vnější lem (Rim)
    ctx.beginPath()
    ctx.arc(stredX, stredY, vnejsiPolomer, 0, Math.PI * 2)
    ctx.lineWidth = 10
    ctx.strokeStyle = '#1e293b'
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(stredX, stredY, vnejsiPolomer + 5, 0, Math.PI * 2)
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.stroke()

    // 4. Kovové kolíčky (Pegs) po obvodu kola
    for (let i = 0; i < pocet; i++) {
      const pegUhel = uhel + i * segmentUhel
      const pegX = stredX + (vnejsiPolomer + 1) * Math.cos(pegUhel)
      const pegY = stredY + (vnejsiPolomer + 1) * Math.sin(pegUhel)

      ctx.beginPath()
      ctx.arc(pegX, pegY, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#f8fafc'
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = '#0f172a'
      ctx.stroke()
    }

    // 5. Středový čep (Hub)
    ctx.save()
    ctx.beginPath()
    ctx.arc(stredX, stredY, vnitrniPolomer + 8, 0, Math.PI * 2)
    ctx.fillStyle = '#0f172a'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 10
    ctx.fill()

    const hubGrad = ctx.createRadialGradient(stredX - 8, stredY - 8, 4, stredX, stredY, vnitrniPolomer)
    hubGrad.addColorStop(0, '#38bdf8')
    hubGrad.addColorStop(1, '#0284c7')

    ctx.beginPath()
    ctx.arc(stredX, stredY, vnitrniPolomer, 0, Math.PI * 2)
    ctx.fillStyle = hubGrad
    ctx.fill()
    ctx.lineWidth = 4
    ctx.strokeStyle = '#ffffff'
    ctx.stroke()

    // Středový lesk
    ctx.beginPath()
    ctx.arc(stredX - 8, stredY - 8, 8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.fill()
    ctx.restore()
  }, [polozky, zvolenaPaleta])

  // Znovuvykreslení při změně položek nebo palety (zarovná první položku vodorovně k šipce)
  useEffect(() => {
    if (!tociSe && polozky.length > 0) {
      const segUhel = (Math.PI * 2) / polozky.length
      uhelRef.current = -segUhel / 2
    }
    vykresliKolo()
  }, [vykresliKolo, polozky.length, tociSe])

  // Spuštění točení
  const roztocitKolo = () => {
    if (tociSe || polozky.length < 2) return

    setVitez(null)
    setTociSe(true)

    // Náhodná rychlost a doba točení
    const minRychlost = 0.42
    const maxRychlost = 0.62
    rychlostRef.current = Math.random() * (maxRychlost - minRychlost) + minRychlost
    const treni = 0.986 + Math.random() * 0.004

    const animovat = () => {
      rychlostRef.current *= treni
      uhelRef.current = (uhelRef.current + rychlostRef.current) % (Math.PI * 2)

      const pocet = polozky.length
      const segmentUhel = (Math.PI * 2) / pocet

      // Šipka je vpravo na 3. hodině (0 stupňů / vodorovně):
      const uhelSipky = (Math.PI * 2 - (uhelRef.current % (Math.PI * 2))) % (Math.PI * 2)
      const aktualniIndex = Math.floor(uhelSipky / segmentUhel) % pocet

      if (aktualniIndex !== minulySegmentRef.current) {
        zahrajCvaknuti()
        minulySegmentRef.current = aktualniIndex

        // Fyzické zavrtění šipky při zásahu kolíčku
        setFlapperTilt(Math.random() > 0.5 ? 12 : -12)
        setTimeout(() => setFlapperTilt(0), 55)
      }

      vykresliKolo(uhelRef.current)

      if (rychlostRef.current > 0.002) {
        animaceRef.current = requestAnimationFrame(animovat)
      } else {
        // Kolo se zastavilo
        setTociSe(false)
        const vitezItem = polozky[aktualniIndex]
        setVitez(vitezItem)
        setHistorie((prev) => [vitezItem, ...prev])

        zahrajFanfaru()

        // Oboustranné konfety
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { x: 0.25, y: 0.65 }
        })
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { x: 0.75, y: 0.65 }
        })
      }
    }

    animaceRef.current = requestAnimationFrame(animovat)
  }

  // Odebrání vítěze z kola pro další losování
  const odebratViteze = () => {
    if (!vitez) return
    const novyList = polozky.filter((p) => p !== vitez)
    setPolozkyText(novyList.join('\n'))
    setVitez(null)
  }

  // Předvolby čísel a témat
  const nastavitCisla = (pocet) => {
    const arr = Array.from({ length: pocet }, (_, i) => String(i + 1))
    setPolozkyText(arr.join('\n'))
  }

  const nastavitSablony = (typ) => {
    const sablony = {
      sluzby: ['Služba v kuchyni', 'Dřevo na táborák', 'Vlajkonoš', 'Čištění ohniště', 'Ranní budíček', 'Vodní hlídka', 'Noční hlídka', 'Zapisovatel bodů'],
      rozcvicka: ['10 kliků', '20 dřepů', 'Běh kolem tábora', 'Skákání panáka', 'Plank 30 sekund', 'Hvězda na louce', 'Žabáky', 'Výskoky s tlesknutím'],
      odmeny: ['První v jídelně na oběd', 'Výběr hudby na rozcvičku', 'Sladká odměna', 'Extra bod pro družinu', 'Odpuštění jedné služby', 'Diplom dne']
    }
    if (sablony[typ]) {
      setPolozkyText(sablony[typ].join('\n'))
    }
  }

  // Přepnutí do Fullscreenu
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {})
      setJeFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setJeFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFsChange = () => {
      setJeFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Klávesové zkratky: Mezerník = Roztočit, F = Fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return

      if (e.code === 'Space') {
        e.preventDefault()
        roztocitKolo()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.key === 'Escape' && vitez) {
        setVitez(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [polozky, tociSe, vitez])

  return (
    <div
      ref={containerRef}
      className="glass-panel animate-fade-in"
      style={{
        maxWidth: jeFullscreen ? '100%' : '1020px',
        margin: '0 auto',
        height: jeFullscreen ? '100vh' : 'auto',
        minHeight: jeFullscreen ? '100vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: jeFullscreen ? '#070b12' : undefined,
        borderRadius: jeFullscreen ? '0' : undefined,
        border: jeFullscreen ? 'none' : undefined,
        padding: jeFullscreen ? '14px 28px 18px 28px' : '28px',
        position: 'relative',
        userSelect: 'none',
        overflow: jeFullscreen ? 'hidden' : 'visible',
        boxSizing: 'border-box',
      }}
    >
      {/* HORNÍ LIŠTA: NÁZEV + OVLÁDACÍ PRVKY */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: jeFullscreen ? '10px' : '24px',
        flexWrap: 'wrap',
        gap: '12px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '8px',
            background: 'rgba(236, 72, 153, 0.15)',
            borderRadius: '12px',
          }}>
            <RotateCw size={22} color="#ec4899" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
              Kolo štěstí
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
              Fyzické cvakání, kolíčky a náhodný výběr
            </p>
          </div>
        </div>

        {/* TLAČÍTKA NASTAVENÍ: PALETA, ZVUK, SEZNAM, FULLSCREEN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* VÝBĚR BAREVNÉHO MOTIVU */}
          <div style={{ position: 'relative' }}>
            <select
              value={zvolenaPaleta}
              onChange={(e) => setZvolenaPaleta(e.target.value)}
              className="badge"
              style={{
                cursor: 'pointer',
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
              title="Změnit barevnou paletu kola"
            >
              {Object.entries(PALETY).map(([k, p]) => (
                <option key={k} value={k} style={{ background: '#0f172a', color: '#fff' }}>
                  {p.nazev}
                </option>
              ))}
            </select>
          </div>

          {/* PŘEPÍNAČ ZVUKU */}
          <button
            onClick={toggleZvuk}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '10px' }}
            title={zvukPovolen ? 'Ztlumit zvuk' : 'Zapnout zvuk'}
          >
            {zvukPovolen ? <Volume2 size={16} /> : <VolumeX size={16} color="var(--text-muted)" />}
          </button>

          {/* ZOBRAZENÍ / SKRYTÍ SEZNAMU (Vhodné pro projekci) */}
          <button
            onClick={() => setZobrazitEditor(!zobrazitEditor)}
            className="btn btn-secondary"
            style={{
              padding: '8px 14px',
              fontSize: '12px',
              borderRadius: '10px',
              backgroundColor: zobrazitEditor ? 'rgba(59, 130, 246, 0.25)' : undefined,
              borderColor: zobrazitEditor ? '#3b82f6' : undefined,
            }}
            title="Upravit seznam jmen a položek"
          >
            <Settings size={15} />
            <span>Položky ({polozky.length})</span>
          </button>

          {/* FULLSCREEN */}
          <button
            onClick={toggleFullscreen}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '10px' }}
            title={jeFullscreen ? 'Ukončit celou obrazovku [F]' : 'Na celou obrazovku [F]'}
          >
            {jeFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* HLAVNÍ PLOCHA (KOLO + PŘÍPADNÝ EDITOR VEDLE SEBE) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: jeFullscreen ? '40px' : '30px',
        width: '100%',
        minHeight: 0,
        flexWrap: jeFullscreen ? 'nowrap' : 'wrap',
      }}>

        {/* CENTRÁLNÍ SEKCE S KOLEM */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: jeFullscreen
            ? (zobrazitEditor ? 'min(66vh, 580px)' : 'min(76vh, 760px)')
            : '460px',
          position: 'relative',
          transition: 'max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* CANVAS KOLA S PRAVOU VODOROVNOU ŠIPKOU */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            boxShadow: '0 0 50px rgba(0, 0, 0, 0.7), inset 0 0 30px rgba(0, 0, 0, 0.5)',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '4px',
            border: '4px solid rgba(255, 255, 255, 0.08)',
          }}>
            <canvas
              ref={canvasRef}
              width={760}
              height={760}
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
              }}
            />

            {/* ZLATÁ FYZICKÁ ŠIPKA NA PRAVÉ STRANĚ (UKAZUJE VODOROVNĚ DOLEVA NA VÍTĚZNÝ SEGMENT) */}
            <div style={{
              position: 'absolute',
              right: jeFullscreen && !zobrazitEditor ? '-18px' : '-14px',
              top: '50%',
              transform: `translateY(-50%) rotate(${flapperTilt}deg)`,
              transformOrigin: 'right center',
              transition: 'transform 0.06s ease',
              filter: 'drop-shadow(-4px 0 10px rgba(0, 0, 0, 0.85))',
              zIndex: 25,
              display: 'flex',
              alignItems: 'center',
            }}>
              <div style={{
                width: 0,
                height: 0,
                borderTop: jeFullscreen && !zobrazitEditor ? '22px solid transparent' : '18px solid transparent',
                borderBottom: jeFullscreen && !zobrazitEditor ? '22px solid transparent' : '18px solid transparent',
                borderRight: jeFullscreen && !zobrazitEditor ? '42px solid #facc15' : '34px solid #facc15',
              }} />
            </div>
          </div>

          {/* TLAČÍTKO ROZTOČIT KOLO */}
          <div style={{
            marginTop: jeFullscreen ? '14px' : '20px',
            width: '100%',
            maxWidth: jeFullscreen && !zobrazitEditor ? '380px' : '340px'
          }}>
            <button
              onClick={roztocitKolo}
              disabled={tociSe || polozky.length < 2}
              className="btn btn-pink"
              style={{
                width: '100%',
                padding: jeFullscreen && !zobrazitEditor ? '16px 24px' : '14px 20px',
                fontSize: jeFullscreen && !zobrazitEditor ? '20px' : '17px',
                borderRadius: '16px',
                boxShadow: tociSe ? 'none' : '0 0 35px rgba(236, 72, 153, 0.45)',
                fontWeight: '800',
                letterSpacing: '0.5px',
              }}
            >
              <Sparkles size={jeFullscreen && !zobrazitEditor ? 22 : 18} />
              {tociSe ? 'ROZTÁČÍM...' : 'ROZTOČIT KOLO'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              nebo stiskni <kbd style={{ padding: '1px 5px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>Mezerník</kbd>
            </div>
          </div>
        </div>

        {/* PRAVÝ PANEL SE SEZNAMEM (VŽDY VEDLE KOLA, NIKDY POD NÍM) */}
        {zobrazitEditor && (
          <div style={{
            width: jeFullscreen ? '360px' : '100%',
            maxWidth: jeFullscreen ? '380px' : '400px',
            maxHeight: jeFullscreen ? 'calc(100vh - 100px)' : 'auto',
            overflowY: 'auto',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            padding: '20px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            flexShrink: 0,
            animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                Seznam položek ({polozky.length}):
              </label>
              <button
                onClick={() => setZobrazitEditor(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px'
                }}
                title="Zavřít panel položek"
              >
                <X size={14} />
                <span>Skrýt</span>
              </button>
            </div>

            {/* RYCHLÉ PŘEDVOLBY (ČÍSLA & TÁBOROVÉ ŠABLONY) */}
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button className="badge" onClick={() => nastavitCisla(8)} style={{ cursor: 'pointer' }}>1-8</button>
              <button className="badge" onClick={() => nastavitCisla(12)} style={{ cursor: 'pointer' }}>1-12</button>
              <button className="badge" onClick={() => nastavitCisla(20)} style={{ cursor: 'pointer' }}>1-20</button>
              <button className="badge" onClick={() => nastavitSablony('sluzby')} style={{ cursor: 'pointer' }}>Služby</button>
              <button className="badge" onClick={() => nastavitSablony('rozcvicka')} style={{ cursor: 'pointer' }}>Rozcvička</button>
              <button className="badge" onClick={() => nastavitSablony('odmeny')} style={{ cursor: 'pointer' }}>Odměny</button>
            </div>

            <textarea
              value={polozkyText}
              onChange={(e) => setPolozkyText(e.target.value)}
              disabled={tociSe}
              placeholder="Každé jméno nebo položka na samostatný řádek..."
              style={{
                height: jeFullscreen ? '220px' : '180px',
                resize: 'vertical',
                fontFamily: 'inherit',
                fontSize: '13px',
                borderRadius: '12px',
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
              }}
            />

            {/* HISTORIE PŘEDCHOZÍCH VÍTĚZŮ */}
            {historie.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    Předchozí vylosovaní:
                  </span>
                  <button
                    onClick={() => setHistorie([])}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Vymazat
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '100px', overflowY: 'auto' }}>
                  {historie.map((item, idx) => (
                    <span key={idx} className="badge badge-yellow" style={{ padding: '4px 8px', fontSize: '11px' }}>
                      #{historie.length - idx}: {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* VÍTĚZNÝ MODAL / KARTA S OSLAVOU */}
      {vitez && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
          animation: 'fadeIn 0.25s ease',
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            border: '2px solid #facc15',
            borderRadius: '24px',
            padding: '36px 32px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(250, 204, 21, 0.4), 0 20px 40px rgba(0,0,0,0.8)',
            animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '16px',
              background: 'rgba(250, 204, 21, 0.15)',
              borderRadius: '50%',
              marginBottom: '16px',
            }}>
              <Trophy size={42} color="#facc15" />
            </div>

            <div style={{
              fontSize: '13px',
              fontWeight: '800',
              color: '#facc15',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}>
              Vylosováno!
            </div>

            <div style={{
              fontSize: 'clamp(28px, 6vw, 42px)',
              fontWeight: '900',
              color: '#ffffff',
              letterSpacing: '-0.5px',
              lineHeight: '1.15',
              margin: '8px 0 24px 0',
              wordBreak: 'break-word',
              textShadow: '0 0 20px rgba(250, 204, 21, 0.5)',
            }}>
              {vitez}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={odebratViteze}
                className="btn btn-secondary"
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '700',
                  gap: '8px',
                }}
              >
                <Trash2 size={16} color="#ef4444" />
                <span>Odebrat z kola a pokračovat</span>
              </button>

              <button
                onClick={() => setVitez(null)}
                className="btn btn-primary"
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '700',
                }}
              >
                <RotateCw size={16} />
                <span>Ponechat v kole a točit znovu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
