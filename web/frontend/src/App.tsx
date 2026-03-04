import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white">
      <h1 className="text-5xl font-bold mb-8 text-hearthstone-gold">
        Hearthstone WebUI
      </h1>
      <p className="text-xl mb-12 text-gray-300">
        AI Training Environment for Hearthstone
      </p>
      <div className="flex gap-4">
        <Link
          to="/game"
          className="px-8 py-4 bg-hearthstone-blue rounded-lg text-lg font-semibold hover:opacity-80 transition"
        >
          Start Game
        </Link>
        <Link
          to="/deck"
          className="px-8 py-4 bg-hearthstone-purple rounded-lg text-lg font-semibold hover:opacity-80 transition"
        >
          Deck Builder
        </Link>
        <Link
          to="/collection"
          className="px-8 py-4 bg-hearthstone-orange rounded-lg text-lg font-semibold hover:opacity-80 transition"
        >
          Collection
        </Link>
      </div>
    </div>
  )
}

function GamePage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <h1 className="text-3xl">Game Board (Coming Soon)</h1>
    </div>
  )
}

function DeckPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <h1 className="text-3xl">Deck Builder (Coming Soon)</h1>
    </div>
  )
}

function CollectionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <h1 className="text-3xl">Card Collection (Coming Soon)</h1>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/deck" element={<DeckPage />} />
        <Route path="/collection" element={<CollectionPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
