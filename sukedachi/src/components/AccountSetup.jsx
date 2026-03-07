import { useState } from 'react'
import { X, Building2, Sparkles, Save, Trash2 } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { useAccount } from '../contexts/AccountContext'
import { hasApiKey } from '../lib/api'

const INDUSTRIES = [
  '製造業', '自動車', '金融・保険', '小売・流通',
  '通信・IT', '公共・インフラ', 'ヘルスケア', 'その他',
]

const PAIN_OPTIONS = [
  'S/4HANA移行の遅延', 'M&A後IT統合', 'テスト工数増大',
  'プロセス属人化', 'データ品質低下', 'シャドーIT', 'レガシー技術的負債',
]

const BOM_OPTIONS = ['Signavio', 'LeanIX', 'Syniti', 'Tricentis', 'WalkMe']

export default function AccountSetup({ open, onClose }) {
  const { t } = useI18n()
  const {
    company, industry, pains, bom,
    setCompany, setIndustry, setPains, setBom, clearAccount, setAccountData,
  } = useAccount()

  const [aiLoading, setAiLoading] = useState(false)

  const toggleChip = (value, list, setter) => {
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  const [aiError, setAiError] = useState('')

  const handleAiFill = async () => {
    if (!company) return
    if (!hasApiKey()) {
      setAiError(t('account.noKey'))
      return
    }
    setAiLoading(true)
    setAiError('')
    try {
      const apiKey = localStorage.getItem('btm-suite-gemini-key') || localStorage.getItem('sukedachi-gemini-key') || ''
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `Company: "${company}". Return JSON only, no markdown. Pick industry from: ${INDUSTRIES.join(', ')}. Pick 1-3 pains from: ${PAIN_OPTIONS.join(', ')}.\n\nFormat: {"industry": "...", "pains": ["..."]}` }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 256 },
          }),
        }
      )
      if (!res.ok) {
        setAiError(`API error: ${res.status}`)
        setAiLoading(false)
        return
      }
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        if (parsed.industry && INDUSTRIES.includes(parsed.industry)) setIndustry(parsed.industry)
        if (parsed.pains?.length) {
          const valid = parsed.pains.filter(p => PAIN_OPTIONS.includes(p))
          if (valid.length) setPains(valid)
        }
      } else {
        setAiError('No suggestion returned')
      }
    } catch (err) {
      setAiError(err.message || 'AI error')
    }
    setAiLoading(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="relative w-full max-w-md h-full overflow-y-auto border-l border-[var(--ink-200)] shadow-xl"
        style={{ background: 'var(--surface)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-5 py-4 border-b border-[var(--ink-200)] flex items-center justify-between" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-[var(--sage)]" />
            <h2 className="text-[15px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
              {t('account.title')}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--ink-100)]">
            <X size={18} className="text-[var(--ink-500)]" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Company */}
          <div>
            <label className="text-[12px] text-[var(--ink-600)] mb-1.5 block" style={{ fontWeight: 500 }}>
              {t('account.company')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t('account.companyPlaceholder')}
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--ink-200)] text-[13px] text-[var(--ink-800)] bg-[var(--washi)] focus:outline-none focus:border-[var(--sage)]"
              />
              <button
                onClick={handleAiFill}
                disabled={!company || aiLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] border border-[var(--sage-light)] text-[var(--sage-dark)] hover:bg-[var(--sage-tint)] transition-colors disabled:opacity-40"
                style={{ fontWeight: 500 }}
              >
                <Sparkles size={14} className={aiLoading ? 'animate-spin' : ''} />
                {t('account.aiFill')}
              </button>
            </div>
          </div>

          {aiError && (
            <p className="text-[11px] text-[#c2410c] mt-1">{aiError}</p>
          )}

          {/* Industry */}
          <div>
            <label className="text-[12px] text-[var(--ink-600)] mb-1.5 block" style={{ fontWeight: 500 }}>
              {t('account.industry')}
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--ink-200)] text-[13px] text-[var(--ink-800)] bg-[var(--washi)] focus:outline-none focus:border-[var(--sage)]"
            >
              <option value="">{t('account.selectIndustry')}</option>
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Pains */}
          <div>
            <label className="text-[12px] text-[var(--ink-600)] mb-1.5 block" style={{ fontWeight: 500 }}>
              {t('account.pains')}
            </label>
            <div className="flex flex-wrap gap-2">
              {PAIN_OPTIONS.map(pain => (
                <button
                  key={pain}
                  onClick={() => toggleChip(pain, pains, setPains)}
                  className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                    pains.includes(pain)
                      ? 'bg-[var(--sage-tint)] border-[var(--sage)] text-[var(--sage-dark)]'
                      : 'border-[var(--ink-200)] text-[var(--ink-600)] hover:bg-[var(--ink-50)]'
                  }`}
                  style={{ fontWeight: pains.includes(pain) ? 500 : 400 }}
                >
                  {pain}
                </button>
              ))}
            </div>
          </div>

          {/* BOM */}
          <div>
            <label className="text-[12px] text-[var(--ink-600)] mb-1.5 block" style={{ fontWeight: 500 }}>
              {t('account.bom')}
            </label>
            <div className="flex flex-wrap gap-2">
              {BOM_OPTIONS.map(product => (
                <button
                  key={product}
                  onClick={() => toggleChip(product, bom, setBom)}
                  className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                    bom.includes(product)
                      ? 'bg-[var(--sage-tint)] border-[var(--sage)] text-[var(--sage-dark)]'
                      : 'border-[var(--ink-200)] text-[var(--ink-600)] hover:bg-[var(--ink-50)]'
                  }`}
                  style={{ fontWeight: bom.includes(product) ? 500 : 400 }}
                >
                  {product}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] bg-[var(--sage)] text-white hover:opacity-90 transition-opacity"
              style={{ fontWeight: 500 }}
            >
              <Save size={15} />
              {t('account.save')}
            </button>
            <button
              onClick={() => { clearAccount(); }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] border border-[var(--ink-200)] text-[var(--ink-600)] hover:bg-[var(--ink-50)] transition-colors"
              style={{ fontWeight: 400 }}
            >
              <Trash2 size={15} />
              {t('account.clear')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
