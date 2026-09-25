import { parseRuby } from '../game/ruby'

/** "{漢字|よみ}" 記法をふりがな付きで表示する（HTMLを文字列で差し込まない） */
export function Ruby({ text }: { text: string }) {
  return (
    <>
      {parseRuby(text).map((seg, i) =>
        seg.reading ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: 並びは固定
          <ruby key={i}>
            {seg.text}
            <rt>{seg.reading}</rt>
          </ruby>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: 並びは固定
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  )
}
