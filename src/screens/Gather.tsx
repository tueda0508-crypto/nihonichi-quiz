import { BigButton, MenuButton, Pill } from '../components/ui'
import { type Player, styleOf } from '../game/players'

type Props = {
  players: Player[]
  last?: Player
  qIndex: number
  total: number
  onReveal: () => void
  onUndo: () => void
  onMenu: () => void
}

/** 全員が答えたら、画面をみんなに向けてから発表する */
export function Gather({ players, last, qIndex, total, onReveal, onUndo, onMenu }: Props) {
  const lastSt = last ? styleOf(last) : undefined
  return (
    <div className="anim-wipe min-h-dvh bg-ink text-ground" style={{ ['--screen-bg' as string]: '#221C18' }}>
      <div className="screen items-center">
        <div className="flex w-full items-center justify-between">
          <Pill className="bg-white/12">
            問題 {qIndex + 1} / {total}
          </Pill>
          <MenuButton onClick={onMenu} onColor />
        </div>

        <main className="screen-body items-center justify-center text-center">
          <svg className="anim-pop" width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="56" fill="#F2B33D" />
            <path
              d="M34 62l18 18 36-40"
              fill="none"
              stroke="#221C18"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1
            className="m-0 mt-2 font-display text-[40px] leading-tight font-normal"
            tabIndex={-1}
            data-autofocus
          >
            みんな
            <br />
            そろった！
          </h1>
          <p className="m-0 text-lg leading-relaxed">
            <ruby>
              画面<rt className="text-ground">がめん</rt>
            </ruby>
            を みんなに
            <ruby>
              向<rt className="text-ground">む</rt>
            </ruby>
            けてね
          </p>
          <div
            className="mt-6 flex flex-wrap justify-center gap-3"
            role="img"
            aria-label={`こたえた人 ${players.length}人`}
          >
            {players.map((p) => {
              const st = styleOf(p)
              return (
                <span
                  key={p.id}
                  className="flex size-12 items-center justify-center rounded-full text-xl"
                  style={{ background: st.base, color: st.on }}
                >
                  {st.symbol}
                </span>
              )
            })}
          </div>
        </main>

        <div className="screen-footer w-full">
          <BigButton variant="gold" onClick={onReveal} className="h-[72px] rounded-3xl text-2xl">
            せいかい発表！
          </BigButton>
          {last && lastSt && (
            <button
              type="button"
              onClick={onUndo}
              className="flex h-12 items-center justify-center text-[15px] font-black underline underline-offset-4"
            >
              {lastSt.symbol}
              {last.name}、えらびなおす？
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
