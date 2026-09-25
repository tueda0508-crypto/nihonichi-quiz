import { useEffect, useMemo, useState } from 'react'
import { IconMedal } from '../components/Icons'
import { Ruby } from '../components/Ruby'
import { Avatar, BigButton } from '../components/ui'
import { PLAYER_STYLES } from '../game/players'
import { genreLabel, getQuestion } from '../game/questions'
import type { QuestionReview, RankEntry } from '../game/reducer'
import { sfx } from '../platform/sfx'

type Props = {
  ranking: RankEntry[]
  reviews: QuestionReview[]
  perfects: { playerName: string; genre: string }[]
  onAgain: () => void
  onChangeMembers: () => void
  onHome: () => void
}

const PODIUM = {
  1: { height: 124, bg: '#F2B33D', size: 28 },
  2: { height: 96, bg: '#E9DFCF', size: 24 },
  3: { height: 72, bg: '#EFE7D9', size: 22 },
} as const

export function Result({ ranking, reviews, perfects, onAgain, onChangeMembers, onHome }: Props) {
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    sfx.fanfare()
  }, [])

  // 表彰台は上位3つの順位グループ。1位は真ん中
  // とちゅうでぬけた人（rank 0）は表彰台に載せない
  const groups = useMemo(() => {
    const ranks = [...new Set(ranking.filter((r) => r.rank > 0).map((r) => r.rank))].slice(0, 3)
    return ranks.map((rank) => ({ rank, entries: ranking.filter((r) => r.rank === rank) }))
  }, [ranking])
  const podiumOrder = groups.length >= 2 ? [groups[1], groups[0], groups[2]].filter(Boolean) : groups
  const rest = ranking.filter((r) => !groups.some((g) => g.rank === r.rank))

  const hardest = [...reviews]
    .filter((r) => r.answered > 0)
    .sort((a, b) => a.correct - b.correct || a.index - b.index)
  const listed = showAll ? [...reviews] : hardest.slice(0, 2)

  const confetti = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2.4 + Math.random() * 1.8,
        color: PLAYER_STYLES[i % PLAYER_STYLES.length].base,
      })),
    [],
  )

  return (
    <div className="screen relative overflow-x-hidden">
      {confetti.map((c, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: 飾り
          key={i}
          aria-hidden="true"
          className="confetti"
          style={{
            left: `${c.left}%`,
            background: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
          }}
        />
      ))}

      <main className="screen-body gap-4">
        <h1
          className="m-0 mt-2 text-center font-display text-[34px] font-normal"
          tabIndex={-1}
          data-autofocus
        >
          けっか発表
        </h1>

        <ol
          className="m-0 grid list-none items-end gap-2 p-0"
          style={{ gridTemplateColumns: `repeat(${podiumOrder.length}, minmax(0, 1fr))` }}
        >
          {podiumOrder.map((g, i) => {
            const look = PODIUM[Math.min(groups.indexOf(g) + 1, 3) as 1 | 2 | 3]
            return (
              <li key={g.rank} className="flex flex-col items-center gap-1.5">
                <div className="flex flex-wrap justify-center gap-1">
                  {g.entries.map((e) => (
                    <Avatar key={e.player.id} player={e.player} size={44} />
                  ))}
                </div>
                <span className="text-center text-sm leading-tight font-black break-all">
                  {g.entries.map((e) => e.player.name).join('・')}
                </span>
                <div
                  className="anim-rise flex w-full flex-col items-center justify-center rounded-t-[14px]"
                  style={{ height: look.height, background: look.bg, animationDelay: `${i * 150}ms` }}
                >
                  <span className="font-display" style={{ fontSize: look.size }}>
                    {g.rank}位
                  </span>
                  <span className="text-sm font-black">{g.entries[0].score}もん</span>
                </div>
              </li>
            )
          })}
        </ol>

        {rest.length > 0 && (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {rest.map((e) => (
              <li key={e.player.id} className="flex items-center gap-2.5 rounded-2xl bg-surface px-3 py-2">
                <span className="w-9 font-display text-base">{e.rank > 0 ? `${e.rank}位` : ''}</span>
                <Avatar player={e.player} size={30} />
                <span className="grow text-[15px] font-black">
                  {e.player.name}
                  {e.rank === 0 && <span className="ml-1.5 text-xs text-text-muted">とちゅうでぬけた</span>}
                </span>
                <span className="text-sm font-black">{e.score}もん</span>
              </li>
            ))}
          </ul>
        )}

        {perfects.map((p) => (
          <div
            key={p.playerName + p.genre}
            className="flex items-center gap-2.5 rounded-2xl bg-[#E3F2E9] px-3.5 py-2.5 text-[#145F34]"
          >
            <IconMedal />
            <span className="text-sm font-black">
              {p.playerName}：「{genreLabel(p.genre as never)}」は ぜんぶ正解！
            </span>
          </div>
        ))}

        <section className="flex flex-col gap-1 rounded-[20px] border-2 border-border-subtle bg-surface px-4 py-3.5">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-[15px] font-black">
              {showAll ? '今日の問題（ぜんぶ）' : 'みんながまちがえた問題'}
            </h2>
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="py-2.5 text-sm font-black text-primary-text"
              aria-expanded={showAll}
            >
              {showAll ? 'とじる' : `ぜんぶ見る（${reviews.length}）`}
            </button>
          </div>
          {listed.map((r) => {
            const q = getQuestion(r.questionId)
            const answer = q.choices.find((c) => c.id === q.answerId)
            return (
              <details key={r.questionId} className="border-t border-border-subtle py-2">
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5">
                  <span className="w-8 shrink-0 font-display text-sm text-primary-text">Q{r.index + 1}</span>
                  <span className="grow text-sm">
                    <Ruby text={answer?.label ?? ''} />
                  </span>
                  <span className="shrink-0 text-sm font-black">正解 {r.correct}人</span>
                </summary>
                <div className="flex flex-col gap-1 pt-1 pl-10 text-sm leading-relaxed">
                  <div>
                    <Ruby text={q.text} />
                  </div>
                  <div className="font-black text-primary-text">
                    <Ruby text={q.fact.value} />
                  </div>
                  <div className="text-text-sub">
                    <Ruby text={q.trivia} />
                  </div>
                </div>
              </details>
            )
          })}
        </section>
      </main>

      <div className="screen-footer">
        <BigButton onClick={onAgain}>もう1ゲーム！</BigButton>
        <div className="grid grid-cols-2 gap-2.5">
          <BigButton variant="secondary" size="md" onClick={onChangeMembers}>
            メンバーを変える
          </BigButton>
          <BigButton variant="secondary" size="md" onClick={onHome}>
            はじめにもどる
          </BigButton>
        </div>
      </div>
    </div>
  )
}
