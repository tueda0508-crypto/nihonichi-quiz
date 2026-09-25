export type Player = { id: string; name: string; slot: number }

export type PlayerStyle = {
  colorName: string
  symbolName: string
  symbol: string
  base: string
  on: string
  depth: string
  tint: string
  /** tint の上に置く濃い文字色 */
  ink: string
}

// DESIGN.md 3章「プレイヤー（4色セット＋記号）」
export const PLAYER_STYLES: PlayerStyle[] = [
  {
    colorName: 'あか',
    symbolName: 'まる',
    symbol: '●',
    base: '#C63A20',
    on: '#FFFFFF',
    depth: '#8E2914',
    tint: '#FBE7E1',
    ink: '#8E2914',
  },
  {
    colorName: 'あお',
    symbolName: 'さんかく',
    symbol: '▲',
    base: '#2A62C9',
    on: '#FFFFFF',
    depth: '#1C4591',
    tint: '#E6EEFB',
    ink: '#1C4591',
  },
  {
    colorName: 'みどり',
    symbolName: 'しかく',
    symbol: '■',
    base: '#1B7F45',
    on: '#FFFFFF',
    depth: '#0F5A30',
    tint: '#E3F2E9',
    ink: '#145F34',
  },
  {
    colorName: 'きいろ',
    symbolName: 'ほし',
    symbol: '★',
    base: '#F2B33D',
    on: '#221C18',
    depth: '#B8831B',
    tint: '#FEF3DA',
    ink: '#6E4B07',
  },
  {
    colorName: 'みずいろ',
    symbolName: 'ひし',
    symbol: '◆',
    base: '#5BC0EB',
    on: '#221C18',
    depth: '#2E8DB8',
    tint: '#E4F5FC',
    ink: '#1D5E7C',
  },
]

export const MAX_PLAYERS = 5
export const MAX_NAME_LENGTH = 6
export const NAME_PRESETS = ['パパ', 'ママ', 'じいじ', 'ばあば', 'おにいちゃん', 'おねえちゃん']

export function styleOf(player: Pick<Player, 'slot'>): PlayerStyle {
  return PLAYER_STYLES[player.slot % PLAYER_STYLES.length]
}

export function nextFreeSlot(players: readonly Player[]): number {
  for (let s = 0; s < MAX_PLAYERS; s++) if (!players.some((p) => p.slot === s)) return s
  return -1
}

export type NameProblem = { playerId: string; message: string }

export function validateNames(players: readonly Player[]): NameProblem[] {
  const problems: NameProblem[] = []
  const seen = new Map<string, string>()
  for (const p of players) {
    const name = p.name.trim()
    if (!name) problems.push({ playerId: p.id, message: '名前を入れてね' })
    else if ([...name].length > MAX_NAME_LENGTH)
      problems.push({ playerId: p.id, message: `${MAX_NAME_LENGTH}文字までだよ` })
    else if (seen.has(name)) problems.push({ playerId: p.id, message: 'ほかの人と同じ名前だよ' })
    else seen.set(name, p.id)
  }
  return problems
}
