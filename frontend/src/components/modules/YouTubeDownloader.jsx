import { useState, useRef, useEffect } from 'react'
import { Video, Music, Download, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function YouTubeDownloader() {
  const [url, setUrl] = useState('')
  const [rezim, setRezim] = useState('video') // 'video' | 'audio'
  const [kvalita, setKvalita] = useState('1080')
  const [status, setStatus] = useState('')
  const [progres, setProgres] = useState(0)
  const [stahujeSe, setStahujeSe] = useState(false)
  const [chyba, setChyba] = useState('')

  const intervalRef = useRef(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const stahnout = async () => {
    if (!url.trim()) {
      setChyba('Vlož odkaz na YouTube video.')
      return
    }

    setChyba('')
    setStahujeSe(true)
    setProgres(0)
    setStatus('Zahajuji stahování na serveru...')

    try {
      const resStart = await fetch('/api/stahnout-yt-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          mode: rezim,
          kvalita: kvalita,
        }),
      })

      if (!resStart.ok) throw new Error('Server neodpovídá.')
      const dataStart = await resStart.json()
      if (dataStart.chyba) throw new Error(dataStart.chyba)

      const taskId = dataStart.task_id

      intervalRef.current = setInterval(async () => {
        try {
          const resStav = await fetch(`/api/stahnout-yt-stav/${taskId}`)
          const dataStav = await resStav.json()

          if (dataStav.status === 'stahuje_se') {
            setProgres(dataStav.procenta || 0)
            setStatus(`Stahování: ${(dataStav.procenta || 0).toFixed(1)} %`)
          } else if (dataStav.status === 'konverze') {
            setProgres(100)
            setStatus('Zpracovávám a spojuji audio se stopou...')
          } else if (dataStav.status === 'hotovo') {
            clearInterval(intervalRef.current)
            setStatus('Hotovo! Zahajuji stažení do počítače...')
            stahnoutDoProhlizece(`/api/stahnout-yt-soubor/${taskId}`)
          } else if (dataStav.status === 'chyba') {
            clearInterval(intervalRef.current)
            setStahujeSe(false)
            setChyba(dataStav.chyba || 'Nastala chyba při stahování.')
          }
        } catch (err) {
          clearInterval(intervalRef.current)
          setStahujeSe(false)
          setChyba('Spojení se serverem bylo přerušeno.')
        }
      }, 1000)
    } catch (err) {
      setStahujeSe(false)
      setChyba(err.message)
    }
  }

  const stahnoutDoProhlizece = async (downloadUrl) => {
    try {
      const res = await fetch(downloadUrl)
      if (!res.ok) throw new Error('Nepodařilo se přenést soubor ze serveru.')

      let nazev = `youtube_${Date.now()}.${rezim === 'video' ? 'mp4' : 'mp3'}`
      const disposition = res.headers.get('Content-Disposition')
      if (disposition) {
        const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/)
        if (utf8Match && utf8Match[1]) {
          nazev = decodeURIComponent(utf8Match[1])
        }
      }

      const blob = await res.blob()
      const fileUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = fileUrl
      a.download = nazev
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(fileUrl)

      setStatus(`Úspěšně staženo: ${nazev}`)
      setStahujeSe(false)
    } catch (err) {
      setStahujeSe(false)
      setChyba(err.message)
    }
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', marginBottom: '12px' }}>
          <Video size={32} color="#ef4444" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>YouTube Downloader</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Stáhni video nebo čisté MP3 audio bez reklam přímo ze serveru
        </p>
      </div>

      {/* VÝBĚR REŽIMU */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setRezim('video')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: rezim === 'video' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: rezim === 'video' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.02)',
            color: rezim === 'video' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Video size={18} color={rezim === 'video' ? '#ef4444' : 'currentColor'} />
          Video (MP4)
        </button>

        <button
          onClick={() => setRezim('audio')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: rezim === 'audio' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: rezim === 'audio' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.02)',
            color: rezim === 'audio' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Music size={18} color={rezim === 'audio' ? '#ef4444' : 'currentColor'} />
          Pouze Audio (MP3)
        </button>
      </div>

      {/* ODKAZ */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={stahujeSe}
          style={{ fontSize: '15px' }}
        />
      </div>

      {/* KVALITA (JEN PRO VIDEO) */}
      {rezim === 'video' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Kvalita videa:</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: '4k', label: '4K Ultra HD (2160p)' },
              { id: '1080', label: '1080p Full HD' },
              { id: '720', label: '720p HD' },
              { id: 'nejnizsi', label: '360p (rychlá)' },
            ].map((k) => (
              <button
                key={k.id}
                type="button"
                className="badge"
                onClick={() => setKvalita(k.id)}
                style={{
                  cursor: 'pointer',
                  background: kvalita === k.id ? 'rgba(239, 68, 68, 0.25)' : undefined,
                  borderColor: kvalita === k.id ? '#ef4444' : undefined,
                  color: kvalita === k.id ? '#ffffff' : undefined,
                  fontWeight: kvalita === k.id ? '700' : '500',
                  padding: '6px 10px',
                }}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TLAČÍTKO SPUŠTĚNÍ */}
      <button
        onClick={stahnout}
        disabled={stahujeSe || !url.trim()}
        className="btn btn-danger"
        style={{ width: '100%', padding: '16px', fontSize: '16px' }}
      >
        {stahujeSe ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
        {stahujeSe ? 'STAHUJI...' : `STÁHNOUT JAKO ${rezim.toUpperCase()}`}
      </button>

      {/* PROGRESS BAR */}
      {stahujeSe && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
            <span>Průběh</span>
            <span>{progres.toFixed(1)} %</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progres}%`,
                background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {status && !chyba && (
        <div className="status-msg info">
          {status}
        </div>
      )}

      {chyba && (
        <div className="status-msg error">
          <AlertCircle size={16} /> {chyba}
        </div>
      )}
    </div>
  )
}
