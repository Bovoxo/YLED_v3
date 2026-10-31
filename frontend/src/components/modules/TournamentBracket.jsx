import { useState } from 'react'
import { Trophy, Swords, Shuffle, RotateCcw, Check, Sparkles, UserPlus, Medal } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function TournamentBracket() {
  const [pocetTymu, setPocetTymu] = useState(8) // 4, 8 nebo 16
  const [jmenaText, setJmenaText] = useState(
    'Tým Červení\nTým Modří\nTým Zelení\nTým Žlutí\nTým Oranžoví\nTým Fialoví\nTým Bílí\nTým Černí'
  )
  const [faze, setFaze] = useState('nastaveni') // 'nastaveni' | 'turnaj'
  const [kola, setKola] = useState([])
  const [vitezTurnaje, setVitezTurnaje] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])

  // Vytvoření pavouka
  const vytvoritPavouka = () => {
    let seznam = jmenaText
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    // Doplnění prázdných míst pokud chybí
    while (seznam.length < pocetTymu) {
      seznam.push(`Tým ${seznam.length + 1}`)
    }
    // Oříznutí na požadovaný počet
    seznam = seznam.slice(0, pocetTymu)

    // Výpočet počtu kol (4 týmy = 2 kola, 8 týmů = 3 kola, 16 týmů = 4 kola)
    const celkemKol = Math.log2(pocetTymu)
    const strukturaKol = []

    // 1. Kolo (základní zápasy)
    const zapasyKolo1 = []
    for (let i = 0; i < pocetTymu; i += 2) {
      zapasyKolo1.push({
        id: `r0-m${i / 2}`,
        tym1: { nazev: seznam[i], skore: '' },
        tym2: { nazev: seznam[i + 1], skore: '' },
        vitez: null,
      })
    }

    const nazvyKol = {
      2: ['Semifinále', 'Finále'],
      3: ['Čtvrtfinále', 'Semifinále', 'Finále'],
      4: ['Osmifinále', 'Čtvrtfinále', 'Semifinále', 'Finále']
    }

    strukturaKol.push({
      nazev: nazvyKol[celkemKol][0],
      zapasy: zapasyKolo1,
    })

    // Další prázdná kola
    let pocetZapasuVKole = zapasyKolo1.length / 2
    for (let r = 1; r < celkemKol; r++) {
      const zapasy = []
      for (let m = 0; m < pocetZapasuVKole; m++) {
        zapasy.push({
          id: `r${r}-m${m}`,
          tym1: { nazev: 'TBD', skore: '' },
          tym2: { nazev: 'TBD', skore: '' },
          vitez: null,
        })
      }
      strukturaKol.push({
        nazev: nazvyKol[celkemKol][r],
        zapasy: zapasy,
      })
      pocetZapasuVKole /= 2
    }

    setKola(strukturaKol)
    setVitezTurnaje(null)
    setLeaderboard([])
    setFaze('turnaj')
  }

  // Označení vítěze zápasu a posunutí do dalšího kola
  const vybratVitezeZapasu = (koloIdx, zapasIdx, tymKlic) => {
    const novyKola = JSON.parse(JSON.stringify(kola))
    const zapas = novyKola[koloIdx].zapasy[zapasIdx]
    const viteznyTym = zapas[tymKlic].nazev

    if (!viteznyTym || viteznyTym === 'TBD') return

    zapas.vitez = tymKlic

    // Pokud je to finále, máme šampiona turnaje a vygenerujeme leaderboard!
    if (koloIdx === novyKola.length - 1) {
      setVitezTurnaje(viteznyTym)
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      })

      // Požadavek na backend pro výpočet kompletního žebříčku
      fetch('/api/bracket/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kola: novyKola })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.leaderboard && data.leaderboard.length > 0) {
            setLeaderboard(data.leaderboard)
          }
        })
        .catch(() => {
          // Lokální fallback
          const porazeny = zapas.tym1.nazev === viteznyTym ? zapas.tym2.nazev : zapas.tym1.nazev
          setLeaderboard([
            { poradi: 1, tym: viteznyTym, faze: 'Vítěz turnaje', medaile: 'gold' },
            { poradi: 2, tym: porazeny, faze: 'Finalista', medaile: 'silver' },
          ])
        })
    } else {
      // Posuneme vítěze do dalšího kola
      const dalsiKoloIdx = koloIdx + 1
      const dalsiZapasIdx = Math.floor(zapasIdx / 2)
      const slot = zapasIdx % 2 === 0 ? 'tym1' : 'tym2'

      novyKola[dalsiKoloIdx].zapasy[dalsiZapasIdx][slot].nazev = viteznyTym
      // Resetujeme případného vítěze v následujícím zápase
      novyKola[dalsiKoloIdx].zapasy[dalsiZapasIdx].vitez = null
      setVitezTurnaje(null)
      setLeaderboard([])
    }

    setKola(novyKola)
  }

  // Změna skóre zápasu
  const zmenitSkore = (koloIdx, zapasIdx, tymKlic, hodnota) => {
    const novyKola = [...kola]
    novyKola[koloIdx].zapasy[zapasIdx][tymKlic].skore = hodnota
    setKola(novyKola)
  }

  // Zamíchání jmen
  const zamichatJmena = () => {
    const list = jmenaText.split('\n').filter((t) => t.trim().length > 0)
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[list[i], list[j]] = [list[j], list[i]]
    }
    setJmenaText(list.join('\n'))
  }

  const nastavitVelikost = (velikost) => {
    setPocetTymu(velikost)
    const list = Array.from({ length: velikost }, (_, i) => `Tým ${i + 1}`)
    setJmenaText(list.join('\n'))
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(59, 130, 246, 0.12)', borderRadius: '16px', marginBottom: '12px' }}>
          <Swords size={32} color="#3b82f6" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>Turnajový pavouk</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Vyřazovací pavouk pro táborové turnaje, sporty a soutěže
        </p>
      </div>

      {/* FÁZE 1: NASTAVENÍ TURNAJE */}
      {faze === 'nastaveni' && (
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Velikost pavouka:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[4, 8, 16].map((pocet) => (
                <button
                  key={pocet}
                  onClick={() => nastavitVelikost(pocet)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: pocetTymu === pocet ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: pocetTymu === pocet ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: pocetTymu === pocet ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {pocet === 4 ? '4 týmy' : `${pocet} týmů`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Seznam týmů / hráčů:
              </label>
              <button
                onClick={zamichatJmena}
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Shuffle size={13} /> Zamíchat nasazení
              </button>
            </div>
            <textarea
              value={jmenaText}
              onChange={(e) => setJmenaText(e.target.value)}
              placeholder="Každý tým na nový řádek..."
              style={{ height: '180px', resize: 'vertical' }}
            />
          </div>

          <button
            onClick={vytvoritPavouka}
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '17px', borderRadius: '14px' }}
          >
            <Sparkles size={18} /> VYGENEROVAT TURNAJ
          </button>
        </div>
      )}

      {/* FÁZE 2: TURNAJOVÝ PAVOUK */}
      {faze === 'turnaj' && (
        <div>
          {/* HORNÍ LIŠTA OVLÁDÁNÍ */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-green">Turnaj pro {pocetTymu} týmů</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Kliknutím na tým určíš vítěze zápasu
              </span>
            </div>

            <button
              onClick={() => setFaze('nastaveni')}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <RotateCcw size={14} /> Upravit týmy / Nový turnaj
            </button>
          </div>

          {/* ŠAMPION BANNER */}
          {vitezTurnaje && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(234, 179, 8, 0.08) 100%)',
              border: '2px solid #facc15',
              borderRadius: '20px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '32px',
              boxShadow: '0 0 40px rgba(250, 204, 21, 0.3)',
              animation: 'fadeIn 0.3s ease',
            }}>
              <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(250, 204, 21, 0.2)', borderRadius: '50%', marginBottom: '8px' }}>
                <Trophy size={36} color="#facc15" />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#facc15', textTransform: 'uppercase', letterSpacing: '2px' }}>
                VÍTĚZ TURNAJE
              </div>
              <div style={{ fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: '900', color: '#ffffff', margin: '4px 0' }}>
                {vitezTurnaje}
              </div>

              {/* KOMPLETNÍ ŽEBŘÍČEK / LEADERBOARD */}
              {leaderboard.length > 0 && (
                <div style={{ marginTop: '24px', textAlign: 'left', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#facc15', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Trophy size={16} /> Konečné pořadí turnaje:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {leaderboard.map((polozka) => (
                      <div
                        key={polozka.poradi}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: polozka.poradi === 1 ? 'rgba(250, 204, 21, 0.15)' : polozka.poradi === 2 ? 'rgba(226, 232, 240, 0.1)' : polozka.poradi === 3 ? 'rgba(217, 119, 6, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                          border: polozka.poradi === 1 ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            width: '24px',
                            fontWeight: '800',
                            fontSize: '14px',
                            color: polozka.poradi === 1 ? '#facc15' : polozka.poradi === 2 ? '#cbd5e1' : polozka.poradi === 3 ? '#fb923c' : 'var(--text-muted)'
                          }}>
                            {polozka.poradi}.
                          </span>
                          <strong style={{ fontSize: '15px' }}>{polozka.tym}</strong>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {polozka.faze}
                          </span>
                          {polozka.celkove_skore > 0 && (
                            <span className="badge badge-green" style={{ fontSize: '11px' }}>
                              {polozka.celkove_skore} b.
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIZUÁLNÍ MŘÍŽKA PAVOUKA (KOLA V SLOUPECÍCH) */}
          <div style={{
            display: 'flex',
            gap: '28px',
            alignItems: 'center',
            overflowX: 'auto',
            paddingBottom: '20px',
            minWidth: pocetTymu === 16 ? '950px' : '650px',
          }}>
            {kola.map((kolo, koloIdx) => (
              <div
                key={koloIdx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* Nadpis kola */}
                <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '14px', color: '#86efac', marginBottom: '8px' }}>
                  {kolo.nazev}
                </div>

                {/* Zápasy v daném kole */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  height: '100%',
                  gap: koloIdx === 0 ? '16px' : koloIdx === 1 ? '48px' : '96px',
                }}>
                  {kolo.zapasy.map((zapas, zapasIdx) => (
                    <div
                      key={zapas.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                      }}
                    >
                      {/* TÝM 1 */}
                      <div
                        onClick={() => vybratVitezeZapasu(koloIdx, zapasIdx, 'tym1')}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                          cursor: zapas.tym1.nazev !== 'TBD' ? 'pointer' : 'default',
                          backgroundColor: zapas.vitez === 'tym1' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{
                          fontWeight: zapas.vitez === 'tym1' ? '800' : '500',
                          color: zapas.vitez === 'tym1' ? '#93c5fd' : zapas.tym1.nazev === 'TBD' ? 'var(--text-muted)' : '#ffffff',
                          fontSize: '14px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '130px',
                        }}>
                          {zapas.tym1.nazev}
                        </span>

                        <input
                          type="text"
                          placeholder="0"
                          value={zapas.tym1.skore}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => zmenitSkore(koloIdx, zapasIdx, 'tym1', e.target.value)}
                          style={{
                            width: '32px',
                            height: '26px',
                            padding: '2px',
                            textAlign: 'center',
                            fontSize: '12px',
                            borderRadius: '6px',
                          }}
                        />
                      </div>

                      {/* TÝM 2 */}
                      <div
                        onClick={() => vybratVitezeZapasu(koloIdx, zapasIdx, 'tym2')}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          cursor: zapas.tym2.nazev !== 'TBD' ? 'pointer' : 'default',
                          backgroundColor: zapas.vitez === 'tym2' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{
                          fontWeight: zapas.vitez === 'tym2' ? '800' : '500',
                          color: zapas.vitez === 'tym2' ? '#93c5fd' : zapas.tym2.nazev === 'TBD' ? 'var(--text-muted)' : '#ffffff',
                          fontSize: '14px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '130px',
                        }}>
                          {zapas.tym2.nazev}
                        </span>

                        <input
                          type="text"
                          placeholder="0"
                          value={zapas.tym2.skore}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => zmenitSkore(koloIdx, zapasIdx, 'tym2', e.target.value)}
                          style={{
                            width: '32px',
                            height: '26px',
                            padding: '2px',
                            textAlign: 'center',
                            fontSize: '12px',
                            borderRadius: '6px',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
