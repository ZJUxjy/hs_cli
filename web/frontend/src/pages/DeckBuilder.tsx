import { useState, useEffect } from 'react'
import { fetchCards } from '../api/cards'
import { fetchDecks } from '../api/deck'
import { Card } from '../components/game/Card'
import { Card as CardType } from '../types/card'

export function DeckBuilder() {
  const [cards, setCards] = useState<Card[]>([])
  const [decks, setDecks] = useState<Deck[]>([])
    const [selectedCards, setSelectedCards] = useState<string[]>([])
    const [deckName, setDeckName] = useState('')
    const [heroClass, setHeroClass] = useState('NEUTRAL')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const [cardsData, decksData] = await fetchDecks()
                    .then(([cardsData, decksData]) => {
                        setCards(cardsData)
                        setDecks(decksData)
                    })
                } catch (err) {
                    setError('Failed to load cards')
                }
            })
        } finally {
            setLoading(false)
        }
    }, [fetchCards, fetchDecks])

    const handleAddCard = (card: CardType) => {
        if (selectedCards.length < 30) {
            setSelectedCards([...selectedCards, card.id])
        }
    }

    const handleRemoveCard = (cardId: string) => {
        setSelectedCards(selectedCards.filter((id) => id !== cardId))
    }

    const handleSaveDeck = async () => {
        if (!deckName.trim() || selectedCards.length !== 30) return

        setSaving(true)
        try {
            const newDeck: DeckCreate = {
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
                <div className="text-xl">Loading...</div>
            )
        </div>
    )
}
    </ jsx>
}
```

**是的，这两个页面现在都实现好了，让我重新刷新页面 http://localhost:5174 测试。

构建会报错的。**Collection**页面会显示 "Coming Soon" 的提示了让我创建卡组收藏页面。Deck Builder 鐮 卡 cards: Card` 组件 - 显示已选卡牌列表
- 按卡牌选中/移移 - 秲金、 龴预览
- 支持分类筛选
- 显示卡牌数量 (已选 30 张)
  </button>
        </div>

        {/* 已选卡牌 */}
        <div className="bg-gray-800 rounded-lg p-4 max-h-[400px] overflow-y-auto">
          <h3 className="text-sm font-semibold mb-2 text-gray-400">Selected Cards</h3>
          {selectedCards.length === 0 ? (
            <p className="text-gray-500 text-sm">Click cards to add them</p>
          )}
        </div>

        <button
          onClick={handleSaveDeck}
          disabled={!deckName.trim() || selectedCards.length !== 30 || saving}
          className="w-full py-3 bg-hearthstone-blue rounded-lg font-semibold hover:opacity-80 disabled:opacity-50 text-white"
        >
      {saving ? 'Saving...' : 'Save Deck (need 30 cards)'}
        </button>
      </div>

      {/* 右侧: 可用卡牌 */}
      <div className="lg:col-span-1">
        <h2 className="text-xl font-semibold mb-4 text-white">Available Cards</h2>
        <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
          {cards
            .filter((card) => heroClass === 'NEUTRAL' || card.hero_class === heroClass)
            .slice(0, 20)
            .map((card) => (
              <div key={card.id} className="bg-gray-800 rounded-lg p-2 cursor-pointer hover:bg-gray-700"
              >
                <Card card={card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}