import { useState, useEffect } from 'react'
import { fetchCards } from '../api/cards'
import { Card } from '../components/game/Card'
import { Card as CardType } from '../types/card'

export function Collection() {
  const [cards, setCards] = useState<CardType[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    heroClass: '',
    cost: null as number | null,
    search: '',
  })

  useEffect(() => {
    fetchCards()
      .then(setCards)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredCards = cards.filter((card) => {
    const matchesHeroClass = filter.heroClass === '' || card.hero_class === filter.heroClass
    const matchesCost = filter.cost === null || card.cost === filter.cost
    const matchesSearch = filter.search === '' ||
      card.name.toLowerCase().includes(filter.search.toLowerCase())
    return matchesHeroClass && matchesCost && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Card Collection</h1>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <select
            value={filter.heroClass}
            onChange={(e) => setFilter({ ...filter, heroClass: e.target.value })}
            className="bg-gray-700 rounded px-3 py-2 text-white"
          >
            <option value="">All Classes</option>
            {['NEUTRAL', 'WARRIOR', 'MAGE', 'HUNTER', 'DRUID', 'PALADIN', 'ROGUE', 'SHAMAN', 'WARLOCK', 'PRIEST', 'DEMON_HUNTER'].map(
              (cls) => (
                <option key={cls} value={cls}>{cls}</option>
              )
            )}
          </select>

          <select
            value={filter.cost ?? ''}
            onChange={(e) => setFilter({ ...filter, cost: e.target.value ? Number(e.target.value) : null })}
            className="bg-gray-700 rounded px-3 py-2 text-white"
          >
            <option value="">All Costs</option>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cost) => (
              <option key={cost} value={cost}>{cost}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search cards..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="bg-gray-700 rounded px-3 py-2 text-white w-48"
          />
        </div>

        {/* Card Grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading cards...</div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No cards found</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCards.map((card) => (
              <Card key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
