import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchCards } from '../api/cards'
import { fetchDecks, createDeck } from '../api/deck'
import type { Deck } from '../types/deck'
import { Card } from '../components/game/Card'
import { Card as CardType } from '../types/card'

export function DeckBuilder() {
  const { t } = useTranslation()
  const [cards, setCards] = useState<CardType[]>([])
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [deckName, setDeckName] = useState('')
  const [heroClass, setHeroClass] = useState('NEUTRAL')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchCards(), fetchDecks()])
      .then(([cardsData, decksData]) => {
        setCards(cardsData)
        setDecks(decksData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleAddCard = (cardId: string) => {
    if (selectedCards.length < 30) {
      setSelectedCards([...selectedCards, cardId])
    }
  }

  const handleRemoveCard = (cardId: string) => {
    setSelectedCards(selectedCards.filter((id) => id !== cardId))
  }

  const handleSaveDeck = async () => {
    if (!deckName.trim() || selectedCards.length !== 30) return

    setSaving(true)
    try {
      const newDeck = {
        name: deckName,
        hero_class: heroClass,
        cards: selectedCards,
      }
      await createDeck(newDeck)
      setDeckName('')
      setSelectedCards([])
      const updatedDecks = await fetchDecks()
      setDecks(updatedDecks)
    } catch (error) {
      console.error('Failed to save deck:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-xl">{t('deckBuilder.loading')}</div>
      </div>
    )
  }

  const availableCards = cards.filter(
    (card) => heroClass === 'NEUTRAL' || card.hero_class === heroClass
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Your decks */}
      <div className="lg:col-span-1">
        <h2 className="text-xl font-semibold mb-4 text-white">
          {t('deckBuilder.yourDecks')}
        </h2>
        <div className="space-y-2">
          {decks.map((deck) => (
            <div key={deck.id} className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold">{deck.name}</h3>
              <p className="text-sm text-gray-400">
                {t('deckBuilder.deckInfo', { class: deck.hero_class, count: deck.cards.length })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Middle: New Deck */}
      <div className="lg:col-span-1">
        <h2 className="text-xl font-semibold mb-4 text-white">
          {t('deckBuilder.newDeck', { count: selectedCards.length })}
        </h2>

        <input
          type="text"
          placeholder={t('deckBuilder.name.placeholder')}
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          className="w-full bg-gray-700 rounded px-4 py-2 mb-4 text-white"
        />

        <select
          value={heroClass}
          onChange={(e) => setHeroClass(e.target.value)}
          className="w-full bg-gray-700 rounded px-4 py-2 mb-4 text-white"
          aria-label={t('deckBuilder.heroClass.label')}
        >
          <option value="NEUTRAL">{t('heroClasses.NEUTRAL')}</option>
          <option value="WARRIOR">{t('heroClasses.WARRIOR')}</option>
          <option value="MAGE">{t('heroClasses.MAGE')}</option>
          <option value="HUNTER">{t('heroClasses.HUNTER')}</option>
          <option value="DRUID">{t('heroClasses.DRUID')}</option>
          <option value="PALADIN">{t('heroClasses.PALADIN')}</option>
          <option value="ROGUE">{t('heroClasses.ROGUE')}</option>
          <option value="SHAMAN">{t('heroClasses.SHAMAN')}</option>
          <option value="WARLOCK">{t('heroClasses.WARLOCK')}</option>
          <option value="PRIEST">{t('heroClasses.PRIEST')}</option>
          <option value="DEMON_HUNTER">{t('heroClasses.DEMON_HUNTER')}</option>
        </select>

        {/* Selected Cards */}
        <div className="bg-gray-800 rounded-lg p-4 max-h-[400px] overflow-y-auto mb-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-400">
            {t('deckBuilder.selectedCards')}
          </h3>
          {selectedCards.length === 0 ? (
            <p className="text-gray-500 text-sm">
              {t('deckBuilder.emptyMessage')}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {selectedCards.map((cardId) => {
                const card = cards.find((c) => c.id === cardId)
                if (!card) return null
                return (
                  <div key={cardId} className="bg-gray-700 rounded p-2 text-xs flex justify-between items-center">
                    <span className="flex-1">{card.name}</span>
                    <button
                      onClick={() => handleRemoveCard(cardId)}
                      className="text-red-500 hover:text-red-400 ml-2"
                    >
                      {t('deckBuilder.removeCard')}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button
          onClick={handleSaveDeck}
          disabled={!deckName.trim() || selectedCards.length !== 30 || saving}
          className="w-full py-3 bg-hearthstone-blue rounded-lg font-semibold hover:opacity-80 disabled:opacity-50 text-white"
        >
          {saving ? t('deckBuilder.save.saving') : t('deckBuilder.save.label')}
        </button>
      </div>

      {/* Right: Available Cards */}
      <div className="lg:col-span-1">
        <h2 className="text-xl font-semibold mb-4 text-white">
          {t('deckBuilder.availableCards')}
        </h2>
        <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
          {availableCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleAddCard(card.id)}
              className="bg-gray-800 rounded-lg p-2 cursor-pointer hover:bg-gray-700"
            >
              <Card card={card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
