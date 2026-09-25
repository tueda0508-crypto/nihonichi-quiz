import { describe, expect, it } from 'vitest'
import { planGame } from './plan'
import type { Player } from './players'
import { getQuestion } from './questions'
import { seededRng } from './random'
import {
  type Action,
  type GameState,
  genrePerfects,
  initialState,
  ranking,
  reducer,
  turnOrderFor,
} from './reducer'

const players: Player[] = [
  { id: 'p1', name: 'パパ', slot: 0 },
  { id: 'p2', name: 'ママ', slot: 1 },
  { id: 'p3', name: 'はると', slot: 2 },
]

function run(state: GameState, ...actions: Action[]): GameState {
  return actions.reduce(reducer, state)
}

function started(count = 3, mode: 'pass' | 'host' = 'pass'): GameState {
  return run(
    initialState,
    { type: 'SET_PLAYERS', players },
    { type: 'UPDATE_SETTINGS', patch: { mode, count } },
    { type: 'START', plan: planGame('mix', count, [], seededRng(1)) },
  )
}

const answerOf = (s: GameState) => getQuestion(s.plan[s.qIndex].questionId).answerId
const wrongOf = (s: GameState) =>
  getQuestion(s.plan[s.qIndex].questionId).choices.find((c) => c.id !== answerOf(s))?.id ?? ''

/** 今の問題を、指定の正誤で全員に答えさせる */
function answerAll(s: GameState, correct: Record<string, boolean>): GameState {
  let st = s
  while (st.phase === 'handoff') {
    const pid = st.turnOrder[st.turnIndex]
    st = run(
      st,
      { type: 'BEGIN_TURN' },
      { type: 'ANSWER', choiceId: correct[pid] ? answerOf(st) : wrongOf(st) },
    )
  }
  return st
}

describe('順番', () => {
  it('最初に答える人を1問ごとにずらす', () => {
    expect(turnOrderFor(['a', 'b', 'c'], 0)).toEqual(['a', 'b', 'c'])
    expect(turnOrderFor(['a', 'b', 'c'], 1)).toEqual(['b', 'c', 'a'])
    expect(turnOrderFor(['a', 'b', 'c'], 3)).toEqual(['a', 'b', 'c'])
  })
})

describe('スマホを回すモード', () => {
  it('全員答えると「みんなに見せて」→発表→次の問題', () => {
    let s = started()
    expect(s.phase).toBe('handoff')
    s = answerAll(s, { p1: true, p2: true, p3: false })
    expect(s.phase).toBe('gather')
    s = run(s, { type: 'REVEAL' }, { type: 'REVEAL_DONE' })
    expect(s.phase).toBe('revealed')
    s = run(s, { type: 'NEXT' })
    expect(s.qIndex).toBe(1)
    expect(s.turnOrder[0]).toBe('p2')
  })

  it('交代画面で前の人がやりなおせる', () => {
    let s = started()
    s = run(s, { type: 'BEGIN_TURN' }, { type: 'ANSWER', choiceId: 'b' })
    expect(s.phase).toBe('handoff')
    s = run(s, { type: 'UNDO' })
    expect(s.phase).toBe('answering')
    expect(s.turnOrder[s.turnIndex]).toBe('p1')
    expect(s.answers[0]).toEqual({})
  })

  it('最初の人の交代画面では、やりなおしは何もしない', () => {
    const s = started()
    expect(run(s, { type: 'UNDO' })).toBe(s)
  })

  it('パスすると次の人へ進み、点は入らない', () => {
    let s = run(started(), { type: 'PASS' })
    expect(s.answers[0].p1).toBeNull()
    expect(s.turnOrder[s.turnIndex]).toBe('p2')
    s = answerAll(s, { p2: true, p3: true })
    s = run(s, { type: 'REVEAL' }, { type: 'REVEAL_DONE' })
    const r = ranking(s)
    expect(r.find((e) => e.player.id === 'p1')?.score).toBe(0)
  })

  it('答える番の人がぬけると、その人を飛ばす', () => {
    let s = started()
    s = run(s, { type: 'BEGIN_TURN' }, { type: 'ANSWER', choiceId: 'a' })
    s = run(s, { type: 'QUIT_PLAYER', playerId: 'p2' })
    expect(s.activeIds).toEqual(['p1', 'p3'])
    expect(s.turnOrder[s.turnIndex]).toBe('p3')
    expect(s.phase).toBe('handoff')
  })

  it('ぬけた人は順位をつけず、後ろに並べる', () => {
    let s = started(1)
    s = answerAll(s, { p1: false, p2: false, p3: false })
    s = run(s, { type: 'QUIT_PLAYER', playerId: 'p1' }, { type: 'REVEAL' }, { type: 'REVEAL_DONE' })
    expect(ranking(s).map((e) => [e.player.id, e.rank])).toEqual([
      ['p2', 1],
      ['p3', 1],
      ['p1', 0],
    ])
  })

  it('全員ぬけたらホームへ', () => {
    let s = started()
    for (const p of players) s = run(s, { type: 'QUIT_PLAYER', playerId: p.id })
    expect(s.phase).toBe('home')
  })

  it('最後の問題のあとは結果へ進み、出た問題を覚えておく', () => {
    let s = started(3)
    for (let i = 0; i < 3; i++) {
      s = answerAll(s, { p1: true, p2: i < 2, p3: false })
      s = run(s, { type: 'REVEAL' }, { type: 'REVEAL_DONE' }, { type: 'NEXT' })
    }
    expect(s.phase).toBe('result')
    expect(s.recentIds).toHaveLength(3)
    const r = ranking(s)
    expect(r.map((e) => [e.player.id, e.score, e.rank])).toEqual([
      ['p1', 3, 1],
      ['p2', 2, 2],
      ['p3', 0, 3],
    ])
  })

  it('同点は同じ順位', () => {
    let s = started(1)
    s = answerAll(s, { p1: true, p2: true, p3: false })
    s = run(s, { type: 'REVEAL' }, { type: 'REVEAL_DONE' })
    expect(ranking(s).map((e) => e.rank)).toEqual([1, 1, 3])
  })

  it('発表前の問題は点数に入らない', () => {
    let s = started(1)
    s = answerAll(s, { p1: true, p2: true, p3: true })
    expect(ranking(s).every((e) => e.score === 0)).toBe(true)
  })

  it('やめる確認で「つづける」を選ぶと、メニューごと閉じてゲームに戻る', () => {
    const s = run(started(), { type: 'ASK_QUIT' }, { type: 'CANCEL_QUIT' })
    expect(s.menuOpen).toBe(false)
    expect(s.confirmQuit).toBe(false)
    expect(s.phase).toBe('handoff')
  })

  it('復元すると回答画面ではなく交代画面から再開する', () => {
    const s = run(started(), { type: 'BEGIN_TURN' })
    expect(s.phase).toBe('answering')
    expect(run(initialState, { type: 'RESTORE', state: s }).phase).toBe('handoff')
  })
})

describe('司会モード', () => {
  it('全員の答えがそろうまで発表できない', () => {
    let s = started(3, 'host')
    expect(s.phase).toBe('hostInput')
    expect(s.settings.hostId).toBe('p1')
    s = run(s, { type: 'HOST_ANSWER', playerId: 'p1', choiceId: 'a' }, { type: 'REVEAL' })
    expect(s.phase).toBe('hostInput')
    s = run(
      s,
      { type: 'HOST_ANSWER', playerId: 'p2', choiceId: 'a' },
      { type: 'HOST_ANSWER', playerId: 'p3', choiceId: 'b' },
      { type: 'REVEAL' },
    )
    expect(s.phase).toBe('revealing')
  })

  it('司会の点をノーカウントにすると順位から外れる', () => {
    let s = started(1, 'host')
    s = run(s, { type: 'UPDATE_SETTINGS', patch: { hostCounts: false } })
    expect(ranking(s).map((e) => e.player.id)).not.toContain('p1')
  })
})

describe('がんばり賞', () => {
  it('2問以上出たジャンルをぜんぶ正解した人', () => {
    let s = run(
      initialState,
      { type: 'SET_PLAYERS', players },
      { type: 'UPDATE_SETTINGS', patch: { genre: 'food', count: 2 } },
      { type: 'START', plan: planGame('food', 2, [], seededRng(2)) },
    )
    for (let i = 0; i < 2; i++) {
      s = answerAll(s, { p1: true, p2: i === 0, p3: false })
      s = run(s, { type: 'REVEAL' }, { type: 'REVEAL_DONE' }, { type: 'NEXT' })
    }
    expect(genrePerfects(s)).toEqual([{ playerId: 'p1', genre: 'food' }])
  })
})
