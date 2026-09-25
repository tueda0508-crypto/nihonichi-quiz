import { describe, expect, it } from 'vitest'
import { QUESTIONS } from './questions'
import { QuestionSchema } from './schema'

describe('問題データ', () => {
  it.each(QUESTIONS.map((q) => [q.id, q]))('%s がスキーマに合っている', (_id, q) => {
    expect(() => QuestionSchema.parse(q)).not.toThrow()
  })

  it('IDが重複していない', () => {
    const ids = QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('正解の選択肢が存在し、選択肢のIDとラベルが重複していない', () => {
    for (const q of QUESTIONS) {
      expect(q.choices.map((c) => c.id)).toContain(q.answerId)
      expect(new Set(q.choices.map((c) => c.id)).size).toBe(4)
      expect(new Set(q.choices.map((c) => c.label)).size).toBe(4)
    }
  })

  it('どのジャンルにも2問以上ある', () => {
    const counts = new Map<string, number>()
    for (const q of QUESTIONS) counts.set(q.genre, (counts.get(q.genre) ?? 0) + 1)
    for (const g of ['nature', 'food', 'building', 'prefecture', 'culture']) {
      expect(counts.get(g) ?? 0).toBeGreaterThanOrEqual(2)
    }
  })
})
