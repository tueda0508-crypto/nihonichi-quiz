import { useState } from 'react'
import { IconClose, IconMute, IconPhone, IconSpeaker } from '../components/Icons'
import { BigButton, RoundButton } from '../components/ui'
import { isIos, isStandalone } from '../platform/hooks'

type Props = {
  soundOn: boolean
  onToggleSound: () => void
  onPlay: () => void
  needRefresh: boolean
  onUpdate: () => void
}

export function Home({ soundOn, onToggleSound, onPlay, needRefresh, onUpdate }: Props) {
  const [showInstall, setShowInstall] = useState(false)
  const showInstallHint = !isStandalone()

  return (
    <div className="screen">
      <div className="flex justify-end">
        <RoundButton
          label={soundOn ? '効果音オン' : '効果音オフ'}
          aria-pressed={soundOn}
          onClick={onToggleSound}
        >
          {soundOn ? <IconSpeaker /> : <IconMute />}
        </RoundButton>
      </div>

      <main className="screen-body items-center justify-center text-center">
        <svg width="240" height="156" viewBox="0 0 260 170" aria-hidden="true">
          <circle cx="196" cy="52" r="30" fill="#F2B33D" />
          <polygon points="16,160 130,36 244,160" fill="#2A62C9" />
          <polygon points="130,36 102,67 116,62 130,74 144,62 158,67" fill="#FFFFFF" />
          <rect x="0" y="158" width="260" height="6" rx="3" fill="#221C18" />
        </svg>
        <div className="rounded-full bg-ink px-3.5 py-1.5 text-sm tracking-widest text-ground">
          かぞくで ちょうせん！
        </div>
        <h1
          className="m-0 flex flex-col items-center font-display font-normal leading-none"
          tabIndex={-1}
          data-autofocus
        >
          <span className="text-[76px] text-primary">日本一</span>
          <span className="text-[44px]">クイズ</span>
        </h1>
        <p className="m-0 text-base leading-relaxed text-text-muted">
          山・川・たべもの・たてもの。
          <br />
          日本の「いちばん」、いくつ知ってる？
        </p>
      </main>

      <div className="screen-footer">
        {needRefresh && (
          <div className="flex items-center gap-3 rounded-2xl border-2 border-gold bg-tip-bg px-3.5 py-2.5">
            <span className="grow text-sm leading-snug text-tip-text">新しい問題が届きました</span>
            <button
              type="button"
              onClick={onUpdate}
              className="rounded-full bg-ink px-4 py-2.5 text-sm text-white"
            >
              更新する
            </button>
          </div>
        )}
        {showInstallHint && (
          <div className="flex items-center gap-3 rounded-2xl border-2 border-border-subtle bg-surface px-3.5 py-2.5">
            <IconPhone size={26} />
            <span className="grow text-sm leading-snug">
              ホーム画面に追加すると、
              <br />
              電波がなくても遊べるよ
            </span>
            <button
              type="button"
              onClick={() => setShowInstall(true)}
              className="px-1 py-3 text-sm font-black text-primary-text"
            >
              やり方
            </button>
          </div>
        )}
        <BigButton onClick={onPlay} className="h-[68px] text-2xl tracking-[0.1em]">
          あそぶ
        </BigButton>
        <p className="m-0 text-center text-sm text-text-muted">最大5人・1台のスマホを回してあそぼう</p>
      </div>

      {showInstall && <InstallHelp onClose={() => setShowInstall(false)} />}
    </div>
  )
}

function InstallHelp({ onClose }: { onClose: () => void }) {
  const ios = isIos()
  return (
    <div className="fixed inset-0 z-20 flex items-end">
      <button
        type="button"
        tabIndex={-1}
        aria-label="とじる"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/55"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        className="anim-sheet relative mx-auto w-full max-w-[480px] rounded-t-[28px] bg-ground px-5 pt-4 pb-[calc(28px+env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between">
          <h2 id="install-title" className="m-0 font-display text-2xl font-normal">
            ホーム画面に追加
          </h2>
          <RoundButton label="とじる" onClick={onClose}>
            <IconClose />
          </RoundButton>
        </div>
        <ol className="mt-4 flex list-none flex-col gap-3 p-0 text-base leading-relaxed">
          {ios ? (
            <>
              <Step n={1}>Safari の下にある「共有」ボタン（□に↑）をタップ</Step>
              <Step n={2}>「ホーム画面に追加」をえらぶ</Step>
              <Step n={3}>右上の「追加」をタップ</Step>
            </>
          ) : (
            <>
              <Step n={1}>ブラウザの右上の「︙」メニューをタップ</Step>
              <Step n={2}>「ホーム画面に追加」または「アプリをインストール」をえらぶ</Step>
            </>
          )}
        </ol>
        <p className="mt-4 mb-0 text-sm leading-relaxed text-text-sub">
          追加しておくと、電波のない場所でも遊べます。Safari
          だけで使っていると、しばらく使わないうちにデータが消えることがあります。
        </p>
      </div>
    </div>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-surface p-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm text-white">
        {n}
      </span>
      <span>{children}</span>
    </li>
  )
}
