// 進行中のゲームだけを sessionStorage に置く（タブを閉じれば消える。結果画面で削除）
import { QUESTION_BY_ID } from '../game/questions'
import { type GameState, IN_GAME_PHASES } from '../game/reducer'

const KEY = 'nihonichi-quiz:game:v1'

export function saveGame(state: GameState) {
  try {
    if (IN_GAME_PHASES.includes(state.phase)) sessionStorage.setItem(KEY, JSON.stringify(state))
    else sessionStorage.removeItem(KEY)
  } catch {
    // プライベートブラウズなどで使えなくても遊べるようにする
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const state = JSON.parse(raw) as GameState
    // 問題データが更新されて、保存した問題がなくなっていたら復元しない
    if (!IN_GAME_PHASES.includes(state.phase)) return null
    if (!state.plan?.every((p) => QUESTION_BY_ID.has(p.questionId))) return null
    return state
  } catch {
    return null
  }
}
