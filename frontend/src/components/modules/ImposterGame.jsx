import { useState, useEffect } from 'react'
import { UserX, Eye, EyeOff, ShieldAlert, Users, Sparkles, HelpCircle, RotateCcw } from 'lucide-react'

export default function ImposterGame() {
  const [faze, setFaze] = useState('nastaveni') // 'nastaveni' | 'predavani' | 'diskuze' | 'odhaleni'
  const [pocetHracu, setPocetHracu] = useState(5)
  const [pocetImposteru, setPocetImposteru] = useState(1)
  const [kategorie, setKategorie] = useState('tábor')
  const [dostupneKategorie, setDostupneKategorie] = useState([
    'tábor', 'škola', 'jídlo', 'sport', 'profese', 'zvířata', 'filmy a pohádky', 'místa a cestování'
  ])
  const [napoveda, setNapoveda] = useState(false)
  const [tajnyMod, setTajnyMod] = useState(false)

  const [hraci, setHraci] = useState([])
  const [aktualniHracIndex, setAktualniHracIndex] = useState(0)
  const [kartaOdhalena, setKartaOdhalena] = useState(false)
  const [chyba, setChyba] = useState('')
  const [nacita, setNacita] = useState(false)

  useEffect(() => {
    // Načteme kategorie z backendu
    fetch('/api/imposter-kategorie')
      .then((res) => res.json())
      .then((data) => {
        if (data.kategorie && Array.isArray(data.kategorie)) {
          setDostupneKategorie(data.kategorie)
        }
      })
      .catch(() => {})
  }, [])

  const startHry = async () => {
    setChyba('')
    setNacita(true)

    try {
      const res = await fetch('/api/imposter-losovat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pocet_hracu: parseInt(pocetHracu) || 5,
          pocet_imposteru: parseInt(pocetImposteru) || 1,
          kategorie: kategorie,
          zobrazit_napovedu: napoveda,
          tajny_mod: tajnyMod,
        }),
      })

      const data = await res.json()
      if (data.chyba) {
        setChyba(data.chyba)
      } else {
        setHraci(data.hraci)
        setAktualniHracIndex(0)
        setKartaOdhalena(false)
        setFaze('predavani')
      }
    } catch (err) {
      setChyba('Výpadek spojení s backendem.')
    } finally {
      setNacita(false)
    }
  }

  const dalsiHrac = () => {
    setKartaOdhalena(false)
    if (aktualniHracIndex + 1 < hraci.length) {
      setAktualniHracIndex((prev) => prev + 1)
    } else {
      setFaze('diskuze')
    }
  }

  const restartHry = () => {
    setHraci([])
    setAktualniHracIndex(0)
    setKartaOdhalena(false)
    setFaze('nastaveni')
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '620px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(236, 72, 153, 0.12)', borderRadius: '16px', marginBottom: '12px' }}>
          <UserX size={32} color="#ec4899" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>Imposter Game</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Jeden telefon, tajné slovo pro většinu a jeden vetřelec mezi vámi
        </p>
      </div>

      {/* FÁZE 1: NASTAVENÍ */}
      {faze === 'nastaveni' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Počet hráčů:
              </label>
              <input
                type="number"
                min="3"
                max="25"
                value={pocetHracu}
                onChange={(e) => setPocetHracu(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Počet impostorů:
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={pocetImposteru}
                onChange={(e) => setPocetImposteru(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Téma slov:
            </label>
            <select value={kategorie} onChange={(e) => setKategorie(e.target.value)}>
              {dostupneKategorie.map((kat) => (
                <option key={kat} value={kat}>
                  {kat.charAt(0).toUpperCase() + kat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={tajnyMod}
                onChange={(e) => setTajnyMod(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>
                <strong>Tajný režim:</strong> Impostor dostane podobné slovo a sám neví, že je impostor!
              </span>
            </label>

            {!tajnyMod && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={napoveda}
                  onChange={(e) => setNapoveda(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>
                  <strong>Nápověda pro impostora:</strong> Zobrazit mu alespoň kategorii slova.
                </span>
              </label>
            )}
          </div>

          <button
            onClick={startHry}
            disabled={nacita}
            className="btn btn-pink"
            style={{ width: '100%', padding: '16px', fontSize: '17px', fontWeight: '800' }}
          >
            <Sparkles size={18} />
            {nacita ? 'LOSUJI HRU...' : 'ZAHÁJIT HRU'}
          </button>

          {chyba && <div className="status-msg error">{chyba}</div>}
        </div>
      )}

      {/* FÁZE 2: PŘEDÁVÁNÍ MOBILU */}
      {faze === 'predavani' && hraci.length > 0 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            borderRadius: '18px',
            padding: '36px 20px',
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '24px',
            position: 'relative',
          }}>
            <div className="badge badge-yellow" style={{ marginBottom: '14px' }}>
              Hráč {aktualniHracIndex + 1} z {hraci.length}
            </div>

            <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>
              Hráč #{hraci[aktualniHracIndex].hrac}
            </h3>

            {!kartaOdhalena ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                Vezmi si zařízení do ruky. Až se nikdo jiný nedívá, klikni na tlačítko dole.
              </p>
            ) : (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>Tvoje slovo / role je:</p>
                <div style={{
                  fontSize: 'clamp(26px, 6vw, 36px)',
                  fontWeight: '900',
                  color: (!tajnyMod && hraci[aktualniHracIndex].data.je_impostor) ? '#f87171' : '#facc15',
                  textShadow: '0 0 25px rgba(250, 204, 21, 0.3)',
                  margin: '12px 0',
                }}>
                  {hraci[aktualniHracIndex].data.slovo}
                </div>
                {(!tajnyMod && hraci[aktualniHracIndex].data.je_impostor) && (
                  <span className="badge badge-red">
                    <ShieldAlert size={13} /> Chovej se nenápadně
                  </span>
                )}
              </div>
            )}
          </div>

          {!kartaOdhalena ? (
            <button
              onClick={() => setKartaOdhalena(true)}
              className="btn btn-success"
              style={{ width: '100%', padding: '16px', fontSize: '17px' }}
            >
              <Eye size={20} /> ZOBRAZIT MOJE SLOVO
            </button>
          ) : (
            <button
              onClick={dalsiHrac}
              className="btn btn-danger"
              style={{ width: '100%', padding: '16px', fontSize: '17px' }}
            >
              <EyeOff size={20} /> SKRÝT A POSLAT DÁL
            </button>
          )}
        </div>
      )}

      {/* FÁZE 3: DISKUZE */}
      {faze === 'diskuze' && (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: '#facc15' }}>
            Čas na nápovědy!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.6', marginBottom: '28px' }}>
            Všichni se podívali na své karty. Nyní každý hráč postupně řekne <strong>1 slovo</strong>,
            které souvisí s tajným slovem.<br /><br />
            Nebuďte příliš konkrétní, aby impostor nepoznal téma, ale ani moc mimo, ať vás neobviní ostatní!
          </p>

          <button
            onClick={() => setFaze('odhaleni')}
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '17px' }}
          >
            UKÁZAT VÝSLEDKY & KDO BYL IMPOSTOR
          </button>
        </div>
      )}

      {/* FÁZE 4: ODHALENÍ */}
      {faze === 'odhaleni' && (
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '18px' }}>
            Kdo byl kdo?
          </h3>

          <div style={{
            background: 'rgba(0,0,0,0.25)',
            borderRadius: '14px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {hraci.map((h) => {
              const isImp = h.data.je_impostor || h.data.role.includes('Impostor')
              return (
                <div
                  key={h.hrac}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: isImp ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: isImp ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <strong style={{ fontSize: '15px' }}>Hráč #{h.hrac}</strong>
                  <span className={`badge ${isImp ? 'badge-red' : 'badge-green'}`}>
                    {h.data.role} ({h.data.slovo})
                  </span>
                </div>
              )
            })}
          </div>

          <button
            onClick={restartHry}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '16px', fontSize: '16px' }}
          >
            <RotateCcw size={16} /> HRÁT ZNOVU
          </button>
        </div>
      )}
    </div>
  )
}
