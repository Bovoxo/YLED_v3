import { useState, useEffect, useRef } from 'react'
import {
  Timer, Play, Pause, RotateCcw, Maximize, Minimize, Volume2, VolumeX,
  CircleDot, SlidersHorizontal, Settings, X
} from 'lucide-react'

export default function CountdownTimer() {
  // Původně nastavená hodnota (pro tlačítko Reset a start)
  const [puvodniNastaveni, setPuvodniNastaveni] = useState(180)
  // Dynamická kapacita odpočtu (pro správný výpočet procent i po přidání/ubrání času)
  const [celkovyCas, setCelkovyCas] = useState(180)
  // Aktuálně zbývající čas v sekundách
  const [zbyvajiciSekundy, setZbyvajiciSekundy] = useState(180)
  const [bezi, setBezi] = useState(false)
  const [zvukPovolen, setZvukPovolen] = useState(true)
  const [jeFullscreen, setJeFullscreen] = useState(false)
  const [stylZobrazeni, setStylZobrazeni] = useState('kruh') // 'kruh' | 'lista'
  const [zobrazitNastaveni, setZobrazitNastaveni] = useState(false)
  const [vlastniMinuty, setVlastniMinuty] = useState('')
  const [vlastniSekundy, setVlastniSekundy] = useState('')

  const containerRef = useRef(null)
  const audioCtxRef = useRef(null)

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

  // Zvukový signál pro odpočítávání (krátké pípnutí v posledních 5 sekundách)
  const zahrajPipnuti = (vysoke = false) => {
    if (!zvukPovolen) return
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(vysoke ? 880 : 540, ctx.currentTime)

      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch (e) {}
  }

  // Zvuk konce (vítězná fanfára / gong)
  const zahrajKonec = () => {
    if (!zvukPovolen) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + i * 0.12)

        gain.gain.setValueAtTime(0.35, now + i * 0.12)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.6)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + i * 0.12)
        osc.stop(now + i * 0.12 + 0.6)
      })
    } catch (e) {}
  }

  // Běh časovače (přesný 1s interval)
  useEffect(() => {
    let interval = null
    if (bezi && zbyvajiciSekundy > 0) {
      interval = setInterval(() => {
        setZbyvajiciSekundy((prev) => {
          const novy = prev - 1

          // Zvukové varování pro posledních 5 sekund
          if (novy <= 5 && novy > 0) {
            zahrajPipnuti(novy === 1)
          } else if (novy === 0) {
            zahrajKonec()
          }

          return novy
        })
      }, 1000)
    } else if (zbyvajiciSekundy === 0 && bezi) {
      setBezi(false)
    }

    return () => clearInterval(interval)
  }, [bezi, zbyvajiciSekundy, zvukPovolen])

  // Formátování času: HH:MM:SS pokud je >= 1h, jinak MM:SS
  const formatCas = (celkemSekund) => {
    const h = Math.floor(celkemSekund / 3600)
    const m = Math.floor((celkemSekund % 3600) / 60)
    const s = celkemSekund % 60
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Start / Pauza / Znovu
  const startStop = () => {
    if (zbyvajiciSekundy === 0) {
      setZbyvajiciSekundy(puvodniNastaveni)
      setCelkovyCas(puvodniNastaveni)
    }
    setBezi((prev) => !prev)
  }

  // Reset do výchozího stavu
  const reset = () => {
    setBezi(false)
    setZbyvajiciSekundy(puvodniNastaveni)
    setCelkovyCas(puvodniNastaveni)
  }

  // Nastavení nového základního času (předvolby nebo formulář)
  const nastavitCas = (sekundy) => {
    setBezi(false)
    setPuvodniNastaveni(sekundy)
    setCelkovyCas(sekundy)
    setZbyvajiciSekundy(sekundy)
  }

  // Přidání / odebrání času během běhu i pauzy se správnou kalibrací čáry/kruhu
  const upravitCas = (rozdilSekund) => {
    setZbyvajiciSekundy((prevZbyva) => {
      // Pokud čas již vypršel a přidáváme čas, začneme novou periodu s přidaným časem
      if (prevZbyva === 0 && rozdilSekund > 0) {
        setCelkovyCas(rozdilSekund)
        return rozdilSekund
      }

      const novyZbyva = Math.max(0, prevZbyva + rozdilSekund)

      setCelkovyCas((prevCelkem) => {
        if (rozdilSekund > 0) {
          // Přidání času: celková kapacita se rozšíří o stejný rozdíl
          return Math.max(novyZbyva, prevCelkem + rozdilSekund)
        } else {
          // Ubrání času: celková kapacita se zkrátí o stejný rozdíl, ale nikdy pod zbývající čas
          return Math.max(novyZbyva, Math.max(1, prevCelkem + rozdilSekund))
        }
      })

      // Pokud časomíra neběží a ještě se neodpočítávalo, aktualizujeme i původní nastavení pro Reset
      if (!bezi && prevZbyva === celkovyCas) {
        setPuvodniNastaveni(novyZbyva)
      }

      return novyZbyva
    })
  }

  const pouzitVlastniCas = (e) => {
    e?.preventDefault()
    const m = parseInt(vlastniMinuty) || 0
    const s = parseInt(vlastniSekundy) || 0
    const celkem = m * 60 + s
    if (celkem > 0) {
      nastavitCas(celkem)
      setVlastniMinuty('')
      setVlastniSekundy('')
    }
  }

  // Přepnutí do režimu na celou obrazovku
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

  // Klávesové zkratky: Mezerník = Start/Pauza, R = Reset, F = Fullscreen, Šipky = +/- 1 min
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return

      if (e.code === 'Space') {
        e.preventDefault()
        startStop()
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        reset()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        upravitCas(60)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        upravitCas(-60)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zbyvajiciSekundy, celkovyCas, puvodniNastaveni, bezi])

  // Výpočet procent (vždy garantováno v rozmezí 0 - 100 %)
  const procenta = celkovyCas > 0
    ? Math.min(100, Math.max(0, (zbyvajiciSekundy / celkovyCas) * 100))
    : 0

  const vyprsel = zbyvajiciSekundy === 0
  const jeKriticky = zbyvajiciSekundy <= 10 && zbyvajiciSekundy > 0
  const jeVarovani = zbyvajiciSekundy <= 30 && zbyvajiciSekundy > 10

  // Dynamická barva podle zbývajícího času
  const barvaStavu = vyprsel
    ? '#ef4444'
    : jeKriticky
    ? '#ef4444'
    : jeVarovani
    ? '#f97316'
    : procenta < 40
    ? '#f59e0b'
    : '#38bdf8'

  // Parametry pro kruhový SVG ciferník
  const polomerKruhu = 120
  const obvodKruhu = 2 * Math.PI * polomerKruhu
  const strokeDashoffset = obvodKruhu * (1 - procenta / 100)

  return (
    <div
      ref={containerRef}
      className="glass-panel animate-fade-in"
      style={{
        maxWidth: jeFullscreen ? '100%' : '840px',
        width: '100%',
        margin: '0 auto',
        height: jeFullscreen ? '100vh' : 'auto',
        minHeight: jeFullscreen ? '100vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: jeFullscreen ? '#070b12' : undefined,
        borderRadius: jeFullscreen ? '0' : undefined,
        border: jeFullscreen ? 'none' : undefined,
        padding: jeFullscreen ? '16px 36px 20px 36px' : '28px',
        position: 'relative',
        userSelect: 'none',
        overflow: jeFullscreen ? 'hidden' : 'visible',
        boxSizing: 'border-box',
      }}
    >
      {/* HORNÍ LIŠTA: NÁZEV + PŘEPÍNAČ STYLU + ZVUK + FULLSCREEN */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: jeFullscreen ? '12px' : '20px',
        flexWrap: 'wrap',
        gap: '12px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '8px',
            background: `${barvaStavu}1a`,
            borderRadius: '12px',
            transition: 'background 0.3s ease',
          }}>
            <Timer size={22} color={barvaStavu} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
              Táborový odpočet
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
              Displej s dynamickou časomírou a zvukovými signály
            </p>
          </div>
        </div>

        {/* PRAVÉ RYCHLÉ VOLBY: STYL, ZVUK, PŘEDVOLBY (VE FULLSCREENU), FULLSCREEN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* PŘEPÍNAČ KRUH / LIŠTA */}
          <button
            onClick={() => setStylZobrazeni(stylZobrazeni === 'kruh' ? 'lista' : 'kruh')}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '10px', gap: '6px' }}
            title={stylZobrazeni === 'kruh' ? 'Přepnout na horizontální lištu' : 'Přepnout na kruhový ciferník'}
          >
            {stylZobrazeni === 'kruh' ? (
              <>
                <SlidersHorizontal size={14} />
                <span>Lišta</span>
              </>
            ) : (
              <>
                <CircleDot size={14} />
                <span>Ciferník</span>
              </>
            )}
          </button>

          {/* PŘEPÍNAČ ZVUKU */}
          <button
            onClick={() => setZvukPovolen(!zvukPovolen)}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '10px' }}
            title={zvukPovolen ? 'Ztlumit zvukové signály' : 'Zapnout zvuk'}
          >
            {zvukPovolen ? <Volume2 size={16} /> : <VolumeX size={16} color="var(--text-muted)" />}
          </button>

          {/* TLAČÍTKO NASTAVENÍ ČASU VE FULLSCREENU */}
          {jeFullscreen && (
            <button
              onClick={() => setZobrazitNastaveni(!zobrazitNastaveni)}
              className="btn btn-secondary"
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: '10px',
                backgroundColor: zobrazitNastaveni ? 'rgba(56, 189, 248, 0.25)' : undefined,
                borderColor: zobrazitNastaveni ? '#38bdf8' : undefined,
              }}
              title="Zobrazit / skrýt předvolby času"
            >
              <Settings size={15} />
              <span>Předvolby</span>
            </button>
          )}

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

      {/* HLAVNÍ DISPLEJ ČASOVAČE (VYUŽÍVÁ CELOU ŠÍŘKU I VÝŠKU VE FULLSCREENU) */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: vyprsel
          ? 'radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, rgba(0,0,0,0.4) 100%)'
          : jeKriticky
          ? 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(0,0,0,0.3) 100%)'
          : 'rgba(0, 0, 0, 0.35)',
        border: vyprsel
          ? '2px solid #ef4444'
          : jeKriticky
          ? '2px solid rgba(239, 68, 68, 0.7)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: jeFullscreen ? '28px' : '24px',
        padding: jeFullscreen ? '24px 30px' : '36px 20px',
        textAlign: 'center',
        marginBottom: jeFullscreen ? '16px' : '24px',
        boxShadow: vyprsel
          ? '0 0 60px rgba(239, 68, 68, 0.35), inset 0 0 30px rgba(239, 68, 68, 0.2)'
          : jeKriticky
          ? '0 0 40px rgba(239, 68, 68, 0.25)'
          : '0 8px 32px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.3s ease',
      }}>

        {/* VARIANT A: KRUHOVÝ CIFERNÍK */}
        {stylZobrazeni === 'kruh' ? (
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: jeFullscreen ? 'min(66vh, 640px)' : '340px',
            aspectRatio: '1 / 1',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg
              viewBox="0 0 280 280"
              style={{
                width: '100%',
                height: '100%',
                transform: 'rotate(-90deg)',
                overflow: 'visible',
              }}
            >
              {/* Podkladová šedá stopa kruhu */}
              <circle
                cx="140"
                cy="140"
                r={polomerKruhu}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="14"
                fill="none"
              />

              {/* Barevný ubývající kruhový oblouk */}
              <circle
                cx="140"
                cy="140"
                r={polomerKruhu}
                stroke={barvaStavu}
                strokeWidth="14"
                strokeDasharray={obvodKruhu}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                style={{
                  transition: 'stroke-dashoffset 0.35s ease, stroke 0.3s ease',
                  filter: `drop-shadow(0 0 14px ${barvaStavu}aa)`,
                }}
              />
            </svg>

            {/* Obsah uprostřed kruhu */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}>
              {/* STAVOVÝ ŠTÍTEK */}
              <div style={{ marginBottom: jeFullscreen ? '14px' : '8px' }}>
                {vyprsel ? (
                  <span className="badge badge-red" style={{ fontSize: jeFullscreen ? '16px' : '13px', padding: '5px 16px', fontWeight: '800' }}>
                    ČAS VYPRŠEL!
                  </span>
                ) : jeKriticky ? (
                  <span className="badge badge-red" style={{ fontSize: jeFullscreen ? '15px' : '12px', padding: '4px 14px', animation: 'pulse 1s infinite' }}>
                    POZOR! {zbyvajiciSekundy}s
                  </span>
                ) : bezi ? (
                  <span className="badge badge-blue" style={{ fontSize: jeFullscreen ? '13px' : '11px', padding: '3px 10px' }}>
                    BĚŽÍ
                  </span>
                ) : (
                  <span className="badge" style={{ fontSize: jeFullscreen ? '13px' : '11px', color: 'var(--text-muted)' }}>
                    PAUZA
                  </span>
                )}
              </div>

              {/* DIGITÁLNÍ ČÍSLICE */}
              <div style={{
                fontSize: jeFullscreen ? 'clamp(68px, 15vw, 125px)' : 'clamp(44px, 10vw, 64px)',
                fontWeight: '900',
                fontFamily: 'JetBrains Mono, monospace',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-2px',
                lineHeight: '1',
                color: barvaStavu,
                textShadow: `0 0 35px ${barvaStavu}80`,
                transition: 'color 0.3s ease',
              }}>
                {formatCas(zbyvajiciSekundy)}
              </div>

              {/* DETAIL: CELKOVÝ ČAS A PROCENTA */}
              <div style={{
                marginTop: jeFullscreen ? '16px' : '10px',
                fontSize: jeFullscreen ? '15px' : '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontVariantNumeric: 'tabular-nums',
              }}>
                <span>z {formatCas(celkovyCas)}</span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: barvaStavu, fontWeight: '800' }}>{Math.round(procenta)} %</span>
              </div>
            </div>
          </div>
        ) : (
          /* VARIANT B: LINEÁRNÍ DISPLEJ S VELKOU ČASOVOU LIŠTOU (ŠIROKOU NA CELÝ MONITOR) */
          <div style={{ width: '100%', maxWidth: jeFullscreen ? 'min(94vw, 1350px)' : '100%' }}>
            {/* DIGITÁLNÍ ČÍSLICE */}
            <div style={{
              fontSize: jeFullscreen ? 'clamp(95px, 22vw, 240px)' : 'clamp(60px, 14vw, 110px)',
              fontWeight: '900',
              fontFamily: 'JetBrains Mono, monospace',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-3px',
              lineHeight: '1',
              color: barvaStavu,
              textShadow: `0 0 45px ${barvaStavu}80`,
              transition: 'color 0.3s ease',
            }}>
              {formatCas(zbyvajiciSekundy)}
            </div>

            {/* STAVOVÁ ZPRÁVA */}
            <div style={{ marginTop: jeFullscreen ? '20px' : '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {vyprsel ? (
                <span className="badge badge-red" style={{ fontSize: jeFullscreen ? '16px' : '14px', padding: '6px 16px', fontWeight: '800' }}>
                  ČAS VYPRŠEL!
                </span>
              ) : jeKriticky ? (
                <span className="badge badge-red" style={{ fontSize: jeFullscreen ? '15px' : '13px', padding: '5px 14px' }}>
                  Posledních {zbyvajiciSekundy} sekund!
                </span>
              ) : bezi ? (
                <span className="badge badge-blue" style={{ fontSize: jeFullscreen ? '14px' : '12px' }}>Odpočítávání běží</span>
              ) : (
                <span className="badge" style={{ color: 'var(--text-muted)', fontSize: jeFullscreen ? '14px' : '12px' }}>Pozastaveno</span>
              )}

              <span style={{ fontSize: jeFullscreen ? '16px' : '13px', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', fontWeight: '700' }}>
                (z {formatCas(celkovyCas)} • {Math.round(procenta)} %)
              </span>
            </div>

            {/* ZLEPŠENÁ DYNAMICKÁ LIŠTA - ŠIROKÁ NA CELÝ MONITOR */}
            <div style={{
              height: jeFullscreen ? '22px' : '14px',
              width: '100%',
              maxWidth: jeFullscreen ? 'min(92vw, 1250px)' : '560px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '9999px',
              margin: jeFullscreen ? '36px auto 0 auto' : '24px auto 0 auto',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '3px',
            }}>
              <div style={{
                height: '100%',
                width: `${procenta}%`,
                borderRadius: '9999px',
                background: vyprsel
                  ? '#ef4444'
                  : jeKriticky
                  ? '#ef4444'
                  : `linear-gradient(90deg, ${barvaStavu} 0%, #38bdf8 100%)`,
                boxShadow: `0 0 20px ${barvaStavu}`,
                transition: 'width 0.35s ease, background 0.3s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* RYCHLÉ PŘIDÁVÁNÍ / UBRÁNÍ ČASU S AUTOMATICKÝM PŘIZPŮSOBENÍM ČÁRY */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: jeFullscreen ? '12px' : '8px',
        marginBottom: jeFullscreen ? '16px' : '20px',
        flexWrap: 'wrap',
        flexShrink: 0,
      }}>
        <button
          onClick={() => upravitCas(-60)}
          className="btn btn-secondary"
          style={{ padding: jeFullscreen ? '10px 18px' : '8px 14px', fontSize: jeFullscreen ? '15px' : '13px', borderRadius: '12px' }}
          title="Zkrátit čas o 1 minutu"
        >
          -1 min
        </button>
        <button
          onClick={() => upravitCas(-30)}
          className="btn btn-secondary"
          style={{ padding: jeFullscreen ? '10px 18px' : '8px 14px', fontSize: jeFullscreen ? '15px' : '13px', borderRadius: '12px' }}
          title="Zkrátit čas o 30 sekund"
        >
          -30 s
        </button>
        <button
          onClick={() => upravitCas(30)}
          className="btn btn-secondary"
          style={{ padding: jeFullscreen ? '10px 18px' : '8px 14px', fontSize: jeFullscreen ? '15px' : '13px', borderRadius: '12px' }}
          title="Přidat 30 sekund navíc"
        >
          +30 s
        </button>
        <button
          onClick={() => upravitCas(60)}
          className="btn btn-secondary"
          style={{ padding: jeFullscreen ? '10px 18px' : '8px 14px', fontSize: jeFullscreen ? '15px' : '13px', borderRadius: '12px' }}
          title="Přidat 1 minutu navíc"
        >
          +1 min
        </button>
        <button
          onClick={() => upravitCas(300)}
          className="btn btn-secondary"
          style={{ padding: jeFullscreen ? '10px 18px' : '8px 14px', fontSize: jeFullscreen ? '15px' : '13px', borderRadius: '12px' }}
          title="Přidat 5 minut navíc"
        >
          +5 min
        </button>
      </div>

      {/* HLAVNÍ OVLÁDACÍ TLAČÍTKA: START / PAUZA / RESET */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '14px',
        marginBottom: (!jeFullscreen || zobrazitNastaveni) ? '20px' : '6px',
        flexWrap: 'wrap',
        flexShrink: 0
      }}>
        <button
          onClick={startStop}
          className={`btn ${bezi ? 'btn-danger' : 'btn-primary'}`}
          style={{
            padding: jeFullscreen ? '18px 48px' : '16px 40px',
            fontSize: jeFullscreen ? '20px' : '18px',
            borderRadius: '16px',
            minWidth: jeFullscreen ? '200px' : '180px',
            boxShadow: bezi ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.2s ease',
            fontWeight: '800',
          }}
        >
          {bezi ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
          {bezi ? 'PAUZA' : vyprsel ? 'ZNOVU' : 'START'}
        </button>

        <button
          onClick={reset}
          className="btn btn-secondary"
          style={{ padding: jeFullscreen ? '18px 30px' : '16px 26px', borderRadius: '16px', fontSize: jeFullscreen ? '16px' : '14px' }}
          title="Resetovat na výchozí hodnotu [R]"
        >
          <RotateCcw size={20} />
          <span>Reset</span>
        </button>
      </div>

      {/* VLASTNÍ ČAS A PŘEDVOLBY (VŽDY VIDITELNÉ V BĚŽNÉM REŽIMU, VE FULLSCREENU PODLE VOLBY) */}
      {(!jeFullscreen || zobrazitNastaveni) && (
        <div style={{
          background: jeFullscreen ? 'rgba(0,0,0,0.4)' : 'transparent',
          padding: jeFullscreen ? '14px 20px' : '0',
          borderRadius: '16px',
          border: jeFullscreen ? '1px solid rgba(255,255,255,0.08)' : 'none',
          marginBottom: '10px',
          animation: 'fadeIn 0.2s ease',
          flexShrink: 0,
        }}>
          {/* VLASTNÍ ČASOVÉ ZADÁNÍ */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '14px',
            flexWrap: 'wrap',
          }}>
            <form onSubmit={pouzitVlastniCas} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Vlastní čas:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  min="0"
                  max="999"
                  placeholder="0 min"
                  value={vlastniMinuty}
                  onChange={(e) => setVlastniMinuty(e.target.value)}
                  style={{ width: '84px', textAlign: 'center', padding: '8px', fontSize: '14px', borderRadius: '10px' }}
                />
                <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="00 s"
                  value={vlastniSekundy}
                  onChange={(e) => setVlastniSekundy(e.target.value)}
                  style={{ width: '84px', textAlign: 'center', padding: '8px', fontSize: '14px', borderRadius: '10px' }}
                />
              </div>
              <button type="submit" className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '10px' }}>
                Nastavit
              </button>
            </form>
          </div>

          {/* PŘEDVOLBY ČASU */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            background: 'rgba(0,0,0,0.2)',
            padding: '10px 14px',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginRight: '4px' }}>
              Předvolby:
            </span>
            {[
              { label: '30s', s: 30 },
              { label: '1 min', s: 60 },
              { label: '2 min', s: 120 },
              { label: '3 min', s: 180 },
              { label: '5 min', s: 300 },
              { label: '10 min', s: 600 },
              { label: '15 min', s: 900 },
              { label: '20 min', s: 1200 },
              { label: '30 min', s: 1800 },
              { label: '45 min', s: 2700 },
              { label: '60 min', s: 3600 },
            ].map((p) => {
              const isSelected = puvodniNastaveni === p.s && !bezi
              return (
                <button
                  key={p.s}
                  type="button"
                  className="badge"
                  onClick={() => nastavitCas(p.s)}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(56, 189, 248, 0.25)' : undefined,
                    borderColor: isSelected ? '#38bdf8' : undefined,
                    color: isSelected ? '#ffffff' : undefined,
                    fontWeight: isSelected ? '700' : '500',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* NÁPOVĚDA KLÁVESOVÝCH ZKRATEK */}
      <div style={{
        textAlign: 'center',
        fontSize: '11px',
        color: 'var(--text-muted)',
        flexShrink: 0,
      }}>
        Zkratky: <kbd style={{ padding: '2px 5px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>Mezerník</kbd> Start/Pauza • <kbd style={{ padding: '2px 5px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>R</kbd> Reset • <kbd style={{ padding: '2px 5px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>F</kbd> Celá obrazovka • <kbd style={{ padding: '2px 5px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>↑ / ↓</kbd> ±1 min
      </div>
    </div>
  )
}
