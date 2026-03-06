import { useState, useEffect, useMemo, useCallback } from 'react'
import { Shuffle, ChevronLeft, ChevronRight, Search, Timer, Trophy, RotateCcw, FileDown } from 'lucide-react'
import { VALUE_DRIVERS, SOLUTION_COLORS } from '../data/valueDrivers'
import { useI18n } from '../lib/i18n'
import { trackFlashCard, trackQuiz } from '../lib/progressTracker'
import { showToast } from '../lib/useToast'

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

// ─── Flash Cards ───────────────────────────────────────────────────────────────

function FlashCards({ lang, t }) {
  const [cards, setCards] = useState(() => [...VALUE_DRIVERS])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const shuffle = useCallback(() => {
    const shuffled = [...VALUE_DRIVERS].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setIndex(0)
    setFlipped(false)
  }, [])

  const go = useCallback((dir) => {
    setIndex(i => {
      const next = i + dir
      if (next < 0) return cards.length - 1
      if (next >= cards.length) return 0
      return next
    })
    setFlipped(false)
  }, [cards.length])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(f => !f) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [go])

  const card = cards[index]
  if (!card) return null

  return (
    <div className="flex flex-col items-center gap-5 py-6 px-4">
      {/* Progress & controls */}
      <div className="flex items-center gap-4 w-full max-w-lg justify-between">
        <span className="text-[13px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>
          {index + 1} / {cards.length}
        </span>
        <button
          onClick={shuffle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] bg-[var(--ink-50)] text-[var(--ink-600)] hover:bg-[var(--ink-100)] transition-colors border border-[var(--ink-200)]"
          style={{ fontWeight: 400 }}
        >
          <Shuffle size={14} />
          {t('vm.shuffle')}
        </button>
      </div>

      {/* Card with flip animation */}
      <div
        className="w-full max-w-lg cursor-pointer"
        style={{ perspective: '1000px', minHeight: '340px' }}
        onClick={() => {
          const willFlip = !flipped
          if (willFlip) trackFlashCard(card.keyword.jp)
          setFlipped(willFlip)
        }}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '340px',
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
              {t('vm.tapToFlip')}
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

            {/* Value Drivers */}
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

            {/* Solutions */}
            <div className="mb-3">
              <p className="text-[11px] text-[var(--ink-400)] mb-1.5 tracking-wide" style={{ fontWeight: 500 }}>
                {t('vm.solutions')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {card.solutions.map(s => <SolutionPill key={s} name={s} />)}
              </div>
            </div>

            {/* 30s Pitch */}
            <div className="mb-2">
              <p className="text-[11px] text-[var(--ink-400)] mb-1.5 tracking-wide" style={{ fontWeight: 500 }}>
                {t('vm.thirtySecPitch')}
              </p>
              <p className="text-[13px] text-[var(--ink-700)] bg-[var(--washi)] rounded-xl p-3 border border-[var(--ink-200)]" style={{ fontWeight: 400, lineHeight: 1.8 }}>
                {card.thirtySecPitch[lang] || card.thirtySecPitch.jp}
              </p>
            </div>

            {/* Sales Plays */}
            <div className="flex gap-1.5 mt-2">
              {card.salesPlays.map(sp => (
                <span key={sp} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--ink-50)] text-[var(--ink-600)] border border-[var(--ink-200)]" style={{ fontWeight: 500 }}>
                  {sp}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => go(-1)}
          className="w-10 h-10 rounded-xl bg-surface border border-[var(--ink-200)] flex items-center justify-center hover:bg-[var(--ink-50)] transition-colors"
        >
          <ChevronLeft size={20} className="text-[var(--ink-600)]" />
        </button>
        <button
          onClick={() => go(1)}
          className="w-10 h-10 rounded-xl bg-surface border border-[var(--ink-200)] flex items-center justify-center hover:bg-[var(--ink-50)] transition-colors"
        >
          <ChevronRight size={20} className="text-[var(--ink-600)]" />
        </button>
      </div>
    </div>
  )
}

// ─── Quiz ──────────────────────────────────────────────────────────────────────

const ALL_SOLUTIONS = ['Signavio', 'LeanIX', 'Syniti', 'Tricentis']

function generateQuestions(count = 10) {
  const shuffled = [...VALUE_DRIVERS].sort(() => Math.random() - 0.5).slice(0, count)
  return shuffled.map(entry => {
    const correct = new Set(entry.solutions)
    const wrong = ALL_SOLUTIONS.filter(s => !correct.has(s))
    // Pick one correct answer and fill rest with wrong ones, shuffle
    const correctAnswer = entry.solutions[Math.floor(Math.random() * entry.solutions.length)]
    const wrongOptions = wrong.sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5)
    return {
      keyword: entry.keyword,
      correctSolutions: entry.solutions,
      options,
    }
  })
}

function Quiz({ lang, t }) {
  const [state, setState] = useState('idle') // idle, playing, done
  const [questions, setQuestions] = useState([])
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState(null)
  const [timeLeft, setTimeLeft] = useState(15)
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('sukedachi-vm-best')
    return saved ? parseInt(saved, 10) : 0
  })

  const startQuiz = () => {
    const qs = generateQuestions(10)
    setQuestions(qs)
    setQIndex(0)
    setScore(0)
    setAnswers([])
    setSelected(null)
    setTimeLeft(15)
    setState('playing')
  }

  // Timer
  useEffect(() => {
    if (state !== 'playing' || selected !== null) return
    if (timeLeft <= 0) {
      handleAnswer(null)
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [state, timeLeft, selected])

  const handleAnswer = (option) => {
    if (selected !== null) return
    const q = questions[qIndex]
    const isCorrect = option !== null && q.correctSolutions.includes(option)
    setSelected(option)
    const newAnswers = [...answers, { keyword: q.keyword, selected: option, correct: q.correctSolutions, isCorrect }]
    setAnswers(newAnswers)
    if (isCorrect) setScore(s => s + 1)

    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        const finalScore = isCorrect ? score + 1 : score
        if (finalScore > bestScore) {
          setBestScore(finalScore)
          localStorage.setItem('sukedachi-vm-best', String(finalScore))
        }
        trackQuiz(finalScore, questions.length)
        setState('done')
      } else {
        setQIndex(i => i + 1)
        setSelected(null)
        setTimeLeft(15)
      }
    }, 1200)
  }

  if (state === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--sage-tint)] flex items-center justify-center mb-4">
          <Trophy size={28} className="text-[var(--sage-dark)]" />
        </div>
        <h3 className="text-[18px] text-[var(--ink-800)] mb-2" style={{ fontWeight: 600 }}>
          {t('vm.quizTitle')}
        </h3>
        <p className="text-[13px] text-[var(--ink-500)] mb-1 text-center" style={{ fontWeight: 400 }}>
          {t('vm.quizDesc')}
        </p>
        {bestScore > 0 && (
          <p className="text-[12px] text-[var(--sage-dark)] mb-4" style={{ fontWeight: 500 }}>
            {t('vm.bestScore')}: {bestScore}/10
          </p>
        )}
        <button
          onClick={startQuiz}
          className="px-6 py-3 rounded-xl text-[14px] text-white hover:opacity-90 transition-opacity"
          style={{ background: 'var(--sage)', fontWeight: 500 }}
        >
          {t('vm.startQuiz')}
        </button>
      </div>
    )
  }

  if (state === 'done') {
    return (
      <div className="flex flex-col items-center py-8 px-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl shadow-lg mb-4"
          style={{
            background: score >= 8 ? '#2D6B45' : score >= 5 ? '#8A6A20' : '#B42020',
            fontWeight: 700,
          }}
        >
          {score}/{questions.length}
        </div>
        <h3 className="text-[18px] text-[var(--ink-800)] mb-1" style={{ fontWeight: 600 }}>
          {score >= 8 ? t('vm.excellent') : score >= 5 ? t('vm.good') : t('vm.needsWork')}
        </h3>
        {score > bestScore - 1 && score === bestScore && (
          <p className="text-[12px] text-[var(--sage-dark)] mb-4" style={{ fontWeight: 500 }}>
            {t('vm.newBest')}
          </p>
        )}

        {/* Answer breakdown */}
        <div className="w-full max-w-lg mt-4 space-y-2">
          {answers.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl border"
              style={{
                background: a.isCorrect ? 'var(--success-bg)' : 'var(--error-bg)',
                borderColor: a.isCorrect ? 'var(--success-border)' : 'var(--error-border)',
              }}
            >
              <span className="text-[13px] text-[var(--ink-800)]" style={{ fontWeight: 500 }}>
                {a.keyword[lang] || a.keyword.jp}
              </span>
              <span className="text-[12px]" style={{ fontWeight: 500, color: a.isCorrect ? 'var(--success-text)' : 'var(--error-text)' }}>
                {a.isCorrect ? (a.selected || '') : `${a.selected || t('vm.timeout')} → ${a.correct.join(', ')}`}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={startQuiz}
          className="flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-[14px] text-white hover:opacity-90 transition-opacity"
          style={{ background: 'var(--sage)', fontWeight: 500 }}
        >
          <RotateCcw size={16} />
          {t('vm.retry')}
        </button>
      </div>
    )
  }

  // Playing
  const q = questions[qIndex]
  return (
    <div className="flex flex-col items-center py-6 px-4">
      {/* Progress bar */}
      <div className="w-full max-w-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>
            {qIndex + 1} / {questions.length}
          </span>
          <span
            className="flex items-center gap-1 text-[12px]"
            style={{ fontWeight: 500, color: timeLeft <= 5 ? '#B42020' : 'var(--ink-600)' }}
          >
            <Timer size={14} />
            {timeLeft}s
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--ink-100)]">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${((qIndex) / questions.length) * 100}%`, background: 'var(--sage)' }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="w-full max-w-lg bg-surface rounded-2xl border border-[var(--ink-200)] shadow-sm p-6 mb-5">
        <p className="text-[12px] text-[var(--ink-400)] mb-2" style={{ fontWeight: 400 }}>
          {t('vm.customerSays')}
        </p>
        <h3 className="text-[22px] text-[var(--ink-800)] mb-1" style={{ fontWeight: 600 }}>
          「{q.keyword[lang] || q.keyword.jp}」
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

      {/* Timer bar */}
      <div className="w-full max-w-lg mt-4">
        <div className="h-1 rounded-full bg-[var(--ink-100)]">
          <div
            className="h-1 rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${(timeLeft / 15) * 100}%`,
              background: timeLeft <= 5 ? '#B42020' : 'var(--sage)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Browse All ────────────────────────────────────────────────────────────────

function handlePrintPdf(filtered, lang) {
  // Group cards by primary solution
  const groups = {}
  filtered.forEach(entry => {
    const primary = entry.solutions[0] || 'Other'
    if (!groups[primary]) groups[primary] = []
    groups[primary].push(entry)
  })

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Value Map Cards</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans JP', -apple-system, sans-serif; color: #1A1A1A; padding: 24px; }
  h2 { font-size: 18px; margin-bottom: 16px; }
  .group-title { font-size: 15px; font-weight: 600; margin-top: 28px; margin-bottom: 12px; break-after: avoid; border-bottom: 1px solid #D4D0C8; padding-bottom: 4px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .card { border: 1px solid #D4D0C8; border-radius: 10px; padding: 14px; break-inside: avoid; }
  .card h4 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
  .card .solutions { font-size: 11px; color: #5C5752; margin-bottom: 4px; }
  .card .drivers { font-size: 11px; color: #3D5C42; }
  .card .pitch { font-size: 12px; line-height: 1.7; color: #3D3A36; margin-top: 6px; padding: 8px; background: #FAFAF8; border-radius: 6px; }
</style></head><body>
<h2>Value Map &mdash; Flash Cards</h2>
${Object.entries(groups).map(([sol, cards]) => `
  <div class="group-title">${sol}</div>
  <div class="grid">${cards.map(c => `
    <div class="card">
      <h4>${c.keyword[lang] || c.keyword.jp}</h4>
      <div class="solutions">${c.solutions.join(', ')}</div>
      <div class="drivers">${c.valueDrivers.map(vd => vd[lang] || vd.jp).join(' / ')}</div>
      <div class="pitch">${c.thirtySecPitch[lang] || c.thirtySecPitch.jp}</div>
    </div>`).join('')}
  </div>`).join('')}
</body></html>`

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.print()
    printWindow.close()
  }
}

function BrowseAll({ lang, t }) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(new Set())

  const toggleFilter = (solution) => {
    setFilters(prev => {
      const next = new Set(prev)
      if (next.has(solution)) next.delete(solution)
      else next.add(solution)
      return next
    })
  }

  const filtered = useMemo(() => {
    return VALUE_DRIVERS.filter(entry => {
      // Search filter
      if (search) {
        const q = search.toLowerCase()
        const matchKeyword = entry.keyword.jp.includes(q) || entry.keyword.en.toLowerCase().includes(q)
        const matchSolution = entry.solutions.some(s => s.toLowerCase().includes(q))
        const matchDriver = entry.valueDrivers.some(vd => vd.jp.includes(q) || vd.en.toLowerCase().includes(q))
        if (!matchKeyword && !matchSolution && !matchDriver) return false
      }
      // Solution filter
      if (filters.size > 0) {
        if (!entry.solutions.some(s => filters.has(s))) return false
      }
      return true
    })
  }, [search, filters])

  return (
    <div className="py-4 px-4">
      {/* Search & filters */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-400)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('vm.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-[var(--ink-200)] text-[13px] text-[var(--ink-800)] placeholder:text-[var(--ink-400)] focus:outline-none focus:border-[var(--sage)]"
            style={{ fontWeight: 400 }}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {ALL_SOLUTIONS.map(s => {
            const active = filters.has(s)
            const colors = SOLUTION_COLORS[s]
            return (
              <button
                key={s}
                onClick={() => toggleFilter(s)}
                className="text-[12px] px-3 py-1.5 rounded-lg border transition-all"
                style={{
                  background: active ? colors.bg : 'white',
                  borderColor: active ? colors.border : 'var(--ink-200)',
                  color: active ? colors.text : 'var(--ink-500)',
                  fontWeight: active ? 500 : 400,
                }}
              >
                {s}
              </button>
            )
          })}
          <button
            onClick={() => handlePrintPdf(filtered, lang)}
            className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg text-[12px] border border-[var(--ink-200)] text-[var(--ink-600)] hover:bg-[var(--ink-50)] transition-colors"
            style={{ fontWeight: 400 }}
          >
            <FileDown size={14} />
            {t('export.pdfExport')}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {filtered.map((entry, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl border border-[var(--ink-200)] p-4 hover:shadow-sm transition-shadow"
          >
            <h4 className="text-[15px] text-[var(--ink-800)] mb-1.5" style={{ fontWeight: 600 }}>
              {entry.keyword[lang] || entry.keyword.jp}
            </h4>
            {lang === 'en' && (
              <p className="text-[11px] text-[var(--ink-400)] mb-2" style={{ fontWeight: 400 }}>
                {entry.keyword.jp}
              </p>
            )}
            <div className="flex flex-wrap gap-1 mb-2">
              {entry.solutions.map(s => <SolutionPill key={s} name={s} />)}
            </div>
            <div className="flex flex-wrap gap-1">
              {entry.valueDrivers.map((vd, j) => (
                <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--sage-tint)] text-[var(--sage-dark)]" style={{ fontWeight: 500 }}>
                  {vd[lang] || vd.jp}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[13px] text-[var(--ink-400)] mt-8" style={{ fontWeight: 400 }}>
          {t('vm.noResults')}
        </p>
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ValueMap() {
  const { t, lang } = useI18n()
  const [activeTab, setActiveTab] = useState('flashcards')

  const tabs = [
    { id: 'flashcards', labelKey: 'vm.flashcards' },
    { id: 'quiz', labelKey: 'vm.quiz' },
    { id: 'browse', labelKey: 'vm.browseAll' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 md:px-8 py-4 bg-surface border-b border-[var(--ink-200)]">
        <h2 className="text-[16px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
          {t('vm.title')}
        </h2>
        <p className="text-[12px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
          {t('vm.subtitle')}
        </p>
      </div>

      {/* Tab toggle */}
      <div className="px-5 md:px-8 py-3 bg-surface border-b border-[var(--ink-200)]">
        <div className="flex items-center p-1 rounded-xl bg-[var(--washi)] border border-[var(--ink-200)] max-w-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-lg text-[13px] transition-all ${
                activeTab === tab.id
                  ? 'bg-surface text-[var(--ink-800)] shadow-sm border border-[var(--ink-200)]'
                  : 'text-[var(--ink-500)] hover:text-[var(--ink-700)]'
              }`}
              style={{ fontWeight: activeTab === tab.id ? 500 : 400 }}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--washi)' }}>
        {activeTab === 'flashcards' && <FlashCards lang={lang} t={t} />}
        {activeTab === 'quiz' && <Quiz lang={lang} t={t} />}
        {activeTab === 'browse' && <BrowseAll lang={lang} t={t} />}
      </div>
    </div>
  )
}
