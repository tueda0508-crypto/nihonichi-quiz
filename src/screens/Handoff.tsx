import { IconUndo } from '../components/Icons'
import { BigButton, MenuButton, Pill } from '../components/ui'
import { type Player, styleOf } from '../game/players'

type Props = {
  player: Player
  previous?: Player
  qIndex: number
  total: number
  answered: number
  participants: number
  onBegin: () => void
  onUndo: () => void
  onMenu: () => void
}

/** 交代画面（目隠し）。次の人の色で全面を覆い、前の人の答えは何も残さない */
export function Handoff({
  player,
  previous,
  qIndex,
  total,
  answered,
  participants,
  onBegin,
  onUndo,
  onMenu,
}: Props) {
  const st = styleOf(player)
  const prevSt = previous ? styleOf(previous) : undefined
  return (
    <div
      className="anim-wipe on-color min-h-dvh"
      style={{ background: st.base, color: st.on, ['--screen-bg' as string]: st.base }}
    >
      <div className="screen items-center">
        <div className="flex w-full items-center justify-between">
          <Pill className="bg-black/25">
            問題 {qIndex + 1} / {total}
          </Pill>
          <MenuButton onClick={onMenu} onColor />
        </div>

        <main className="screen-body items-center justify-center text-center">
          <div
            aria-hidden="true"
            className="anim-pop flex size-[132px] items-center justify-center rounded-full text-[60px]"
            style={{ background: st.on, color: st.base, boxShadow: `0 0 0 10px ${st.on}38` }}
          >
            {st.symbol}
          </div>
          <h1
            className="m-0 mt-3 font-display text-5xl leading-tight font-normal break-all"
            tabIndex={-1}
            data-autofocus
          >
            {player.name}
          </h1>
          <div className="text-[26px] font-black">の ばんだよ！</div>
          <div className="text-base">スマホを {player.name} に わたしてね</div>
          <Pill className="mt-6 bg-black/25">
            こたえた人 {answered} / {participants}
          </Pill>
        </main>

        <div className="screen-footer w-full">
          <BigButton
            variant="onColor"
            onClick={onBegin}
            className="h-[72px] rounded-3xl"
            style={{ color: st.depth, ['--depth' as string]: st.depth }}
          >
            タップしてはじめる
          </BigButton>
          {previous && prevSt && (
            <button
              type="button"
              onClick={onUndo}
              className="flex h-12 items-center justify-center gap-1.5 text-[15px] font-black underline underline-offset-4"
            >
              <IconUndo size={18} />
              {prevSt.symbol}
              {previous.name}、えらびなおす？
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
