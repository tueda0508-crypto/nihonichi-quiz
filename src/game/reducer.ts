import type { PlannedQuestion } from './plan'
import type { Player } from './players'
import { type GenreChoice, getQuestion } from './questions'

export type Phase =
  | 'home'
  | 'players'
  | 'settings'
  | 'handoff'
  | 'answering'
  | 'gather'
  | 'hostInput'
  | 'revealing'
  | 'revealed'
  | 'result'

export type Mode = 'pass' | 'host'

export type Settings = {
  genre: GenreChoice
  count: number
  mode: Mode
  hostId: string | null
  hostCounts: boolean
}

/** playerId → 選んだ選択肢ID（null はパス） */
export type Answers = Record<string, string | null>

export type GameState = {
  phase: Phase
  players: Player[]
  settings: Settings
  plan: PlannedQuestion[]
  qIndex: number
  /** 今の問題で答える順番（ゲームに残っている人だけ） */
  turnOrder: string[]
  turnIndex: number
  answers: Answers[]
  activeIds: string[]
  menuOpen: boolean
  confirmQuit: boolean
  /** 直前のゲームで出た問題（メモリ上だけ） */
  recentIds: string[]
  soundOn: boolean
}

export const IN_GAME_PHASES: readonly Phase[] = [
  'handoff',
  'answering',
  'gather',
  'hostInput',
  'revealing',
  'revealed',
]

export const initialState: GameState = {
  phase: 'home',
  players: [],
  settings: { genre: 'mix', count: 10, mode: 'pass', hostId: null, hostCounts: true },
  plan: [],
  qIndex: 0,
  turnOrder: [],
  turnIndex: 0,
  answers: [],
  activeIds: [],
  menuOpen: false,
  confirmQuit: false,
  recentIds: [],
  soundOn: true,
}

export type Action =
  | { type: 'GO'; phase: 'home' | 'players' | 'settings' }
  | { type: 'SET_PLAYERS'; players: Player[] }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<Settings> }
  | { type: 'START'; plan: PlannedQuestion[] }
  | { type: 'BEGIN_TURN' }
  | { type: 'ANSWER'; choiceId: string }
  | { type: 'UNDO' }
  | { type: 'PASS' }
  | { type: 'QUIT_PLAYER'; playerId: string }
  | { type: 'HOST_ANSWER'; playerId: string; choiceId: string }
  | { type: 'REVEAL' }
  | { type: 'REVEAL_DONE' }
  | { type: 'NEXT' }
  | { type: 'OPEN_MENU' }
  | { type: 'CLOSE_MENU' }
  | { type: 'ASK_QUIT' }
  | { type: 'CANCEL_QUIT' }
  | { type: 'QUIT_GAME' }
  | { type: 'NEW_GAME' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'RESTORE'; state: GameState }

/** 最初に答える人を1問ごとにずらす */
export function turnOrderFor(activeIds: readonly string[], qIndex: number): string[] {
  if (activeIds.length === 0) return []
  const k = qIndex % activeIds.length
  return [...activeIds.slice(k), ...activeIds.slice(0, k)]
}

export function currentPlayerId(s: GameState): string | undefined {
  return s.turnOrder[s.turnIndex]
}

export function previousPlayerId(s: GameState): string | undefined {
  return s.turnIndex > 0 ? s.turnOrder[s.turnIndex - 1] : undefined
}

function currentAnswers(s: GameState): Answers {
  return s.answers[s.qIndex] ?? {}
}

function withAnswers(s: GameState, answers: Answers): GameState {
  const all = [...s.answers]
  all[s.qIndex] = answers
  return { ...s, answers: all }
}

/** 次の人へ。全員終わったら「みんなに見せて」へ */
function advance(s: GameState): GameState {
  const turnIndex = s.turnIndex + 1
  if (turnIndex >= s.turnOrder.length) return { ...s, turnIndex, phase: 'gather' }
  return { ...s, turnIndex, phase: 'handoff' }
}

function startQuestion(s: GameState, qIndex: number): GameState {
  const answers = [...s.answers]
  answers[qIndex] = {}
  return {
    ...s,
    qIndex,
    answers,
    turnOrder: turnOrderFor(s.activeIds, qIndex),
    turnIndex: 0,
    phase: s.settings.mode === 'pass' ? 'handoff' : 'hostInput',
    menuOpen: false,
    confirmQuit: false,
  }
}

function resetGame(s: GameState): GameState {
  return {
    ...s,
    plan: [],
    qIndex: 0,
    turnOrder: [],
    turnIndex: 0,
    answers: [],
    activeIds: [],
    menuOpen: false,
    confirmQuit: false,
  }
}

export function allHostAnswersIn(s: GameState): boolean {
  const a = currentAnswers(s)
  return s.activeIds.every((id) => id in a)
}

export function reducer(s: GameState, action: Action): GameState {
  switch (action.type) {
    case 'GO':
      return { ...resetGame(s), phase: action.phase }

    case 'SET_PLAYERS': {
      const ids = new Set(action.players.map((p) => p.id))
      const hostId = s.settings.hostId && ids.has(s.settings.hostId) ? s.settings.hostId : null
      return { ...s, players: action.players, settings: { ...s.settings, hostId } }
    }

    case 'UPDATE_SETTINGS':
      return { ...s, settings: { ...s.settings, ...action.patch } }

    case 'START': {
      if (action.plan.length === 0 || s.players.length === 0) return s
      const hostId =
        s.settings.mode === 'host' ? (s.settings.hostId ?? s.players[0]?.id ?? null) : s.settings.hostId
      const base: GameState = {
        ...resetGame(s),
        settings: { ...s.settings, hostId },
        plan: action.plan,
        activeIds: s.players.map((p) => p.id),
      }
      return startQuestion(base, 0)
    }

    case 'BEGIN_TURN':
      return s.phase === 'handoff' ? { ...s, phase: 'answering' } : s

    case 'ANSWER': {
      if (s.phase !== 'answering') return s
      const pid = currentPlayerId(s)
      if (!pid) return s
      return advance(withAnswers(s, { ...currentAnswers(s), [pid]: action.choiceId }))
    }

    case 'UNDO': {
      if ((s.phase !== 'handoff' && s.phase !== 'gather') || s.turnIndex === 0) return s
      const pid = previousPlayerId(s)
      if (!pid) return s
      const { [pid]: _removed, ...rest } = currentAnswers(s)
      return { ...withAnswers(s, rest), turnIndex: s.turnIndex - 1, phase: 'answering' }
    }

    case 'PASS': {
      if (s.phase !== 'handoff' && s.phase !== 'answering') return s
      const pid = currentPlayerId(s)
      if (!pid) return s
      return { ...advance(withAnswers(s, { ...currentAnswers(s), [pid]: null })), menuOpen: false }
    }

    case 'QUIT_PLAYER': {
      if (!IN_GAME_PHASES.includes(s.phase)) return s
      const activeIds = s.activeIds.filter((id) => id !== action.playerId)
      if (activeIds.length === 0) return { ...resetGame(s), phase: 'home' }
      const { [action.playerId]: _gone, ...rest } = currentAnswers(s)
      let next: GameState = { ...withAnswers(s, rest), activeIds, menuOpen: false }
      if (s.phase === 'handoff' || s.phase === 'answering' || s.phase === 'gather') {
        const turnOrder = s.turnOrder.filter((id) => id !== action.playerId)
        const turnIndex = turnOrder.filter((id) => id in rest).length
        next = {
          ...next,
          turnOrder,
          turnIndex,
          phase: turnIndex >= turnOrder.length ? 'gather' : 'handoff',
        }
      }
      return next
    }

    case 'HOST_ANSWER': {
      if (s.phase !== 'hostInput' || !s.activeIds.includes(action.playerId)) return s
      return withAnswers(s, { ...currentAnswers(s), [action.playerId]: action.choiceId })
    }

    case 'REVEAL': {
      if (s.phase === 'gather') return { ...s, phase: 'revealing' }
      if (s.phase === 'hostInput' && allHostAnswersIn(s)) return { ...s, phase: 'revealing' }
      return s
    }

    case 'REVEAL_DONE':
      return s.phase === 'revealing' ? { ...s, phase: 'revealed' } : s

    case 'NEXT': {
      if (s.phase !== 'revealed') return s
      if (s.qIndex + 1 >= s.plan.length) {
        return {
          ...s,
          phase: 'result',
          menuOpen: false,
          recentIds: s.plan.map((p) => p.questionId),
        }
      }
      return startQuestion(s, s.qIndex + 1)
    }

    case 'OPEN_MENU':
      return { ...s, menuOpen: true }
    case 'CLOSE_MENU':
      return { ...s, menuOpen: false, confirmQuit: false }
    case 'ASK_QUIT':
      return { ...s, menuOpen: true, confirmQuit: true }
    case 'CANCEL_QUIT':
      // 「つづける」はゲームに戻る（メニューごと閉じる）
      return { ...s, menuOpen: false, confirmQuit: false }
    case 'QUIT_GAME':
      return { ...resetGame(s), phase: 'home' }

    case 'NEW_GAME':
      return { ...resetGame(s), phase: 'settings' }

    case 'TOGGLE_SOUND':
      return { ...s, soundOn: !s.soundOn }

    case 'RESTORE': {
      const r = action.state
      // 復元直後に回答画面を出すと、手元の人に問題が見えてしまうので交代画面に戻す
      const phase: Phase =
        r.phase === 'answering' ? 'handoff' : r.phase === 'revealing' ? 'revealed' : r.phase
      return { ...r, phase, menuOpen: false, confirmQuit: false }
    }
  }
}

// ---- 採点 ----

/** その問題の正誤が確定しているか */
function isScored(s: GameState, qIndex: number): boolean {
  if (qIndex < s.qIndex) return true
  return qIndex === s.qIndex && (s.phase === 'revealing' || s.phase === 'revealed' || s.phase === 'result')
}

export function isRanked(s: GameState, playerId: string): boolean {
  return !(s.settings.mode === 'host' && !s.settings.hostCounts && s.settings.hostId === playerId)
}

export function scores(s: GameState): Record<string, number> {
  const result: Record<string, number> = Object.fromEntries(s.players.map((p) => [p.id, 0]))
  s.plan.forEach((planned, i) => {
    if (!isScored(s, i)) return
    const answerId = getQuestion(planned.questionId).answerId
    for (const [pid, choice] of Object.entries(s.answers[i] ?? {})) {
      if (choice === answerId && pid in result) result[pid] += 1
    }
  })
  return result
}

export type RankEntry = { player: Player; score: number; rank: number; active: boolean }

/**
 * 同点は同じ順位（1, 1, 3 …）。順位は最後まで残った人だけでつけ、
 * とちゅうでぬけた人は rank 0 で後ろに並べる
 */
export function ranking(s: GameState): RankEntry[] {
  const sc = scores(s)
  const entries = s.players
    .filter((p) => isRanked(s, p.id))
    .map((p) => ({ player: p, score: sc[p.id] ?? 0, active: s.activeIds.includes(p.id) }))
    .sort((a, b) => Number(b.active) - Number(a.active) || b.score - a.score)
  const active = entries.filter((e) => e.active)
  return entries.map((e) => ({
    ...e,
    rank: e.active ? active.findIndex((x) => x.score === e.score) + 1 : 0,
  }))
}

export type QuestionReview = { index: number; questionId: string; correct: number; answered: number }

export function reviews(s: GameState): QuestionReview[] {
  return s.plan.map((planned, i) => {
    const answerId = getQuestion(planned.questionId).answerId
    const answers = Object.entries(s.answers[i] ?? {}).filter(([pid]) => isRanked(s, pid))
    return {
      index: i,
      questionId: planned.questionId,
      correct: answers.filter(([, c]) => c === answerId).length,
      answered: answers.filter(([, c]) => c !== null).length,
    }
  })
}

/** ジャンルの問題を2問以上出して、ぜんぶ正解した人 */
export function genrePerfects(s: GameState): { playerId: string; genre: string }[] {
  const byGenre = new Map<string, number[]>()
  s.plan.forEach((p, i) => {
    const g = getQuestion(p.questionId).genre
    byGenre.set(g, [...(byGenre.get(g) ?? []), i])
  })
  const out: { playerId: string; genre: string }[] = []
  for (const [genre, idxs] of byGenre) {
    if (idxs.length < 2) continue
    for (const p of s.players) {
      if (!isRanked(s, p.id)) continue
      const all = idxs.every((i) => s.answers[i]?.[p.id] === getQuestion(s.plan[i].questionId).answerId)
      if (all) out.push({ playerId: p.id, genre })
    }
  }
  return out
}
