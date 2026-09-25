export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text: string) {
  if (!canSpeak) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ja-JP'
  u.rate = 0.9
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('ja'))
  if (voice) u.voice = voice
  window.speechSynthesis.speak(u)
}

export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel()
}
