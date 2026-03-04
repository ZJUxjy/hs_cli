import { apiGet, apiPost } from './client'

export async function fetchDecks() {
  return apiGet<any[]>('/decks')
}

 export async function createDeck(deck: { name: string; hero_class: string; cards: string[] }) {
  return apiPost<any>('/decks', deck)
}
