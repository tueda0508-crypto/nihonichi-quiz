import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { type Player, styleOf } from '../game/players'
import { IconPause } from './Icons'

type Variant = 'primary' | 'gold' | 'secondary' | 'onColor'

const VARIANTS: Record<Variant, { className: string; style?: CSSProperties }> = {
  primary: { className: 'press bg-primary text-white', style: { ['--depth' as string]: '#8E2914' } },
  gold: { className: 'press bg-gold text-ink', style: { ['--depth' as string]: '#B8831B' } },
  secondary: { className: 'bg-surface text-ink border-2 border-ink' },
  onColor: { className: 'press bg-surface' },
}

type BigButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: 'lg' | 'md'
  children: ReactNode
}

/** 画面下に置く大きなボタン */
export function BigButton({
  variant = 'primary',
  size = 'lg',
  className = '',
  style,
  children,
  ...rest
}: BigButtonProps) {
  const v = VARIANTS[variant]
  const h = size === 'lg' ? 'h-16 text-[22px] rounded-[22px]' : 'h-14 text-[17px] rounded-[20px]'
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-center gap-2 font-black tracking-wide disabled:bg-disabled disabled:text-text-sub disabled:shadow-none ${h} ${v.className} ${className}`}
      style={{ ...v.style, ...style }}
      {...rest}
    >
      {children}
    </button>
  )
}

/** 44px の丸いアイコンボタン */
export function RoundButton({
  label,
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-border-strong bg-surface text-ink ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function MenuButton({ onClick, onColor = false }: { onClick: () => void; onColor?: boolean }) {
  return (
    <button
      type="button"
      aria-label="メニュー（ていし）"
      onClick={onClick}
      className={
        onColor
          ? 'flex size-11 shrink-0 items-center justify-center rounded-full bg-black/25'
          : 'flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-border-strong bg-surface text-ink'
      }
    >
      <IconPause size={18} />
    </button>
  )
}

/** プレイヤーの色＋記号の丸 */
export function Avatar({ player, size = 32 }: { player: Pick<Player, 'slot'>; size?: number }) {
  const st = styleOf(player)
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: st.base, color: st.on, fontSize: size * 0.45 }}
    >
      {st.symbol}
    </span>
  )
}

export function Progress({ index, total }: { index: number; total: number }) {
  return (
    <>
      <div className="shrink-0 text-base font-black">
        {index + 1}
        <span className="text-text-muted"> / {total}</span>
      </div>
      <div
        className="h-2.5 grow overflow-hidden rounded-full bg-[#EDE3D2]"
        role="progressbar"
        aria-label="すすみぐあい"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
    </>
  )
}

export function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-full px-3.5 py-2 text-[15px] font-black ${className}`}>{children}</div>
}
