import data from '../data/questions.json'

export type GenreId = 'nature' | 'food' | 'building' | 'prefecture' | 'culture'

export type Question = {
  id: string
  genre: GenreId
  text: string
  choices: { id: string; label: string }[]
  answerId: string
  fact: { label: string; value: string }
  trivia: string
  source: { title: string; publisher: string; url: string }
  dataYear: string
  verifiedAt: string
}

export const QUESTIONS = data as Question[]

export const QUESTION_BY_ID: ReadonlyMap<string, Question> = new Map(QUESTIONS.map((q) => [q.id, q]))

export function getQuestion(id: string): Question {
  const q = QUESTION_BY_ID.get(id)
  if (!q) throw new Error(`問題が見つかりません: ${id}`)
  return q
}

export const GENRES: { id: GenreId; label: string; short: string }[] = [
  { id: 'nature', label: '自然・地理', short: '自然・地理' },
  { id: 'food', label: '食べもの・特産品', short: '食べもの' },
  { id: 'building', label: '建物・乗りもの', short: '建物・乗りもの' },
  { id: 'prefecture', label: '都道府県・まち', short: '都道府県' },
  { id: 'culture', label: 'スポーツ・記録・文化', short: '記録・文化' },
]

export function genreLabel(id: GenreId): string {
  return GENRES.find((g) => g.id === id)?.label ?? id
}

export type GenreChoice = GenreId | 'mix'

export function poolFor(genre: GenreChoice, questions: readonly Question[] = QUESTIONS): Question[] {
  return genre === 'mix' ? [...questions] : questions.filter((q) => q.genre === genre)
}
