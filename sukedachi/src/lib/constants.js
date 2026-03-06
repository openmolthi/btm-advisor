// Product definitions with KOKORO aesthetic colors
export const PRODUCTS = [
  {
    id: 'signavio',
    name: 'Signavio',
    emoji: '🔍',
    color: '#6B8CAE',
    colorBg: '#F0F4F8',
    colorBorder: '#D0DBE7',
    domain: 'プロセスマイニング＆マネジメント',
    domainEn: 'Process Mining & Management',
    tagline: '業務プロセスの実態を可視化。問題を発見し、改善し、自動化する。',
    plays: ['SP1', 'SP2', 'SP4'],
  },
  {
    id: 'leanix',
    name: 'LeanIX',
    emoji: '🏗️',
    color: '#8B7BB5',
    colorBg: '#F3F0F8',
    colorBorder: '#D4CDE5',
    domain: 'エンタープライズ・アーキテクチャ管理',
    domainEn: 'Enterprise Architecture Management',
    tagline: 'IT資産の全体像を把握。計画的に最適化。Excelの混乱から脱却。',
    plays: ['SP1', 'SP3', 'SP4'],
  },
  {
    id: 'syniti',
    name: 'Syniti',
    emoji: '🧬',
    color: '#7BA88E',
    colorBg: '#F0F7F2',
    colorBorder: '#C8E0D2',
    domain: 'データ品質＆マイグレーション',
    domainEn: 'Data Quality & Migration',
    tagline: 'S/4HANA移行の成否はデータ品質で決まる。Synitiがそれを保証する。',
    plays: ['SP1'],
  },
  {
    id: 'tricentis',
    name: 'Tricentis',
    emoji: '🧪',
    color: '#B5985B',
    colorBg: '#FAF6EF',
    colorBorder: '#E5D9C3',
    domain: 'テスト自動化＆品質保証',
    domainEn: 'Testing & QA Automation',
    tagline: 'SAP変更のリスクを最小化。人が見逃すバグを継続的に検出。',
    plays: ['SP1', 'SP5'],
  },
]

// Sales plays
export const SALES_PLAYS = [
  {
    id: 'SP1',
    name: 'Integrated Toolchain for ERP Transformation',
    nameJa: 'ERP変革のための統合ツールチェーン',
    products: ['signavio', 'leanix', 'syniti', 'tricentis'],
    isPortfolioPlay: true,
  },
  {
    id: 'SP2',
    name: 'Process Excellence for LoBs',
    nameJa: 'LoB向けプロセスエクセレンス',
    products: ['signavio'],
  },
  {
    id: 'SP3',
    name: 'Manage IT Complexity with EA',
    nameJa: 'エンタープライズアーキテクチャでIT複雑性を管理',
    products: ['leanix'],
  },
  {
    id: 'SP4',
    name: 'Manage & Govern AI Agents',
    nameJa: 'AIエージェントの管理とガバナンス',
    products: ['leanix', 'signavio'],
  },
  {
    id: 'SP5',
    name: 'Enterprise Application QA',
    nameJa: 'エンタープライズアプリケーション品質保証',
    products: ['tricentis'],
  },
  {
    id: 'SP6',
    name: 'Enterprise Digital Adoption',
    nameJa: 'エンタープライズ・デジタルアダプション',
    products: ['walkme'],
    secondary: true,
  },
]

// Cross-sell scenarios - deal sizes in yen
export const CROSSSELL_SCENARIOS = [
  {
    trigger: '「S/4HANAへの移行を計画しています」',
    flow: ['signavio', 'syniti', 'tricentis'],
    description: 'プロセス把握 → データ整備 → テスト自動化。移行リスクを包括的に低減。',
    dealSize: '¥1.5億以上のポートフォリオ案件',
    play: 'SP1',
  },
  {
    trigger: '「M&A後にアプリケーションが多すぎます」',
    flow: ['leanix', 'signavio'],
    description: 'IT全体像の可視化 → プロセスの標準化。合理化と統合を実現。',
    dealSize: '¥8,000万〜1.2億',
    play: 'SP3 → SP2',
  },
  {
    trigger: '「SAPのアップグレードで障害が頻発します」',
    flow: ['tricentis', 'signavio'],
    description: 'まず継続テストで安定化 → プロセス監視で根本原因を特定。',
    dealSize: '¥5,000万〜8,000万',
    play: 'SP5 → SP2',
  },
  {
    trigger: '「データ移行で痛い目に遭いました」',
    flow: ['syniti', 'tricentis'],
    description: 'データ品質を改善 + テスト自動化で検証。二度と移行を失敗しない。',
    dealSize: '¥6,000万〜1億',
    play: 'SP1',
  },
  {
    trigger: '「すでにCelonisを導入しています」',
    flow: ['signavio'],
    coexist: 'Celonis',
    description: 'Celonisは問題発見。Signavioは改善設計とガバナンス。競合ではなく補完関係。',
    dealSize: '¥3,000万〜5,000万',
    play: 'SP2',
  },
  {
    trigger: '「AIエージェントの管理に困っています」',
    flow: ['leanix', 'signavio'],
    description: 'エージェントの発見・配置・ガバナンス・最適化。ライフサイクル全体を管理。',
    dealSize: '¥5,000万〜8,000万',
    play: 'SP4',
  },
]

// Pitch gym scenarios - Japan-specific
export const GYM_SCENARIOS = [
  {
    id: 'manufacturing-cio',
    title: '🏭 製造業 CIO',
    subtitle: '大手自動車メーカー、S/4移行中',
    difficulty: '普通',
    persona: '田村様 — 大手自動車メーカー CIO。プロセスの可視化が不十分で移行リスクが心配。',
    opening: 'S/4HANAへの移行を進めていますが、現状のプロセスが十分に把握できておらず、移行後にどんな問題が起きるか心配しています。どのようなサポートをいただけますか？',
    relevantPlays: ['SP1', 'SP2', 'SP5'],
  },
  {
    id: 'banking-vp',
    title: '🏦 銀行 技術担当VP',
    subtitle: 'コンプライアンス重視、Celonis導入済み',
    difficulty: '難しい',
    persona: '田中様 — メガバンク 技術担当VP。既にCelonisでプロセスマイニングを実施中。',
    opening: 'すでにCelonisでプロセスマイニングをやっています。今さらSAPからまた別のツールを導入する理由がわかりませんが、何が違うのですか？',
    relevantPlays: ['SP2', 'SP4'],
  },
  {
    id: 'cfo-budget',
    title: '💼 CFO 予算レビュー',
    subtitle: '「なぜまた新しいツールが必要なの？」',
    difficulty: '難しい',
    persona: '鈴木様 — 大手小売業 CFO。IT予算の厳しい査定を行う。',
    opening: 'IT予算は既に限界です。なぜ今、新しいツールに投資する必要があるのですか？具体的なROIを示してください。',
    relevantPlays: ['SP1', 'SP3'],
  },
  {
    id: 'retail-cdo',
    title: '🏢 小売業 CDO',
    subtitle: 'DX推進、オムニチャネル',
    difficulty: '易しい',
    persona: '佐藤様 — 大手小売チェーン CDO。DX推進を担当、業務標準化に前向き。',
    opening: 'DXを推進していますが、業務プロセスが各店舗でバラバラです。標準化と可視化を同時に進めたいのですが、どうすればいいでしょうか？',
    relevantPlays: ['SP2', 'SP3'],
  },
  {
    id: 'pharma-it',
    title: '💊 製薬会社 IT部門長',
    subtitle: 'バリデーション必須、規制対応',
    difficulty: '普通',
    persona: '山田様 — 製薬会社 IT部門長。GxP規制下でのシステム変更に慎重。',
    opening: 'SAPのアップグレードを検討していますが、バリデーション要件が厳しく、テストに膨大な工数がかかります。何か良い方法はありますか？',
    relevantPlays: ['SP5', 'SP1'],
  },
  {
    id: 'logistics-ea',
    title: '🚚 物流会社 EA',
    subtitle: 'M&A後のシステム統合',
    difficulty: '普通',
    persona: '中村様 — 物流会社 エンタープライズアーキテクト。M&Aでシステムが乱立。',
    opening: '最近のM&Aで、似たようなシステムが複数存在しています。どこから手をつけていいかわかりません。',
    relevantPlays: ['SP3', 'SP1'],
  },
]

// Coach quick chips - learning mode
export const COACH_CHIPS = [
  'プロセスマイニングとは？',
  'LeanIXの価値は？',
  'S/4移行でSynitiが必要な理由',
  'Tricentisの30秒ピッチ',
  'SP1の説明をして',
  'Celonisとの違いは？',
  '日本市場でのBPMの可能性',
]

// Challenge mode chips
export const CHALLENGE_CHIPS = [
  '🙄「BPMに市場はない」',
  '🤷「EAはただのパワポ」',
  '😤「Celonisに勝てない」',
  '🤔「テストは技術の話」',
  '😑「Synitiなんて聞いたことない」',
]

// Scorecard criteria
export const SCORE_CRITERIA = [
  { key: 'value', label: 'ビジネス価値で訴求', icon: '💡' },
  { key: 'discovery', label: 'ヒアリング質問', icon: '❓' },
  { key: 'product', label: '適切なソリューション提案', icon: '🎯' },
  { key: 'objection', label: '反論への対応', icon: '🥊' },
  { key: 'dealSize', label: '案件規模の発想', icon: '📐' },
  { key: 'crossSell', label: 'クロスセル意識', icon: '🔗' },
]
