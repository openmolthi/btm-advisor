import { useState, useEffect, useRef, useCallback } from 'react'
import { X, ChevronRight, Trophy, Swords, Layers, CheckCircle2, Zap } from 'lucide-react'
import { VALUE_DRIVERS, SOLUTION_COLORS } from '../data/valueDrivers'
import { GYM_SCENARIOS } from '../lib/constants'
import { sendMessage, parseScorecard, hasApiKey } from '../lib/api'
import { useI18n } from '../lib/i18n'
import { trackFlashCard, trackQuiz, trackDojo, trackDailyDrill, getProgress, today } from '../lib/progressTracker'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'

const ALL_SOLUTIONS = ['Signavio', 'LeanIX', 'Syniti', 'Tricentis']

function SolutionPill({ name }) {
  const colors = SOLUTION_COLORS[name] || { bg: '#f0f0f0', text: '#666', border: '#ddd' }
  return (
    <span
      className="text-[12px] px-2.5 py-1 rounded-lg border"
      style={{ background: colors.bg, color: colors.text, borderColor: colors.border, fontWeight: 500 }}
    >
      {name}
    </span>
  )
}

// Pick N random cards, preferring unmastered ones
function pickFlashCards(count = 3) {
  const progress = getProgress()
  const seen = progress.flashCards?.seen || {}
  const unmastered = VALUE_DRIVERS.filter(c => (seen[c.keyword.jp] || 0) < 3)
  const pool = unmastered.length >= count ? unmastered : VALUE_DRIVERS
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count)
}

// Generate quiz questions
function generateDrillQuestions(count = 5) {
  const shuffled = [...VALUE_DRIVERS].sort(() => Math.random() - 0.5).slice(0, count)
  return shuffled.map(entry => {
    const correct = new Set(entry.solutions)
    const wrong = ALL_SOLUTIONS.filter(s => !correct.has(s))
    const correctAnswer = entry.solutions[Math.floor(Math.random() * entry.solutions.length)]
    const wrongOptions = wrong.sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5)
    return { keyword: entry.keyword, correctSolutions: entry.solutions, options }
  })
}

// Pick a random scenario, preferring unattempted
function pickDojoScenario() {
  const progress = getProgress()
  const attempted = progress.dojo?.scenariosAttempted || []
  const unattempted = GYM_SCENARIOS.filter(s => !attempted.includes(s.id))
  const pool = unattempted.length > 0 ? unattempted : GYM_SCENARIOS
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── Step 1: Flash Cards ──────────────────────────────────────────────────────

function DrillFlashCards({ lang, t, onComplete }) {
  const [cards] = useState(() => pickFlashCards(3))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = cards[index]
  const isLast = index === cards.length - 1

  const handleFlip = () => {
    if (!flipped) {
      trackFlashCard(card.keyword.jp)
      setFlipped(true)
    }
  }

  const handleNext = () => {
    if (isLast) {
      onComplete(cards.length)
    } else {
      setIndex(i => i + 1)
      setFlipped(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 py-4 px-4">
      <div className="flex items-center gap-2 text-[13px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>
        <Layers size={16} />
        {t('drill.flashcards')} — {index + 1}/{cards.length}
      </div>

      {/* Card */}
      <div
        className="w-full max-w-lg cursor-pointer"
        style={{ perspective: '1000px', minHeight: '300px' }}
        onClick={handleFlip}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '300px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-surface rounded-2xl border border-[var(--ink-200)] shadow-sm flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-[11px] text-[var(--ink-400)] mb-3 tracking-wide" style={{ fontWeight: 400 }}>
              {t('vm.customerSays')}
            </p>
            <h2 className="text-[28px] text-[var(--ink-800)] text-center" style={{ fontWeight: 600 }}>
              {card.keyword[lang] || card.keyword.jp}
            </h2>
            <p className="text-[13px] text-[var(--ink-400)] mt-6" style={{ fontWeight: 400 }}>
              {t('drill.flipToReveal')}
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-surface rounded-2xl border border-[var(--ink-200)] shadow-sm p-6 overflow-y-auto"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <h3 className="text-[18px] text-[var(--ink-800)] mb-3" style={{ fontWeight: 600 }}>
              {card.keyword[lang] || card.keyword.jp}
            </h3>
            <div className="mb-3">
              <p className="text-[11px] text-[var(--ink-400)] mb-1.5 tracking-wide" style={{ fontWeight: 500 }}>
                {t('vm.valueDrivers')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {card.valueDrivers.map((vd, i) => (
                  <span key={i} className="text-[12px] px-2 py-0.5 rounded bg-[var(--sage-tint)] text-[var(--sage-dark)]" style={{ fontWeight: 500 }}>
                    {vd[lang] || vd.jp}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <p className="text-[11px] text-[var(--ink-400)] mb-1.5 tracking-wide" style={{ fontWeight: 500 }}>
                {t('vm.solutions')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {card.solutions.map(s => <SolutionPill key={s} name={s} />)}
              </div>
            </div>
            <div className="mb-2">
              <p className="text-[11px] text-[var(--ink-400)] mb-1.5 tracking-wide" style={{ fontWeight: 500 }}>
                {t('vm.thirtySecPitch')}
              </p>
              <p className="text-[13px] text-[var(--ink-700)] bg-[var(--washi)] rounded-xl p-3 border border-[var(--ink-200)]" style={{ fontWeight: 400, lineHeight: 1.8 }}>
                {card.thirtySecPitch[lang] || card.thirtySecPitch.jp}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next button — only when flipped */}
      {flipped && (
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] text-white hover:opacity-90 transition-opacity"
          style={{ background: 'var(--sage)', fontWeight: 500 }}
        >
          {isLast ? t('drill.quiz') : t('drill.next')}
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  )
}

// ─── Step 2: Quiz ─────────────────────────────────────────────────────────────

function DrillQuiz({ lang, t, onComplete }) {
  const [questions] = useState(() => generateDrillQuestions(5))
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)

  const q = questions[qIndex]

  const handleAnswer = (option) => {
    if (selected !== null) return
    const isCorrect = q.correctSolutions.includes(option)
    setSelected(option)
    const newScore = isCorrect ? score + 1 : score
    if (isCorrect) setScore(s => s + 1)

    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        trackQuiz(newScore, questions.length)
        onComplete(newScore, questions.length)
      } else {
        setQIndex(i => i + 1)
        setSelected(null)
      }
    }, 1000)
  }

  return (
    <div className="flex flex-col items-center py-4 px-4">
      <div className="flex items-center gap-2 text-[13px] text-[var(--ink-500)] mb-4" style={{ fontWeight: 400 }}>
        <Trophy size={16} />
        {t('drill.quiz')} — {qIndex + 1}/{questions.length}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-lg mb-5">
        <div className="h-1.5 rounded-full bg-[var(--ink-100)]">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${(qIndex / questions.length) * 100}%`, background: 'var(--sage)' }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="w-full max-w-lg bg-surface rounded-2xl border border-[var(--ink-200)] shadow-sm p-6 mb-5">
        <p className="text-[12px] text-[var(--ink-400)] mb-2" style={{ fontWeight: 400 }}>
          {t('vm.customerSays')}
        </p>
        <h3 className="text-[22px] text-[var(--ink-800)] mb-1" style={{ fontWeight: 600 }}>
          {q.keyword[lang] || q.keyword.jp}
        </h3>
        <p className="text-[13px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>
          {t('vm.whichSolution')}
        </p>
      </div>

      {/* Options */}
      <div className="w-full max-w-lg space-y-2.5">
        {q.options.map(option => {
          const isCorrect = q.correctSolutions.includes(option)
          const isSelected = selected === option
          let borderColor = 'var(--ink-200)'
          let bg = 'var(--surface)'
          if (selected !== null) {
            if (isCorrect) { borderColor = 'var(--success-border)'; bg = 'var(--success-bg)' }
            else if (isSelected && !isCorrect) { borderColor = 'var(--error-border)'; bg = 'var(--error-bg)' }
          }

          return (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={selected !== null}
              className="w-full text-left px-5 py-3.5 rounded-xl border transition-all hover:border-[var(--sage)] hover:shadow-sm disabled:hover:border-[var(--ink-200)] disabled:hover:shadow-none"
              style={{ background: bg, borderColor }}
            >
              <SolutionPill name={option} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 3: Mini Dojo ────────────────────────────────────────────────────────

function SkeletonLoader() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[70%] px-5 py-4 rounded-2xl bg-surface border border-[var(--ink-200)] shadow-sm">
        <div className="space-y-3">
          <div className="skeleton h-4 w-[85%]" />
          <div className="skeleton h-4 w-[65%]" />
          <div className="skeleton h-4 w-[50%]" />
        </div>
      </div>
    </div>
  )
}

function DrillMiniDojo({ lang, t, onComplete }) {
  const [scenario] = useState(() => pickDojoScenario())
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [exchangeCount, setExchangeCount] = useState(0)
  const [dojoResult, setDojoResult] = useState(null)
  const scrollRef = useRef(null)
  const apiAvailable = hasApiKey()

  useEffect(() => {
    if (scenario) {
      setMessages([{ role: 'assistant', content: scenario.opening }])
    }
  }, [scenario])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamingText])

  const miniDojoSystemPrompt = useCallback((sc, lng) => {
    return `あなたは助太刀の実践練習（ミニ道場）モードです。
以下のお客様役を演じてください：

${sc.persona}

ルール：
- ${lng === 'en' ? '英語で会話' : '日本語で会話'}
- リアルなお客様として振る舞う
- 3回のやり取りの後、会話を終了しスコアを返す
- 終了時にJSON形式で簡易スコアを返す：
{"scores": {"value": 0-100, "discovery": 0-100, "product": 0-100}, "feedback": "簡潔なコメント"}`
  }, [])

  const handleSend = async (text) => {
    if (!apiAvailable) return
    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    setStreamingText('')
    const newCount = exchangeCount + 1
    setExchangeCount(newCount)

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }))

      const apiKey = localStorage.getItem('sukedachi-gemini-key') || ''
      const systemPrompt = miniDojoSystemPrompt(scenario, lang)

      const geminiContents = apiMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }))

      // Force scorecard after 3 exchanges
      if (newCount >= 3) {
        geminiContents.push({
          role: 'user',
          parts: [{ text: '（システム：3回のやり取りが完了しました。会話を終了し、必ずJSONスコアを返してください。）' }],
        })
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:streamGenerateContent?key=${apiKey}&alt=sse`
      const body = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiContents,
        generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (!data || data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const t = parsed.candidates?.[0]?.content?.parts?.[0]?.text || ''
            fullText += t
            setStreamingText(fullText)
          } catch { /* skip */ }
        }
      }

      const parsed = parseScorecard(fullText)
      if (parsed) {
        trackDojo(scenario.id)
        const cleanResponse = fullText.replace(/\{[\s\S]*"scores"[\s\S]*\}/, '').trim()
        if (cleanResponse) {
          setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }])
        }
        setDojoResult(parsed)
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: fullText }])
      }
      setStreamingText('')
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  // Show result
  if (dojoResult) {
    const avg = Object.values(dojoResult.scores).reduce((a, b) => a + b, 0) / Object.values(dojoResult.scores).length
    return (
      <div className="flex flex-col items-center py-4 px-4">
        <div className="flex items-center gap-2 text-[13px] text-[var(--ink-500)] mb-4" style={{ fontWeight: 400 }}>
          <Swords size={16} />
          {t('drill.dojoComplete')}
        </div>

        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl shadow-lg mb-4"
          style={{ background: avg >= 70 ? '#2D6B45' : avg >= 45 ? '#8A6A20' : '#B42020', fontWeight: 700 }}
        >
          {Math.round(avg)}%
        </div>

        <p className="text-[14px] text-[var(--ink-800)] mb-1" style={{ fontWeight: 600 }}>
          {scenario.title}
        </p>

        {dojoResult.feedback && (
          <p className="text-[13px] text-[var(--ink-600)] text-center max-w-md mt-2 mb-4" style={{ fontWeight: 400, lineHeight: 1.7 }}>
            {dojoResult.feedback}
          </p>
        )}

        {/* Score bars */}
        <div className="w-full max-w-md space-y-3 mb-5">
          {Object.entries(dojoResult.scores).map(([key, val]) => {
            const labels = { value: t('score.value'), discovery: t('score.discovery'), product: t('score.product') }
            return (
              <div key={key}>
                <div className="flex justify-between text-[12px] text-[var(--ink-600)] mb-1" style={{ fontWeight: 400 }}>
                  <span>{labels[key] || key}</span>
                  <span style={{ fontWeight: 500 }}>{val}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--ink-100)]">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${val}%`, background: val >= 70 ? '#2D6B45' : val >= 45 ? '#8A6A20' : '#B42020' }} />
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => onComplete(scenario.title, dojoResult.scores)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] text-white hover:opacity-90 transition-opacity"
          style={{ background: 'var(--sage)', fontWeight: 500 }}
        >
          {t('drill.next')}
          <ChevronRight size={18} />
        </button>
      </div>
    )
  }

  if (!apiAvailable) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-[14px] text-[var(--ink-500)] text-center" style={{ fontWeight: 400 }}>
          {lang === 'en' ? 'API key needed for Mini Dojo. Skipping...' : 'ミニ道場にはAPIキーが必要です。スキップします...'}
        </p>
        <button
          onClick={() => onComplete(null, null)}
          className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] text-white hover:opacity-90 transition-opacity"
          style={{ background: 'var(--sage)', fontWeight: 500 }}
        >
          {t('drill.next')}
          <ChevronRight size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 text-[13px] text-[var(--ink-500)] px-4 pt-4 pb-2" style={{ fontWeight: 400 }}>
        <Swords size={16} />
        {t('drill.miniDojo')} — {scenario.title}
        <span className="text-[11px] text-[var(--ink-400)]">({exchangeCount}/3)</span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ background: 'var(--gym-bg)', minHeight: '200px', maxHeight: '400px' }}
      >
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} variant="gym" />
        ))}
        {streamingText && <ChatMessage role="assistant" content={streamingText} variant="gym" />}
        {loading && !streamingText && <SkeletonLoader />}
      </div>

      <ChatInput
        onSend={handleSend}
        placeholder={t('drill.miniDojoPlaceholder')}
        variant="gym"
        disabled={loading}
      />
    </div>
  )
}

// ─── Completion Screen ────────────────────────────────────────────────────────

function DrillComplete({ t, results, onClose }) {
  const progress = getProgress()
  const streak = progress.streak?.current || 0

  return (
    <div className="flex flex-col items-center py-8 px-4 relative">
      {/* Confetti particles */}
      <div className="drill-confetti" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="drill-confetti-particle" style={{ '--i': i }} />
        ))}
      </div>

      <div className="w-20 h-20 rounded-full bg-[var(--sage)] flex items-center justify-center text-white text-3xl shadow-lg mb-4">
        <CheckCircle2 size={40} />
      </div>

      <h2 className="text-[22px] text-[var(--ink-800)] mb-2" style={{ fontWeight: 700 }}>
        {t('drill.complete')}
      </h2>

      {streak > 1 && (
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{ background: 'var(--streak-bg)', border: '1px solid var(--streak-border)' }}
        >
          <Zap size={16} style={{ color: 'var(--streak-icon)' }} />
          <span className="text-[13px]" style={{ color: 'var(--streak-text)', fontWeight: 600 }}>
            {streak}{t('drill.streak')}
          </span>
        </div>
      )}

      {/* Summary card */}
      <div className="w-full max-w-md bg-surface rounded-2xl border border-[var(--ink-200)] p-5 mb-5 space-y-3">
        <h3 className="text-[14px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
          {t('drill.summary')}
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-[var(--ink-100)]">
          <div className="flex items-center gap-2 text-[13px] text-[var(--ink-600)]">
            <Layers size={16} />
            {t('drill.flashcards')}
          </div>
          <span className="text-[13px] text-[var(--ink-800)]" style={{ fontWeight: 500 }}>
            {results.cardsReviewed}{t('drill.cardsReviewed')}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[var(--ink-100)]">
          <div className="flex items-center gap-2 text-[13px] text-[var(--ink-600)]">
            <Trophy size={16} />
            {t('drill.quizScore')}
          </div>
          <span className="text-[13px] text-[var(--ink-800)]" style={{ fontWeight: 500 }}>
            {results.quizScore}/{results.quizTotal}
          </span>
        </div>

        {results.dojoScenario && (
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-[13px] text-[var(--ink-600)]">
              <Swords size={16} />
              {t('drill.dojoScenario')}
            </div>
            <span className="text-[13px] text-[var(--ink-800)]" style={{ fontWeight: 500 }}>
              {results.dojoScenario}
            </span>
          </div>
        )}
      </div>

      <p className="text-[15px] text-[var(--ink-500)] mb-6" style={{ fontWeight: 400 }}>
        {t('drill.seeYouTomorrow')}
      </p>

      <button
        onClick={onClose}
        className="px-6 py-3 rounded-xl text-[14px] text-white hover:opacity-90 transition-opacity"
        style={{ background: 'var(--sage)', fontWeight: 500 }}
      >
        OK
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const STEPS = ['flashcards', 'quiz', 'dojo', 'complete']

export default function DailyDrill({ onClose }) {
  const { t, lang } = useI18n()
  const [step, setStep] = useState('flashcards')
  const [results, setResults] = useState({
    cardsReviewed: 0,
    quizScore: 0,
    quizTotal: 5,
    dojoScenario: null,
    dojoScores: null,
  })

  const stepIndex = STEPS.indexOf(step)
  const progressPct = (stepIndex / (STEPS.length - 1)) * 100

  const handleFlashCardsComplete = (count) => {
    setResults(r => ({ ...r, cardsReviewed: count }))
    setStep('quiz')
  }

  const handleQuizComplete = (score, total) => {
    setResults(r => ({ ...r, quizScore: score, quizTotal: total }))
    setStep('dojo')
  }

  const handleDojoComplete = (scenarioTitle, scores) => {
    const finalResults = {
      ...results,
      dojoScenario: scenarioTitle,
      dojoScores: scores,
    }
    setResults(finalResults)
    trackDailyDrill(today(), finalResults)
    setStep('complete')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="relative bg-[var(--washi)] rounded-2xl shadow-2xl border border-[var(--ink-200)] w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ink-200)] bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--sage-tint)] flex items-center justify-center">
              <Zap size={20} className="text-[var(--sage-dark)]" />
            </div>
            <div>
              <h2 className="text-[15px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                {t('drill.title')}
              </h2>
              <p className="text-[11px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>
                {t('drill.subtitle')}
              </p>
            </div>
          </div>
          {step !== 'complete' && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--ink-100)] transition-colors text-[var(--ink-500)]"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Progress bar */}
        {step !== 'complete' && (
          <div className="px-5 py-2 bg-surface border-b border-[var(--ink-200)]">
            <div className="flex items-center gap-3">
              {STEPS.slice(0, 3).map((s, i) => {
                const isActive = i === stepIndex
                const isDone = i < stepIndex
                return (
                  <div key={s} className="flex-1 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] flex-shrink-0"
                      style={{
                        background: isDone ? 'var(--sage)' : isActive ? 'var(--sage-tint)' : 'var(--ink-100)',
                        color: isDone ? 'white' : isActive ? 'var(--sage-dark)' : 'var(--ink-400)',
                        fontWeight: 600,
                      }}
                    >
                      {isDone ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    {i < 2 && (
                      <div className="flex-1 h-1 rounded-full" style={{ background: isDone ? 'var(--sage)' : 'var(--ink-100)' }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 'flashcards' && (
            <DrillFlashCards lang={lang} t={t} onComplete={handleFlashCardsComplete} />
          )}
          {step === 'quiz' && (
            <DrillQuiz lang={lang} t={t} onComplete={handleQuizComplete} />
          )}
          {step === 'dojo' && (
            <DrillMiniDojo lang={lang} t={t} onComplete={handleDojoComplete} />
          )}
          {step === 'complete' && (
            <DrillComplete t={t} results={results} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Prompt Overlay ───────────────────────────────────────────────────────────

export function DrillPrompt({ onStart, onDismiss }) {
  const { t } = useI18n()

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30">
      <div className="bg-surface rounded-t-2xl md:rounded-2xl shadow-2xl border border-[var(--ink-200)] w-full max-w-md mx-0 md:mx-4 p-6 safe-area-bottom">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--sage-tint)] flex items-center justify-center">
            <Zap size={24} className="text-[var(--sage-dark)]" />
          </div>
          <div>
            <h3 className="text-[16px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
              {t('drill.promptTitle')}
            </h3>
            <p className="text-[13px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>
              {t('drill.promptDesc')}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-3 rounded-xl text-[14px] bg-[var(--ink-50)] border border-[var(--ink-200)] text-[var(--ink-600)] hover:bg-[var(--ink-100)] transition-colors"
            style={{ fontWeight: 400 }}
          >
            {t('drill.dismiss')}
          </button>
          <button
            onClick={onStart}
            className="flex-1 px-4 py-3 rounded-xl text-[14px] text-white hover:opacity-90 transition-opacity"
            style={{ background: 'var(--sage)', fontWeight: 500 }}
          >
            {t('drill.start')}
          </button>
        </div>
      </div>
    </div>
  )
}
