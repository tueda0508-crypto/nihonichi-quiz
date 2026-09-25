import { IconSpeaker } from '../components/Icons'
import { Ruby } from '../components/Ruby'
import { Avatar, BigButton, MenuButton, Pill } from '../components/ui'
import { type Player, styleOf } from '../game/players'
import type { Question } from '../game/questions'
import type { Answers } from '../game/reducer'
import { canSpeak } from '../platform/speech'
import { questionFontSize, readAloud } from './Question'

type Props = {
  question: Question
  choiceOrder: string[]
  players: Player[]
  hostId: string | null
  answers: Answers
  qIndex: number
  total: number
  onAnswer: (playerId: string, choiceId: string) => void
  onReveal: () => void
  onMenu: () => void
}

/** 司会モード：問題を読み上げ、みんなの答えを司会が入力する（答えはまだ出さない） */
export function Host({
  question,
  choiceOrder,
  players,
  hostId,
  answers,
  qIndex,
  total,
  onAnswer,
  onReveal,
  onMenu,
}: Props) {
  // 司会を先頭にして「先に自分の答えを入れる」流れにする
  const ordered = [...players].sort((a, b) => Number(b.id === hostId) - Number(a.id === hostId))
  const remaining = players.filter((p) => !(p.id in answers)).length

  return (
    <div className="screen">
      <div className="flex items-center gap-2.5">
        <MenuButton onClick={onMenu} />
        <Pill className="bg-ink py-1.5 text-[13px] text-ground">司会モード</Pill>
        <div className="grow" />
        <div className="text-base font-black">
          {qIndex + 1}
          <span className="text-text-muted"> / {total}</span>
        </div>
      </div>

      <main className="screen-body mt-3">
        <div className="flex flex-col gap-2.5 rounded-[22px] border-2 border-border-subtle bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="text-[13px] text-text-sub">読み上げてね（答えはまだ出ないよ）</div>
            {canSpeak && (
              <button
                type="button"
                aria-label="問題を読み上げる"
                onClick={() => readAloud(question, choiceOrder)}
                className="flex size-11 items-center justify-center rounded-full border-2 border-border-strong"
              >
                <IconSpeaker size={20} />
              </button>
            )}
          </div>
          <h1
            className="m-0 leading-normal font-black"
            style={{ fontSize: questionFontSize(question.text) - 6 }}
            tabIndex={-1}
            data-autofocus
          >
            <Ruby text={question.text} />
          </h1>
          <ol className="m-0 grid list-none grid-cols-2 gap-2 p-0">
            {choiceOrder.map((id, i) => {
              const c = question.choices.find((x) => x.id === id)
              return (
                <li key={id} className="flex items-center gap-2 text-base font-black">
                  <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-ink text-[13px] text-white">
                    {i + 1}
                  </span>
                  {c && <Ruby text={c.label} />}
                </li>
              )
            })}
          </ol>
        </div>

        <div className="mt-0.5 flex items-baseline justify-between">
          <h2 className="m-0 text-[15px] font-black">みんなの答え</h2>
          <span className="text-[13px] text-text-sub">司会は さいしょに自分の答えを</span>
        </div>

        <div className="flex flex-col gap-2">
          {ordered.map((p) => {
            const st = styleOf(p)
            const chosen = answers[p.id]
            const isHost = p.id === hostId
            return (
              <div
                key={p.id}
                role="group"
                aria-label={`${p.name}${isHost ? '（司会）' : ''}の答え`}
                className={`flex items-center gap-1.5 rounded-2xl bg-surface px-2 py-1.5 ${
                  isHost
                    ? 'border-2 border-ink'
                    : chosen === undefined
                      ? 'border-2 border-dashed border-border-strong'
                      : 'border-2 border-border-subtle'
                }`}
              >
                <Avatar player={p} size={32} />
                <span className="min-w-0 grow text-sm leading-tight font-black">
                  {p.name}
                  {isHost && <span className="block text-xs text-text-sub">司会</span>}
                </span>
                {choiceOrder.map((id, i) => {
                  const on = chosen === id
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={on}
                      aria-label={`${i + 1}番`}
                      onClick={() => onAnswer(p.id, id)}
                      className="size-11 shrink-0 rounded-xl text-[17px] font-black"
                      style={
                        on
                          ? { background: st.base, color: st.on }
                          : { background: '#FFFFFF', border: '2px solid #958571', color: '#221C18' }
                      }
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </main>

      <div className="screen-footer">
        <BigButton variant="gold" disabled={remaining > 0} onClick={onReveal}>
          {remaining > 0 ? `せいかい発表！（あと${remaining}人）` : 'せいかい発表！'}
        </BigButton>
      </div>
    </div>
  )
}
