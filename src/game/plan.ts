import { type GenreChoice, poolFor, QUESTIONS, type Question } from './questions'
import { type Rng, shuffle } from './random'

export type PlannedQuestion = { questionId: string; choiceOrder: string[] }

/**
 * 1ゲーム分の出題を決める。
 * - 直前のゲームで出た問題は後回し（足りないときだけ使う）
 * - おまかせはジャンルを順番に回して偏りを防ぐ
 * - 選択肢の並びは問題ごとに1回だけ決め、全員が同じ並びを見る
 */
export function planGame(
  genre: GenreChoice,
  count: number,
  recentIds: readonly string[],
  rng: Rng,
  questions: readonly Question[] = QUESTIONS,
): PlannedQuestion[] {
  const recent = new Set(recentIds)
  const pool = poolFor(genre, questions)
  const fresh = pool.filter((q) => !recent.has(q.id))
  const stale = pool.filter((q) => recent.has(q.id))

  // おまかせはジャンルを順番に回して取る。新しい問題を先に使い切ってから、直前の問題に手をつける
  const roundRobin = (qs: Question[], limit: number): Question[] => {
    if (genre !== 'mix') return shuffle(qs, rng).slice(0, limit)
    const buckets = new Map<string, Question[]>()
    for (const q of qs) buckets.set(q.genre, [...(buckets.get(q.genre) ?? []), q])
    const queues = shuffle([...buckets.values()], rng).map((b) => shuffle(b, rng))
    const out: Question[] = []
    while (out.length < limit && queues.some((q) => q.length > 0)) {
      for (const queue of queues) {
        const next = queue.shift()
        if (next && out.length < limit) out.push(next)
      }
    }
    // ジャンルが決まった順に並ばないよう混ぜる
    return shuffle(out, rng)
  }

  const fromFresh = roundRobin(fresh, count)
  const picked = [...fromFresh, ...roundRobin(stale, count - fromFresh.length)]

  return picked.map((q) => ({
    questionId: q.id,
    choiceOrder: shuffle(
      q.choices.map((c) => c.id),
      rng,
    ),
  }))
}

/** 選べる問題数の選択肢。足りないものは disabled、5問未満のジャンルは「ぜんぶ」を出す */
export function countOptions(poolSize: number): { value: number; label: string; disabled: boolean }[] {
  const base = [5, 10, 20].map((n) => ({ value: n, label: `${n}問`, disabled: n > poolSize }))
  if (poolSize > 0 && poolSize < 5)
    return [{ value: poolSize, label: `ぜんぶ（${poolSize}問）`, disabled: false }, ...base]
  return base
}

/** だいたいの所要時間（分）。1人15秒 + 発表30秒 */
export function estimateMinutes(count: number, players: number, mode: 'pass' | 'host'): number {
  const perQuestion = mode === 'pass' ? players * 15 + 30 : 20 + 30
  return Math.max(1, Math.round((count * perQuestion) / 60))
}
