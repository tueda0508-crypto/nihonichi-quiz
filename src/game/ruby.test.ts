import { describe, expect, it } from 'vitest'
import { parseRuby, plainText, spokenText } from './ruby'

describe('ふりがな記法', () => {
  const src = '{日本|にっぽん}でいちばん{高|たか}い山は？'

  it('区切りに分解する', () => {
    expect(parseRuby(src)).toEqual([
      { text: '日本', reading: 'にっぽん' },
      { text: 'でいちばん' },
      { text: '高', reading: 'たか' },
      { text: 'い山は？' },
    ])
  })

  it('表示用・読み上げ用の文字列を作る', () => {
    expect(plainText(src)).toBe('日本でいちばん高い山は？')
    expect(spokenText(src)).toBe('にっぽんでいちばんたかい山は？')
  })

  it('記法がない文字列はそのまま', () => {
    expect(parseRuby('サロマ湖')).toEqual([{ text: 'サロマ湖' }])
  })
})
