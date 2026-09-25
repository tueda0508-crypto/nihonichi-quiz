import { useEffect, useState } from 'react'
import { IconBulb, MarkCorrect, MarkWrong } from '../components/Icons'
import { Ruby } from '../components/Ruby'
import { Avatar, BigButton, MenuButton } from '../components/ui'
import type { Player } from '../game/players'
import type { Question } from '../game/questions'
import { sfx } from '../platform/sfx'

const DRUM_SECONDS = 1.2
const REDUCED_DRUM_SECONDS = 0.6

type RevealingProps = { reducedMotion: boolean; onDone: () => void }

/** ドラムロール。タップで飛ばせる */
export function Revealing({ reducedMotion, onDone }: RevealingProps) {
  useEffect(() => {
    const seconds = reducedMotion ? REDUCED_DRUM_SECONDS : DRUM_SECONDS
    sfx.drumroll(seconds)
    const t = window.setTimeout(onDone, seconds * 1000)
    return () => window.clearTimeout(t)
  }, [onDone, reducedMotion])

  return (
    <button
      type="button"
      onClick={onDone}
      className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 bg-ground"
      aria-label="せいかい発表（タップでとばす）"
    >
      <div className="anim-drum font-display text-5xl text-primary">せいかいは…</div>
      <div className="text-sm text-text-muted">タップでとばせるよ</div>
    </button>
  )
}

type Row = { player: Player; choiceLabel: string | null; correct: boolean; total: number }

type RevealedProps = {
  question: Question
  rows: Row[]
  qIndex: number
  total: number
  isLast: boolean
  onNext: () => void
  onMenu: () => void
}

export function Revealed({ question, rows, qIndex, total, isLast, onNext, onMenu }: RevealedProps) {
  const [skip, setSkip] = useState(false)
  const answer = question.choices.find((c) => c.id === question.answerId)
  const anyCorrect = rows.some((r) => r.correct)

  useEffect(() => {
    const t = window.setTimeout(() => (anyCorrect ? sfx.correct() : sfx.wrong()), 250)
    return () => window.clearTimeout(t)
  }, [anyCorrect])

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: 演出を飛ばすだけの補助操作（キーボードでは演出はすぐ終わる）
    // biome-ignore lint/a11y/noStaticElementInteractions: 同上
    <div className={`screen ${skip ? 'skip-anim' : ''}`} onClick={() => setSkip(true)}>
      <div className="flex items-center gap-2.5">
        <MenuButton onClick={onMenu} />
        <div className="grow text-base font-black">
          {qIndex + 1}
          <span className="text-text-muted"> / {total}</span>
        </div>
        <div className="text-sm text-text-muted">せいかい発表</div>
      </div>

      <main className="screen-body mt-2.5 gap-3">
        <div className="anim-flip relative mt-2.5 flex flex-col items-center gap-0.5 rounded-[26px] border-4 border-gold bg-surface px-5 pt-6 pb-4">
          <div className="absolute -top-4 rounded-full bg-gold px-4.5 py-1.5 font-display text-base tracking-[0.1em]">
            日本一
          </div>
          <div className="text-sm text-text-sub">
            <Ruby text={question.fact.label} />
          </div>
          <h1
            className="m-0 text-center font-display text-[44px] leading-[1.35] font-normal"
            tabIndex={-1}
            data-autofocus
          >
            {answer && <Ruby text={answer.label} />}
          </h1>
          <div className="text-xl font-black text-primary-text">
            <Ruby text={question.fact.value} />
          </div>
        </div>

        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {rows.map((r, i) => (
            <li
              key={r.player.id}
              className="flex min-h-[52px] items-center gap-2.5 rounded-[14px] px-3 py-1.5"
              style={{ background: r.correct ? '#FBE7E1' : '#EFE9DF' }}
            >
              <Avatar player={r.player} size={32} />
              <span className="min-w-0 grow text-[15px] font-black">
                {r.player.name}
                <span className="font-bold text-text-sub">
                  ・{r.choiceLabel === null ? 'パス' : <Ruby text={r.choiceLabel} />}
                </span>
              </span>
              <span
                className="anim-stamp flex shrink-0 items-center gap-1 text-sm font-black"
                style={{ color: r.correct ? '#A8311A' : '#4F463F', animationDelay: `${500 + i * 150}ms` }}
              >
                {r.correct ? <MarkCorrect size={22} /> : <MarkWrong size={22} />}
                {r.correct ? 'せいかい' : 'ざんねん'}
              </span>
              <span className="w-12 shrink-0 text-right text-sm font-black">{r.total}もん</span>
            </li>
          ))}
        </ul>

        <div
          className="anim-fade flex flex-col gap-1.5 rounded-[20px] bg-tip-bg px-4 py-3.5"
          style={{ animationDelay: '700ms' }}
        >
          <div className="flex items-center gap-1.5 text-sm font-black text-tip-text">
            <IconBulb size={18} />
            まめちしき
          </div>
          <p className="m-0 text-base leading-[1.9]">
            <Ruby text={question.trivia} />
          </p>
          <p className="m-0 text-xs font-medium text-text-sub">
            出典：{question.source.publisher}「
            <a
              href={question.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-sub underline"
              onClick={(e) => e.stopPropagation()}
            >
              {question.source.title}
            </a>
            」（{question.dataYear}）
          </p>
        </div>
      </main>

      <div className="screen-footer">
        <BigButton
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
        >
          {isLast ? 'けっか発表へ' : '次の問題へ'}
        </BigButton>
      </div>
    </div>
  )
}

export type { Row as RevealRow }
