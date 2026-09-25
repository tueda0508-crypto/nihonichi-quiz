import { useState } from 'react'
import { IconBack, IconClose, IconPlus } from '../components/Icons'
import { Avatar, BigButton } from '../components/ui'
import {
  MAX_NAME_LENGTH,
  MAX_PLAYERS,
  NAME_PRESETS,
  nextFreeSlot,
  type Player,
  styleOf,
  validateNames,
} from '../game/players'

type Props = {
  initial: Player[]
  onBack: () => void
  onNext: (players: Player[]) => void
}

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()))

export function Players({ initial, onBack, onNext }: Props) {
  const [players, setPlayers] = useState<Player[]>(initial)
  const [showErrors, setShowErrors] = useState(false)
  const problems = validateNames(players)
  const full = players.length >= MAX_PLAYERS

  const add = (name: string) => {
    if (full) return
    setPlayers((ps) => [...ps, { id: newId(), name, slot: nextFreeSlot(ps) }])
  }
  const rename = (id: string, name: string) =>
    setPlayers((ps) =>
      ps.map((p) => (p.id === id ? { ...p, name: [...name].slice(0, MAX_NAME_LENGTH).join('') } : p)),
    )
  const remove = (id: string) => setPlayers((ps) => ps.filter((p) => p.id !== id))

  const usedNames = new Set(players.map((p) => p.name.trim()))
  const presets = NAME_PRESETS.filter((n) => !usedNames.has(n))

  const next = () => {
    if (players.length === 0 || problems.length > 0) {
      setShowErrors(true)
      return
    }
    onNext(players.map((p) => ({ ...p, name: p.name.trim() })))
  }

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
        <div className="text-sm text-text-muted">1 / 2</div>
      </div>

      <main className="screen-body mt-2">
        <div>
          <h1 className="m-0 font-display text-[30px] font-normal" tabIndex={-1} data-autofocus>
            だれがあそぶ？
          </h1>
          <p className="m-0 mt-1 text-sm text-text-muted">
            タップで入れるか、名前を書いてね（{MAX_NAME_LENGTH}文字まで）
          </p>
        </div>

        {!full && presets.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="よく使う名前">
            {presets.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => add(name)}
                className="h-11 rounded-full border-2 border-border-strong bg-surface px-4 text-[15px] font-black"
              >
                ＋ {name}
              </button>
            ))}
          </div>
        )}

        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {players.map((p, i) => {
            const st = styleOf(p)
            const problem = showErrors ? problems.find((x) => x.playerId === p.id) : undefined
            const inputId = `name-${p.id}`
            return (
              <li key={p.id}>
                <div
                  className={`flex h-16 items-center gap-3 rounded-[18px] bg-surface pr-2 pl-2.5 ${problem ? 'border-[3px] border-primary' : 'border-2 border-border-subtle'}`}
                >
                  <Avatar player={p} size={44} />
                  <label htmlFor={inputId} className="sr-only-text">
                    プレイヤー{i + 1}（{st.colorName}・{st.symbolName}）の名前
                  </label>
                  <input
                    id={inputId}
                    value={p.name}
                    onChange={(e) => rename(p.id, e.target.value)}
                    placeholder="なまえ"
                    enterKeyHint="done"
                    autoComplete="off"
                    aria-invalid={problem ? true : undefined}
                    aria-describedby={problem ? `${inputId}-err` : undefined}
                    className="h-11 min-w-0 grow border-0 bg-transparent text-xl outline-none placeholder:text-text-muted"
                  />
                  <button
                    type="button"
                    aria-label={`${p.name || 'この人'}を削除`}
                    onClick={() => remove(p.id)}
                    className="flex size-11 items-center justify-center text-text-muted"
                  >
                    <IconClose size={20} />
                  </button>
                </div>
                {problem && (
                  <p id={`${inputId}-err`} className="m-0 mt-1 pl-3 text-sm text-primary-text">
                    {problem.message}
                  </p>
                )}
              </li>
            )
          })}
        </ul>

        {!full && (
          <button
            type="button"
            onClick={() => add('')}
            className="flex h-[60px] items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-border-strong text-base text-text-sub"
          >
            <IconPlus size={20} />
            名前を書いて追加（あと{MAX_PLAYERS - players.length}人）
          </button>
        )}
        {showErrors && players.length === 0 && (
          <p className="m-0 text-sm text-primary-text">1人以上入れてね</p>
        )}
      </main>

      <div className="screen-footer">
        <BigButton onClick={next}>
          {players.length > 0 ? `つぎへ（${players.length}人であそぶ）` : 'つぎへ'}
        </BigButton>
      </div>
    </div>
  )
}
