import { Dices, RotateCw, Users, Swords, Bomb, Timer, Volume2, Presentation, Video, UserX, QrCode } from 'lucide-react'

export default function Navbar({ aktivni, setAktivni }) {
  const moduly = [
    { id: 'losovac', nazev: 'Losovač', ikona: Dices, barva: '#3b82f6' },
    { id: 'raffle', nazev: 'Kolo štěstí', ikona: RotateCw, barva: '#06b6d4' },
    { id: 'tymy', nazev: 'Týmy', ikona: Users, barva: '#22c55e' },
    { id: 'pavouk', nazev: 'Pavouk', ikona: Swords, barva: '#10b981' },
    { id: 'tictacboom', nazev: 'Tik Tak Bum', ikona: Bomb, barva: '#ef4444' },
    { id: 'odpocet', nazev: 'Odpočet', ikona: Timer, barva: '#3b82f6' },
    { id: 'soundboard', nazev: 'Soundboard', ikona: Volume2, barva: '#f97316' },
    { id: 'qr', nazev: 'QR Kód', ikona: QrCode, barva: '#38bdf8' },
    { id: 'prezentace', nazev: 'Prezentace', ikona: Presentation, barva: '#a855f7' },
    { id: 'youtube', nazev: 'YouTube', ikona: Video, barva: '#dc2626' },
    { id: 'imposter', nazev: 'Imposter', ikona: UserX, barva: '#facc15' },
  ]

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '35px',
      flexWrap: 'wrap'
    }}>
      {moduly.map((m) => {
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
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Icon size={17} color={isSelected ? m.barva : 'currentColor'} />
            {m.nazev}
          </button>
        )
      })}
    </nav>
  )
}
