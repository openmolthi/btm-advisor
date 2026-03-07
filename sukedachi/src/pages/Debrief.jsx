import { useState } from 'react'
import { FileText, Send, Copy, Loader2, AlertTriangle } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { useAccount, buildAccountContextString } from '../contexts/AccountContext'
import { hasApiKey } from '../lib/api'
import { showToast } from '../lib/useToast'

const DEBRIEF_PROMPT = (notes, accountCtx, lang) => `あなたはSAP BTMポートフォリオのシニアSA（ソリューションアーキテクト）です。
以下の会議メモから、2つのアウトプットを生成してください。

【出力1: フォローアップメール】
- 日本語（敬語・ビジネスメール形式）と英語の両方
- 件名、本文、次のステップを含む

【出力2: 社内SAメモ】
- MEDDPICC各項目へのマッピング（M: Metrics, E: Economic Buyer, D: Decision Criteria, D: Decision Process, P: Paper Process, I: Identify Pain, C: Champion, C: Competition）
- キーポイント
- 不足情報（次回確認すべき項目）
- 推奨ネクストステップ
- 関連セールスプレイ（SP1〜SP6）

${lang === 'en' ? '回答は英語メインで。' : '回答は日本語メインで。'}
${accountCtx}

---
会議メモ:
${notes}`

export default function Debrief() {
  const { t, lang } = useI18n()
  const account = useAccount()
  const [notes, setNotes] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!notes.trim() || !hasApiKey()) return
    setLoading(true)
    setOutput('')

    try {
      const apiKey = localStorage.getItem('btm-suite-gemini-key') || localStorage.getItem('sukedachi-gemini-key') || ''
      const accountCtx = buildAccountContextString(account)
      const prompt = DEBRIEF_PROMPT(notes, accountCtx, lang)

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:streamGenerateContent?key=${apiKey}&alt=sse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
          }),
        }
      )

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
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
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || ''
            full += text
            setOutput(full)
          } catch {}
        }
      }
    } catch (err) {
      setOutput(`エラー: ${err.message}`)
    }
    setLoading(false)
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
    showToast(t('toast.copied'), 'success')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 md:px-8 py-4 border-b border-[var(--ink-200)]" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-[var(--sage)]" />
          <div>
            <h2 className="text-[16px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
              {t('debrief.title')}
            </h2>
            <p className="text-[12px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
              {t('debrief.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {!hasApiKey() && (
        <div className="px-5 md:px-8 py-3 border-b flex items-center gap-2" style={{ background: 'var(--amber-bg)', borderColor: 'var(--amber-border)' }}>
          <AlertTriangle size={16} style={{ color: 'var(--amber-icon)' }} className="flex-shrink-0" />
          <p className="text-[13px]" style={{ fontWeight: 400, color: 'var(--amber-text)' }}>{t('banner.noApiKey')}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-5 space-y-4" style={{ background: 'var(--washi)' }}>
        {/* Input */}
        <div className="rounded-xl border border-[var(--ink-200)] p-4" style={{ background: 'var(--surface)' }}>
          <label className="text-[12px] text-[var(--ink-600)] mb-2 block" style={{ fontWeight: 500 }}>
            {t('debrief.notesLabel')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('debrief.notesPlaceholder')}
            rows={8}
            className="w-full px-3 py-2 rounded-lg border border-[var(--ink-200)] text-[13px] text-[var(--ink-800)] bg-[var(--washi)] focus:outline-none focus:border-[var(--sage)] resize-y"
            style={{ lineHeight: 1.7 }}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleGenerate}
              disabled={!notes.trim() || loading || !hasApiKey()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] bg-[var(--sage)] text-white hover:opacity-90 transition-opacity disabled:opacity-40"
              style={{ fontWeight: 500 }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {t('debrief.generate')}
            </button>
          </div>
        </div>

        {/* Output */}
        {output && (
          <div className="rounded-xl border border-[var(--ink-200)] p-4" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] text-[var(--ink-700)]" style={{ fontWeight: 600 }}>
                {t('debrief.output')}
              </h3>
              <button
                onClick={copyOutput}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border border-[var(--ink-200)] text-[var(--ink-600)] hover:bg-[var(--ink-50)] transition-colors"
                style={{ fontWeight: 400 }}
              >
                <Copy size={13} />
                {t('nav.copy')}
              </button>
            </div>
            <div
              className="text-[13px] text-[var(--ink-700)] whitespace-pre-wrap"
              style={{ fontWeight: 400, lineHeight: 1.8 }}
            >
              {output}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
