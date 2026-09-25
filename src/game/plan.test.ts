import { describe, expect, it } from 'vitest'
import { countOptions, planGame } from './plan'
import { getQuestion, QUESTIONS } from './questions'
import { seededRng, shuffle } from './random'

describe('shuffle', () => {
  it('要素を失わず、元の配列を変えない', () => {
    const src = [1, 2, 3, 4, 5]
    const out = shuffle(src, seededRng(1))
    expect([...out].sort()).toEqual(src)
    expect(src).toEqual([1, 2, 3, 4, 5])
  })

  it('同じシードなら同じ結果', () => {
    expect(shuffle([1, 2, 3, 4], seededRng(42))).toEqual(shuffle([1, 2, 3, 4], seededRng(42)))
  })
})

describe('planGame', () => {
  it('同じゲーム内で問題が重複しない', () => {
    const plan = planGame('mix', 10, [], seededRng(3))
    expect(plan).toHaveLength(10)
    expect(new Set(plan.map((p) => p.questionId)).size).toBe(10)
  })

  it('おまかせで5問なら全ジャンルから1問ずつ', () => {
    const plan = planGame('mix', 5, [], seededRng(7))
    const genres = new Set(plan.map((p) => getQuestion(p.questionId).genre))
    expect(genres.size).toBe(5)
  })

  it('直前のゲームの問題を後回しにする', () => {
    const recent = QUESTIONS.slice(0, 5).map((q) => q.id)
    const plan = planGame('mix', 5, recent, seededRng(9))
    for (const p of plan) expect(recent).not.toContain(p.questionId)
  })

  it('ジャンル指定では、そのジャンルの問題だけ・問題数を超えない', () => {
    const plan = planGame('food', 10, [], seededRng(5))
    expect(plan.length).toBe(QUESTIONS.filter((q) => q.genre === 'food').length)
    for (const p of plan) expect(getQuestion(p.questionId).genre).toBe('food')
  })

  it('選択肢の並びは4つのIDの並べ替え', () => {
    for (const p of planGame('mix', 10, [], seededRng(11))) {
      expect([...p.choiceOrder].sort()).toEqual(
        getQuestion(p.questionId)
          .choices.map((c) => c.id)
          .sort(),
      )
    }
  })
})

describe('countOptions', () => {
  it('足りない問題数は選べない', () => {
    expect(countOptions(10).map((o) => o.disabled)).toEqual([false, false, true])
  })

  it('5問未満なら「ぜんぶ」を出す', () => {
    const opts = countOptions(2)
    expect(opts[0]).toEqual({ value: 2, label: 'ぜんぶ（2問）', disabled: false })
    expect(opts.slice(1).every((o) => o.disabled)).toBe(true)
  })
})
