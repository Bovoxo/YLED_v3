import { useState } from 'react'
import Header from './components/layout/Header'
import Navbar from './components/layout/Navbar'
import RandomNumber from './components/modules/RandomNumber'
import RaffleWheel from './components/modules/RaffleWheel'
import TeamSplitter from './components/modules/TeamSplitter'
import TournamentBracket from './components/modules/TournamentBracket'
import TicTacBoom from './components/modules/TicTacBoom'
import CountdownTimer from './components/modules/CountdownTimer'
import Soundboard from './components/modules/Soundboard'
import QrGenerator from './components/modules/QrGenerator'
import LyricsToPpt from './components/modules/LyricsToPpt'
import YouTubeDownloader from './components/modules/YouTubeDownloader'
import ImposterGame from './components/modules/ImposterGame'
import CharadesGame from './components/modules/CharadesGame'

export default function App() {
  const [aktivni, setAktivni] = useState('losovac')
  const [rozlozeni, setRozlozeni] = useState(() => {
    try {
      return localStorage.getItem('yled_layout_mode') || 'nahore' // 'nahore' | 'sidebar'
    } catch {
      return 'nahore'
    }
  })

  const zmenitRozlozeni = (nove) => {
    setRozlozeni(nove)
    try {
      localStorage.setItem('yled_layout_mode', nove)
    } catch {}
  }

  // Společný obsah modulů
  const renderModul = () => (
    <main>
      {aktivni === 'losovac' && <RandomNumber />}
      {aktivni === 'raffle' && <RaffleWheel />}
      {aktivni === 'charades' && <CharadesGame />}
      {aktivni === 'tymy' && <TeamSplitter />}
      {aktivni === 'pavouk' && <TournamentBracket />}
      {aktivni === 'tictacboom' && <TicTacBoom />}
      {aktivni === 'odpocet' && <CountdownTimer />}
      {aktivni === 'qr' && <QrGenerator />}
      {aktivni === 'prezentace' && <LyricsToPpt />}
      {aktivni === 'youtube' && <YouTubeDownloader />}
      {aktivni === 'imposter' && <ImposterGame />}

      {/* Soundboard je vykreslený trvale se skrytím, aby se nepřerušil běžící zvuk při přepnutí */}
      <div style={{ display: aktivni === 'soundboard' ? 'block' : 'none' }}>
        <Soundboard />
      </div>
    </main>
  )

  // 1. Varianta: Boční panel vlevo (Sidebar)
  if (rozlozeni === 'sidebar') {
    return (
      <div className="app-layout-sidebar-container">
        <Navbar
          aktivni={aktivni}
          setAktivni={setAktivni}
          rozlozeni={rozlozeni}
          setRozlozeni={zmenitRozlozeni}
        />
        <div className="app-main-content">
          <Header compact={true} />
          {renderModul()}
        </div>
      </div>
    )
  }

  // 2. Varianta: Klasický horní panel (kategorie a lišta nahoře)
  return (
    <div className="app-container">
      {/* Horní hlavička se statusem backendu */}
      <Header />

      {/* Moderní navigace s kategoriemi */}
      <Navbar
        aktivni={aktivni}
        setAktivni={setAktivni}
        rozlozeni={rozlozeni}
        setRozlozeni={zmenitRozlozeni}
      />

      {/* Zobrazení aktivního modulu */}
      {renderModul()}
    </div>
  )
}
