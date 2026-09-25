import { GENRE_COLORS, GenreIcon, IconSpeaker } from '../components/Icons'
import { Ruby } from '../components/Ruby'
import { Avatar, MenuButton, Progress } from '../components/ui'
import { type Player, styleOf } from '../game/players'
import { genreLabel, type Question as QuestionT } from '../game/questions'
import { plainText, spokenText } from '../game/ruby'
import { canSpeak, speak } from '../platform/speech'

type Props = {
  question: QuestionT
  choiceOrder: string[]
  player: Player
  qIndex: number
  total: number
  onAnswer: (choiceId: string) => void
  onMenu: () => void
}

/** 長い問題文は文字を小さくする（28 → 24 → 22px） */
export function questionFontSize(text: string): number {
  const len = plainText(text).length
  return len > 40 ? 22 : len > 28 ? 24 : 28
}

export function readAloud(question: QuestionT, choiceOrder: string[]) {
  const labels = choiceOrder.map((id, i) => {
    const c = question.choices.find((x) => x.id === id)
    return `${i + 1}、${spokenText(c?.label ?? '')}`
  })
  speak(`${spokenText(question.text)}。${labels.join('。')}`)
}

export function Question({ question, choiceOrder, player, qIndex, total, onAnswer, onMenu }: Props) {
  const st = styleOf(player)
  const gc = GENRE_COLORS[question.genre]
  return (
    <div className="screen">
      <div className="flex items-center gap-2.5">
        <MenuButton onClick={onMenu} />
        <Progress index={qIndex} total={total} />
        <div
          className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[13px] font-black"
          style={{ background: gc.chipBg, color: gc.chipText }}
        >
          <GenreIcon genre={question.genre} size={14} />
          {genreLabel(question.genre).split('・')[0]}
        </div>
      </div>

      <main className="screen-body mt-3.5">
        <div
          className="flex items-center gap-2.5 self-start rounded-full py-1.5 pr-3.5 pl-1.5"
          style={{ background: st.tint }}
        >
          <Avatar player={player} size={32} />
          <span className="text-[15px] font-black" style={{ color: st.ink }}>
            {player.name} が こたえる番
          </span>
        </div>

        <div className="flex flex-col gap-2 rounded-[26px] bg-surface p-5 shadow-[0_2px_0_#E9DFCF,0_12px_28px_rgba(34,28,24,0.06)]">
          <div className="flex items-center justify-between">
            <div className="font-display text-xl text-primary">Q{qIndex + 1}</div>
            {canSpeak && (
              <button
                type="button"
                aria-label="問題を読み上げる"
                onClick={() => readAloud(question, choiceOrder)}
                className="flex h-11 items-center gap-1.5 rounded-full border-2 border-border-strong bg-surface pr-3.5 pl-2.5 text-sm font-black"
              >
                <IconSpeaker size={20} />
                よみあげ
              </button>
            )}
          </div>
          <h1
            className="m-0 leading-[1.6] font-black"
            style={{ fontSize: questionFontSize(question.text) }}
            tabIndex={-1}
            data-autofocus
          >
            <Ruby text={question.text} />
          </h1>
        </div>

        <div role="group" aria-label="選択肢" className="mt-0.5 flex flex-col gap-3">
          {choiceOrder.map((id, i) => {
            const c = question.choices.find((x) => x.id === id)
            if (!c) return null
            return (
              <button
                key={id}
                type="button"
                onClick={() => onAnswer(id)}
                className="press-sm flex min-h-[72px] items-center gap-3.5 rounded-[20px] border-2 border-border-strong bg-surface px-4 py-2 text-left text-[23px] font-black"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-[17px] text-white">
                  {i + 1}
                </span>
                <span>
                  <Ruby text={c.label} />
                </span>
              </button>
            )
          })}
        </div>
      </main>

      <div className="screen-footer">
        <p className="m-0 text-center text-sm leading-relaxed text-text-muted">
          えらんだら次の人にわたしてね
          <br />
          まちがえても、次の画面でやりなおせるよ
        </p>
      </div>
    </div>
  )
}
