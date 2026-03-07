import { useState } from 'react'
import { ShieldCheck, ChevronDown, ChevronUp, Sparkles, Loader2, Globe } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { useAccount, buildAccountContextString } from '../contexts/AccountContext'
import { hasApiKey } from '../lib/api'

const OBJECTIONS = [
  {
    id: 1,
    objection: { jp: '既に統合戦略がある', en: 'We already have a consolidation strategy' },
    rebuttal: {
      jp: '戦略があることは素晴らしいですね。ただ、多くのお客様が「戦略はあるが実行が追いつかない」とおっしゃいます。Signavioでプロセスの実態を可視化すると、計画と現実のギャップが明確になり、優先順位付けが格段に精度が上がります。',
      en: 'Having a strategy is great. But many customers tell us "we have a strategy but execution lags." Signavio visualizes actual process reality, revealing gaps between plans and reality, dramatically improving prioritization accuracy.',
    },
    reframe: {
      jp: '戦略の「実行力」を強化するツールとして位置づける',
      en: 'Position as a tool to strengthen strategy "execution capability"',
    },
    valueTie: {
      jp: 'Signavio + LeanIX: 戦略とIT資産の整合性を自動的に可視化',
      en: 'Signavio + LeanIX: Automatically visualize alignment between strategy and IT assets',
    },
    nextStep: {
      jp: '現在の統合計画の進捗率と、プロセス可視化によるギャップ分析のデモを提案',
      en: 'Propose a demo showing gap analysis between current consolidation progress and process visibility',
    },
  },
  {
    id: 2,
    objection: { jp: 'LeanIX/Signavioは高すぎる', en: 'Too expensive — we have Visio/Excel' },
    rebuttal: {
      jp: 'ExcelやVisioは確かに初期コストが低いですが、データの鮮度維持、共有、バージョン管理に膨大な工数がかかっています。あるお客様では年間2,000時間以上をExcelメンテナンスに費やしていました。LeanIXに移行後、その80%を削減できました。',
      en: 'Excel and Visio have low upfront costs, but maintaining data freshness, sharing, and version control consumes enormous effort. One customer spent 2,000+ hours/year on Excel maintenance. After LeanIX, they reduced that by 80%.',
    },
    reframe: {
      jp: '「見えないコスト」の可視化 — 隠れた人件費と機会損失',
      en: 'Visualize "hidden costs" — invisible labor costs and opportunity costs',
    },
    valueTie: {
      jp: 'LeanIX: IT資産のリアルタイム可視化でExcel地獄から脱却',
      en: 'LeanIX: Real-time IT landscape visibility, escaping Excel hell',
    },
    nextStep: {
      jp: '現在のExcel管理工数の簡易見積もりとROI試算を提案',
      en: 'Propose a quick estimate of current Excel management effort and ROI calculation',
    },
  },
  {
    id: 3,
    objection: { jp: 'テストは手動で回せている', en: 'Our team handles testing manually' },
    rebuttal: {
      jp: '手動テストが「回せている」ように見えても、実際にはリグレッションテストのカバレッジは20-30%程度であることが多いです。S/4HANA移行やパッチ適用のたびにリスクが累積します。Tricentisなら90%以上のカバレッジを実現し、テストサイクルを70%短縮した事例があります。',
      en: 'Manual testing may seem to "work," but regression test coverage is typically only 20-30%. Risk accumulates with every S/4HANA migration or patch. Tricentis achieves 90%+ coverage and has reduced test cycles by 70% in documented cases.',
    },
    reframe: {
      jp: '「回せている」≠「守れている」 — リスクの見える化',
      en: '"Working" ≠ "Protected" — Making risk visible',
    },
    valueTie: {
      jp: 'Tricentis: テスト自動化でSAP変更リスクを最小化',
      en: 'Tricentis: Minimize SAP change risk through test automation',
    },
    nextStep: {
      jp: '現在のテストカバレッジ率の診断と、自動化によるROI試算を提案',
      en: 'Propose a diagnostic of current test coverage and automation ROI estimate',
    },
  },
  {
    id: 4,
    objection: { jp: 'SAPで全部買う必要はない', en: "We don't need to buy everything from SAP" },
    rebuttal: {
      jp: 'おっしゃる通り、全てをSAPから買う必要はありません。ただ、BTMソリューションはSAPのコアERPと深くネイティブ統合されています。サードパーティツールとの連携構築・維持コストと、ネイティブ統合の価値を比較すると、TCOで有利になるケースが多いです。',
      en: "You're right, you don't need to buy everything from SAP. However, BTM solutions have deep native integration with SAP core ERP. When comparing the cost of building and maintaining third-party integrations versus native integration value, TCO often favors the integrated approach.",
    },
    reframe: {
      jp: '「全部買う」ではなく「統合の価値」で判断',
      en: 'Judge by "integration value" not "buying everything"',
    },
    valueTie: {
      jp: 'ネイティブ統合: データのリアルタイム連携、メンテナンスコスト削減',
      en: 'Native integration: Real-time data connectivity, reduced maintenance costs',
    },
    nextStep: {
      jp: '現在のサードパーティツールの統合コスト（人件費含む）の棚卸しを提案',
      en: 'Propose an inventory of current third-party tool integration costs (including labor)',
    },
  },
  {
    id: 5,
    objection: { jp: 'ベストオブブリードで十分', en: 'Our best-of-breed approach works fine' },
    rebuttal: {
      jp: 'ベストオブブリードは個々の機能では優れています。しかし、ツール間のデータサイロ、統合メンテナンス、ベンダー管理の複雑さが指数関数的に増大します。SAPのBTMポートフォリオなら、プロセス→アーキテクチャ→データ→テストの一貫したワークフローを実現できます。',
      en: "Best-of-breed excels in individual capabilities. But data silos between tools, integration maintenance, and vendor management complexity grow exponentially. SAP's BTM portfolio delivers a consistent workflow from process → architecture → data → testing.",
    },
    reframe: {
      jp: '個別最適 vs 全体最適 — 統合されたワークフローの価値',
      en: 'Local optimization vs global optimization — value of integrated workflows',
    },
    valueTie: {
      jp: 'BTMポートフォリオ: エンドツーエンドの変革管理を単一プラットフォームで',
      en: 'BTM Portfolio: End-to-end transformation management on a single platform',
    },
    nextStep: {
      jp: '現在のツール統合の課題を整理するワークショップを提案',
      en: 'Propose a workshop to map current tool integration challenges',
    },
  },
  {
    id: 6,
    objection: { jp: 'データ品質は問題ない', en: 'Our data quality is fine' },
    rebuttal: {
      jp: 'データ品質が「問題ない」とおっしゃるお客様の90%で、実際にアセスメントを行うと重大な問題が見つかります。S/4HANA移行後にデータ品質の問題が発覚すると、修正コストは移行前の5-10倍になることがデータで示されています。Synitiの事前診断は低リスク・低コストで実態を把握できます。',
      en: "90% of customers who say data quality is 'fine' discover significant issues during actual assessment. Data shows that fixing data quality issues post-S/4HANA migration costs 5-10x more than pre-migration. Syniti's pre-assessment is low-risk, low-cost reality check.",
    },
    reframe: {
      jp: '「問題ない」を検証する — 低リスクな事前診断の提案',
      en: 'Verify "fine" — propose a low-risk pre-assessment',
    },
    valueTie: {
      jp: 'Syniti: 移行前のデータ品質診断で移行リスクを最小化',
      en: 'Syniti: Pre-migration data quality assessment to minimize migration risk',
    },
    nextStep: {
      jp: '無償のデータ品質クイックスキャン（2-3日）を提案',
      en: 'Propose a complimentary data quality quick scan (2-3 days)',
    },
  },
]

function BattleCard({ card, lang, showEn }) {
  const { t } = useI18n()
  const account = useAccount()
  const [expanded, setExpanded] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const displayLang = showEn ? 'en' : 'jp'

  const handleAiTailor = async () => {
    if (!hasApiKey()) return
    setAiLoading(true)
    setAiResponse('')
    try {
      const apiKey = localStorage.getItem('btm-suite-gemini-key') || localStorage.getItem('sukedachi-gemini-key') || ''
      const accountCtx = buildAccountContextString(account)
      const companyRef = account.company ? `「${account.company}」` : 'このお客様'
      const industryRef = account.industry ? `（${account.industry}）` : ''
      const painRef = account.pains?.length ? `\n顧客の課題: ${account.pains.join('、')}` : ''
      const prompt = `お客様の反論「${card.objection.jp}」に対して、${companyRef}${industryRef}に特化した切り返しを作成してください。

以下を含めてください：
1. 反論への直接回答 — ${companyRef}の業界・事業に即した具体例で
2. リフレーム — ${companyRef}のビジネス課題に紐づけて視点を変える
3. 価値提案 — ${companyRef}が得られる具体的なROI・成果（業界ベンチマーク活用）
4. ネクストステップ — ${companyRef}に適した次のアクション提案
${painRef}
${displayLang === 'en' ? '英語で回答。' : '日本語で回答。'}
${accountCtx}`

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:streamGenerateContent?key=${apiKey}&alt=sse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
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
            setAiResponse(full)
          } catch {}
        }
      }
    } catch (err) {
      setAiResponse(`エラー: ${err.message}`)
    }
    setAiLoading(false)
  }

  return (
    <div className="rounded-xl border border-[var(--ink-200)] overflow-hidden" style={{ background: 'var(--surface)' }}>
      <div
        className="p-4 cursor-pointer flex items-start gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <ShieldCheck size={18} className="text-[var(--sage)] flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-[13px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
            {card.objection[displayLang]}
          </p>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-[var(--ink-400)] flex-shrink-0" />
          : <ChevronDown size={16} className="text-[var(--ink-400)] flex-shrink-0" />
        }
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--ink-100)] space-y-3 pt-3">
          {[
            { label: t('battlecards.rebuttal'), text: card.rebuttal[displayLang] },
            { label: t('battlecards.reframe'), text: card.reframe[displayLang] },
            { label: t('battlecards.valueTie'), text: card.valueTie[displayLang] },
            { label: t('battlecards.nextStep'), text: card.nextStep[displayLang] },
          ].map(({ label, text }) => (
            <div key={label}>
              <p className="text-[11px] text-[var(--sage-dark)] mb-1" style={{ fontWeight: 600 }}>{label}</p>
              <p className="text-[13px] text-[var(--ink-700)]" style={{ fontWeight: 400, lineHeight: 1.7 }}>{text}</p>
            </div>
          ))}

          {/* AI Tailor */}
          <div className="pt-2 border-t border-[var(--ink-100)]">
            <button
              onClick={handleAiTailor}
              disabled={aiLoading || !hasApiKey()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border border-[var(--sage-light)] text-[var(--sage-dark)] hover:bg-[var(--sage-tint)] transition-colors disabled:opacity-40"
              style={{ fontWeight: 500 }}
            >
              {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {t('battlecards.aiTailor')}
            </button>
            {aiResponse && (
              <div className="mt-3 p-3 rounded-lg bg-[var(--sage-tint)] border border-[var(--sage-light)]">
                <p className="text-[13px] text-[var(--ink-700)] whitespace-pre-wrap" style={{ fontWeight: 400, lineHeight: 1.7 }}>
                  {aiResponse}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Battlecards() {
  const { t, lang } = useI18n()
  const [showEn, setShowEn] = useState(lang === 'en')

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 md:px-8 py-4 border-b border-[var(--ink-200)]" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-[var(--sage)]" />
            <div>
              <h2 className="text-[16px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                {t('battlecards.title')}
              </h2>
              <p className="text-[12px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
                {t('battlecards.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowEn(!showEn)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border border-[var(--ink-200)] text-[var(--ink-600)] hover:bg-[var(--ink-50)] transition-colors"
            style={{ fontWeight: 400 }}
          >
            <Globe size={14} />
            {showEn ? '日本語' : 'English'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-5 space-y-3" style={{ background: 'var(--washi)' }}>
        {OBJECTIONS.map(card => (
          <BattleCard key={card.id} card={card} lang={lang} showEn={showEn} />
        ))}
      </div>
    </div>
  )
}
