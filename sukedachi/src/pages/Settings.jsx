import { useState, useCallback } from 'react'
import { Info, BookOpen, Users, Globe, Key, Eye, EyeOff, Check, Mic, BarChart3, Flame, RotateCcw, Sun, Moon, Monitor } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { isSpeechSupported, isSynthesisSupported } from '../lib/useSpeech'
import { getProgress, resetAll } from '../lib/progressTracker'
import { VALUE_DRIVERS } from '../data/valueDrivers'
import { GYM_SCENARIOS } from '../lib/constants'
import { useTheme } from '../lib/useTheme'

function DonutChart({ percentage }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (percentage / 100) * circ
  const color = percentage >= 70 ? 'var(--sage)' : percentage >= 40 ? '#8A6A20' : 'var(--ink-300)'
  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} fill="none" stroke="var(--ink-100)" strokeWidth="10" />
      <circle
        cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 65 65)" style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="65" y="62" textAnchor="middle" fontSize="28" fontWeight="700" fill="var(--ink-800)">
        {percentage}
      </text>
      <text x="65" y="80" textAnchor="middle" fontSize="11" fontWeight="400" fill="var(--ink-500)">
        %
      </text>
    </svg>
  )
}

function MiniBarChart({ scores }) {
  const max = Math.max(...scores, 1)
  return (
    <div className="flex items-end gap-1 h-6">
      {scores.map((s, i) => (
        <div
          key={i}
          className="w-3 rounded-sm"
          style={{
            height: `${Math.max((s / max) * 100, 8)}%`,
            background: s >= 70 ? 'var(--sage)' : s >= 40 ? '#8A6A20' : 'var(--ink-200)',
            transition: 'height 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}

function ProgressDashboard({ t }) {
  const [progress, setProgress] = useState(() => getProgress())
  const [showConfirm, setShowConfirm] = useState(false)

  const handleReset = useCallback(() => {
    resetAll()
    setProgress(getProgress())
    setShowConfirm(false)
  }, [])

  const totalCards = VALUE_DRIVERS.length
  const cardsSeen = Object.keys(progress.flashCards.seen).length
  const mastered = Object.values(progress.flashCards.seen).filter(v => v >= 3).length
  const flashPct = totalCards > 0 ? Math.round((mastered / totalCards) * 100) : 0

  const quizPct = progress.quiz.bestScore
  const quizAvg = progress.quiz.completed > 0
    ? Math.round(progress.quiz.totalScore / progress.quiz.completed)
    : 0

  const totalScenarios = GYM_SCENARIOS.length
  const scenariosDone = progress.dojo.scenariosAttempted.length
  const dojoPct = totalScenarios > 0 ? Math.round((scenariosDone / totalScenarios) * 100) : 0

  const coachActive = progress.coach.sessions > 0 ? 100 : 0

  const readiness = Math.round(flashPct * 0.3 + quizPct * 0.3 + dojoPct * 0.25 + coachActive * 0.15)

  return (
    <div className="rounded-2xl border border-[var(--ink-200)] overflow-hidden" style={{ background: 'var(--surface)' }}>
      <div className="p-5 border-b border-[var(--ink-200)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[var(--sage)]" />
            <h3 className="text-[14px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
              {t('progress.title')}
            </h3>
          </div>
          {progress.streak.current > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border" style={{ background: 'var(--streak-bg)', borderColor: 'var(--streak-border)' }}>
              <Flame size={14} style={{ color: 'var(--streak-icon)' }} />
              <span className="text-[12px]" style={{ fontWeight: 600, color: 'var(--streak-text)' }}>
                {progress.streak.current}{t('progress.streakDays')}
              </span>
            </div>
          )}
        </div>

        {/* Readiness donut + label */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <DonutChart percentage={readiness} />
          <div>
            <p className="text-[13px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>
              {t('progress.readiness')}
            </p>
            <p className="text-[28px] text-[var(--ink-800)]" style={{ fontWeight: 700 }}>
              {readiness}%
            </p>
          </div>
        </div>
      </div>

      {/* 4 stat cards in 2x2 grid */}
      <div className="grid grid-cols-2 gap-px bg-[var(--ink-100)]">
        {/* Flash Cards */}
        <div className="p-4" style={{ background: 'var(--surface)' }}>
          <p className="text-[11px] text-[var(--ink-400)] mb-1" style={{ fontWeight: 500 }}>
            {t('progress.flashCards')}
          </p>
          <p className="text-[18px] text-[var(--ink-800)]" style={{ fontWeight: 700 }}>
            {cardsSeen}<span className="text-[11px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>/{totalCards}</span>
          </p>
          <div className="h-1.5 rounded-full bg-[var(--ink-100)] mt-2">
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${flashPct}%`, background: 'var(--sage)', transition: 'width 0.4s ease' }}
            />
          </div>
          <p className="text-[10px] text-[var(--ink-400)] mt-1" style={{ fontWeight: 400 }}>
            {mastered}{t('progress.mastered')}
          </p>
        </div>

        {/* Quiz */}
        <div className="p-4" style={{ background: 'var(--surface)' }}>
          <p className="text-[11px] text-[var(--ink-400)] mb-1" style={{ fontWeight: 500 }}>
            {t('progress.quizzes')}
          </p>
          <p className="text-[18px] text-[var(--ink-800)]" style={{ fontWeight: 700 }}>
            {progress.quiz.completed}<span className="text-[11px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>{t('progress.quizzesCompleted')}</span>
          </p>
          {progress.quiz.lastScores.length > 0 ? (
            <div className="mt-2">
              <MiniBarChart scores={progress.quiz.lastScores} />
              <div className="flex gap-3 mt-1">
                <span className="text-[10px] text-[var(--ink-400)]">{t('progress.bestScore')}: {progress.quiz.bestScore}%</span>
                <span className="text-[10px] text-[var(--ink-400)]">{t('progress.avgScore')}: {quizAvg}%</span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-[var(--ink-400)] mt-2">{t('progress.noActivity')}</p>
          )}
        </div>

        {/* Dojo */}
        <div className="p-4" style={{ background: 'var(--surface)' }}>
          <p className="text-[11px] text-[var(--ink-400)] mb-1" style={{ fontWeight: 500 }}>
            {t('progress.dojo')}
          </p>
          <p className="text-[18px] text-[var(--ink-800)]" style={{ fontWeight: 700 }}>
            {progress.dojo.sessionsCompleted}<span className="text-[11px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>{t('progress.sessions')}</span>
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {GYM_SCENARIOS.map(s => (
              <span key={s.id} className="text-[10px] leading-none" title={s.title}>
                {progress.dojo.scenariosAttempted.includes(s.id) ? '\u2705' : '\u2B1C'}
              </span>
            ))}
          </div>
        </div>

        {/* Coach */}
        <div className="p-4" style={{ background: 'var(--surface)' }}>
          <p className="text-[11px] text-[var(--ink-400)] mb-1" style={{ fontWeight: 500 }}>
            {t('progress.coach')}
          </p>
          <p className="text-[18px] text-[var(--ink-800)]" style={{ fontWeight: 700 }}>
            {progress.coach.messagesSent}<span className="text-[11px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>{t('progress.messagesSent')}</span>
          </p>
          <p className="text-[10px] text-[var(--ink-400)] mt-2" style={{ fontWeight: 400 }}>
            {progress.coach.sessions}{t('progress.coachSessions')}
          </p>
        </div>
      </div>

      {/* Reset button */}
      <div className="p-4 border-t border-[var(--ink-100)]">
        {showConfirm ? (
          <div className="flex items-center gap-2">
            <p className="text-[12px] text-[var(--ink-600)] flex-1" style={{ fontWeight: 400 }}>
              {t('progress.resetConfirm')}
            </p>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-[12px] text-white bg-red-500 hover:bg-red-600 transition-colors"
              style={{ fontWeight: 500 }}
            >
              {t('progress.reset')}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 rounded-lg text-[12px] text-[var(--ink-600)] bg-[var(--ink-50)] hover:bg-[var(--ink-100)] transition-colors border border-[var(--ink-200)]"
              style={{ fontWeight: 400 }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 text-[12px] text-[var(--ink-400)] hover:text-[var(--ink-600)] transition-colors"
            style={{ fontWeight: 400 }}
          >
            <RotateCcw size={12} />
            {t('progress.reset')}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Settings() {
  const { t, lang, setLang } = useI18n()
  const { preference, setTheme } = useTheme()
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('sukedachi-gemini-key') || '')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [voiceInput, setVoiceInput] = useState(() => localStorage.getItem('sukedachi-voice-input') !== 'false')
  const [autoSpeak, setAutoSpeak] = useState(() => localStorage.getItem('sukedachi-auto-speak') === 'true')
  const [speechRate, setSpeechRate] = useState(() => parseFloat(localStorage.getItem('sukedachi-speech-rate')) || 0.9)

  const handleSaveKey = () => {
    localStorage.setItem('sukedachi-gemini-key', apiKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const themeOptions = [
    { value: 'light', labelKey: 'theme.light', icon: Sun },
    { value: 'dark', labelKey: 'theme.dark', icon: Moon },
    { value: 'system', labelKey: 'theme.system', icon: Monitor },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 md:px-8 py-4 border-b border-[var(--ink-200)]" style={{ background: 'var(--surface)' }}>
        <h2 className="text-[16px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
          {t('settings.title')}
        </h2>
        <p className="text-[12px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6" style={{ background: 'var(--washi)' }}>
        <div className="max-w-lg mx-auto space-y-4">
          {/* Progress Dashboard */}
          <ProgressDashboard t={t} />

          {/* App info card */}
          <div className="rounded-2xl border border-[var(--ink-200)] overflow-hidden" style={{ background: 'var(--surface)' }}>
            <div className="p-6 text-center border-b border-[var(--ink-200)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--sage-tint)] flex items-center justify-center">
                <span className="text-3xl">⚔️</span>
              </div>
              <h3 className="text-[18px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                {t('settings.appName')}
              </h3>
              <p className="text-[13px] text-[var(--ink-500)] mt-1" style={{ fontWeight: 400 }}>
                {t('settings.appDesc')}
              </p>
              <p className="text-[11px] text-[var(--ink-400)] mt-2">
                v2.0.0
              </p>
            </div>

            <div className="p-4">
              <p className="text-[13px] text-[var(--ink-700)] text-center whitespace-pre-line" style={{ fontWeight: 400, lineHeight: 1.8 }}>
                {t('settings.appStory')}
              </p>
            </div>
          </div>

          {/* Theme toggle */}
          <div className="rounded-2xl border border-[var(--ink-200)] p-5" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sun size={18} className="text-[var(--sage)]" />
              <h3 className="text-[14px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                {t('theme.title')}
              </h3>
            </div>
            <p className="text-[12px] text-[var(--ink-500)] mb-3" style={{ fontWeight: 400 }}>
              {t('theme.desc')}
            </p>
            <div className="flex gap-2">
              {themeOptions.map(opt => {
                const Icon = opt.icon
                const isActive = preference === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] border transition-all ${
                      isActive
                        ? 'bg-[var(--sage)] text-white border-[var(--sage)]'
                        : 'text-[var(--ink-600)] border-[var(--ink-200)] hover:border-[var(--sage)]'
                    }`}
                    style={{ fontWeight: isActive ? 500 : 400, background: isActive ? undefined : 'var(--surface)' }}
                  >
                    <Icon size={14} />
                    {t(opt.labelKey)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Language toggle */}
          <div className="rounded-2xl border border-[var(--ink-200)] p-5" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={18} className="text-[var(--sage)]" />
              <h3 className="text-[14px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                {t('settings.language')}
              </h3>
            </div>
            <p className="text-[12px] text-[var(--ink-500)] mb-3" style={{ fontWeight: 400 }}>
              {t('settings.languageDesc')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setLang('jp')}
                className={`px-4 py-2 rounded-xl text-[13px] border transition-all ${
                  lang === 'jp'
                    ? 'bg-[var(--sage)] text-white border-[var(--sage)]'
                    : 'text-[var(--ink-600)] border-[var(--ink-200)] hover:border-[var(--sage)]'
                }`}
                style={{ fontWeight: lang === 'jp' ? 500 : 400, background: lang === 'jp' ? undefined : 'var(--surface)' }}
              >
                日本語
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-2 rounded-xl text-[13px] border transition-all ${
                  lang === 'en'
                    ? 'bg-[var(--sage)] text-white border-[var(--sage)]'
                    : 'text-[var(--ink-600)] border-[var(--ink-200)] hover:border-[var(--sage)]'
                }`}
                style={{ fontWeight: lang === 'en' ? 500 : 400, background: lang === 'en' ? undefined : 'var(--surface)' }}
              >
                English
              </button>
            </div>
          </div>

          {/* API Key configuration */}
          <div className="rounded-2xl border border-[var(--ink-200)] p-5" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Key size={18} className="text-[var(--sage)]" />
              <h3 className="text-[14px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                {t('settings.apiKey')}
              </h3>
            </div>
            <p className="text-[12px] text-[var(--ink-500)] mb-3" style={{ fontWeight: 400 }}>
              {t('settings.apiKeyDesc')}
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('settings.apiKeyPlaceholder')}
                  className="w-full rounded-xl px-4 py-2.5 pr-10 text-[13px] bg-[var(--washi)] border border-[var(--ink-200)] outline-none focus:border-[var(--sage)] focus:ring-2 focus:ring-[var(--sage-tint)] transition-all"
                  style={{ fontWeight: 400, color: 'var(--ink-800)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-400)] hover:text-[var(--ink-600)]"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                onClick={handleSaveKey}
                disabled={saved}
                className="px-4 py-2.5 rounded-xl text-[13px] text-white transition-all hover:opacity-90 disabled:opacity-70 flex items-center gap-1.5 flex-shrink-0"
                style={{ background: saved ? '#2D6B45' : 'var(--sage)', fontWeight: 500 }}
              >
                {saved ? <Check size={14} /> : null}
                {saved ? t('settings.apiKeySaved') : t('settings.apiKeySave')}
              </button>
            </div>
            <p className="text-[11px] text-[var(--ink-400)] mt-2" style={{ fontWeight: 400 }}>
              Model: gemini-2.5-pro
            </p>
          </div>

          {/* Voice settings */}
          {(isSpeechSupported() || isSynthesisSupported()) && (
            <div className="rounded-2xl border border-[var(--ink-200)] p-5" style={{ background: 'var(--surface)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Mic size={18} className="text-[var(--sage)]" />
                <h3 className="text-[14px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                  {t('voice.settings')}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Voice input toggle */}
                {isSpeechSupported() && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] text-[var(--ink-800)]" style={{ fontWeight: 500 }}>
                        {t('voice.inputToggle')}
                      </p>
                      <p className="text-[11px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>
                        {t('voice.inputToggleDesc')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const next = !voiceInput
                        setVoiceInput(next)
                        localStorage.setItem('sukedachi-voice-input', String(next))
                      }}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        voiceInput ? 'bg-[var(--sage)]' : 'bg-[var(--ink-200)]'
                      }`}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform"
                        style={{ background: 'var(--washi)', transform: voiceInput ? 'translateX(20px)' : 'translateX(0)' }}
                      />
                    </button>
                  </div>
                )}

                {/* Auto-speak toggle */}
                {isSynthesisSupported() && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] text-[var(--ink-800)]" style={{ fontWeight: 500 }}>
                        {t('voice.autoSpeak')}
                      </p>
                      <p className="text-[11px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>
                        {t('voice.autoSpeakDesc')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const next = !autoSpeak
                        setAutoSpeak(next)
                        localStorage.setItem('sukedachi-auto-speak', String(next))
                      }}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        autoSpeak ? 'bg-[var(--sage)]' : 'bg-[var(--ink-200)]'
                      }`}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform"
                        style={{ background: 'var(--washi)', transform: autoSpeak ? 'translateX(20px)' : 'translateX(0)' }}
                      />
                    </button>
                  </div>
                )}

                {/* Speech rate slider */}
                {isSynthesisSupported() && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[13px] text-[var(--ink-800)]" style={{ fontWeight: 500 }}>
                        {t('voice.speechRate')}
                      </p>
                      <span className="text-[12px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>
                        {speechRate.toFixed(1)}x
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[var(--ink-400)]">{t('voice.slow')}</span>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={speechRate}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          setSpeechRate(val)
                          localStorage.setItem('sukedachi-speech-rate', String(val))
                        }}
                        className="flex-1 accent-[var(--sage)]"
                      />
                      <span className="text-[11px] text-[var(--ink-400)]">{t('voice.fast')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Portfolio overview */}
          <div className="rounded-2xl border border-[var(--ink-200)] p-5" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-[var(--sage)]" />
              <h3 className="text-[14px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                {t('settings.portfolio')}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Signavio', domain: 'product.signavio.domain', color: 'var(--signavio)', bg: 'var(--signavio-bg)', emoji: '🔍' },
                { name: 'LeanIX', domain: 'product.leanix.domain', color: 'var(--leanix)', bg: 'var(--leanix-bg)', emoji: '🏗️' },
                { name: 'Syniti', domain: 'product.syniti.domain', color: 'var(--syniti)', bg: 'var(--syniti-bg)', emoji: '🧬' },
                { name: 'Tricentis', domain: 'product.tricentis.domain', color: 'var(--tricentis)', bg: 'var(--tricentis-bg)', emoji: '🧪' },
              ].map(product => (
                <div
                  key={product.name}
                  className="rounded-xl p-3 border border-[var(--ink-200)]"
                  style={{ background: product.bg }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{product.emoji}</span>
                    <p className="text-[13px]" style={{ color: product.color, fontWeight: 600 }}>
                      {product.name}
                    </p>
                  </div>
                  <p className="text-[10px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
                    {t(product.domain)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sales plays */}
          <div className="rounded-2xl border border-[var(--ink-200)] p-5" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-[var(--sage)]" />
              <h3 className="text-[14px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                {t('settings.salesPlays')}
              </h3>
            </div>
            <ul className="space-y-2">
              {['sp1', 'sp2', 'sp3', 'sp4', 'sp5', 'sp6'].map((key, i) => (
                <li key={key} className="flex items-center gap-3 text-[13px]">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--sage-tint)] text-[var(--sage-dark)]" style={{ fontWeight: 600 }}>
                    SP{i + 1}
                  </span>
                  <span className="text-[var(--ink-700)]" style={{ fontWeight: 400 }}>
                    {t(key)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Japan context */}
          <div className="rounded-2xl border border-[var(--ink-200)] p-5" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} className="text-[var(--sage)]" />
              <h3 className="text-[14px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                {t('settings.japanFocus')}
              </h3>
            </div>
            <p className="text-[13px] text-[var(--ink-700)]" style={{ fontWeight: 400, lineHeight: 1.8 }}>
              {t('settings.japanDesc')}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-[12px] text-[var(--ink-400)] justify-center pt-4" style={{ fontWeight: 400 }}>
            <Info size={14} />
            {t('settings.footer')}
          </div>
        </div>
      </div>
    </div>
  )
}
