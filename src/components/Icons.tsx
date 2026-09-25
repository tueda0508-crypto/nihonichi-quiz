import type { SVGProps } from 'react'
import type { GenreChoice } from '../game/questions'

type P = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 22, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconBack = (p: P) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
)
export const IconClose = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
)
export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)
export const IconPause = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
)
export const IconSpeaker = (p: P) => (
  <Svg {...p}>
    <path d="M4 9v6h4l5 4V5L8 9z" />
    <path d="M16 9a4 4 0 0 1 0 6" />
    <path d="M18.5 6.5a8 8 0 0 1 0 11" />
  </Svg>
)
export const IconMute = (p: P) => (
  <Svg {...p}>
    <path d="M4 9v6h4l5 4V5L8 9z" />
    <path d="M17 9l5 6M22 9l-5 6" />
  </Svg>
)
export const IconUndo = (p: P) => (
  <Svg {...p}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
  </Svg>
)
export const IconBulb = (p: P) => (
  <Svg {...p}>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
  </Svg>
)
export const IconPhone = (p: P) => (
  <Svg {...p}>
    <rect x="6" y="2" width="12" height="20" rx="3" />
    <path d="M12 8v6M9 11h6" />
  </Svg>
)
export const IconExit = (p: P) => (
  <Svg {...p}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="M10 17l-5-5 5-5M5 12h11" />
  </Svg>
)
export const IconStop = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </Svg>
)
export const IconSkip = (p: P) => (
  <Svg {...p}>
    <path d="M5 5l9 7-9 7z" />
    <path d="M19 5v14" />
  </Svg>
)
export const IconMedal = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="9" r="6" />
    <path d="M8.5 14L7 22l5-3 5 3-1.5-8" />
  </Svg>
)
export const IconCheck = (p: P) => (
  <Svg {...p} strokeWidth={3}>
    <path d="M5 12l5 5 9-10" />
  </Svg>
)

export function MarkCorrect({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="10" fill="none" stroke="#C63A20" strokeWidth="3.5" />
    </svg>
  )
}
export function MarkWrong({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <path d="M7 7l14 14M21 7L7 21" stroke="#4F463F" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

export function GenreIcon({
  genre,
  size = 24,
  color,
}: {
  genre: GenreChoice
  size?: number
  color?: string
}) {
  const style = color ? { color } : undefined
  switch (genre) {
    case 'mix':
      return (
        <Svg size={size} style={style}>
          <path d="M4 7h3c5 0 5 10 10 10h3" />
          <path d="M4 17h3c2 0 3-1.5 4-3.5" />
          <path d="M14 9.5c1-2 2-3.5 4-3.5h2" />
          <path d="M18 4l2 2-2 2M18 15l2 2-2 2" />
        </Svg>
      )
    case 'nature':
      return (
        <Svg size={size} style={style}>
          <path d="M3 20L10 7l4 6 2-3 5 10z" />
        </Svg>
      )
    case 'food':
      return (
        <Svg size={size} style={style}>
          <path d="M12 7c-2-2-7-1.5-7 4 0 4 3 9 5 9 1 0 1.5-.5 2-.5s1 .5 2 .5c2 0 5-5 5-9 0-5.5-5-6-7-4z" />
          <path d="M12 7c0-2 1-3.5 3-4" />
        </Svg>
      )
    case 'building':
      return (
        <Svg size={size} style={style}>
          <rect x="5" y="3" width="14" height="18" rx="1" />
          <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
        </Svg>
      )
    case 'prefecture':
      return (
        <Svg size={size} style={style}>
          <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
          <circle cx="12" cy="9" r="2.5" />
        </Svg>
      )
    case 'culture':
      return (
        <Svg size={size} style={style}>
          <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
          <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8" />
        </Svg>
      )
  }
}

export const GENRE_COLORS: Record<GenreChoice, { icon: string; chipBg: string; chipText: string }> = {
  mix: { icon: '#A8311A', chipBg: '#FBE7E1', chipText: '#8E2914' },
  nature: { icon: '#2A62C9', chipBg: '#E6EEFB', chipText: '#1C4591' },
  food: { icon: '#C63A20', chipBg: '#FBE7E1', chipText: '#8E2914' },
  building: { icon: '#4F463F', chipBg: '#EFE9DF', chipText: '#4F463F' },
  prefecture: { icon: '#1B7F45', chipBg: '#E3F2E9', chipText: '#145F34' },
  culture: { icon: '#8A5A0C', chipBg: '#FEF3DA', chipText: '#6E4B07' },
}
