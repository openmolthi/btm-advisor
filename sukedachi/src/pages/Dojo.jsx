import { useState, useRef, useEffect } from 'react'
import { Play, RotateCcw, ArrowLeft, Trophy, Target, MessageSquare, Lightbulb, Scale, Link2, Plus, Pencil, Trash2, X, WifiOff, Share2, Copy } from 'lucide-react'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import { GYM_SCENARIOS, CROSSSELL_SCENARIOS, PRODUCTS } from '../lib/constants'
import { sendMessage, parseScorecard, hasApiKey } from '../lib/api'
import { useI18n } from '../lib/i18n'
import { useAccount, buildAccountContextString } from '../contexts/AccountContext'
import { trackDojo } from '../lib/progressTracker'
import { getScenarios, saveScenario, updateScenario, deleteScenario, toGymScenario } from '../lib/scenarioBuilder'
import { useOnlineStatus } from '../lib/useOnlineStatus'
import { showToast } from '../lib/useToast'

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

function ScenarioCard({ scenario, onStart, onEdit, onDelete }) {
  const { t } = useI18n()

  const difficultyColors = {
    '易しい': { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)' },
    '普通': { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)' },
    '難しい': { bg: 'var(--error-bg)', text: 'var(--error-text)', border: 'var(--error-border)' },
  }
  const colors = difficultyColors[scenario.difficulty] || difficultyColors['普通']

  const difficultyMap = { '易しい': 'difficulty.easy', '普通': 'difficulty.normal', '難しい': 'difficulty.hard' }

  return (
    <div className="w-full text-left bg-surface rounded-xl p-4 border border-[var(--ink-200)] hover:border-[var(--sage)] hover:shadow-md transition-all group relative">
      <button onClick={() => onStart(scenario)} className="w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{scenario.title.split(' ')[0]}</span>
              <h3 className="text-[14px] text-[var(--ink-800)] truncate" style={{ fontWeight: 600 }}>
                {scenario.title.split(' ').slice(1).join(' ')}
              </h3>
              {scenario.isCustom && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded border border-[#D0B8E0] bg-[#F5EFFA] text-[#7B4FA0]"
                  style={{ fontWeight: 500 }}
                >
                  {t('dojo.customBadge')}
                </span>
              )}
            </div>
            <p className="text-[12px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
              {scenario.subtitle}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {scenario.relevantPlays?.map(play => (
                <span
                  key={play}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--sage-tint)] text-[var(--sage-dark)]"
                  style={{ fontWeight: 500 }}
                >
                  {play}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span
              className="text-[11px] px-2 py-0.5 rounded-lg border"
              style={{ background: colors.bg, color: colors.text, borderColor: colors.border, fontWeight: 500 }}
            >
              {t(difficultyMap[scenario.difficulty] || 'difficulty.normal')}
            </span>
            <div className="w-7 h-7 rounded-lg bg-[var(--sage-tint)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play size={14} className="text-[var(--sage-dark)]" />
            </div>
          </div>
        </div>
      </button>
      {scenario.isCustom && onEdit && onDelete && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(scenario) }}
            className="w-7 h-7 rounded-lg bg-[var(--ink-50)] border border-[var(--ink-200)] flex items-center justify-center hover:bg-[var(--ink-100)] transition-colors"
          >
            <Pencil size={13} className="text-[var(--ink-600)]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(scenario) }}
            className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors"
            style={{ background: 'var(--error-bg)', borderColor: 'var(--error-border)' }}
          >
            <Trash2 size={13} style={{ color: 'var(--error-text)' }} />
          </button>
        </div>
      )}
    </div>
  )
}

function CrossSellCard({ scenario }) {
  const getProduct = (id) => PRODUCTS.find(p => p.id === id)

  return (
    <div className="bg-surface rounded-xl p-4 border border-[var(--ink-200)]">
      <p className="text-[14px] text-[var(--ink-800)] mb-2" style={{ fontWeight: 600 }}>
        {scenario.trigger}
      </p>
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        {scenario.flow.map((productId, i) => {
          const product = getProduct(productId)
          if (!product) return null
          return (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-[var(--ink-400)] text-xs">→</span>}
              <span
                className="text-[11px] px-2 py-0.5 rounded-lg border"
                style={{ background: product.colorBg, borderColor: product.colorBorder, color: product.color, fontWeight: 500 }}
              >
                {product.name}
              </span>
            </span>
          )
        })}
        {scenario.coexist && (
          <>
            <span className="text-[var(--ink-400)] text-xs">+</span>
            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[var(--ink-50)] text-[var(--ink-600)] border border-[var(--ink-200)]">
              {scenario.coexist}
            </span>
          </>
        )}
      </div>
      <p className="text-[12px] text-[var(--ink-600)]" style={{ fontWeight: 400, lineHeight: 1.7 }}>
        {scenario.description}
      </p>
      {scenario.dealSize && (
        <p className="text-[12px] text-[var(--sage-dark)] mt-1.5" style={{ fontWeight: 600 }}>
          {scenario.dealSize}
        </p>
      )}
    </div>
  )
}

function ScoreCriterion({ icon: Icon, label, score }) {
  const { t } = useI18n()
  const getScoreInfo = (score) => {
    if (score >= 75) return { textKey: 'dojo.excellent', color: '#2D6B45' }
    if (score >= 50) return { textKey: 'dojo.decent', color: '#8A6A20' }
    return { textKey: 'dojo.needsWork', color: '#B42020' }
  }
  const info = getScoreInfo(score)

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-[13px] text-[var(--ink-700)]" style={{ fontWeight: 400 }}>
          <Icon size={16} className="text-[var(--ink-500)]" />
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[var(--ink-600)]" style={{ fontWeight: 500 }}>{score}%</span>
          <span className="text-[11px]" style={{ color: info.color, fontWeight: 500 }}>
            {t(info.textKey)}
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-[var(--ink-100)]">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${score}%`, background: info.color }}
        />
      </div>
    </div>
  )
}

function Scorecard({ scores, feedback, scenario, onRetry, onBack }) {
  const { t } = useI18n()
  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
  const grade = avg >= 85 ? 'A' : avg >= 70 ? 'B+' : avg >= 55 ? 'B' : avg >= 40 ? 'C+' : 'C'
  const gradeColor = grade.startsWith('A') ? '#2D6B45' : grade.startsWith('B') ? '#8A6A20' : '#B42020'

  const criteria = [
    { key: 'value', labelKey: 'score.value', icon: Lightbulb },
    { key: 'discovery', labelKey: 'score.discovery', icon: MessageSquare },
    { key: 'product', labelKey: 'score.product', icon: Target },
    { key: 'objection', labelKey: 'score.objection', icon: Scale },
    { key: 'dealSize', labelKey: 'score.dealSize', icon: Trophy },
    { key: 'crossSell', labelKey: 'score.crossSell', icon: Link2 },
  ]

  const buildScorecardText = () => {
    const lines = [
      `${t('dojo.scorecard')} — ${scenario?.title || ''}`,
      `${t('dojo.scoreItems')}: ${grade} (${Math.round(avg)}%)`,
      '',
      ...criteria.map(c => `${t(c.labelKey)}: ${scores[c.key] || 0}%`),
    ]
    if (feedback) lines.push('', `${t('dojo.coachComment')}: ${feedback}`)
    return lines.join('\n')
  }

  const handleShare = async () => {
    const text = buildScorecardText()
    if (navigator.share) {
      try {
        await navigator.share({ title: t('dojo.scorecard'), text })
        return
      } catch {}
    }
    await navigator.clipboard.writeText(text)
    showToast(t('toast.copied'), 'success')
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6" style={{ background: 'var(--gym-bg)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Grade circle */}
        <div className="flex items-center gap-6 mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"
            style={{ background: gradeColor, fontWeight: 700 }}
          >
            {grade}
          </div>
          <div>
            <p className="text-[16px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
              {grade.startsWith('A') ? t('dojo.gradeA') : grade.startsWith('B') ? t('dojo.gradeB') : t('dojo.gradeC')}
            </p>
            <p className="text-[13px] text-[var(--ink-500)] mt-1" style={{ fontWeight: 400 }}>
              {scenario?.title}
            </p>
          </div>
        </div>

        {/* Score criteria */}
        <div className="bg-surface rounded-2xl p-5 border border-[var(--ink-200)] mb-5">
          <h3 className="text-[14px] text-[var(--ink-800)] mb-4" style={{ fontWeight: 600 }}>
            {t('dojo.scoreItems')}
          </h3>
          <div className="space-y-4">
            {criteria.map(c => (
              <ScoreCriterion
                key={c.key}
                icon={c.icon}
                label={t(c.labelKey)}
                score={scores[c.key] || 0}
              />
            ))}
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="bg-surface rounded-2xl p-5 border border-[var(--ink-200)] mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-[var(--sage)]" />
              <h3 className="text-[14px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                {t('dojo.coachComment')}
              </h3>
            </div>
            <p className="text-[14px] text-[var(--ink-700)]" style={{ fontWeight: 400, lineHeight: 1.8 }}>
              {feedback}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] bg-surface border border-[var(--ink-200)] text-[var(--ink-700)] hover:bg-[var(--ink-50)] transition-colors"
            style={{ fontWeight: 400 }}
          >
            <ArrowLeft size={18} />
            {t('dojo.backToSelect')}
          </button>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] text-white hover:opacity-90 transition-opacity"
            style={{ background: 'var(--gym-accent)', fontWeight: 500 }}
          >
            <RotateCcw size={18} />
            {t('dojo.retry')}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] bg-surface border border-[var(--ink-200)] text-[var(--ink-700)] hover:bg-[var(--ink-50)] transition-colors"
            style={{ fontWeight: 400 }}
          >
            {navigator.share ? <Share2 size={18} /> : <Copy size={18} />}
            {navigator.share ? t('export.shareScorecard') : t('export.copyScorecard')}
          </button>
        </div>
      </div>
    </div>
  )
}

const INDUSTRIES = ['製造業', '金融', '小売', '物流', '製薬', '公共', 'その他']
const ROLES = ['CIO', 'CFO', 'COO', 'VP Engineering', 'IT Director', 'Head of Quality', 'Procurement', 'その他']
const SOLUTIONS = ['Signavio', 'LeanIX', 'Syniti', 'Tricentis']
const PLAYS = ['SP1', 'SP2', 'SP3', 'SP4', 'SP5', 'SP6']
const DIFFICULTIES = [
  { value: '普通', key: 'difficulty.normal' },
  { value: '難しい', key: 'difficulty.hard' },
  { value: '非常に難しい', key: 'difficulty.veryHard' },
]

function ConfirmDialog({ message, onConfirm, onCancel }) {
  const { t } = useI18n()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-surface rounded-2xl p-6 max-w-sm mx-4 shadow-xl border border-[var(--ink-200)]">
        <p className="text-[14px] text-[var(--ink-800)] mb-5" style={{ fontWeight: 500 }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-[13px] bg-[var(--ink-50)] border border-[var(--ink-200)] text-[var(--ink-700)] hover:bg-[var(--ink-100)] transition-colors"
            style={{ fontWeight: 400 }}
          >
            {t('dojo.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-[13px] text-white hover:opacity-90 transition-opacity"
            style={{ background: '#B42020', fontWeight: 500 }}
          >
            {t('dojo.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

function ScenarioBuilderForm({ onSave, onCancel, editingScenario }) {
  const { t } = useI18n()
  const [form, setForm] = useState(() => {
    if (editingScenario) {
      return {
        name: editingScenario.name || '',
        industry: editingScenario.industry || '製造業',
        role: editingScenario.role || 'CIO',
        roleCustom: editingScenario.roleCustom || '',
        situation: editingScenario.situation || '',
        difficulty: editingScenario.difficulty || '普通',
        solutions: editingScenario.solutions || [],
        salesPlays: editingScenario.salesPlays || [],
      }
    }
    return {
      name: '', industry: '製造業', role: 'CIO', roleCustom: '',
      situation: '', difficulty: '普通', solutions: [], salesPlays: [],
    }
  })

  const toggleArray = (arr, value) =>
    arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.situation.trim()) return
    onSave(form)
  }

  const inputClass = "w-full px-3 py-2 rounded-xl text-[13px] border border-[var(--ink-200)] text-[var(--ink-800)] focus:outline-none focus:border-[var(--sage)] transition-colors bg-[var(--washi)]"
  const labelClass = "block text-[12px] text-[var(--ink-600)] mb-1"

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-5 border border-[var(--ink-200)] space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[15px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
          {editingScenario ? t('dojo.edit') : t('dojo.createScenario')}
        </h3>
        <button type="button" onClick={onCancel} className="text-[var(--ink-400)] hover:text-[var(--ink-600)]">
          <X size={20} />
        </button>
      </div>

      {/* Scenario Name */}
      <div>
        <label className={labelClass} style={{ fontWeight: 500 }}>{t('dojo.scenarioName')}</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder={t('dojo.scenarioNamePlaceholder')}
          className={inputClass}
          required
          style={{ fontWeight: 400 }}
        />
      </div>

      {/* Industry + Role row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} style={{ fontWeight: 500 }}>{t('dojo.industry')}</label>
          <select
            value={form.industry}
            onChange={e => setForm({ ...form, industry: e.target.value })}
            className={inputClass}
            style={{ fontWeight: 400 }}
          >
            {INDUSTRIES.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} style={{ fontWeight: 500 }}>{t('dojo.customerRole')}</label>
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            className={inputClass}
            style={{ fontWeight: 400 }}
          >
            {ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom role input */}
      {form.role === 'その他' && (
        <div>
          <label className={labelClass} style={{ fontWeight: 500 }}>{t('dojo.customerRoleCustom')}</label>
          <input
            type="text"
            value={form.roleCustom}
            onChange={e => setForm({ ...form, roleCustom: e.target.value })}
            placeholder={t('dojo.customerRoleCustom')}
            className={inputClass}
            style={{ fontWeight: 400 }}
          />
        </div>
      )}

      {/* Situation */}
      <div>
        <label className={labelClass} style={{ fontWeight: 500 }}>{t('dojo.situation')}</label>
        <textarea
          value={form.situation}
          onChange={e => setForm({ ...form, situation: e.target.value })}
          placeholder={t('dojo.situationPlaceholder')}
          className={inputClass + ' resize-none'}
          rows={3}
          required
          style={{ fontWeight: 400 }}
        />
      </div>

      {/* Difficulty */}
      <div>
        <label className={labelClass} style={{ fontWeight: 500 }}>{t('dojo.difficultyLabel')}</label>
        <div className="flex gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d.value}
              type="button"
              onClick={() => setForm({ ...form, difficulty: d.value })}
              className={`flex-1 px-3 py-2 rounded-xl text-[12px] border transition-all ${
                form.difficulty === d.value
                  ? 'bg-[var(--sage-tint)] border-[var(--sage)] text-[var(--sage-dark)]'
                  : 'bg-surface border-[var(--ink-200)] text-[var(--ink-500)] hover:border-[var(--ink-300)]'
              }`}
              style={{ fontWeight: form.difficulty === d.value ? 500 : 400 }}
            >
              {t(d.key)}
            </button>
          ))}
        </div>
      </div>

      {/* Solutions checkboxes */}
      <div>
        <label className={labelClass} style={{ fontWeight: 500 }}>{t('dojo.relatedSolutions')}</label>
        <div className="flex flex-wrap gap-2">
          {SOLUTIONS.map(sol => (
            <label
              key={sol}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] border cursor-pointer transition-all ${
                form.solutions.includes(sol)
                  ? 'bg-[var(--sage-tint)] border-[var(--sage)] text-[var(--sage-dark)]'
                  : 'bg-surface border-[var(--ink-200)] text-[var(--ink-500)]'
              }`}
              style={{ fontWeight: form.solutions.includes(sol) ? 500 : 400 }}
            >
              <input
                type="checkbox"
                checked={form.solutions.includes(sol)}
                onChange={() => setForm({ ...form, solutions: toggleArray(form.solutions, sol) })}
                className="sr-only"
              />
              {sol}
            </label>
          ))}
        </div>
      </div>

      {/* Sales Plays checkboxes */}
      <div>
        <label className={labelClass} style={{ fontWeight: 500 }}>{t('dojo.relatedSalesPlays')}</label>
        <div className="flex flex-wrap gap-2">
          {PLAYS.map(play => (
            <label
              key={play}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] border cursor-pointer transition-all ${
                form.salesPlays.includes(play)
                  ? 'bg-[var(--sage-tint)] border-[var(--sage)] text-[var(--sage-dark)]'
                  : 'bg-surface border-[var(--ink-200)] text-[var(--ink-500)]'
              }`}
              style={{ fontWeight: form.salesPlays.includes(play) ? 500 : 400 }}
            >
              <input
                type="checkbox"
                checked={form.salesPlays.includes(play)}
                onChange={() => setForm({ ...form, salesPlays: toggleArray(form.salesPlays, play) })}
                className="sr-only"
              />
              {play}
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl text-[13px] bg-[var(--ink-50)] border border-[var(--ink-200)] text-[var(--ink-700)] hover:bg-[var(--ink-100)] transition-colors"
          style={{ fontWeight: 400 }}
        >
          {t('dojo.cancel')}
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 rounded-xl text-[13px] text-white hover:opacity-90 transition-opacity"
          style={{ background: 'var(--gym-accent)', fontWeight: 500 }}
        >
          {editingScenario ? t('dojo.update') : t('dojo.save')}
        </button>
      </div>
    </form>
  )
}

export default function Dojo() {
  const [view, setView] = useState('select')
  const [activeTab, setActiveTab] = useState('gym')
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [scorecard, setScorecard] = useState(null)
  const [customScenarios, setCustomScenarios] = useState(() => getScenarios())
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingScenario, setEditingScenario] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const scrollRef = useRef(null)
  const { t, lang } = useI18n()
  const { isOnline } = useOnlineStatus()
  const account = useAccount()
  const accountContext = buildAccountContextString(account)

  const allGymScenarios = [
    ...GYM_SCENARIOS,
    ...customScenarios.map(toGymScenario),
  ]

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamingText])

  const startScenario = (scenario) => {
    if (!isOnline) return
    setSelectedScenario(scenario)
    setMessages([{ role: 'assistant', content: scenario.opening }])
    setScorecard(null)
    setView('roleplay')
  }

  const handleSend = async (text) => {
    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    setStreamingText('')

    try {
      const response = await sendMessage(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        {
          mode: 'gym',
          scenario: selectedScenario,
          lang,
          accountContext,
          onChunk: (text) => setStreamingText(text),
        }
      )

      const parsed = parseScorecard(response)
      if (parsed) {
        setScorecard(parsed)
        if (selectedScenario) trackDojo(selectedScenario.id)
        const cleanResponse = response.replace(/\{[\s\S]*"scores"[\s\S]*\}/, '').trim()
        if (cleanResponse) {
          setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }])
        }
        setView('scorecard')
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
      }
      setStreamingText('')
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `エラー: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (selectedScenario) {
      setMessages([{ role: 'assistant', content: selectedScenario.opening }])
      setScorecard(null)
      setView('roleplay')
    }
  }

  const handleBack = () => {
    setView('select')
    setSelectedScenario(null)
    setMessages([])
    setScorecard(null)
  }

  const handleSaveCustom = (formData) => {
    if (editingScenario) {
      updateScenario(editingScenario.id, formData)
    } else {
      saveScenario(formData)
    }
    setCustomScenarios(getScenarios())
    setShowBuilder(false)
    setEditingScenario(null)
  }

  const handleEditCustom = (gymScenario) => {
    const raw = customScenarios.find(s => s.id === gymScenario.id)
    if (raw) {
      setEditingScenario(raw)
      setShowBuilder(true)
    }
  }

  const handleDeleteCustom = (gymScenario) => {
    setDeleteTarget(gymScenario)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteScenario(deleteTarget.id)
      setCustomScenarios(getScenarios())
      setDeleteTarget(null)
    }
  }

  // Scorecard view
  if (view === 'scorecard' && scorecard) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 md:px-8 py-4 bg-surface border-b border-[var(--ink-200)]">
          <h2 className="text-[16px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
            {t('dojo.scorecard')}
          </h2>
          <p className="text-[12px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
            {selectedScenario?.title}
          </p>
        </div>
        <Scorecard
          scores={scorecard.scores}
          feedback={scorecard.feedback}
          scenario={selectedScenario}
          onRetry={handleRetry}
          onBack={handleBack}
        />
      </div>
    )
  }

  // Roleplay view
  if (view === 'roleplay') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 md:px-8 py-4 bg-surface border-b border-[var(--ink-200)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                {t('dojo.inProgress')}
              </h2>
              <p className="text-[12px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
                {selectedScenario?.title}
              </p>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] bg-[var(--ink-50)] text-[var(--ink-700)] hover:bg-[var(--ink-100)] transition-colors border border-[var(--ink-200)]"
            >
              <ArrowLeft size={16} />
              {t('dojo.back')}
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4"
          style={{ background: 'var(--gym-bg)' }}
        >
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} variant="gym" />
          ))}
          {streamingText && <ChatMessage role="assistant" content={streamingText} variant="gym" />}
          {loading && !streamingText && <SkeletonLoader />}
        </div>

        {!isOnline && (
          <div className="px-5 md:px-8 py-3 border-t flex items-center justify-center gap-2" style={{ background: 'var(--amber-bg)', borderColor: 'var(--amber-border)' }}>
            <WifiOff size={14} style={{ color: 'var(--amber-icon)' }} />
            <p className="text-[13px]" style={{ fontWeight: 500, color: 'var(--amber-text)' }}>
              {t('offline.needsInternet')}
            </p>
          </div>
        )}
        <ChatInput
          onSend={handleSend}
          placeholder={t('dojo.placeholder')}
          variant="gym"
          disabled={loading || !isOnline}
        />
      </div>
    )
  }

  // Selection view — 3-column grid on desktop
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 md:px-8 py-4 bg-surface border-b border-[var(--ink-200)]">
        <h2 className="text-[16px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
          {t('dojo.title')}
        </h2>
        <p className="text-[12px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
          {t('dojo.subtitle')}
        </p>
      </div>

      {/* Tab toggle */}
      <div className="px-5 md:px-8 py-3 bg-surface border-b border-[var(--ink-200)]">
        <div className="flex items-center p-1 rounded-xl bg-[var(--washi)] border border-[var(--ink-200)] max-w-xl">
          <button
            onClick={() => setActiveTab('gym')}
            className={`flex-1 px-4 py-2 rounded-lg text-[13px] transition-all ${
              activeTab === 'gym'
                ? 'bg-surface text-[var(--ink-800)] shadow-sm border border-[var(--ink-200)]'
                : 'text-[var(--ink-500)] hover:text-[var(--ink-700)]'
            }`}
            style={{ fontWeight: activeTab === 'gym' ? 500 : 400 }}
          >
            {t('dojo.roleplay')}
          </button>
          <button
            onClick={() => setActiveTab('crosssell')}
            className={`flex-1 px-4 py-2 rounded-lg text-[13px] transition-all ${
              activeTab === 'crosssell'
                ? 'bg-surface text-[var(--ink-800)] shadow-sm border border-[var(--ink-200)]'
                : 'text-[var(--ink-500)] hover:text-[var(--ink-700)]'
            }`}
            style={{ fontWeight: activeTab === 'crosssell' ? 500 : 400 }}
          >
            {t('dojo.crosssell')}
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex-1 px-4 py-2 rounded-lg text-[13px] transition-all ${
              activeTab === 'builder'
                ? 'bg-surface text-[var(--ink-800)] shadow-sm border border-[var(--ink-200)]'
                : 'text-[var(--ink-500)] hover:text-[var(--ink-700)]'
            }`}
            style={{ fontWeight: activeTab === 'builder' ? 500 : 400 }}
          >
            {t('dojo.createScenario')}
          </button>
        </div>
      </div>

      {/* Content — 3 columns on desktop */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5" style={{ background: 'var(--washi)' }}>
        {activeTab === 'gym' && (
          <>
            {!isOnline && (
              <div className="mb-3 px-4 py-2.5 rounded-xl border flex items-center gap-2" style={{ background: 'var(--amber-bg)', borderColor: 'var(--amber-border)' }}>
                <WifiOff size={14} style={{ color: 'var(--amber-icon)' }} className="flex-shrink-0" />
                <p className="text-[12px]" style={{ fontWeight: 500, color: 'var(--amber-text)' }}>
                  {t('offline.needsInternet')}
                </p>
              </div>
            )}
            <p className="text-[13px] text-[var(--ink-500)] mb-3" style={{ fontWeight: 400 }}>
              {t('dojo.selectPrompt')}
            </p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {allGymScenarios.map(scenario => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onStart={startScenario}
                  onEdit={scenario.isCustom ? handleEditCustom : undefined}
                  onDelete={scenario.isCustom ? handleDeleteCustom : undefined}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'crosssell' && (
          <>
            <p className="text-[13px] text-[var(--ink-500)] mb-3" style={{ fontWeight: 400 }}>
              {t('dojo.crosssellPrompt')}
            </p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {CROSSSELL_SCENARIOS.map((scenario, i) => (
                <CrossSellCard key={i} scenario={scenario} />
              ))}
            </div>

            {/* Portfolio play reminder */}
            <div className="mt-5 rounded-xl p-5 text-center border border-[var(--ink-700)]" style={{ background: 'var(--ink-800)' }}>
              <p className="text-[12px] text-[var(--ink-400)] mb-2" style={{ letterSpacing: '0.05em', fontWeight: 400 }}>
                {t('dojo.thinkBig')}
              </p>
              <div className="flex flex-col md:flex-row md:justify-center gap-4 md:gap-12">
                <p className="text-[15px] text-white" style={{ fontWeight: 500 }}>
                  {t('dojo.singleProduct')}
                </p>
                <p className="text-[15px] text-white" style={{ fontWeight: 500 }}>
                  {t('dojo.portfolio')}
                </p>
              </div>
              <p className="text-[12px] text-[var(--ink-400)] mt-3" style={{ fontWeight: 400 }}>
                {t('dojo.alwaysLook')}
              </p>
            </div>
          </>
        )}

        {activeTab === 'builder' && (
          <>
            {showBuilder ? (
              <div className="max-w-lg mx-auto">
                <ScenarioBuilderForm
                  onSave={handleSaveCustom}
                  onCancel={() => { setShowBuilder(false); setEditingScenario(null) }}
                  editingScenario={editingScenario}
                />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[13px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>
                    {t('dojo.myScenarios')}
                  </p>
                  <button
                    onClick={() => { setEditingScenario(null); setShowBuilder(true) }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'var(--gym-accent)', fontWeight: 500 }}
                  >
                    <Plus size={16} />
                    {t('dojo.createScenario')}
                  </button>
                </div>
                {customScenarios.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[14px] text-[var(--ink-400)]" style={{ fontWeight: 400 }}>
                      {t('dojo.noCustomScenarios')}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {customScenarios.map(raw => {
                      const gym = toGymScenario(raw)
                      return (
                        <ScenarioCard
                          key={gym.id}
                          scenario={gym}
                          onStart={startScenario}
                          onEdit={handleEditCustom}
                          onDelete={handleDeleteCustom}
                        />
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message={t('dojo.deleteConfirm')}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
