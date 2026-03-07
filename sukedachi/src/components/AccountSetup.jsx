import { useState } from 'react'
import { X, Building2, Sparkles, Save, Trash2 } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { useAccount } from '../contexts/AccountContext'
import { hasApiKey } from '../lib/api'

const INDUSTRIES = [
  '製造業', '自動車', '化学', '金融・保険', '小売・流通',
  '通信・IT', '公共・インフラ', 'ヘルスケア・製薬',
  'エネルギー・ユーティリティ', '物流・運輸', 'メディア・エンタメ',
  '建設・不動産', '食品・飲料', 'その他',
]

const PAIN_OPTIONS = [
  'ERP移行・S/4HANA化',
  'プロセス可視化・標準化',
  'アプリケーション最適化・合理化',
  'M&A後IT統合',
  'テスト自動化・品質',
  'データ品質・ガバナンス',
  'レガシー技術的負債',
  'デジタル変革推進',
]

// Keyword map: AI response keyword → our pain option
const PAIN_KEYWORDS = {
  'erp': 'ERP移行・S/4HANA化', 's/4': 'ERP移行・S/4HANA化', 's4': 'ERP移行・S/4HANA化', 'hana': 'ERP移行・S/4HANA化', 'migration': 'ERP移行・S/4HANA化', '移行': 'ERP移行・S/4HANA化',
  'process': 'プロセス可視化・標準化', 'プロセス': 'プロセス可視化・標準化', '可視化': 'プロセス可視化・標準化', '標準化': 'プロセス可視化・標準化', 'transparency': 'プロセス可視化・標準化', 'excellence': 'プロセス可視化・標準化',
  'application': 'アプリケーション最適化・合理化', 'rationalization': 'アプリケーション最適化・合理化', 'modernization': 'アプリケーション最適化・合理化', '最適化': 'アプリケーション最適化・合理化', '合理化': 'アプリケーション最適化・合理化', 'landscape': 'アプリケーション最適化・合理化',
  'm&a': 'M&A後IT統合', 'merger': 'M&A後IT統合', 'acquisition': 'M&A後IT統合', '統合': 'M&A後IT統合',
  'test': 'テスト自動化・品質', 'quality': 'テスト自動化・品質', 'テスト': 'テスト自動化・品質', '品質': 'テスト自動化・品質',
  'data': 'データ品質・ガバナンス', 'データ': 'データ品質・ガバナンス', 'governance': 'データ品質・ガバナンス', 'ガバナンス': 'データ品質・ガバナンス',
  'legacy': 'レガシー技術的負債', 'レガシー': 'レガシー技術的負債', 'technical debt': 'レガシー技術的負債', '負債': 'レガシー技術的負債',
  'digital': 'デジタル変革推進', 'transformation': 'デジタル変革推進', 'dx': 'デジタル変革推進', 'デジタル': 'デジタル変革推進', '変革': 'デジタル変革推進',
}

const INDUSTRY_KEYWORDS = {
  '製造': '製造業', 'manufacturing': '製造業',
  '自動車': '自動車', 'automotive': '自動車', 'car': '自動車', 'vehicle': '自動車',
  '化学': '化学', 'chemical': '化学',
  '金融': '金融・保険', 'banking': '金融・保険', 'finance': '金融・保険', 'insurance': '金融・保険', '保険': '金融・保険',
  '小売': '小売・流通', 'retail': '小売・流通', '流通': '小売・流通', 'consumer': '小売・流通',
  '通信': '通信・IT', 'telecom': '通信・IT', 'it': '通信・IT', 'tech': '通信・IT', 'software': '通信・IT',
  '公共': '公共・インフラ', 'public': '公共・インフラ', 'government': '公共・インフラ', 'infrastructure': '公共・インフラ',
  'ヘルスケア': 'ヘルスケア・製薬', 'health': 'ヘルスケア・製薬', 'pharma': 'ヘルスケア・製薬', '製薬': 'ヘルスケア・製薬', 'life science': 'ヘルスケア・製薬',
  'エネルギー': 'エネルギー・ユーティリティ', 'energy': 'エネルギー・ユーティリティ', 'utility': 'エネルギー・ユーティリティ', 'oil': 'エネルギー・ユーティリティ', 'gas': 'エネルギー・ユーティリティ',
  '物流': '物流・運輸', 'logistics': '物流・運輸', 'transport': '物流・運輸', '運輸': '物流・運輸',
  'メディア': 'メディア・エンタメ', 'media': 'メディア・エンタメ', 'entertainment': 'メディア・エンタメ',
  '建設': '建設・不動産', 'construction': '建設・不動産', 'real estate': '建設・不動産', '不動産': '建設・不動産',
  '食品': '食品・飲料', 'food': '食品・飲料', 'beverage': '食品・飲料', '飲料': '食品・飲料',
}

const BOM_OPTIONS = ['Signavio', 'LeanIX', 'Syniti', 'Tricentis', 'WalkMe']

function fuzzyMatchIndustry(aiIndustry) {
  if (!aiIndustry) return ''
  const lower = aiIndustry.toLowerCase()
  // Direct match first
  const direct = INDUSTRIES.find(i => i === aiIndustry)
  if (direct) return direct
  // Keyword match
  for (const [keyword, industry] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (lower.includes(keyword.toLowerCase())) return industry
  }
  // Partial match
  const partial = INDUSTRIES.find(i => lower.includes(i.toLowerCase()) || i.toLowerCase().includes(lower))
  return partial || ''
}

function fuzzyMatchPains(aiPains) {
  if (!aiPains?.length) return []
  const matched = new Set()
  for (const painText of aiPains) {
    const lower = painText.toLowerCase()
    // Direct match
    const direct = PAIN_OPTIONS.find(o => o === painText)
    if (direct) { matched.add(direct); continue }
    // Keyword match
    for (const [keyword, pain] of Object.entries(PAIN_KEYWORDS)) {
      if (lower.includes(keyword.toLowerCase())) { matched.add(pain); break }
    }
  }
  return [...matched]
}

export default function AccountSetup({ open, onClose }) {
  const { t } = useI18n()
  const {
    company, industry, pains, bom,
    setCompany, setIndustry, setPains, setBom, clearAccount, setAccountData,
  } = useAccount()

  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const toggleChip = (value, list, setter) => {
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  const handleAiFill = async () => {
    if (!company) return
    if (!hasApiKey()) { setAiError(t('account.noKey')); return }
    setAiLoading(true)
    setAiError('')
    try {
      const apiKey = localStorage.getItem('btm-suite-gemini-key') || localStorage.getItem('sukedachi-gemini-key') || ''
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: 'You are an SAP industry analyst. Return ONLY a JSON object. No markdown, no explanation, no code fences.' }] },
            contents: [{ role: 'user', parts: [{ text: `Company: "${company}". What industry are they in, and what are their likely IT/business pain points relevant to SAP?
Return JSON: {"industry":"one word like automotive, manufacturing, etc","pains":["pain1","pain2"]}` }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
          }),
        }
      )
      if (!res.ok) {
        setAiError(`API error ${res.status}`)
        setAiLoading(false)
        return
      }
      const data = await res.json()
      const allParts = data.candidates?.[0]?.content?.parts || []
      console.log('[AI Suggest] raw parts:', JSON.stringify(allParts))

      // Extract JSON from any part
      let parsed = null
      for (const part of allParts) {
        if (!part.text) continue
        const clean = part.text.replace(/```json?\s*/gi, '').replace(/```/g, '').trim()
        try { parsed = JSON.parse(clean); break } catch {}
        const m = clean.match(/\{[\s\S]*\}/)
        if (m) try { parsed = JSON.parse(m[0]); break } catch {}
      }

      if (parsed) {
        console.log('[AI Suggest] parsed:', parsed)
        const matchedIndustry = fuzzyMatchIndustry(parsed.industry)
        if (matchedIndustry) setIndustry(matchedIndustry)
        const matchedPains = fuzzyMatchPains(parsed.pains || [])
        if (matchedPains.length) setPains(matchedPains)
        if (!matchedIndustry && !matchedPains.length) {
          setAiError(`Could not map: ${JSON.stringify(parsed).slice(0, 80)}`)
        }
      } else {
        const allText = allParts.map(p => p.text || '').join(' ')
        setAiError(`Parse failed: ${allText.slice(0, 80)}`)
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
