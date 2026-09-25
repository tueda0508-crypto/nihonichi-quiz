import { useRegisterSW } from 'virtual:pwa-register/react'
import { useCallback, useEffect, useReducer } from 'react'
import { planGame } from './game/plan'
import { getQuestion } from './game/questions'
import {
  allHostAnswersIn,
  currentPlayerId,
  type GameState,
  genrePerfects,
  IN_GAME_PHASES,
  initialState,
  previousPlayerId,
  ranking,
  reducer,
  reviews,
  scores,
} from './game/reducer'
import { plainText } from './game/ruby'
import { usePrefersReducedMotion, useTapGuard, useWakeLock } from './platform/hooks'
import { loadGame, saveGame } from './platform/session'
import { setSoundEnabled, sfx, unlockAudio } from './platform/sfx'
import { stopSpeaking } from './platform/speech'
import { Gather } from './screens/Gather'
import { Handoff } from './screens/Handoff'
import { Home } from './screens/Home'
import { Host } from './screens/Host'
import { Menu } from './screens/Menu'
import { Players } from './screens/Players'
import { Question } from './screens/Question'
import { Result } from './screens/Result'
import { Revealed, Revealing } from './screens/Reveal'
import { Settings } from './screens/Settings'

function init(): GameState {
  const saved = loadGame()
  return saved ? reducer(initialState, { type: 'RESTORE', state: saved }) : initialState
}

export function App() {
  const [s, dispatch] = useReducer(reducer, undefined, init)
  const reducedMotion = usePrefersReducedMotion()
  const inGame = IN_GAME_PHASES.includes(s.phase)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      // ホーム画面アプリは起動しっぱなしになりやすいので、画面に戻るたびに更新を確かめる
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void registration.update()
      })
    },
  })

  useEffect(() => saveGame(s), [s])
  useEffect(() => setSoundEnabled(s.soundOn), [s.soundOn])
  useWakeLock(inGame)

  // 復元したときなど、最初のタップで音を出せるようにする
  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  // ゲーム中の「戻る」操作は、やめるかどうかを確かめる
  useEffect(() => {
    if (!inGame) return
    history.pushState({ inGame: true }, '')
    const onPop = () => {
      history.pushState({ inGame: true }, '')
      dispatch({ type: 'ASK_QUIT' })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [inGame])

  // 画面が変わったら：連打防止・先頭へスクロール・見出しへフォーカス・読み上げを止める
  const screenKey = `${s.phase}-${s.qIndex}-${s.turnIndex}`
  const locked = useTapGuard(screenKey)
  // biome-ignore lint/correctness/useExhaustiveDependencies: 画面が変わったときだけ動かす
  useEffect(() => {
    stopSpeaking()
    window.scrollTo(0, 0)
    const id = requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true })
    })
    if (s.phase === 'handoff') sfx.handoff()
    return () => cancelAnimationFrame(id)
  }, [screenKey])

  const playersById = new Map(s.players.map((p) => [p.id, p]))
  const planned = s.plan[s.qIndex]
  const question = planned ? getQuestion(planned.questionId) : undefined
  const answers = s.answers[s.qIndex] ?? {}
  const activePlayers = s.activeIds.map((id) => playersById.get(id)).filter((p) => p !== undefined)

  // 正解発表は、演出が終わってから1回だけ読み上げる（回答中は誰が何を選んだかを読み上げない）
  let announcement = ''
  if (s.phase === 'revealed' && question) {
    const answer = question.choices.find((c) => c.id === question.answerId)
    const parts = activePlayers.map(
      (p) => `${p.name} ${answers[p.id] === question.answerId ? 'せいかい' : 'ざんねん'}`,
    )
    announcement = `せいかいは ${plainText(answer?.label ?? '')}。${parts.join('、')}`
  }

  const onRevealDone = useCallback(() => dispatch({ type: 'REVEAL_DONE' }), [])
  const onSettingsChange = useCallback(
    (patch: Partial<GameState['settings']>) => dispatch({ type: 'UPDATE_SETTINGS', patch }),
    [],
  )
  const openMenu = () => dispatch({ type: 'OPEN_MENU' })

  const start = () => {
    unlockAudio()
    const plan = planGame(s.settings.genre, s.settings.count, s.recentIds, Math.random)
    dispatch({ type: 'START', plan })
  }

  const renderScreen = () => {
    switch (s.phase) {
      case 'home':
        return (
          <Home
            soundOn={s.soundOn}
            onToggleSound={() => dispatch({ type: 'TOGGLE_SOUND' })}
            onPlay={() => {
              unlockAudio()
              sfx.tap()
              dispatch({ type: 'GO', phase: 'players' })
            }}
            needRefresh={needRefresh}
            onUpdate={() => void updateServiceWorker(true)}
          />
        )
      case 'players':
        return (
          <Players
            initial={s.players}
            onBack={() => dispatch({ type: 'GO', phase: 'home' })}
            onNext={(players) => {
              dispatch({ type: 'SET_PLAYERS', players })
              dispatch({ type: 'GO', phase: 'settings' })
            }}
          />
        )
      case 'settings':
        return (
          <Settings
            settings={s.settings}
            players={s.players}
            onChange={onSettingsChange}
            onBack={() => dispatch({ type: 'GO', phase: 'players' })}
            onStart={start}
          />
        )
      case 'handoff': {
        const player = playersById.get(currentPlayerId(s) ?? '')
        if (!player || !planned) return null
        const prevId = previousPlayerId(s)
        return (
          <Handoff
            key={screenKey}
            player={player}
            previous={prevId ? playersById.get(prevId) : undefined}
            qIndex={s.qIndex}
            total={s.plan.length}
            answered={s.turnIndex}
            participants={s.turnOrder.length}
            onBegin={() => dispatch({ type: 'BEGIN_TURN' })}
            onUndo={() => dispatch({ type: 'UNDO' })}
            onMenu={openMenu}
          />
        )
      }
      case 'answering': {
        const player = playersById.get(currentPlayerId(s) ?? '')
        if (!player || !planned || !question) return null
        return (
          // 人が替わるたびに作り直し、前の人の押した跡やフォーカスを残さない
          <Question
            key={`${planned.questionId}-${player.id}`}
            question={question}
            choiceOrder={planned.choiceOrder}
            player={player}
            qIndex={s.qIndex}
            total={s.plan.length}
            onAnswer={(choiceId) => {
              sfx.tap()
              dispatch({ type: 'ANSWER', choiceId })
            }}
            onMenu={openMenu}
          />
        )
      }
      case 'gather': {
        const lastId = previousPlayerId(s)
        return (
          <Gather
            players={activePlayers}
            last={lastId ? playersById.get(lastId) : undefined}
            qIndex={s.qIndex}
            total={s.plan.length}
            onReveal={() => dispatch({ type: 'REVEAL' })}
            onUndo={() => dispatch({ type: 'UNDO' })}
            onMenu={openMenu}
          />
        )
      }
      case 'hostInput':
        if (!planned || !question) return null
        return (
          <Host
            question={question}
            choiceOrder={planned.choiceOrder}
            players={activePlayers}
            hostId={s.settings.hostId}
            answers={answers}
            qIndex={s.qIndex}
            total={s.plan.length}
            onAnswer={(playerId, choiceId) => {
              sfx.tap()
              dispatch({ type: 'HOST_ANSWER', playerId, choiceId })
            }}
            onReveal={() => allHostAnswersIn(s) && dispatch({ type: 'REVEAL' })}
            onMenu={openMenu}
          />
        )
      case 'revealing':
        return <Revealing reducedMotion={reducedMotion} onDone={onRevealDone} />
      case 'revealed': {
        if (!question) return null
        const sc = scores(s)
        const rows = activePlayers.map((p) => {
          const choiceId = answers[p.id]
          const choice = question.choices.find((c) => c.id === choiceId)
          return {
            player: p,
            choiceLabel: choice ? choice.label : null,
            correct: choiceId === question.answerId,
            total: sc[p.id] ?? 0,
          }
        })
        return (
          <Revealed
            question={question}
            rows={rows}
            qIndex={s.qIndex}
            total={s.plan.length}
            isLast={s.qIndex + 1 >= s.plan.length}
            onNext={() => dispatch({ type: 'NEXT' })}
            onMenu={openMenu}
          />
        )
      }
      case 'result':
        return (
          <Result
            ranking={ranking(s)}
            reviews={reviews(s)}
            perfects={genrePerfects(s).map((p) => ({
              playerName: playersById.get(p.playerId)?.name ?? '',
              genre: p.genre,
            }))}
            onAgain={() => dispatch({ type: 'NEW_GAME' })}
            onChangeMembers={() => dispatch({ type: 'GO', phase: 'players' })}
            onHome={() => dispatch({ type: 'GO', phase: 'home' })}
          />
        )
    }
  }

  const canPass = s.settings.mode === 'pass' && (s.phase === 'handoff' || s.phase === 'answering')
  const current = canPass ? playersById.get(currentPlayerId(s) ?? '') : undefined

  return (
    <>
      <div style={{ pointerEvents: locked ? 'none' : undefined }}>{renderScreen()}</div>
      {inGame && s.menuOpen && (
        <Menu
          soundOn={s.soundOn}
          onToggleSound={() => dispatch({ type: 'TOGGLE_SOUND' })}
          current={current}
          onPass={() => dispatch({ type: 'PASS' })}
          activePlayers={activePlayers}
          onQuitPlayer={(playerId) => dispatch({ type: 'QUIT_PLAYER', playerId })}
          confirmQuit={s.confirmQuit}
          onAskQuit={() => dispatch({ type: 'ASK_QUIT' })}
          onCancelQuit={() => dispatch({ type: 'CANCEL_QUIT' })}
          onQuitGame={() => dispatch({ type: 'QUIT_GAME' })}
          onClose={() => dispatch({ type: 'CLOSE_MENU' })}
        />
      )}
      <div aria-live="polite" className="sr-only-text">
        {announcement}
      </div>
    </>
  )
}
