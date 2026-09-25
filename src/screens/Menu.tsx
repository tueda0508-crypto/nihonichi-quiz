import { useEffect, useRef, useState } from 'react'
import { IconExit, IconSkip, IconSpeaker, IconStop } from '../components/Icons'
import { Avatar, BigButton } from '../components/ui'
import type { Player } from '../game/players'

type Props = {
  soundOn: boolean
  onToggleSound: () => void
  /** 今こたえる番の人（スマホを回すモードの交代・回答中だけ） */
  current?: Player
  onPass: () => void
  activePlayers: Player[]
  onQuitPlayer: (id: string) => void
  confirmQuit: boolean
  onAskQuit: () => void
  onCancelQuit: () => void
  onQuitGame: () => void
  onClose: () => void
}

/** ゲーム中メニュー（ていし中） */
export function Menu(props: Props) {
  const { soundOn, onToggleSound, current, onPass, activePlayers, onQuitPlayer, confirmQuit } = props
  const [choosingQuitter, setChoosingQuitter] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  // 表示内容が切り替わるたびに見出しへフォーカスを移す
  // biome-ignore lint/correctness/useExhaustiveDependencies: 切り替えのたびに実行したい
  useEffect(() => {
    titleRef.current?.focus()
  }, [confirmQuit, choosingQuitter])

  const { onClose } = props
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const rowClass =
    'flex min-h-[60px] items-center gap-3 rounded-2xl border-2 border-border-subtle bg-surface px-3.5 text-left text-base font-black'

  return (
    <div className="fixed inset-0 z-30 flex items-end">
      <button
        type="button"
        tabIndex={-1}
        aria-label="とじる"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/55"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
        className="anim-sheet relative mx-auto flex w-full max-w-[480px] flex-col gap-3 rounded-t-[28px] bg-ground px-5 pt-3 pb-[calc(28px+env(safe-area-inset-bottom))]"
      >
        <div aria-hidden="true" className="h-[5px] w-11 self-center rounded-full bg-[#B3A690]" />

        {confirmQuit ? (
          <>
            <h2
              id="menu-title"
              ref={titleRef}
              tabIndex={-1}
              className="m-0 mt-1 font-display text-[26px] font-normal"
            >
              ゲームをやめる？
            </h2>
            <p className="m-0 text-base leading-relaxed text-text-sub">
              ここまでの点数は消えて、はじめの画面にもどります。
            </p>
            <BigButton onClick={props.onQuitGame} className="mt-1">
              やめる
            </BigButton>
            <BigButton variant="secondary" size="md" onClick={props.onCancelQuit}>
              つづける
            </BigButton>
          </>
        ) : choosingQuitter ? (
          <>
            <h2
              id="menu-title"
              ref={titleRef}
              tabIndex={-1}
              className="m-0 mt-1 font-display text-[26px] font-normal"
            >
              だれが ぬける？
            </h2>
            {activePlayers.map((p) => (
              <button
                key={p.id}
                type="button"
                className={rowClass}
                onClick={() => {
                  setChoosingQuitter(false)
                  onQuitPlayer(p.id)
                }}
              >
                <Avatar player={p} size={30} />
                {p.name}
              </button>
            ))}
            <BigButton variant="secondary" size="md" onClick={() => setChoosingQuitter(false)}>
              もどる
            </BigButton>
          </>
        ) : (
          <>
            <h2
              id="menu-title"
              ref={titleRef}
              tabIndex={-1}
              className="m-0 mt-1 font-display text-[26px] font-normal"
            >
              ていし中
            </h2>
            <div className={rowClass}>
              <IconSpeaker />
              <span className="grow">効果音</span>
              <button
                type="button"
                role="switch"
                aria-checked={soundOn}
                aria-label="効果音"
                onClick={onToggleSound}
                className="flex h-9 w-[60px] items-center rounded-full p-[3px]"
                style={{
                  background: soundOn ? '#1B7F45' : '#958571',
                  justifyContent: soundOn ? 'flex-end' : 'flex-start',
                }}
              >
                <span className="size-[30px] rounded-full bg-white" />
              </button>
            </div>
            {current && (
              <button type="button" className={rowClass} onClick={onPass}>
                <IconSkip />
                {current.name} を この問題だけパス
              </button>
            )}
            {activePlayers.length > 1 && (
              <button type="button" className={rowClass} onClick={() => setChoosingQuitter(true)}>
                <IconExit />
                だれかが ぬける…
              </button>
            )}
            <button
              type="button"
              className={`${rowClass} border-primary-text text-primary-text`}
              onClick={props.onAskQuit}
            >
              <IconStop />
              ゲームをやめる（たしかめるよ）
            </button>
            <BigButton onClick={props.onClose} className="mt-1">
              つづける
            </BigButton>
          </>
        )}
      </div>
    </div>
  )
}
