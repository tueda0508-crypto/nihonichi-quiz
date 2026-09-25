// ふりがな記法 "{漢字|よみ}" を扱う小さなパーサ

export type RubySegment = { text: string; reading?: string }

const PATTERN = /\{([^{}|]+)\|([^{}|]+)\}/g

export function parseRuby(source: string): RubySegment[] {
  const segments: RubySegment[] = []
  let last = 0
  for (const m of source.matchAll(PATTERN)) {
    const index = m.index ?? 0
    if (index > last) segments.push({ text: source.slice(last, index) })
    segments.push({ text: m[1], reading: m[2] })
    last = index + m[0].length
  }
  if (last < source.length) segments.push({ text: source.slice(last) })
  return segments
}

/** 読みを除いた表示用の文字列（司会画面・スクリーンリーダー用） */
export function plainText(source: string): string {
  return source.replace(PATTERN, '$1')
}

/** 読み上げ用の文字列（漢字を読みに置き換える） */
export function spokenText(source: string): string {
  return source.replace(PATTERN, '$2')
}
