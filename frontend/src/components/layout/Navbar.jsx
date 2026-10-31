import { useState, useEffect } from 'react'
import {
  Dices,
  RotateCw,
  Users,
  Swords,
  Bomb,
  Timer,
  Volume2,
  Presentation,
  Video,
  UserX,
  QrCode,
  Drama,
  PanelLeft,
  LayoutGrid,
  Sparkles,
  Gamepad2,
  Wrench,
  Music
} from 'lucide-react'

export const KATEGORIE_MODULU = [
  { id: 'vse', nazev: 'Všechny moduly', ikona: LayoutGrid, pocet: 12 },
  { id: 'hry', nazev: 'Hry & Párty', ikona: Gamepad2, pocet: 5, barva: '#ec4899' },
  { id: 'nastroje', nazev: 'Nástroje', ikona: Wrench, pocet: 4, barva: '#3b82f6' },
  { id: 'media', nazev: 'Média & Audio', ikona: Music, pocet: 3, barva: '#f97316' },
]

export const VSECHNY_MODULY = [
  // 1. Hry & Párty - sjednocená barva sekce (#ec4899)
  { id: 'charades', kategorie: 'hry', nazev: 'Šarády', ikona: Drama, barva: '#ec4899', popis: 'Activity, pantomima a čelovka' },
  { id: 'tictacboom', kategorie: 'hry', nazev: 'Tik Tak Bum', ikona: Bomb, barva: '#ec4899', popis: 'Výbušná hra se slabikami' },
  { id: 'imposter', kategorie: 'hry', nazev: 'Imposter', ikona: UserX, barva: '#ec4899', popis: 'Hledání tajného vetřelce' },
  { id: 'raffle', kategorie: 'hry', nazev: 'Kolo štěstí', ikona: RotateCw, barva: '#ec4899', popis: 'Fyzikální náhodné kolo' },
  { id: 'losovac', kategorie: 'hry', nazev: 'Losovač', ikona: Dices, barva: '#ec4899', popis: 'Čísla, týmy a pořadí' },

  // 2. Nástroje & Organizace - sjednocená barva sekce (#3b82f6)
  { id: 'odpocet', kategorie: 'nastroje', nazev: 'Odpočet', ikona: Timer, barva: '#3b82f6', popis: 'Stopky a velký odpočet' },
  { id: 'tymy', kategorie: 'nastroje', nazev: 'Týmy', ikona: Users, barva: '#3b82f6', popis: 'Rozdělovač do vyrovnaných týmů' },
  { id: 'pavouk', kategorie: 'nastroje', nazev: 'Pavouk', ikona: Swords, barva: '#3b82f6', popis: 'Turnajový vyřazovací pavouk' },
  { id: 'qr', kategorie: 'nastroje', nazev: 'QR Kód', ikona: QrCode, barva: '#3b82f6', popis: 'Táborový generátor QR' },

  // 3. Média & Zvuk - signifikantní barvy (YouTube červená, PowerPoint oranžová, Soundboard oranžová)
  { id: 'soundboard', kategorie: 'media', nazev: 'Soundboard', ikona: Volume2, barva: '#f97316', popis: 'Zvukové efekty a znělky' },
  { id: 'youtube', kategorie: 'media', nazev: 'YouTube', ikona: Video, barva: '#dc2626', popis: 'Stahování MP3 a MP4 videí' },
  { id: 'prezentace', kategorie: 'media', nazev: 'Prezentace', ikona: Presentation, barva: '#f97316', popis: 'Generátor textů do PPT' },
]

export default function Navbar({ aktivni, setAktivni, rozlozeni, setRozlozeni }) {
  // Aktivní vybraná kategorie v horní liště
  const [aktivniKategorie, setAktivniKategorie] = useState(() => {
    const nalezene = VSECHNY_MODULY.find((m) => m.id === aktivni)
    return nalezene ? nalezene.kategorie : 'vse'
  })

  // Synchronizace kategorie s aktivním modulem
  useEffect(() => {
    const mod = VSECHNY_MODULY.find((m) => m.id === aktivni)
    if (mod && aktivniKategorie !== 'vse' && mod.kategorie !== aktivniKategorie) {
      setAktivniKategorie(mod.kategorie)
    }
  }, [aktivni])

  const filtrovaneModuly =
    aktivniKategorie === 'vse'
      ? VSECHNY_MODULY
      : VSECHNY_MODULY.filter((m) => m.kategorie === aktivniKategorie)

  // ==========================================
  // 1. REŽIM: BOČNÍ PANEL (VLEVO - SIDEBAR)
  // ==========================================
  if (rozlozeni === 'sidebar') {
    const sekce = [
      { id: 'hry', nazev: 'Hry & Párty', ikona: Gamepad2, barva: '#ec4899' },
      { id: 'nastroje', nazev: 'Nástroje & Tábor', ikona: Wrench, barva: '#3b82f6' },
      { id: 'media', nazev: 'Média & Audio', ikona: Music, barva: '#f97316' },
    ]

    return (
      <aside className="app-sidebar">
        {/* Logo a hlavička sidebaru */}
        <div style={{ marginBottom: '24px', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1
              style={{
                fontSize: '20px',
                fontWeight: '900',
                letterSpacing: '-0.5px',
                margin: 0,
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              YLeventdeck
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  WebkitTextFillColor: '#38bdf8'
                }}
              >
                v3
              </span>
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Táborové a eventové nástroje
          </p>
        </div>

        {/* Sekce s moduly */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {sekce.map((s) => {
            const modulySekce = VSECHNY_MODULY.filter((m) => m.kategorie === s.id)
            const SekceIkona = s.ikona
            return (
              <div key={s.id}>
                {/* Nadpis sekce */}
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: s.barva,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    padding: '0 10px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <SekceIkona size={13} />
                  {s.nazev}
                </div>

                {/* Seznam tlačítek v sekci */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {modulySekce.map((m) => {
                    const Icon = m.ikona
                    const isSelected = aktivni === m.id
                    return (
                      <button
                        key={m.id}
                        onClick={() => setAktivni(m.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: isSelected ? `1px solid ${m.barva}` : '1px solid transparent',
                          backgroundColor: isSelected ? `${m.barva}1a` : 'transparent',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: '13px',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? `0 0 16px ${m.barva}22` : 'none'
                        }}
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? `${m.barva}33` : 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Icon size={16} color={isSelected ? m.barva : 'currentColor'} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.nazev}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Spodní přepínač zpět na horní lištu */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => setRozlozeni('nahore')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '12px',
              width: '100%',
              transition: 'all 0.2s'
            }}
            title="Přepnout výběr modulů na klasickou horní lištu"
          >
            <LayoutGrid size={14} />
            Horní panel (nahoře)
          </button>
        </div>
      </aside>
    )
  }

  // ==========================================
  // 2. REŽIM: HORNÍ LIŠTA (UTŘÍDĚNÁ DO KATEGORIÍ)
  // ==========================================
  return (
    <nav style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* Horní řádek: Záložky kategorií (Hry / Nástroje / Média) a přepínač na boční panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '5px 8px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
      >
        {KATEGORIE_MODULU.map((kat) => {
          const KatIkona = kat.ikona
          const jeAktivni = aktivniKategorie === kat.id
          return (
            <button
              key={kat.id}
              onClick={() => setAktivniKategorie(kat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: '11px',
                border: jeAktivni ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                backgroundColor: jeAktivni ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: jeAktivni ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: jeAktivni ? '700' : '500',
                fontSize: '13px',
                transition: 'all 0.15s ease'
              }}
            >
              <KatIkona size={14} color={kat.barva || 'currentColor'} />
              <span>{kat.nazev}</span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  backgroundColor: jeAktivni ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: jeAktivni ? '#fff' : 'var(--text-muted)'
                }}
              >
                {kat.pocet}
              </span>
            </button>
          )
        })}

        <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }} />

        {/* Tlačítko na přepnutí na levý boční panel */}
        <button
          onClick={() => setRozlozeni('sidebar')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '11px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.15s ease'
          }}
          title="Přepnout výběr aplikace vlevo (moderní boční panel)"
        >
          <PanelLeft size={14} />
          <span>Panel vlevo</span>
        </button>
      </div>

      {/* Dolní řádek: Konkrétní moduly v dané kategorii */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          maxWidth: '1200px'
        }}
      >
        {filtrovaneModuly.map((m) => {
          const Icon = m.ikona
          const isSelected = aktivni === m.id
          return (
            <button
              key={m.id}
              onClick={() => setAktivni(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '14px',
                border: isSelected ? `1px solid ${m.barva}` : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: isSelected ? `${m.barva}22` : 'rgba(255, 255, 255, 0.03)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: isSelected ? '700' : '500',
                fontSize: '14px',
                boxShadow: isSelected ? `0 0 20px ${m.barva}40` : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <Icon size={17} color={isSelected ? m.barva : 'currentColor'} />
              {m.nazev}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
