import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { BookOpen, Swords, AlertTriangle, Mic, WifiOff, Download } from 'lucide-react'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import { COACH_CHIPS, CHALLENGE_CHIPS } from '../lib/constants'
import { sendMessage, hasApiKey } from '../lib/api'
import { useI18n } from '../lib/i18n'
import { trackCoachMessage } from '../lib/progressTracker'
import { useOnlineStatus } from '../lib/useOnlineStatus'
import { showToast } from '../lib/useToast'
import { useAccount, buildAccountContextString } from '../contexts/AccountContext'

function SkeletonLoader() {
  return (
    <div className="flex justify-start">
      <div className="px-4 py-3 rounded-2xl border border-[var(--ink-200)] shadow-sm flex items-center gap-2" style={{ background: 'var(--surface)' }}>
        <span className="text-lg animate-bounce" style={{ animationDelay: '0ms' }}>⚔️</span>
        <div className="flex gap-1.5 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--sage)] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--sage)] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--sage)] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

export default function Coach() {
  const [mode, setMode] = useState('learn')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const scrollRef = useRef(null)
  const { t, lang } = useI18n()
  const { isOnline } = useOnlineStatus()
  const account = useAccount()
  const accountContext = buildAccountContextString(account)

  // Voice settings from localStorage
  const voiceInputEnabled = localStorage.getItem('sukedachi-voice-input') !== 'false'
  const autoSpeak = localStorage.getItem('sukedachi-auto-speak') === 'true'
  const speechRate = parseFloat(localStorage.getItem('sukedachi-speech-rate')) || 0.9

  const isChallenge = mode === 'challenge'
  const allChips = isChallenge ? CHALLENGE_CHIPS : COACH_CHIPS

  // Rotate chips: show 5 at a time, change on mode switch or message count
  const visibleChips = useMemo(() => {
    const seed = messages.length
    const start = (seed * 2) % allChips.length
    const result = []
    for (let i = 0; i < Math.min(5, allChips.length); i++) {
      result.push(allChips[(start + i) % allChips.length])
    }
    return result
  }, [allChips, messages.length])

  useEffect(() => {
    setMessages([])
  }, [mode])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamingText])

  const handleListeningChange = useCallback((listening) => {
    setIsVoiceActive(listening)
  }, [])

  const exportChatHistory = () => {
    if (messages.length === 0) return
    const lines = messages.map(m => {
      const role = m.role === 'user' ? 'あなた' : 'コーチ'
      const time = new Date().toLocaleString('ja-JP')
      return `### ${role}\n\n${m.content}\n`
    })
    const md = `# ${t('export.chatHistory')} — ${isChallenge ? t('coach.challenge.title') : t('coach.learn.title')}\n\n${lines.join('\n---\n\n')}`
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sukedachi-chat-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
    showToast(t('toast.exported'), 'success')
  }

  const handleSend = async (text) => {
    trackCoachMessage()
    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    setStreamingText('')

    try {
      const response = await sendMessage(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        {
          mode,
          lang,
          accountContext,
          onChunk: (text) => setStreamingText(text),
        }
      )
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setStreamingText('')
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `エラー: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      const prompt = `以下のドキュメントを分析してください（${file.name}）:\n\n${content.slice(0, 10000)}\n\nこのドキュメントに基づいて、最適なセールスプレイと提案アプローチを教えてください。`
      handleSend(prompt)
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col h-full">
      {/* API Key Banner */}
      {!hasApiKey() && (
        <div className="px-5 md:px-8 py-3 border-b flex items-center gap-2" style={{ background: 'var(--amber-bg)', borderColor: 'var(--amber-border)' }}>
          <AlertTriangle size={16} style={{ color: 'var(--amber-icon)' }} className="flex-shrink-0" />
          <p className="text-[13px]" style={{ fontWeight: 400, color: 'var(--amber-text)' }}>
            {t('banner.noApiKey')}
          </p>
        </div>
      )}

      {/* Header with mode toggle */}
      <div className="px-5 md:px-8 py-4 border-b border-[var(--ink-200)]" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-[16px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                {isChallenge ? t('coach.challenge.title') : t('coach.learn.title')}
              </h2>
              <p className="text-[12px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
                {isChallenge ? t('coach.challenge.subtitle') : t('coach.learn.subtitle')}
              </p>
            </div>

            {/* Export chat button */}
            {messages.length > 0 && (
              <button
                onClick={exportChatHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border border-[var(--ink-200)] text-[var(--ink-600)] hover:bg-[var(--ink-50)] transition-colors"
                style={{ fontWeight: 400 }}
              >
                <Download size={14} />
                {t('export.chatHistory')}
              </button>
            )}

            {/* Voice mode indicator */}
            {isVoiceActive && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--sage-tint)] border border-[var(--sage-light)]">
                <Mic size={12} className="text-[var(--sage)] voice-speaker-active" />
                <span className="text-[11px] text-[var(--sage-dark)]" style={{ fontWeight: 500 }}>
                  {t('voice.active')}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center p-1 rounded-2xl bg-[var(--washi)] border border-[var(--ink-200)]">
            <button
              onClick={() => setMode('learn')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] transition-all ${
                !isChallenge
                  ? 'text-[var(--sage-dark)] shadow-sm border border-[var(--ink-200)]'
                  : 'text-[var(--ink-500)] hover:text-[var(--ink-700)]'
              }`}
              style={!isChallenge ? { background: 'var(--surface)', fontWeight: 500 } : { fontWeight: 400 }}
            >
              <BookOpen size={16} strokeWidth={!isChallenge ? 2 : 1.5} />
              {t('coach.learn')}
            </button>
            <button
              onClick={() => setMode('challenge')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] transition-all ${
                isChallenge
                  ? 'text-[var(--challenge-accent)] shadow-sm border border-[var(--ink-200)]'
                  : 'text-[var(--ink-500)] hover:text-[var(--ink-700)]'
              }`}
              style={isChallenge ? { background: 'var(--surface)', fontWeight: 500 } : { fontWeight: 400 }}
            >
              <Swords size={16} strokeWidth={isChallenge ? 2 : 1.5} />
              {t('coach.challenge')}
            </button>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4"
        style={{ background: isChallenge ? 'var(--challenge-bg)' : 'var(--washi)' }}
      >
        {/* Welcome message */}
        {messages.length === 0 && (
          <>
            <ChatMessage
              role="assistant"
              variant={isChallenge ? 'challenge' : 'default'}
              content={isChallenge ? t('coach.welcome.challenge') : t('coach.welcome.learn')}
              speechRate={speechRate}
            />

            {/* Starter chips */}
            <div className="flex flex-wrap gap-2 mt-2">
              {visibleChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(chip.replace(/[🙄🤷😤🤔😑]/g, '').replace(/[「」]/g, '').trim())}
                  className="px-4 py-2 rounded-2xl text-[13px] border border-[var(--ink-200)]
                    hover:border-[var(--sage)] hover:bg-[var(--sage-tint)] transition-all shadow-sm"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--ink-700)',
                    fontWeight: 400,
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Chat history */}
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content}
            variant={isChallenge ? 'challenge' : 'default'}
            autoSpeak={autoSpeak && msg.role === 'assistant' && i === messages.length - 1}
            speechRate={speechRate}
          />
        ))}

        {/* Streaming text */}
        {streamingText && (
          <ChatMessage
            role="assistant"
            content={streamingText}
            variant={isChallenge ? 'challenge' : 'default'}
            speechRate={speechRate}
          />
        )}

        {/* Skeleton loading */}
        {loading && !streamingText && <SkeletonLoader />}
      </div>

      {/* Offline notice */}
      {!isOnline && (
        <div className="px-5 md:px-8 py-3 border-t flex items-center justify-center gap-2" style={{ background: 'var(--amber-bg)', borderColor: 'var(--amber-border)' }}>
          <WifiOff size={14} style={{ color: 'var(--amber-icon)' }} />
          <p className="text-[13px]" style={{ fontWeight: 500, color: 'var(--amber-text)' }}>
            {t('offline.needsInternet')}
          </p>
        </div>
      )}

      {/* Chat input */}
      <ChatInput
        onSend={handleSend}
        onFileUpload={handleFileUpload}
        placeholder={isChallenge ? t('coach.challenge.placeholder') : t('coach.learn.placeholder')}
        variant={isChallenge ? 'challenge' : 'default'}
        disabled={loading || !isOnline}
        showMic={voiceInputEnabled}
        onListeningChange={handleListeningChange}
      />
    </div>
  )
}
