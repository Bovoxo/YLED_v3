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

export default function App() {
  const [aktivni, setAktivni] = useState('losovac')

  return (
    <div className="app-container">
      {/* Horní hlavička se statusem backendu */}
      <Header />

      {/* Moderní navigace s ikonami */}
      <Navbar aktivni={aktivni} setAktivni={setAktivni} />

      {/* Zobrazení aktivního modulu */}
      <main>
        {aktivni === 'losovac' && <RandomNumber />}
        {aktivni === 'raffle' && <RaffleWheel />}
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
    </div>
  )
}
