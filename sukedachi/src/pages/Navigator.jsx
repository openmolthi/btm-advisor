import { useState } from 'react'
import { Copy, Check, ChevronDown, ChevronUp, Users, Clock, Zap, ExternalLink } from 'lucide-react'
import { PRODUCTS } from '../lib/constants'
import { useI18n } from '../lib/i18n'
import { OFFICIAL_DOCS } from '../data/officialDocs'
import { showToast } from '../lib/useToast'

// Rich product data from knowledge files
const PRODUCT_DATA = {
  signavio: {
    pitches: {
      '30s': 'プロセスマイニングは業務の「デジタルレントゲン」です。システムログから実際の業務フローを可視化し、問題を発見、改善、自動化します。5,500社以上が既に活用中。日本の製造業にとっては「デジタルカイゼン」そのものです。',
      '2min': 'SAP Signavioは、クラウドベースのプロセス変革ソリューションです。\n\n**Prepare（準備）** — データ駆動で改善ポテンシャルを発見。数ヶ月ではなく、数時間で分析可能。\n\n**Build（構築）** — ベストプラクティスを活用し、関係者の合意を得ながらあるべき姿を設計。\n\n**Run（実行）** — ガバナンスワークフローとベンチマークで継続的な改善を実現。',
      '5min': '### なぜSignavioか？\n\nプロセスエクセレンスには「コックピット」が必要です。推測ではなく、データに基づいた意思決定が求められます。\n\n### 3つのフェーズ\n\n**1. Prepare（準備）**\n- 日常業務中に改善ポテンシャルを発見・分析\n- データ駆動の意思決定を迅速に実行\n- ビジネス戦略に基づく最適化の優先順位付け\n- SAP・非SAPプロセスの分析で隠れたビジネス機会を特定\n\n**2. Build（構築）**\n- Value Accelerator Library（ベストプラクティス、KPI、API）を活用\n- プロセス変更の協働・共有 — 単一の真実の情報源\n- 実行プラットフォームへの設計引き継ぎ\n\n**3. Run（実行）**\n- プロセス、リスク、コントロールのガバナンスワークフロー\n- 業界・企業ベンチマークで競合比較\n- 360度ビュー：協働、共有、モニタリング\n\n### 実績\n- **Fujitsu**: 製造サイクル33%削減\n- **BHP**: US$5億の価値創出\n- **GWF**: A$5,340万の改善機会特定',
    },
    personas: 'プロセスオーナー・CoE責任者・COO・CFO・変革リーダー・BPMコンサルタント',
    triggers: [
      '業務プロセスの実態が把握できていない',
      '改善の優先順位付けができない',
      '関係者の合意形成が難しい',
      'ガバナンスと継続的改善の仕組みがない',
    ],
    discoveryQuestions: [
      'どのエンドツーエンドプロセスが最も摩擦やコストを生んでいますか？',
      '改善ポテンシャルをデータで定量化できていますか？それとも推測ベースですか？',
      'To-Be設計で関係者の合意をどのように得ていますか？',
    ],
  },
  leanix: {
    pitches: {
      '30s': 'ITの複雑さが変革の障壁になっていませんか？SAP LeanIXは、IT資産全体（SAP・非SAP・SaaS・AIエージェント含む）を可視化し、データに基づいた意思決定、ポートフォリオの最適化、ビジネスとITの連携を実現します。',
      '2min': 'SAP LeanIXは3つの柱でIT複雑性を管理します。\n\n**可視化** — IT資産全体の統一ビュー（AIエージェント含む）で非効率を特定、コスト最適化。\n\n**最適化** — アプリケーションポートフォリオの合理化、TCO評価、クリーンなアーキテクチャ設計。\n\n**連携** — 経営とITを一つの真実の情報源で橋渡し。\n\n平均案件規模：エンタープライズ€100K（約¥1,600万）。営業サイクル約5ヶ月。',
      '5min': '### IT複雑性という障壁\n\n変革は複雑で、多くのリスクと障害があります。可視性がなければナビゲーションは不可能です。\n\n### 3つの柱\n\n**1. 完全な可視性を獲得**\n- IT資産の統一ビュー（AIエージェント含む）\n- 非効率の特定、コスト最適化\n- データ駆動の意思決定\n\n**2. ITランドスケープを最適化**\n- アプリケーションポートフォリオの合理化\n- TCO（総所有コスト）評価\n- 将来のイノベーションに向けたクリーンなITアーキテクチャ\n\n**3. ビジネスとITを連携**\n- 単一の真実の情報源で戦略を橋渡し\n- 経営ダッシュボードでステークホルダー調整\n- SAP Discovery統合\n\n### お客様シグナル\n- 「アプリケーション間の依存関係を追跡したい」\n- 「IT投資の優先順位付けができない」\n- 「AIエージェントとSaaSの管理が追いつかない」\n- 「M&A後のシステム統合で困っている」',
    },
    personas: 'CIO・エンタープライズアーキテクト・CTO・IT戦略責任者・クラウド/インフラ責任者',
    triggers: [
      'ITランドスケープの全体像が見えない',
      '技術的負債が変革を妨げている',
      'M&A後のシステム統合',
      'AIエージェントやSaaSの管理',
    ],
    discoveryQuestions: [
      'アプリケーション、インフラ、ビジネスプロセス間の依存関係をどのように追跡していますか？',
      'ITとビジネスのステークホルダー間でどのように連携していますか？',
      '最も価値を提供するIT投資をどのように判断していますか？',
    ],
  },
  syniti: {
    pitches: {
      '30s': 'S/4HANA移行の成否はデータ品質で決まります。Synitiはマスターデータ管理とデータ移行の品質を保証し、移行リスクを最小化します。データが汚れていれば、どんなに優れたシステムも機能しません。',
      '2min': 'Synitiは以下の課題を解決します。\n\n**マスターデータ品質** — データの標準化、重複排除、品質向上。\n\n**移行レディネス** — S/4HANA移行前のデータ品質評価。\n\n**移行実行サポート** — 品質保証付きのデータ移行。\n\n多くの組織がデータ品質に予算を割かず、移行が失敗してから気づきます。Synitiは「保険」として機能し、移行プロジェクトのリスクを大幅に軽減します。',
      '5min': '### データ品質という見えないリスク\n\nS/4HANA移行プロジェクトの多くは、データ品質の問題で遅延やコスト超過に陥ります。\n\n### Synitiの役割\n\n**マスターデータ管理**\n- 顧客、製品、サプライヤーなどのマスターデータを一元管理\n- データの標準化と重複排除\n- 継続的なデータガバナンス\n\n**S/4HANA移行サポート**\n- 移行前のデータレディネス評価\n- データクレンジングと変換\n- 移行後の検証\n\n### なぜ今Synitiか？\n\nデータ品質は「誰も予算を割かないが、失敗して初めて気づく」領域です。Synitiは移行の「保険」として、プロジェクトリスクを大幅に軽減します。\n\n### SP1（統合ツールチェーン）での位置付け\n\nSignavio（プロセス）+ LeanIX（アプリ）+ Syniti（データ）+ Tricentis（テスト）で、ERP変革を包括的にサポートします。',
    },
    personas: 'データ/統合リーダー・変革リーダー・CIO・IT責任者',
    triggers: [
      'S/4HANA移行を計画中',
      'データ品質に課題がある',
      '過去のデータ移行で問題があった',
      'マスターデータが複数システムに分散',
    ],
    discoveryQuestions: [
      '現在のマスターデータの品質レベルをどのように評価していますか？',
      '過去のデータ移行プロジェクトで、データ品質に起因する問題はありましたか？',
      'S/4HANA移行に向けて、データレディネスをどのように評価していますか？',
    ],
  },
  tricentis: {
    pitches: {
      '30s': 'SAPは常に変化します — トランスポート、サポートパック、アップグレード、移行。リスクは変更そのものではなく、何が影響を受けるかわからないこと。Tricentisは影響分析、継続テスト、パフォーマンス保証で変革を加速します。',
      '2min': 'Tricentisの3ステップアプローチ。\n\n**Assess（評価）** — 変更影響をAIで分析、テスト優先度を特定。\n\n**Test（テスト）** — SAP＋160以上の周辺技術を横断した継続的テスト自動化。\n\n**Assure（保証）** — 大規模なパフォーマンスと安定性の検証。\n\nIDC調査結果：年間平均$533万（約¥8億）の効果、576%の3年ROI、テストサイクル51%高速化、8ヶ月で投資回収。',
      '5min': '### 変更リスクの本質\n\nSAPは常に変化します。トランスポート、サポートパック、アップグレード、移行。リスクは変更そのものではなく、「何が影響を受けるかわからないこと」と「十分な検証ができないこと」です。\n\n### Assess → Test → Assure\n\n**1. Assess（評価）**\n- 変更前に影響とリスクを特定\n- テスト対象の優先順位付け\n- テストカバレッジのギャップ特定\n\n**2. Test（テスト）**\n- ビジネスクリティカルプロセスの継続的検証\n- SAP＋160以上の周辺技術をスケールで自動化\n\n**3. Assure（保証）**\n- Go-live準備のパフォーマンス検証\n- SLAとユーザー体験期待値の達成\n\n### 実績（IDC調査 2024年9月）\n- 年間平均効果：$533万（約¥8億）\n- 3年ROI：576%\n- テストサイクル：51%高速化\n- 投資回収：8ヶ月\n- 導入企業：600社以上\n\n### お客様の声\n> 「200以上のSAPシステム、年間10,000の変更。SAPとTricentisが安定性を支えています」— Barmer Edwin Schwentek氏',
    },
    personas: 'CIO・QA/テストリーダー・SAP Practice責任者・IT運用責任者',
    triggers: [
      'SAPアップグレードで障害が頻発',
      '変更影響の把握ができていない',
      'テストに時間がかかりすぎる',
      'ハイパーケアコストが高い',
    ],
    discoveryQuestions: [
      'どのような変更が最もリスクを生んでいますか？（トランスポート、サポートパック、アップグレード、移行）',
      '現在、何をテストするかをどのように決めていますか？影響を後から発見することはありますか？',
      'リリース後のハイパーケア/本番障害のパターンはどうなっていますか？',
    ],
  },
}

const JAPAN_CONTEXT_KEYS = [
  { titleKey: 'japan.cliff', descKey: 'japan.cliff.desc', icon: '⏰' },
  { titleKey: 'japan.labor', descKey: 'japan.labor.desc', icon: '👥' },
  { titleKey: 'japan.dx', descKey: 'japan.dx.desc', icon: '🚀' },
  { titleKey: 'japan.manufacturing', descKey: 'japan.manufacturing.desc', icon: '🏭' },
]

function ProductCard({ product }) {
  const [expanded, setExpanded] = useState(false)
  const [activePitch, setActivePitch] = useState(null)
  const [copied, setCopied] = useState(false)
  const data = PRODUCT_DATA[product.id]
  const { t } = useI18n()

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.replace(/\*\*/g, '').replace(/###/g, ''))
    setCopied(true)
    showToast(t('toast.copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-[var(--ink-200)] overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ background: 'var(--surface)' }}>
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: product.colorBg, border: `1px solid ${product.colorBorder}` }}
          >
            {product.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[15px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                {product.name}
              </h3>
              <div className="flex gap-1">
                {product.plays.map(play => (
                  <span
                    key={play}
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: product.colorBg, color: product.color, fontWeight: 500, border: `1px solid ${product.colorBorder}` }}
                  >
                    {play}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[12px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
              {t(`product.${product.id}.domain`)}
            </p>
            <p className="text-[13px] text-[var(--ink-700)] mt-1.5" style={{ fontWeight: 400, lineHeight: 1.7 }}>
              {t(`product.${product.id}.tagline`)}
            </p>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-[var(--ink-50)] transition-colors flex-shrink-0">
            {expanded ? (
              <ChevronUp size={18} className="text-[var(--ink-500)]" />
            ) : (
              <ChevronDown size={18} className="text-[var(--ink-500)]" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && data && (
        <div className="border-t border-[var(--ink-200)]">
          {/* Pitch selector */}
          <div className="p-3 bg-[var(--washi)] border-b border-[var(--ink-200)]">
            <div className="flex flex-wrap gap-1.5">
              {['30s', '2min', '5min'].map(level => (
                <button
                  key={level}
                  onClick={() => setActivePitch(activePitch === level ? null : level)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border transition-all ${
                    activePitch === level
                      ? 'bg-surface shadow-sm'
                      : 'bg-transparent hover:bg-[var(--ink-50)]'
                  }`}
                  style={{
                    borderColor: activePitch === level ? product.color : 'var(--ink-200)',
                    color: activePitch === level ? product.color : 'var(--ink-600)',
                    fontWeight: activePitch === level ? 500 : 400,
                  }}
                >
                  <Clock size={13} />
                  {level === '30s' ? t('nav.pitch.30s') : level === '2min' ? t('nav.pitch.2min') : t('nav.pitch.5min')}
                </button>
              ))}
              <button
                onClick={() => setActivePitch(activePitch === 'personas' ? null : 'personas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border transition-all ${
                  activePitch === 'personas'
                    ? 'bg-surface shadow-sm'
                    : 'bg-transparent hover:bg-[var(--ink-50)]'
                }`}
                style={{
                  borderColor: activePitch === 'personas' ? product.color : 'var(--ink-200)',
                  color: activePitch === 'personas' ? product.color : 'var(--ink-600)',
                  fontWeight: activePitch === 'personas' ? 500 : 400,
                }}
              >
                <Users size={13} />
                {t('nav.personas')}
              </button>
              <button
                onClick={() => setActivePitch(activePitch === 'triggers' ? null : 'triggers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border transition-all ${
                  activePitch === 'triggers'
                    ? 'bg-surface shadow-sm'
                    : 'bg-transparent hover:bg-[var(--ink-50)]'
                }`}
                style={{
                  borderColor: activePitch === 'triggers' ? product.color : 'var(--ink-200)',
                  color: activePitch === 'triggers' ? product.color : 'var(--ink-600)',
                  fontWeight: activePitch === 'triggers' ? 500 : 400,
                }}
              >
                <Zap size={13} />
                {t('nav.triggers')}
              </button>
            </div>
          </div>

          {/* Content display */}
          {activePitch && (
            <div className="p-4">
              {activePitch === 'personas' ? (
                <div>
                  <h4 className="text-[13px] text-[var(--ink-700)] mb-2" style={{ fontWeight: 600 }}>
                    {t('nav.targetPersonas')}
                  </h4>
                  <p className="text-[14px] text-[var(--ink-800)]" style={{ fontWeight: 400, lineHeight: 1.8 }}>
                    {data.personas}
                  </p>
                </div>
              ) : activePitch === 'triggers' ? (
                <div>
                  <h4 className="text-[13px] text-[var(--ink-700)] mb-3" style={{ fontWeight: 600 }}>
                    {t('nav.engagementTriggers')}
                  </h4>
                  <ul className="space-y-2">
                    {data.triggers.map((trigger, i) => (
                      <li key={i} className="flex gap-2 text-[14px]" style={{ fontWeight: 400 }}>
                        <span className="text-[var(--sage)]">•</span>
                        <span className="text-[var(--ink-800)]">{trigger}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[13px] text-[var(--ink-700)]" style={{ fontWeight: 600 }}>
                      {activePitch === '30s' ? '30s' : activePitch === '2min' ? '2min' : '5min'} {t('nav.elevatorPitch')}
                    </h4>
                    <button
                      onClick={() => copyToClipboard(data.pitches[activePitch])}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] hover:bg-[var(--ink-50)] transition-colors"
                      style={{ color: product.color }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? t('copied') : t('nav.copy')}
                    </button>
                  </div>
                  <div
                    className="text-[14px] text-[var(--ink-800)] whitespace-pre-line rounded-xl p-4 bg-[var(--washi)] border border-[var(--ink-200)]"
                    style={{ fontWeight: 400, lineHeight: 1.9 }}
                  >
                    {data.pitches[activePitch]}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Official docs link */}
          {OFFICIAL_DOCS[product.id] && (
            <div className="px-4 pt-3 flex flex-wrap gap-2">
              {OFFICIAL_DOCS[product.id].officialUrls.map((doc, i) => (
                <a
                  key={i}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border border-[var(--ink-200)] hover:bg-[var(--ink-50)] transition-colors"
                  style={{ color: product.color, fontWeight: 400 }}
                >
                  <ExternalLink size={12} />
                  {doc.label}
                </a>
              ))}
            </div>
          )}

          {/* Discovery questions (default when expanded) */}
          {!activePitch && (
            <div className="p-4">
              <h4 className="text-[13px] text-[var(--ink-700)] mb-3" style={{ fontWeight: 600 }}>
                {t('nav.discoveryQuestions')}
              </h4>
              <ul className="space-y-2">
                {data.discoveryQuestions.map((q, i) => (
                  <li key={i} className="flex gap-2 text-[13px]" style={{ fontWeight: 400 }}>
                    <span className="text-[var(--sage)] shrink-0" style={{ fontWeight: 500 }}>{i + 1}.</span>
                    <span className="text-[var(--ink-700)]">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Navigator() {
  const { t } = useI18n()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 md:px-8 py-4 border-b border-[var(--ink-200)]" style={{ background: 'var(--surface)' }}>
        <h2 className="text-[16px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
          {t('nav.page.title')}
        </h2>
        <p className="text-[12px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
          {t('nav.page.subtitle')}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6" style={{ background: 'var(--washi)' }}>
        {/* Product cards */}
        <div className="grid gap-3 md:grid-cols-2">
          {PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Japan context */}
        <div className="mt-5 rounded-2xl border border-[var(--ink-200)] p-5" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🇯🇵</span>
            <h3 className="text-[15px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
              {t('nav.japan.title')}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {JAPAN_CONTEXT_KEYS.map((item, i) => (
              <div
                key={i}
                className="rounded-xl p-3 text-center bg-[var(--washi)] border border-[var(--ink-200)]"
              >
                <span className="text-xl">{item.icon}</span>
                <p className="text-[13px] text-[var(--ink-800)] mt-1.5" style={{ fontWeight: 500 }}>
                  {t(item.titleKey)}
                </p>
                <p className="text-[11px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
                  {t(item.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
