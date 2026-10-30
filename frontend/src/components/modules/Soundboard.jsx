import { useState, useRef, useEffect } from 'react'
import localforage from 'localforage'
import {
  Volume2, VolumeX, Square, ChevronLeft, ChevronRight, Settings, Upload, Trash2, Check,
  CloudUpload, CloudDownload, Search, Download, FolderUp, Edit3, Sparkles, Sliders,
  Play, Pause, Flame, Bell, Music, AlertTriangle, Zap, Trophy, Heart, Smile, Clock, Skull,
  PartyPopper, Shield, Star
} from 'lucide-react'

// Ikony pro tlačítka
const IKONY = {
  bell: Bell,
  flame: Flame,
  music: Music,
  alert: AlertTriangle,
  zap: Zap,
  trophy: Trophy,
  heart: Heart,
  smile: Smile,
  clock: Clock,
  sparkles: Sparkles,
  skull: Skull,
  volume: Volume2,
  party: PartyPopper,
  shield: Shield,
  star: Star,
}

// Paleta doporučených zářivých barev
const PALETA_BAREV = [
  { nazev: 'Smaragdová', hex: '#10b981' },
  { nazev: 'Královská modrá', hex: '#3b82f6' },
  { nazev: 'Neonová fialová', hex: '#8b5cf6' },
  { nazev: 'Ohnivá oranžová', hex: '#f97316' },
  { nazev: 'Karmínová', hex: '#ef4444' },
  { nazev: 'Zlatá žlutá', hex: '#f59e0b' },
  { nazev: 'Tyrkysová', hex: '#06b6d4' },
  { nazev: 'Růžová', hex: '#ec4899' },
  { nazev: 'Břidlicová', hex: '#334155' },
]

const formatCas = (sekundy) => {
  if (isNaN(sekundy) || !isFinite(sekundy)) return '0:00'
  const m = Math.floor(sekundy / 60)
  const s = Math.floor(sekundy % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export default function Soundboard() {
  const [stranka, setStranka] = useState(0)
  const MAX_TLACITEK = 72 // 3 stránky po 24 tlačítkách

  // Názvy stránek
  const [nazvyStranek, setNazvyStranek] = useState([
    'Ranní nástup a znělky',
    'Hry a scénky',
    'Memy a efekty'
  ])
  const [editovanyNazevStranky, setEditovanyNazevStranky] = useState(null)

  // Globální a master hlasitost
  const [masterVolume, setMasterVolume] = useState(1.0)
  const [mute, setMute] = useState(false)

  // Vyhledávání
  const [hledanyText, setHledanyText] = useState('')

  // Základní mřížka
  const getInitialGrid = () => {
    const grid = Array(MAX_TLACITEK).fill(null).map((_, i) => ({
      url: null,
      fileBlob: null,
      name: 'Prázdné',
      color: '#334155',
      icon: null,
      start: 0,
      end: 0,
      volume: 1.0,
      mode: 'restart', // 'restart' | 'overlap'
      hotkey: i < 8 ? String(i + 1) : null,
      playing: false,
    }))

    const predpripraveneZvuky = [
      { file: 'circus.mp3', name: 'Cirkus', color: '#f59e0b', icon: 'party' },
      { file: 'crickets.mp3', name: 'Cvrčci', color: '#10b981', icon: 'clock' },
      { file: 'crowd_clapping.mp3', name: 'Potlesk', color: '#3b82f6', icon: 'trophy' },
      { file: 'error.mp3', name: 'Error', color: '#ef4444', icon: 'alert' },
      { file: 'fah.mp3', name: 'Fah', color: '#8b5cf6', icon: 'zap' },
      { file: 'incorrect.mp3', name: 'Špatně', color: '#ef4444', icon: 'skull' },
      { file: 'iphone_ringtone.mp3', name: 'iPhone Zvonění', color: '#3b82f6', icon: 'bell' },
      { file: 'iphone_text.mp3', name: 'iPhone SMS', color: '#3b82f6', icon: 'bell' },
      { file: 'love_song.mp3', name: 'Love Song', color: '#ec4899', icon: 'heart' },
      { file: 'meaw.MP3', name: 'Mňau', color: '#f59e0b', icon: 'smile' },
      { file: 'rick_roll.mp3', name: 'Rick Roll', color: '#8b5cf6', icon: 'music' },
      { file: 'rizzt.mp3', name: 'Rizzt', color: '#10b981', icon: 'sparkles' },
      { file: 'run.mp3', name: 'Run!', color: '#ef4444', icon: 'flame' },
      { file: 'sad_violin.mp3', name: 'Sad Violin', color: '#3b82f6', icon: 'music' },
      { file: 'titanic.mp3', name: 'Titanic', color: '#06b6d4', icon: 'music' },
      { file: 'wah_wah_wahwah.mp3', name: 'Wah Wah...', color: '#ef4444', icon: 'skull' },
      { file: 'zvonek.mp3', name: 'Zvonek', color: '#f59e0b', icon: 'bell' },
    ]

    predpripraveneZvuky.forEach((zvuk, index) => {
      if (index < MAX_TLACITEK) {
        grid[index] = {
          ...grid[index],
          url: `/zvuky/${zvuk.file}`,
          name: zvuk.name,
          color: zvuk.color,
          icon: zvuk.icon,
          volume: 1.0,
          mode: 'restart',
        }
      }
    })

    return grid
  }

  const [tlacitka, setTlacitka] = useState(getInitialGrid)
  const [nacteno, setNacteno] = useState(false)
  const [casy, setCasy] = useState({})
  const [delkyAudii, setDelkyAudii] = useState({})
  const [dragOverIndex, setDragOverIndex] = useState(null)

  // Sledování všech aktivních audio instancí (i více současně pro mód překrývání)
  const activeAudiosRef = useRef({})

  const getActiveSet = (index) => {
    if (!activeAudiosRef.current[index]) {
      activeAudiosRef.current[index] = new Set()
    }
    return activeAudiosRef.current[index]
  }

  const [editIndex, setEditIndex] = useState(null)
  const [syncStatus, setSyncStatus] = useState('')

  // 1. NAČTENÍ DAT Z LOCALFORAGE
  useEffect(() => {
    localforage.getItem('soundboard_data_v3_plus').then((ulozenaData) => {
      const defaultGrid = getInitialGrid()
      if (ulozenaData) {
        if (ulozenaData.buttons) {
          const obnovena = defaultGrid.map((defBtn, i) => {
            const saved = ulozenaData.buttons[i]
            if (!saved) return defBtn
            return {
              ...defBtn,
              ...saved,
              url: saved.fileBlob ? URL.createObjectURL(saved.fileBlob) : saved.url || defBtn.url,
              playing: false
            }
          })
          setTlacitka(obnovena)
          if (ulozenaData.pageNames) setNazvyStranek(ulozenaData.pageNames)
          if (ulozenaData.masterVolume !== undefined) setMasterVolume(ulozenaData.masterVolume)
        } else if (Array.isArray(ulozenaData)) {
          // Zpětná kompatibilita se starším formátem pole
          const obnovena = defaultGrid.map((defBtn, i) => {
            const saved = ulozenaData[i]
            if (!saved) return defBtn
            return { ...defBtn, ...saved, playing: false }
          })
          setTlacitka(obnovena)
        }
      }
      setNacteno(true)
    })
  }, [])

  // 2. ULOŽENÍ PŘI ZMĚNĚ
  useEffect(() => {
    if (nacteno) {
      const kUlozeniButtons = tlacitka.map(({ url, playing, ...zbytek }) => zbytek)
      localforage.setItem('soundboard_data_v3_plus', {
        buttons: kUlozeniButtons,
        pageNames: nazvyStranek,
        masterVolume: masterVolume,
      })
    }
  }, [tlacitka, nazvyStranek, masterVolume, nacteno])

  // Živá změna hlasitosti na všech aktivně hrajících instancích při změně Master Volume nebo Mute
  useEffect(() => {
    Object.keys(activeAudiosRef.current).forEach((key) => {
      const idx = parseInt(key)
      const activeSet = activeAudiosRef.current[idx]
      if (activeSet && activeSet.size > 0) {
        const btn = tlacitka[idx]
        const btnVol = btn?.volume ?? 1.0
        const targetVol = mute ? 0 : Math.min(1.0, btnVol * masterVolume)
        activeSet.forEach((audio) => {
          try {
            audio.volume = targetVol
          } catch (e) {}
        })
      }
    })
  }, [masterVolume, mute, tlacitka])

  // Úklid při odchodu ze stránky
  useEffect(() => {
    return () => {
      Object.keys(activeAudiosRef.current).forEach((key) => {
        const idx = parseInt(key)
        const activeSet = activeAudiosRef.current[idx]
        if (activeSet) {
          activeSet.forEach((audio) => {
            try {
              audio.pause()
            } catch (e) {}
          })
          activeSet.clear()
        }
      })
    }
  }, [])

  // Plynulé ztišení zvuku (Fade-out) pro všechny instance daného tlačítka (i v overlap módu)
  const fadeOutAndStop = (index, duration = 250) => {
    const activeSet = getActiveSet(index)
    if (!activeSet || activeSet.size === 0) {
      setTlacitka((prev) => {
        if (!prev[index]?.playing) return prev
        const novy = [...prev]
        novy[index] = { ...novy[index], playing: false }
        return novy
      })
      setCasy((prev) => ({ ...prev, [index]: null }))
      return
    }

    // Vezmeme všechny instance, které momentálně hrají pro toto tlačítko
    const audiosToStop = Array.from(activeSet)
    activeSet.clear()

    const initialVols = audiosToStop.map((a) => a.volume)
    const steps = 10
    const stepTime = Math.max(10, Math.floor(duration / steps))
    let currentStep = 0

    // Okamžitě vypneme indikaci na tlačítku
    setTlacitka((prev) => {
      const novy = [...prev]
      if (novy[index]) novy[index] = { ...novy[index], playing: false }
      return novy
    })
    setCasy((prev) => ({ ...prev, [index]: null }))

    const interval = setInterval(() => {
      currentStep++
      const factor = Math.max(0, 1 - currentStep / steps)

      audiosToStop.forEach((audio, i) => {
        try {
          audio.volume = initialVols[i] * factor
        } catch (e) {}
      })

      if (currentStep >= steps) {
        clearInterval(interval)
        audiosToStop.forEach((audio) => {
          try {
            audio.pause()
            audio.currentTime = tlacitka[index]?.start || 0
          } catch (e) {}
        })
      }
    }, stepTime)
  }

  // Přehrání zvuku
  const prehraj = (index) => {
    const btn = tlacitka[index]
    if (!btn || !btn.url) return

    const vypoctenaHlasitost = mute ? 0 : Math.min(1.0, (btn.volume ?? 1.0) * masterVolume)
    const activeSet = getActiveSet(index)

    // REŽIM OVERLAP: Vytvoří nezávislou instanci zvuku, která se vrství přes sebe
    if (btn.mode === 'overlap') {
      const audioInstance = new Audio(btn.url)
      audioInstance.volume = vypoctenaHlasitost
      audioInstance.currentTime = btn.start || 0
      activeSet.add(audioInstance)

      audioInstance.onloadedmetadata = () => {
        setDelkyAudii((prev) => ({ ...prev, [index]: audioInstance.duration }))
      }

      audioInstance.ontimeupdate = () => {
        const aktualni = audioInstance.currentTime
        const konec = btn.end > 0 ? btn.end : (audioInstance.duration || 0)
        const zbyva = Math.max(0, konec - aktualni)
        const delkaTrvani = Math.max(0.1, konec - (btn.start || 0))
        const odehrano = Math.max(0, aktualni - (btn.start || 0))
        const procenta = Math.min(100, (odehrano / delkaTrvani) * 100)

        setCasy((prev) => ({ ...prev, [index]: { zbyva, aktualni, procenta } }))

        if (btn.end > 0 && aktualni >= btn.end) {
          try {
            audioInstance.pause()
          } catch (e) {}
          activeSet.delete(audioInstance)
          if (activeSet.size === 0) {
            setTlacitka((prev) => {
              const novy = [...prev]
              if (novy[index]) novy[index] = { ...novy[index], playing: false }
              return novy
            })
            setCasy((prev) => ({ ...prev, [index]: null }))
          }
        }
      }

      audioInstance.onended = () => {
        activeSet.delete(audioInstance)
        if (activeSet.size === 0) {
          setTlacitka((prev) => {
            const novy = [...prev]
            if (novy[index]) novy[index] = { ...novy[index], playing: false }
            return novy
          })
          setCasy((prev) => ({ ...prev, [index]: null }))
        }
      }

      audioInstance.play().catch(() => {})

      setTlacitka((prev) => {
        const novy = [...prev]
        novy[index] = { ...novy[index], playing: true }
        return novy
      })
      return
    }

    // REŽIM RESTART: Pokud už pro toto tlačítko hraje zvuk, okamžitě ho zastavíme
    activeSet.forEach((oldAudio) => {
      try {
        oldAudio.pause()
        oldAudio.currentTime = 0
      } catch (e) {}
    })
    activeSet.clear()

    const audio = new Audio(btn.url)
    activeSet.add(audio)

    audio.onloadedmetadata = () => {
      setDelkyAudii((prev) => ({ ...prev, [index]: audio.duration }))
    }

    audio.ontimeupdate = () => {
      const aktualni = audio.currentTime
      const konec = btn.end > 0 ? btn.end : (audio.duration || 0)
      const zbyva = Math.max(0, konec - aktualni)
      const delkaTrvani = Math.max(0.1, konec - (btn.start || 0))
      const odehrano = Math.max(0, aktualni - (btn.start || 0))
      const procenta = Math.min(100, (odehrano / delkaTrvani) * 100)

      setCasy((prev) => ({ ...prev, [index]: { zbyva, aktualni, procenta } }))

      if (btn.end > 0 && aktualni >= btn.end) {
        zastav(index)
      }
    }

    audio.onended = () => {
      activeSet.delete(audio)
      if (activeSet.size === 0) {
        setTlacitka((prev) => {
          const novy = [...prev]
          if (novy[index]) novy[index] = { ...novy[index], playing: false }
          return novy
        })
        setCasy((prev) => ({ ...prev, [index]: null }))
      }
    }

    audio.volume = vypoctenaHlasitost
    audio.currentTime = btn.start || 0
    audio.play().catch(() => {})

    setTlacitka((prev) => {
      const novy = [...prev]
      novy[index] = { ...novy[index], playing: true }
      return novy
    })
  }

  // Zastavení jednoho tlačítka (všech jeho běžících instancí)
  const zastav = (index, okamzite = false) => {
    if (okamzite) {
      const activeSet = getActiveSet(index)
      activeSet.forEach((audio) => {
        try {
          audio.pause()
          audio.currentTime = tlacitka[index]?.start || 0
        } catch (e) {}
      })
      activeSet.clear()

      setTlacitka((prev) => {
        const novy = [...prev]
        if (novy[index]) novy[index] = { ...novy[index], playing: false }
        return novy
      })
      setCasy((prev) => ({ ...prev, [index]: null }))
    } else {
      fadeOutAndStop(index)
    }
  }

  // Zastavit všechna tlačítka (PANIC BUTTON i mezerník)
  const stopAll = () => {
    Object.keys(activeAudiosRef.current).forEach((key) => {
      const idx = parseInt(key)
      const activeSet = activeAudiosRef.current[idx]
      if (activeSet && activeSet.size > 0) {
        fadeOutAndStop(idx, 200)
      }
    })

    // Pojistka pro vyčištění vizuálního stavu
    setTlacitka((prev) => prev.map((b) => (b.playing ? { ...b, playing: false } : b)))
    setCasy({})
  }

  // Klávesové zkratky (1-8 pro prvních 8 tlačítek na aktivní stránce, Space = STOP ALL)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorovat když píše do inputu nebo textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return

      if (e.code === 'Space') {
        e.preventDefault()
        stopAll()
        return
      }

      if (e.key === 'ArrowLeft') {
        setStranka((p) => Math.max(0, p - 1))
        return
      }
      if (e.key === 'ArrowRight') {
        setStranka((p) => Math.min(2, p + 1))
        return
      }

      const cislo = parseInt(e.key)
      if (!isNaN(cislo) && cislo >= 1 && cislo <= 8) {
        const targetIdx = stranka * 24 + (cislo - 1)
        if (tlacitka[targetIdx]?.url) {
          prehraj(targetIdx)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stranka, tlacitka, masterVolume, mute])

  // Nahrání vlastního souboru (z dialogu i přes Drag & Drop)
  const zpracovatSoubor = async (index, file) => {
    if (!file) return

    const cistyNazev = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
    const localUrl = URL.createObjectURL(file)

    setTlacitka((prev) => {
      const novy = [...prev]
      novy[index] = {
        ...novy[index],
        url: localUrl,
        fileBlob: file,
        name: cistyNazev,
        color: novy[index].color === '#334155' ? '#3b82f6' : novy[index].color,
        start: 0,
        end: 0,
        volume: 1.0,
        playing: false,
      }
      return novy
    })

    // Uložení na server do /zvuky
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('custom_name', cistyNazev)

      const res = await fetch('/api/zvuky/nahrat', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setTlacitka((prev) => {
          const novy = [...prev]
          novy[index] = {
            ...novy[index],
            url: data.url,
            fileBlob: null,
          }
          return novy
        })
      }
    } catch (err) {
      console.warn('Uloženo dočasně v paměti prohlížeče:', err)
    }
  }

  // Smazání tlačítka
  const smazatTlacitko = (index) => {
    zastav(index, true)
    setTlacitka((prev) => {
      const novy = [...prev]
      novy[index] = {
        url: null,
        fileBlob: null,
        name: 'Prázdné',
        color: '#334155',
        icon: null,
        start: 0,
        end: 0,
        volume: 1.0,
        mode: 'restart',
        hotkey: index % 24 < 8 ? String((index % 24) + 1) : null,
        playing: false,
      }
      return novy
    })
    setEditIndex(null)
  }

  // Synchronizace se serverem
  const ulozitNaServer = async () => {
    try {
      setSyncStatus('Ukládám...')
      const dataToSave = tlacitka.map(({ url, name, color, icon, start, end, volume, mode, hotkey }) => ({
        url, name, color, icon, start, end, volume: volume ?? 1.0, mode: mode || 'restart', hotkey, playing: false
      }))

      const res = await fetch('/api/soundboard/konfigurace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buttons: dataToSave,
          pageNames: nazvyStranek,
          masterVolume: masterVolume,
        })
      })

      if (res.ok) {
        setSyncStatus('Uloženo na server.')
        setTimeout(() => setSyncStatus(''), 2500)
      } else {
        setSyncStatus('Chyba při ukládání.')
      }
    } catch {
      setSyncStatus('Backend nedostupný.')
    }
  }

  const nacistZeServeru = async () => {
    try {
      setSyncStatus('Načítám...')
      const res = await fetch('/api/soundboard/konfigurace')
      const data = await res.json()
      if (data.status === 'ok' && data.config?.buttons) {
        stopAll()
        setTlacitka(data.config.buttons)
        if (data.config.pageNames) setNazvyStranek(data.config.pageNames)
        if (data.config.masterVolume !== undefined) setMasterVolume(data.config.masterVolume)
        setSyncStatus('Načteno ze serveru.')
        setTimeout(() => setSyncStatus(''), 2500)
      } else {
        setSyncStatus('Na serveru není uložena konfigurace.')
        setTimeout(() => setSyncStatus(''), 2500)
      }
    } catch {
      setSyncStatus('Backend nedostupný.')
    }
  }

  // Export konfigurace jako JSON záloha
  const exportovatZalohu = () => {
    const kExportu = {
      nazvyStranek,
      masterVolume,
      tlacitka: tlacitka.map(({ url, fileBlob, playing, ...zbytek }) => ({
        ...zbytek,
        url: url && url.startsWith('http') ? url : url
      }))
    }
    const blob = new Blob([JSON.stringify(kExportu, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `soundboard_backup_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // Import JSON zálohy
  const importovatZalohu = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importData = JSON.parse(event.target.result)
        if (importData.tlacitka && Array.isArray(importData.tlacitka)) {
          stopAll()
          setTlacitka(importData.tlacitka)
          if (importData.nazvyStranek) setNazvyStranek(importData.nazvyStranek)
          if (importData.masterVolume !== undefined) setMasterVolume(importData.masterVolume)
          setSyncStatus('Záloha úspěšně importována.')
          setTimeout(() => setSyncStatus(''), 3000)
        }
      } catch (err) {
        alert('Neplatný formát souboru zálohy.')
      }
    }
    reader.readAsText(file)
  }

  // Filtrovaná tlačítka při vyhledávání
  const filtrovanaTlacitka = hledanyText.trim()
    ? tlacitka.map((btn, idx) => ({ ...btn, originalIndex: idx })).filter((b) =>
        b.url && b.name.toLowerCase().includes(hledanyText.toLowerCase())
      )
    : null

  return (
    <div className="glass-panel animate-fade-in" style={{ width: '100%', overflowX: 'auto' }}>
      
      {/* ZÁHLAVÍ & MASTER VOLUME */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(249, 115, 22, 0.12)', borderRadius: '14px' }}>
            <Volume2 size={26} color="#f97316" />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
              Soundboard Studio
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
              Klávesové zkratky [1-8], fade-out a podpora drag & drop
            </p>
          </div>
        </div>

        {/* MASTER VOLUME SLIDER */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0,0,0,0.25)',
          padding: '8px 16px',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <button
            onClick={() => setMute(!mute)}
            style={{ background: 'none', border: 'none', color: mute ? '#ef4444' : '#ffffff', cursor: 'pointer', padding: 0 }}
            title={mute ? 'Ztlumeno (klikni pro zapnutí zvuku)' : 'Ztlumit vše'}
          >
            {mute ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Master:</span>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={mute ? 0 : masterVolume}
            onChange={(e) => {
              setMasterVolume(parseFloat(e.target.value))
              if (mute) setMute(false)
            }}
            style={{ width: '100px', accentColor: '#f97316', cursor: 'pointer' }}
          />

          <span style={{ fontSize: '12px', fontWeight: '700', width: '36px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {mute ? '0%' : `${Math.round(masterVolume * 100)}%`}
          </span>
        </div>
      </div>

      {/* DRUHÝ ŘÁDEK: ZÁLOŽKY STRÁNEK, HLEDÁNÍ & SYNCHRONIZACE */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {/* ZÁLOŽKY STRÁNEK */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[0, 1, 2].map((idx) => {
            const isSelected = stranka === idx && !hledanyText
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => {
                  setStranka(idx)
                  setHledanyText('')
                }}
              >
                {editovanyNazevStranky === idx ? (
                  <input
                    type="text"
                    value={nazvyStranek[idx]}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const novy = [...nazvyStranek]
                      novy[idx] = e.target.value
                      setNazvyStranek(novy)
                    }}
                    onBlur={() => setEditovanyNazevStranky(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditovanyNazevStranky(null)}
                    style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '13px', color: '#fff', width: '130px' }}
                  />
                ) : (
                  <span style={{ fontSize: '13px', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                    {nazvyStranek[idx] || `Stránka ${idx + 1}`}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditovanyNazevStranky(editovanyNazevStranky === idx ? null : idx)
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                  title="Přejmenovat kategorii"
                >
                  <Edit3 size={11} />
                </button>
              </div>
            )
          })}
        </div>

        {/* HLEDACÍ POLÍČKO A SYNCHRONIZACE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Filtrovat zvuky..."
              value={hledanyText}
              onChange={(e) => setHledanyText(e.target.value)}
              style={{
                padding: '6px 10px 6px 30px',
                fontSize: '13px',
                width: '160px',
                borderRadius: '10px',
              }}
            />
          </div>

          {syncStatus && <span style={{ fontSize: '12px', fontWeight: '600', color: '#38bdf8' }}>{syncStatus}</span>}

          <button
            onClick={ulozitNaServer}
            title="Uložit rozložení na server (bude dostupné i na mobilu)"
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <CloudUpload size={13} /> Uložit
          </button>

          <button
            onClick={nacistZeServeru}
            title="Načíst rozložení ze serveru"
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <CloudDownload size={13} /> Načíst
          </button>

          <button
            onClick={exportovatZalohu}
            title="Exportovat konfiguraci jako JSON soubor"
            className="btn btn-secondary"
            style={{ padding: '6px 10px' }}
          >
            <Download size={13} />
          </button>

          <label
            title="Importovat JSON konfiguraci ze souboru"
            className="btn btn-secondary"
            style={{ padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <FolderUp size={13} />
            <input type="file" accept=".json" onChange={importovatZalohu} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* MŘÍŽKA TLAČÍTEK (STREAM DECK / LAUNCHPAD STYL) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {(filtrovanaTlacitka || tlacitka.slice(stranka * 24, (stranka + 1) * 24)).map((btn, localIdx) => {
          const index = filtrovanaTlacitka ? btn.originalIndex : stranka * 24 + localIdx
          const zobrazenyCas = casy[index]
          const celkovyCas = delkyAudii[index] || 0
          const startCas = btn.start || 0
          const konecCas = btn.end > 0 ? btn.end : celkovyCas
          const zbyvaCelkem = Math.max(0, konecCas - startCas)
          const textOdpocet = btn.playing && zobrazenyCas
            ? `-${formatCas(zobrazenyCas.zbyva)}`
            : `-${formatCas(zbyvaCelkem)}`

          const IconComponent = btn.icon && IKONY[btn.icon] ? IKONY[btn.icon] : null
          const isDragTarget = dragOverIndex === index

          return (
            <div
              key={index}
              onClick={() => btn.url && prehraj(index)}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverIndex(index)
              }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOverIndex(null)
                if (e.dataTransfer.files?.[0]) {
                  zpracovatSoubor(index, e.dataTransfer.files[0])
                }
              }}
              style={{
                position: 'relative',
                height: '142px',
                borderRadius: '16px',
                backgroundColor: btn.playing
                  ? `${btn.color}35`
                  : isDragTarget
                  ? 'rgba(59, 130, 246, 0.3)'
                  : btn.url
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 0, 0, 0.25)',
                border: isDragTarget
                  ? '2px dashed #38bdf8'
                  : `2px solid ${btn.url ? btn.color : 'rgba(255, 255, 255, 0.08)'}`,
                boxShadow: btn.playing
                  ? `0 0 25px ${btn.color}99, inset 0 0 15px ${btn.color}40`
                  : '0 4px 12px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                cursor: btn.url ? 'pointer' : 'default',
                overflow: 'hidden',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                userSelect: 'none',
              }}
            >
              {/* ŽIVÝ PROGRESS BAR NA POZADÍ PŘI PŘEHRÁVÁNÍ */}
              {btn.playing && zobrazenyCas && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '4px',
                  width: `${zobrazenyCas.procenta || 0}%`,
                  backgroundColor: btn.color || '#38bdf8',
                  boxShadow: `0 0 8px ${btn.color}`,
                  transition: 'width 0.1s linear',
                  zIndex: 2,
                }} />
              )}

              {/* HORNÍ LIŠTA: HOTKEY BADGE + NASTAVENÍ + ČASOVÝ ODPOČET */}
              <div style={{
                height: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 8px 0 8px',
                fontSize: '11px',
                fontWeight: '700',
                fontVariantNumeric: 'tabular-nums',
                zIndex: 3,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {/* HOTKEY INDIKÁTOR [1-8] */}
                  {localIdx < 8 && !filtrovanaTlacitka && (
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      color: 'var(--text-secondary)',
                      fontFamily: 'monospace',
                    }}>
                      {localIdx + 1}
                    </span>
                  )}
                  {btn.url && (
                    <span style={{ color: 'var(--text-muted)' }}>{formatCas(btn.start)}</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {btn.url && (
                    <span style={{ color: btn.playing ? '#facc15' : '#f87171' }}>{textOdpocet}</span>
                  )}
                  {btn.url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditIndex(index)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Nastavení zvuku"
                    >
                      <Settings size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* STŘEDOVÁ ČÁST: IKONA + NÁZEV NEBO NAHRÁNÍ */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 10px',
                textAlign: 'center',
                gap: '4px',
                zIndex: 3,
              }}>
                {!btn.url ? (
                  <label
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      cursor: 'pointer',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px',
                      borderRadius: '8px',
                    }}
                  >
                    <Upload size={16} />
                    <span>Nahrát / Přetáhnout</span>
                    <input
                      type="file"
                      accept="audio/*"
                      style={{ display: 'none' }}
                      onChange={(e) => e.target.files?.[0] && zpracovatSoubor(index, e.target.files[0])}
                    />
                  </label>
                ) : (
                  <>
                    {IconComponent && (
                      <IconComponent size={22} color={btn.playing ? '#ffffff' : btn.color} style={{ filter: `drop-shadow(0 0 6px ${btn.color}80)` }} />
                    )}
                    <strong style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#ffffff',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.25',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    }}>
                      {btn.name}
                    </strong>
                  </>
                )}
              </div>

              {/* SPODNÍ STOP / PAUSE PROUŽEK */}
              {btn.url && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    zastav(index)
                  }}
                  style={{
                    height: '24px',
                    backgroundColor: btn.playing ? '#ef4444' : 'rgba(0, 0, 0, 0.45)',
                    color: btn.playing ? '#ffffff' : '#f87171',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '800',
                    fontSize: '10px',
                    letterSpacing: '0.6px',
                    transition: 'all 0.15s ease',
                    zIndex: 3,
                  }}
                >
                  {btn.playing ? 'STOP (FADE)' : 'STOP'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* STOP ALL PANIC BUTTON (KLÁVESA MEZERNÍK) */}
      <button
        onClick={stopAll}
        className="btn btn-danger"
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '16px',
          fontWeight: '800',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.35)',
        }}
      >
        <Square size={18} fill="currentColor" /> ZASTAVIT VŠECHNY ZVUKY (STOP ALL / MEZERNÍK)
      </button>

      {/* MODÁLNÍ OKNO NASTAVENÍ TLAČÍTKA */}
      {editIndex !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="#3b82f6" /> Nastavení zvuku #{editIndex + 1}
            </h3>

            {/* NÁZEV */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Název zvuku:</label>
              <input
                type="text"
                defaultValue={tlacitka[editIndex]?.name}
                id="editSoundName"
              />
            </div>

            {/* VÝBĚR BARVY TLAČÍTKA */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Barva tlačítka:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {PALETA_BAREV.map((b) => (
                  <button
                    key={b.hex}
                    type="button"
                    onClick={() => {
                      document.getElementById('editSoundColor').value = b.hex
                    }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: b.hex,
                      border: '1px solid rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    title={b.nazev}
                  />
                ))}
                <input
                  type="color"
                  defaultValue={tlacitka[editIndex]?.color || '#3b82f6'}
                  id="editSoundColor"
                  style={{ width: '30px', height: '26px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                  title="Vlastní barva"
                />
              </div>
            </div>

            {/* VÝBĚR IKONY */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Ikona:</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  id="selectedIconBtn"
                  onClick={(e) => {
                    document.querySelectorAll('.icon-choice-btn').forEach(btn => btn.style.border = '1px solid rgba(255,255,255,0.1)')
                    e.currentTarget.style.border = '2px solid #3b82f6'
                    document.getElementById('editSoundIcon').value = ''
                  }}
                  className="icon-choice-btn"
                  style={{ padding: '6px 10px', fontSize: '11px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: !tlacitka[editIndex]?.icon ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                >
                  Žádná
                </button>

                {Object.keys(IKONY).map((iconKey) => {
                  const IconComp = IKONY[iconKey]
                  const isCurrent = tlacitka[editIndex]?.icon === iconKey
                  return (
                    <button
                      key={iconKey}
                      type="button"
                      className="icon-choice-btn"
                      onClick={(e) => {
                        document.querySelectorAll('.icon-choice-btn').forEach(btn => btn.style.border = '1px solid rgba(255,255,255,0.1)')
                        e.currentTarget.style.border = '2px solid #3b82f6'
                        document.getElementById('editSoundIcon').value = iconKey
                      }}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: isCurrent ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={iconKey}
                    >
                      <IconComp size={16} color="#ffffff" />
                    </button>
                  )
                })}
                <input type="hidden" id="editSoundIcon" defaultValue={tlacitka[editIndex]?.icon || ''} />
              </div>
            </div>

            {/* OŘEZ ČASU */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Začátek (s):</label>
                <input
                  type="number"
                  step="0.1"
                  defaultValue={tlacitka[editIndex]?.start || 0}
                  id="editSoundStart"
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Konec (0 = celý):</label>
                <input
                  type="number"
                  step="0.1"
                  defaultValue={tlacitka[editIndex]?.end || 0}
                  id="editSoundEnd"
                />
              </div>
            </div>

            {/* HLASITOST & REŽIM PŘEHRÁVÁNÍ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Hlasitost zvuku:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="0.1"
                    max="1.5"
                    step="0.05"
                    defaultValue={tlacitka[editIndex]?.volume ?? 1.0}
                    id="editSoundVolume"
                    style={{ flex: 1, accentColor: '#3b82f6' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Režim spouštění:</label>
                <select id="editSoundMode" defaultValue={tlacitka[editIndex]?.mode || 'restart'} style={{ padding: '8px' }}>
                  <option value="restart">Restart (znovu od začátku)</option>
                  <option value="overlap">Překrývání (vrstvení)</option>
                </select>
              </div>
            </div>

            {/* AKČNÍ TLAČÍTKA */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setEditIndex(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Zrušit
              </button>
              <button
                onClick={() => smazatTlacitko(editIndex)}
                className="btn btn-danger"
                style={{ flex: 1 }}
              >
                <Trash2 size={14} /> Smazat
              </button>
              <button
                onClick={() => {
                  const name = document.getElementById('editSoundName').value
                  const color = document.getElementById('editSoundColor').value
                  const icon = document.getElementById('editSoundIcon').value || null
                  const start = parseFloat(document.getElementById('editSoundStart').value) || 0
                  const end = parseFloat(document.getElementById('editSoundEnd').value) || 0
                  const volume = parseFloat(document.getElementById('editSoundVolume').value) || 1.0
                  const mode = document.getElementById('editSoundMode').value || 'restart'

                  setTlacitka((prev) => {
                    const novy = [...prev]
                    novy[editIndex] = {
                      ...novy[editIndex],
                      name,
                      color,
                      icon,
                      start,
                      end,
                      volume,
                      mode,
                    }
                    return novy
                  })
                  setEditIndex(null)
                }}
                className="btn btn-success"
                style={{ flex: 1.5 }}
              >
                <Check size={14} /> Uložit změny
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
