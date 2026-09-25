// 問題データのスキーマ（テスト・CI でだけ使い、本番のJSには入れない）
import { z } from 'zod'

const rubyText = z.string().refine((s) => {
  const open = (s.match(/\{/g) ?? []).length
  const close = (s.match(/\}/g) ?? []).length
  const pairs = (s.match(/\{[^{}|]+\|[^{}|]+\}/g) ?? []).length
  return open === close && open === pairs
}, 'ふりがな記法 {漢字|よみ} が壊れています')

export const QuestionSchema = z.object({
  id: z.string().regex(/^[a-z]+-\d{3}$/),
  genre: z.enum(['nature', 'food', 'building', 'prefecture', 'culture']),
  text: rubyText,
  choices: z.array(z.object({ id: z.string().min(1), label: rubyText })).length(4),
  answerId: z.string(),
  fact: z.object({ label: rubyText, value: rubyText }),
  trivia: rubyText,
  source: z.object({ title: z.string().min(1), publisher: z.string().min(1), url: z.url() }),
  dataYear: z.string().min(1),
  verifiedAt: z.iso.date(),
})
