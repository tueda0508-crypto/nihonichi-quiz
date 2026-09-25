import { useEffect } from 'react'
import { GENRE_COLORS, GenreIcon, IconBack } from '../components/Icons'
import { Avatar, BigButton } from '../components/ui'
import { countOptions, estimateMinutes } from '../game/plan'
import type { Player } from '../game/players'
import { GENRES, type GenreChoice, poolFor } from '../game/questions'
import type { Settings as SettingsT } from '../game/reducer'

type Props = {
  settings: SettingsT
  players: Player[]
  onChange: (patch: Partial<SettingsT>) => void
  onBack: () => void
  onStart: () => void
}

const GENRE_TILES: { id: GenreChoice; label: string }[] = [
  { id: 'mix', label: 'おまかせ' },
  ...GENRES.map((g) => ({ id: g.id, label: g.short })),
]

export function Settings({ settings, players, onChange, onBack, onStart }: Props) {
  const poolSize = poolFor(settings.genre).length
  const options = countOptions(poolSize)
  const selectable = options.filter((o) => !o.disabled)

  // ジャンルを変えて今の問題数が選べなくなったら、選べる中でいちばん近いものにする
  useEffect(() => {
    if (!selectable.some((o) => o.value === settings.count) && selectable.length > 0) {
      const best = [...selectable].sort(
        (a, b) => Math.abs(a.value - settings.count) - Math.abs(b.value - settings.count),
      )[0]
      onChange({ count: best.value })
    }
  }, [selectable, settings.count, onChange])

  const minutes = estimateMinutes(settings.count, players.length, settings.mode)
  const hostId = settings.hostId ?? players[0]?.id

  return (
    <div className="screen">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="もどる"
          onClick={onBack}
          className="flex size-11 items-center justify-center"
        >
          <IconBack size={24} />
        </button>
        <div className="text-sm text-text-muted">2 / 2</div>
      </div>

      <main className="screen-body mt-2 gap-4">
        <h1 className="m-0 font-display text-[30px] font-normal" tabIndex={-1} data-autofocus>
          どうあそぶ？
        </h1>

        <section className="flex flex-col gap-2" aria-labelledby="genre-label">
          <h2 id="genre-label" className="m-0 text-[15px] font-black">
            ジャンル
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {GENRE_TILES.map((g) => {
              const on = settings.genre === g.id
              const n = poolFor(g.id).length
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ genre: g.id })}
                  className={`flex h-[88px] flex-col items-center justify-center gap-1 rounded-2xl p-1 text-sm ${
                    on
                      ? 'border-[3px] border-primary bg-correct-bg font-black text-primary-text'
                      : 'border-2 border-border-strong bg-surface'
                  }`}
                >
                  <GenreIcon genre={g.id} color={on ? undefined : GENRE_COLORS[g.id].icon} />
                  {g.label}
                  <span className={`text-xs ${on ? '' : 'text-text-muted'}`}>{n}問</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="count-label">
          <div className="flex items-baseline justify-between">
            <h2 id="count-label" className="m-0 text-[15px] font-black">
              問題の数
            </h2>
            <span className="text-[13px] text-text-muted">
              {players.length}人で 約{minutes}分
            </span>
          </div>
          <div
            role="group"
            aria-labelledby="count-label"
            className="grid gap-2 rounded-[18px] bg-sunken p-1.5"
            style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
          >
            {options.map((o) => {
              const on = settings.count === o.value
              return (
                <button
                  key={o.label}
                  type="button"
                  aria-pressed={on}
                  disabled={o.disabled}
                  onClick={() => onChange({ count: o.value })}
                  className={`flex h-[52px] flex-col items-center justify-center rounded-[14px] leading-tight ${
                    on
                      ? 'bg-ink text-lg font-black text-white'
                      : o.disabled
                        ? 'border-2 border-dashed border-[#B3A690] text-sm text-text-muted'
                        : 'text-lg font-black'
                  }`}
                >
                  {o.label}
                  {o.disabled && <span className="text-xs">問題が足りない</span>}
                </button>
              )
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="mode-label">
          <h2 id="mode-label" className="m-0 text-[15px] font-black">
            こたえかた
          </h2>
          <div role="group" aria-labelledby="mode-label" className="grid grid-cols-2 gap-2">
            {(
              [
                ['pass', 'スマホを回す', 'ひとりずつ、こっそり'],
                ['host', '司会モード', '口で答えて司会が入力'],
              ] as const
            ).map(([mode, title, sub]) => {
              const on = settings.mode === mode
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ mode })}
                  className={`flex flex-col gap-0.5 rounded-2xl bg-surface p-3 text-left ${on ? 'border-[3px] border-ink' : 'border-2 border-border-strong'}`}
                >
                  <span className="text-base font-black">{title}</span>
                  <span className="text-[13px] text-text-muted">{sub}</span>
                </button>
              )
            })}
          </div>
        </section>

        {settings.mode === 'host' && (
          <section
            className="anim-fade flex flex-col gap-2 rounded-2xl bg-surface p-3"
            aria-labelledby="host-label"
          >
            <h2 id="host-label" className="m-0 text-[15px] font-black">
              司会はだれ？
            </h2>
            <div role="group" aria-labelledby="host-label" className="flex flex-wrap gap-2">
              {players.map((p) => {
                const on = hostId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onChange({ hostId: p.id })}
                    className={`flex h-11 items-center gap-2 rounded-full pr-4 pl-1.5 ${on ? 'border-[3px] border-ink' : 'border-2 border-border-strong'}`}
                  >
                    <Avatar player={p} size={30} />
                    {p.name}
                  </button>
                )
              })}
            </div>
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={settings.hostCounts}
                onChange={(e) => onChange({ hostCounts: e.target.checked })}
                className="size-6 accent-[#1B7F45]"
              />
              司会の点数も数える（司会は先に自分の答えを入れてね）
            </label>
          </section>
        )}
      </main>

      <div className="screen-footer">
        <BigButton onClick={onStart} disabled={selectable.length === 0} className="tracking-[0.06em]">
          スタート！
        </BigButton>
      </div>
    </div>
  )
}
