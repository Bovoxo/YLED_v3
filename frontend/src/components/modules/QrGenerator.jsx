import { useState, useEffect, useRef } from 'react'
import { QrCode, Download, Copy, Check, Globe, Wifi, FileText, Sparkles, RefreshCw, Sliders, AlertCircle, ExternalLink } from 'lucide-react'

export default function QrGenerator() {
  const [typ, setTyp] = useState('url') // 'url' | 'wifi' | 'text'
  const [vstupText, setVstupText] = useState('https://yleventdeck.cloud')
  
  // Wi-Fi specifická pole
  const [wifiSsid, setWifiSsid] = useState('Taborova_Wifi')
  const [wifiHeslo, setWifiHeslo] = useState('')
  const [wifiTyp, setWifiTyp] = useState('WPA')

  // Vzhled a parametry
  const [barvaPopredi, setBarvaPopredi] = useState('#000000')
  const [barvaPozadi, setBarvaPozadi] = useState('#ffffff')
  const [velikost, setVelikost] = useState(12) // box_size (12 = cca 450px)
  const [korekce, setKorekce] = useState('M') // L, M, Q, H

  // Stav generování
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrSvg, setQrSvg] = useState('')
  const [nacita, setNacita] = useState(false)
  const [chyba, setChyba] = useState('')
  const [zkopirovano, setZkopirovano] = useState(false)
  const [potrebujeInstalaci, setPotrebujeInstalaci] = useState(false)

  const debounceTimeout = useRef(null)

  // Výpočet finálního textu podle zvoleného typu
  const ziskejFinalniText = () => {
    if (typ === 'wifi') {
      const auth = wifiTyp === 'nopass' ? 'nopass' : wifiTyp
      const passPart = auth !== 'nopass' ? `P:${wifiHeslo};` : ''
      return `WIFI:S:${wifiSsid};T:${auth};${passPart};`
    }
    return vstupText.trim()
  }

  // Generování QR kódu přes Python backend
  const vygenerovatQR = async () => {
    const textKZakodovani = ziskejFinalniText()
    if (!textKZakodovani) {
      setQrDataUrl('')
      setQrSvg('')
      return
    }

    setNacita(true)
    setChyba('')
    setPotrebujeInstalaci(false)

    try {
      const res = await fetch('/api/qr/generovat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textKZakodovani,
          velikost: parseInt(velikost) || 12,
          ramecek: 3,
          barva_popredi: barvaPopredi,
          barva_pozadi: barvaPozadi,
          korekce: korekce,
        }),
      })

      const data = await res.json()
      if (data.chyba) {
        setChyba(data.chyba)
        if (data.potrebuje_instalaci) {
          setPotrebujeInstalaci(true)
        }
      } else {
        setQrDataUrl(data.data_url)
        setQrSvg(data.svg)
      }
    } catch (err) {
      setChyba('Výpadek spojení s backendem.')
    } finally {
      setNacita(false)
    }
  }

  // Automatické přegenerování při změně parametrů s lehkým zpožděním
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    debounceTimeout.current = setTimeout(() => {
      vygenerovatQR()
    }, 250)

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    }
  }, [vstupText, wifiSsid, wifiHeslo, wifiTyp, typ, barvaPopredi, barvaPozadi, velikost, korekce])

  // Stažení PNG souboru
  const stahnoutPNG = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `qr_kod_${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  // Stažení SVG souboru
  const stahnoutSVG = () => {
    if (!qrSvg) return
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr_kod_${Date.now()}.svg`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // Kopírování obrázku do schránky (pokud prohlížeč podporuje ClipboardItem s blobem)
  const kopirovatDoSchranky = async () => {
    if (!qrDataUrl) return
    try {
      const res = await fetch(qrDataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setZkopirovano(true)
      setTimeout(() => setZkopirovano(false), 2000)
    } catch (err) {
      // Fallback: zkopírovat zakódovaný text
      navigator.clipboard.writeText(ziskejFinalniText())
      setZkopirovano(true)
      setTimeout(() => setZkopirovano(false), 2000)
    }
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '920px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', marginBottom: '12px' }}>
          <QrCode size={32} color="#3b82f6" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>QR Kód Generátor</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Vytvoř QR kód pro web, táborovou Wi-Fi nebo zprávu pro šifrovací hru
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* LEVÝ SLOUPEC: VSTUPNÍ DATA A NASTAVENÍ */}
        <div>
          {/* VÝBĚR TYPU OBSAHU */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <button
              onClick={() => { setTyp('url'); setVstupText('https://yleventdeck.cloud') }}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '12px',
                border: typ === 'url' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: typ === 'url' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: typ === 'url' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Globe size={15} /> Odkaz / Web
            </button>

            <button
              onClick={() => setTyp('wifi')}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '12px',
                border: typ === 'wifi' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: typ === 'wifi' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: typ === 'wifi' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Wifi size={15} /> Wi-Fi síť
            </button>

            <button
              onClick={() => { setTyp('text'); setVstupText('Tajná zpráva: Jděte 50 kroků na sever ke starému dubu!') }}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '12px',
                border: typ === 'text' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: typ === 'text' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: typ === 'text' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <FileText size={15} /> Text / Hra
            </button>
          </div>

          {/* FORMULÁŘ PODLE TYPU */}
          {typ === 'url' && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Webová adresa (URL):
              </label>
              <input
                type="url"
                value={vstupText}
                onChange={(e) => setVstupText(e.target.value)}
                placeholder="https://example.com"
                style={{ fontSize: '15px' }}
              />
            </div>
          )}

          {typ === 'wifi' && (
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '16px',
              borderRadius: '14px',
              marginBottom: '18px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Název Wi-Fi sítě (SSID):</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="Moje_Taborova_Sit"
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Heslo k síti:</label>
                <input
                  type="text"
                  value={wifiHeslo}
                  onChange={(e) => setWifiHeslo(e.target.value)}
                  placeholder="Heslo (ponech prázdné pokud není)"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Zabezpečení:</label>
                <select
                  value={wifiTyp}
                  onChange={(e) => setWifiTyp(e.target.value)}
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                >
                  <option value="WPA">WPA / WPA2 (běžné)</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Otevřená síť (bez hesla)</option>
                </select>
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                Po naskenování tohoto QR kódu se telefon automaticky připojí k zadané Wi-Fi síti bez ručního zadávání hesla.
              </p>
            </div>
          )}

          {typ === 'text' && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Text nebo zpráva:
              </label>
              <textarea
                value={vstupText}
                onChange={(e) => setVstupText(e.target.value)}
                placeholder="Napiš libovolný text, indicii pro bojovku nebo pravidla..."
                style={{ height: '110px', resize: 'vertical' }}
              />
            </div>
          )}

          {/* PŘIZPŮSOBENÍ BAREV A KVALITY */}
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '16px',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                Barva QR kódu:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {['#000000', '#1e3a8a', '#14532d', '#581c87', '#ffffff'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setBarvaPopredi(color)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: barvaPopredi === color ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={barvaPopredi}
                  onChange={(e) => setBarvaPopredi(e.target.value)}
                  style={{ width: '32px', height: '28px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                  title="Vlastní barva"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                Barva pozadí:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {['#ffffff', '#f8fafc', '#0f172a', '#18181b'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setBarvaPozadi(color)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: barvaPozadi === color ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={barvaPozadi}
                  onChange={(e) => setBarvaPozadi(e.target.value)}
                  style={{ width: '32px', height: '28px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                  title="Vlastní barva pozadí"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Odolnost proti poškození:
              </label>
              <select
                value={korekce}
                onChange={(e) => setKorekce(e.target.value)}
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                title="Vyšší korekce umožňuje přečíst kód i když je papír venku zašpiněný nebo natržený"
              >
                <option value="L">L (7% obnova)</option>
                <option value="M">M (15% obnova - výchozí)</option>
                <option value="Q">Q (25% obnova)</option>
                <option value="H">H (30% obnova - ideální na tábor)</option>
              </select>
            </div>
          </div>
        </div>

        {/* PRAVÝ SLOUPEC: NÁHLED A STAŽENÍ */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* NÁHLEDOVÁ KARTA QR KÓDU */}
          <div style={{
            background: barvaPozadi,
            padding: '24px',
            borderRadius: '20px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '290px',
            minWidth: '290px',
            position: 'relative',
            transition: 'all 0.3s ease',
          }}>
            {nacita && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <RefreshCw size={28} color="#ffffff" className="spin" />
              </div>
            )}

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Vygenerovaný QR kód"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '8px',
                }}
              />
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center', fontSize: '13px', padding: '20px' }}>
                Zadej text nebo odkaz pro vytvoření QR kódu.
              </div>
            )}
          </div>

          {/* CHYBOVÉ HLÁŠENÍ (NAPŘ. CHYBĚJÍCÍ KNIHOVNA) */}
          {chyba && (
            <div className="status-msg error" style={{ width: '100%', marginTop: '16px', textAlign: 'center' }}>
              <AlertCircle size={16} />
              <div>
                <div>{chyba}</div>
                {potrebujeInstalaci && (
                  <code style={{ display: 'block', marginTop: '6px', fontSize: '12px' }}>
                    pip install qrcode pillow
                  </code>
                )}
              </div>
            </div>
          )}

          {/* TLAČÍTKA AKCÍ */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', width: '100%', flexWrap: 'wrap' }}>
            <button
              onClick={stahnoutPNG}
              disabled={!qrDataUrl}
              className="btn btn-primary"
              style={{ flex: '1 1 140px', padding: '14px', fontSize: '14px' }}
            >
              <Download size={16} /> Stáhnout PNG
            </button>

            <button
              onClick={stahnoutSVG}
              disabled={!qrSvg}
              className="btn btn-secondary"
              style={{ flex: '1 1 120px', padding: '14px', fontSize: '14px' }}
              title="Vektorový formát vhodný pro velkoformátový tisk na plakáty nebo trička"
            >
              <Download size={16} /> SVG (Vektor)
            </button>

            <button
              onClick={kopirovatDoSchranky}
              disabled={!qrDataUrl}
              className="btn btn-secondary"
              style={{ padding: '14px', minWidth: '48px' }}
              title="Kopírovat obrázek do schránky"
            >
              {zkopirovano ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
            </button>
          </div>

          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Vygenerováno přes Python backend (`routers/qr_generator.py`)
          </div>
        </div>

      </div>
    </div>
  )
}
