// Value Drivers mapping: customer keywords → value drivers → solutions → pitches
// Used by the Value Map (バリューマップ) module for flash cards and quizzes

// Official SAP Help Portal references per solution
const SOLUTION_OFFICIAL_REFS = {
  Signavio: 'https://help.sap.com/docs/signavio-process-intelligence/user-guide/process-analysis-and-mining',
  LeanIX: 'https://help.sap.com/docs/leanix/ea/getting-started',
  Syniti: 'https://help.sap.com/docs/SAP_ADVANCED_DATA_MIGRATION_AND_MANAGEMENT_BY_SYNITI',
  Tricentis: 'https://help.sap.com/docs/cloud-alm/tricentis-test-automation-for-sap/overview',
}

// Helper: get officialRef URLs for a list of solutions
function getOfficialRefs(solutions) {
  return solutions
    .map(s => SOLUTION_OFFICIAL_REFS[s])
    .filter(Boolean)
}

export const VALUE_DRIVERS = [
  {
    keyword: { jp: 'コスト削減', en: 'Cost Reduction' },
    valueDrivers: [
      { jp: '業務効率化', en: 'Operational Efficiency' },
      { jp: 'プロセス標準化', en: 'Process Standardization' },
    ],
    solutions: ['Signavio', 'LeanIX'],
    officialRef: getOfficialRefs(['Signavio', 'LeanIX']),
    thirtySecPitch: {
      jp: 'コスト削減の鍵は「見える化」です。Signavioでプロセスの実態を可視化し、ムダを特定。LeanIXでIT資産を最適化し、重複コストを排除。データに基づいた削減で、持続的な効果を実現します。',
      en: 'The key to cost reduction is visibility. Signavio visualizes actual processes to identify waste. LeanIX optimizes IT assets to eliminate redundant costs. Data-driven reduction delivers sustainable results.',
    },
    salesPlays: ['SP1', 'SP2'],
  },
  {
    keyword: { jp: '効率化', en: 'Efficiency' },
    valueDrivers: [
      { jp: 'プロセス自動化', en: 'Process Automation' },
      { jp: '継続的改善', en: 'Continuous Improvement' },
    ],
    solutions: ['Signavio', 'Tricentis'],
    officialRef: getOfficialRefs(['Signavio', 'Tricentis']),
    thirtySecPitch: {
      jp: '効率化にはプロセスの実態把握が不可欠です。Signavioで改善ポテンシャルを数時間で発見し、自動化。Tricentisでテストを自動化し、変更サイクルを51%高速化。推測ではなくデータで効率化を実現します。',
      en: 'Efficiency requires understanding actual processes. Signavio discovers improvement potential in hours and automates. Tricentis automates testing, accelerating change cycles by 51%. Drive efficiency with data, not guesswork.',
    },
    salesPlays: ['SP2', 'SP5'],
  },
  {
    keyword: { jp: 'レジリエンス', en: 'Resilience' },
    valueDrivers: [
      { jp: 'リスク可視化', en: 'Risk Visibility' },
      { jp: '事業継続性', en: 'Business Continuity' },
    ],
    solutions: ['LeanIX', 'Syniti'],
    officialRef: getOfficialRefs(['LeanIX', 'Syniti']),
    thirtySecPitch: {
      jp: 'レジリエンスはIT全体像の把握から始まります。LeanIXで依存関係とリスクを可視化し、障害の影響を事前に評価。Synitiでデータ品質を保証し、移行や変更時のリスクを最小化します。',
      en: 'Resilience starts with full IT visibility. LeanIX maps dependencies and risks to assess impact before failures occur. Syniti ensures data quality, minimizing risk during migrations and changes.',
    },
    salesPlays: ['SP1', 'SP3'],
  },
  {
    keyword: { jp: 'DX推進', en: 'DX Transformation' },
    valueDrivers: [
      { jp: 'デジタル変革', en: 'Digital Transformation' },
      { jp: '統合ツールチェーン', en: 'Integrated Toolchain' },
    ],
    solutions: ['Signavio', 'LeanIX', 'Syniti'],
    officialRef: getOfficialRefs(['Signavio', 'LeanIX', 'Syniti']),
    thirtySecPitch: {
      jp: 'DXの現実は断片的です — 人・プロセス・アプリ・データがバラバラ。統合ツールチェーンで一つの真実の情報源を作り、価値の特定から実現まで、リスクを抑えて変革を加速します。',
      en: 'DX reality is fragmented — people, processes, apps, and data are siloed. The integrated toolchain creates one source of truth, accelerating transformation from value identification to realization while de-risking execution.',
    },
    salesPlays: ['SP1', 'SP2', 'SP3'],
  },
  {
    keyword: { jp: '移行リスク', en: 'Migration Risk' },
    valueDrivers: [
      { jp: 'データ品質保証', en: 'Data Quality Assurance' },
      { jp: '変更影響分析', en: 'Change Impact Analysis' },
    ],
    solutions: ['Syniti', 'Tricentis'],
    officialRef: getOfficialRefs(['Syniti', 'Tricentis']),
    thirtySecPitch: {
      jp: '移行リスクの多くはデータ品質の問題です。Synitiで移行前にデータ品質を評価・改善し、Tricentisで変更影響を分析して継続テストで検証。移行の「保険」として、プロジェクトリスクを大幅に軽減します。',
      en: 'Most migration risk stems from data quality issues. Syniti assesses and improves data quality pre-migration. Tricentis analyzes change impact and validates with continuous testing — your migration insurance policy.',
    },
    salesPlays: ['SP1', 'SP5'],
  },
  {
    keyword: { jp: '品質保証', en: 'Quality Assurance' },
    valueDrivers: [
      { jp: '継続的テスト', en: 'Continuous Testing' },
      { jp: 'リスクベーステスト', en: 'Risk-based Testing' },
    ],
    solutions: ['Tricentis'],
    officialRef: getOfficialRefs(['Tricentis']),
    thirtySecPitch: {
      jp: 'SAPは常に変化します。リスクは変更そのものではなく、何が影響を受けるかわからないこと。Tricentisは影響分析、継続テスト、パフォーマンス保証で変革を加速。576%の3年ROI、テストサイクル51%高速化を実現します。',
      en: 'SAP constantly changes. The risk isn\'t change itself — it\'s not knowing what\'s impacted. Tricentis delivers impact analysis, continuous testing, and performance assurance. 576% three-year ROI with 51% faster test cycles.',
    },
    salesPlays: ['SP5'],
  },
  {
    keyword: { jp: 'データ品質', en: 'Data Quality' },
    valueDrivers: [
      { jp: 'マスターデータ管理', en: 'Master Data Management' },
      { jp: 'データガバナンス', en: 'Data Governance' },
    ],
    solutions: ['Syniti'],
    officialRef: getOfficialRefs(['Syniti']),
    thirtySecPitch: {
      jp: 'S/4HANA移行の成否はデータ品質で決まります。Synitiはマスターデータの標準化・重複排除・品質向上を実現し、移行リスクを最小化。データが汚れていれば、どんなに優れたシステムも機能しません。',
      en: 'S/4HANA migration success depends on data quality. Syniti standardizes, deduplicates, and improves master data to minimize migration risk. Dirty data means even the best system won\'t perform.',
    },
    salesPlays: ['SP1'],
  },
  {
    keyword: { jp: 'IT複雑性', en: 'IT Complexity' },
    valueDrivers: [
      { jp: 'アプリケーション可視化', en: 'Application Visibility' },
      { jp: '技術的負債削減', en: 'Technical Debt Reduction' },
    ],
    solutions: ['LeanIX'],
    officialRef: getOfficialRefs(['LeanIX']),
    thirtySecPitch: {
      jp: 'IT複雑性が変革の障壁になっていませんか？LeanIXはIT資産全体を可視化し、依存関係・コスト・リスクをデータで把握。Excelの混乱から脱却し、戦略的なIT最適化を実現します。',
      en: 'Is IT complexity blocking your transformation? LeanIX provides full IT landscape visibility, mapping dependencies, costs, and risks with data. Escape Excel chaos and achieve strategic IT optimization.',
    },
    salesPlays: ['SP3'],
  },
  {
    keyword: { jp: 'コンプライアンス', en: 'Compliance' },
    valueDrivers: [
      { jp: 'ガバナンスワークフロー', en: 'Governance Workflows' },
      { jp: '規制対応', en: 'Regulatory Compliance' },
    ],
    solutions: ['Signavio', 'LeanIX'],
    officialRef: getOfficialRefs(['Signavio', 'LeanIX']),
    thirtySecPitch: {
      jp: 'コンプライアンスにはプロセスとITの両面での透明性が必要です。Signavioでプロセス・リスク・コントロールのガバナンスを確立。LeanIXでIT資産のポリシー準拠を管理。単一の真実の情報源で規制対応を効率化します。',
      en: 'Compliance requires transparency across processes and IT. Signavio establishes governance for processes, risks, and controls. LeanIX manages IT asset policy compliance. One source of truth streamlines regulatory response.',
    },
    salesPlays: ['SP2', 'SP3'],
  },
  {
    keyword: { jp: '可視化', en: 'Visualization' },
    valueDrivers: [
      { jp: 'プロセス透明化', en: 'Process Transparency' },
      { jp: 'IT資産マッピング', en: 'IT Asset Mapping' },
    ],
    solutions: ['Signavio', 'LeanIX'],
    officialRef: getOfficialRefs(['Signavio', 'LeanIX']),
    thirtySecPitch: {
      jp: '推測ではなくデータで意思決定を。Signavioは業務プロセスの「デジタルレントゲン」として実態を可視化。LeanIXはIT資産の全体像を統一ビューで提供。両方があれば、変革の全体像が見えます。',
      en: 'Make decisions with data, not guesswork. Signavio is a digital X-ray for business processes. LeanIX provides a unified view of the full IT landscape. Together, they reveal the complete transformation picture.',
    },
    salesPlays: ['SP2', 'SP3'],
  },
  {
    keyword: { jp: 'M&A統合', en: 'M&A Integration' },
    valueDrivers: [
      { jp: 'システム統合', en: 'System Consolidation' },
      { jp: 'アプリ合理化', en: 'Application Rationalization' },
    ],
    solutions: ['LeanIX', 'Syniti'],
    officialRef: getOfficialRefs(['LeanIX', 'Syniti']),
    thirtySecPitch: {
      jp: 'M&A後のシステム乱立を解消。LeanIXでIT全体像を可視化し、重複アプリを特定・合理化。Synitiでデータの統合・標準化を実施。計画的な統合でコスト削減とリスク低減を両立します。',
      en: 'Resolve post-M&A system sprawl. LeanIX visualizes the full IT landscape to identify and rationalize duplicate apps. Syniti integrates and standardizes data. Planned consolidation achieves both cost reduction and risk mitigation.',
    },
    salesPlays: ['SP1', 'SP3'],
  },
  {
    keyword: { jp: 'レガシー刷新', en: 'Legacy Modernization' },
    valueDrivers: [
      { jp: 'モダナイゼーション', en: 'Modernization' },
      { jp: '技術的負債解消', en: 'Technical Debt Resolution' },
    ],
    solutions: ['Signavio', 'LeanIX', 'Syniti', 'Tricentis'],
    officialRef: getOfficialRefs(['Signavio', 'LeanIX', 'Syniti', 'Tricentis']),
    thirtySecPitch: {
      jp: '2025年の崖を前に、レガシー刷新は待ったなし。Signavioでプロセスを把握、LeanIXでアプリを評価、Synitiでデータを整備、Tricentisでテストを自動化。統合ツールチェーンで包括的にリスクを低減します。',
      en: 'With the 2025 cliff approaching, legacy modernization can\'t wait. Signavio maps processes, LeanIX evaluates apps, Syniti prepares data, Tricentis automates testing. The integrated toolchain comprehensively de-risks the journey.',
    },
    salesPlays: ['SP1'],
  },
  {
    keyword: { jp: '自動化', en: 'Automation' },
    valueDrivers: [
      { jp: 'プロセス自動化', en: 'Process Automation' },
      { jp: 'テスト自動化', en: 'Test Automation' },
    ],
    solutions: ['Signavio', 'Tricentis'],
    officialRef: getOfficialRefs(['Signavio', 'Tricentis']),
    thirtySecPitch: {
      jp: '自動化の第一歩は「何を自動化すべきか」を知ること。Signavioでプロセスの実態を把握し、自動化候補を特定。Tricentisでテストを自動化し、SAP+160以上の技術を横断でカバー。人手不足時代の必須戦略です。',
      en: 'Automation starts with knowing what to automate. Signavio reveals actual processes to identify automation candidates. Tricentis automates testing across SAP and 160+ technologies. Essential strategy for the labor shortage era.',
    },
    salesPlays: ['SP2', 'SP5'],
  },
  {
    keyword: { jp: 'AI活用', en: 'AI Utilization' },
    valueDrivers: [
      { jp: 'AIエージェント管理', en: 'AI Agent Management' },
      { jp: 'AIガバナンス', en: 'AI Governance' },
    ],
    solutions: ['LeanIX', 'Signavio'],
    officialRef: getOfficialRefs(['LeanIX', 'Signavio']),
    thirtySecPitch: {
      jp: 'AIエージェントの急増に伴い、管理とガバナンスが課題に。LeanIXでエージェントの発見・棚卸し・管理を実現。Signavioでプロセス文脈を付与し、コンプライアンスを確保。ライフサイクル全体を制御します。',
      en: 'As AI agents proliferate, management and governance become critical. LeanIX handles agent discovery, inventory, and management. Signavio provides process context and ensures compliance. Control the entire lifecycle.',
    },
    salesPlays: ['SP4'],
  },
  {
    keyword: { jp: 'テスト効率化', en: 'Testing Efficiency' },
    valueDrivers: [
      { jp: 'テスト自動化', en: 'Test Automation' },
      { jp: 'テストサイクル短縮', en: 'Test Cycle Reduction' },
    ],
    solutions: ['Tricentis'],
    officialRef: getOfficialRefs(['Tricentis']),
    thirtySecPitch: {
      jp: 'テストに時間がかかりすぎていませんか？Tricentisはフェーズとしてのテストから、ライフサイクルに組み込まれた継続的品質に変革。AIベースの影響分析でテスト対象を最適化し、テストサイクルを51%短縮します。',
      en: 'Spending too much time on testing? Tricentis transforms testing from a phase to continuous quality embedded in the lifecycle. AI-based impact analysis optimizes test targets, cutting test cycles by 51%.',
    },
    salesPlays: ['SP5'],
  },
  {
    keyword: { jp: 'S/4HANA移行', en: 'S/4HANA Migration' },
    valueDrivers: [
      { jp: '移行リスク低減', en: 'Migration Risk Reduction' },
      { jp: '統合ツールチェーン', en: 'Integrated Toolchain' },
    ],
    solutions: ['Syniti', 'Tricentis', 'Signavio'],
    officialRef: getOfficialRefs(['Syniti', 'Tricentis', 'Signavio']),
    thirtySecPitch: {
      jp: 'S/4HANA移行は断片的なアプローチでは失敗します。Signavioでプロセスを把握、Synitiでデータ品質を保証、Tricentisで変更を検証。統合ツールチェーンで移行を包括的にサポートし、リスクを大幅に軽減します。',
      en: 'S/4HANA migration fails with a fragmented approach. Signavio maps processes, Syniti ensures data quality, Tricentis validates changes. The integrated toolchain comprehensively supports migration, dramatically reducing risk.',
    },
    salesPlays: ['SP1', 'SP5'],
  },
  {
    keyword: { jp: 'プロセスマイニング', en: 'Process Mining' },
    valueDrivers: [
      { jp: 'プロセス可視化', en: 'Process Visibility' },
      { jp: 'データ駆動改善', en: 'Data-driven Improvement' },
    ],
    solutions: ['Signavio'],
    officialRef: getOfficialRefs(['Signavio']),
    thirtySecPitch: {
      jp: 'プロセスマイニングは業務の「デジタルレントゲン」です。システムログから実際の業務フローを可視化し、問題を発見、改善、自動化。5,500社以上が既に活用中。日本の製造業にとっては「デジタルカイゼン」そのものです。',
      en: 'Process mining is a digital X-ray for operations. It visualizes actual workflows from system logs to discover, improve, and automate. Over 5,500 companies already use it. For Japanese manufacturers, it\'s the ultimate digital Kaizen.',
    },
    salesPlays: ['SP2'],
  },
  {
    keyword: { jp: 'アプリ合理化', en: 'App Rationalization' },
    valueDrivers: [
      { jp: 'ポートフォリオ最適化', en: 'Portfolio Optimization' },
      { jp: 'TCO削減', en: 'TCO Reduction' },
    ],
    solutions: ['LeanIX'],
    officialRef: getOfficialRefs(['LeanIX']),
    thirtySecPitch: {
      jp: '重複アプリケーションがコストとリスクを増大させていませんか？LeanIXでアプリケーションポートフォリオを可視化し、TCOを評価。合理化の優先順位をデータで判断し、クリーンなITアーキテクチャを設計します。',
      en: 'Are duplicate applications inflating costs and risk? LeanIX visualizes your application portfolio and evaluates TCO. Data-driven prioritization for rationalization, designing a clean IT architecture.',
    },
    salesPlays: ['SP3'],
  },
  {
    keyword: { jp: '変更管理', en: 'Change Management' },
    valueDrivers: [
      { jp: '変更影響分析', en: 'Change Impact Analysis' },
      { jp: 'ガバナンス', en: 'Governance' },
    ],
    solutions: ['Tricentis', 'Signavio'],
    officialRef: getOfficialRefs(['Tricentis', 'Signavio']),
    thirtySecPitch: {
      jp: '変更のリスクは「何が影響を受けるかわからないこと」。TricentisのAIベース影響分析でリスクを事前に特定し、テスト対象を最適化。Signavioでプロセスレベルのガバナンスを確立し、変更を安全に管理します。',
      en: 'The risk of change is not knowing what\'s impacted. Tricentis AI-based impact analysis identifies risks upfront and optimizes test targets. Signavio establishes process-level governance for safe change management.',
    },
    salesPlays: ['SP2', 'SP5'],
  },
  {
    keyword: { jp: 'サプライチェーン最適化', en: 'Supply Chain Optimization' },
    valueDrivers: [
      { jp: 'エンドツーエンド可視化', en: 'End-to-end Visibility' },
      { jp: 'プロセス最適化', en: 'Process Optimization' },
    ],
    solutions: ['Signavio'],
    officialRef: getOfficialRefs(['Signavio']),
    thirtySecPitch: {
      jp: 'サプライチェーンの最適化にはエンドツーエンドの可視化が必要です。Signavioでサプライチェーン全体のプロセスを可視化し、ボトルネックを特定。データ駆動の改善で、コスト削減とリードタイム短縮を同時に実現します。',
      en: 'Supply chain optimization requires end-to-end visibility. Signavio visualizes the entire supply chain process, identifying bottlenecks. Data-driven improvement simultaneously reduces costs and lead times.',
    },
    salesPlays: ['SP2'],
  },
  {
    keyword: { jp: '人材不足対応', en: 'Labor Shortage' },
    valueDrivers: [
      { jp: '業務自動化', en: 'Business Automation' },
      { jp: '生産性向上', en: 'Productivity Improvement' },
    ],
    solutions: ['Signavio', 'Tricentis'],
    officialRef: getOfficialRefs(['Signavio', 'Tricentis']),
    thirtySecPitch: {
      jp: '人材不足時代、自動化は必須戦略です。Signavioで業務プロセスを自動化し、属人化を解消。Tricentisでテスト工数を大幅削減。少ない人員でも高品質な運用を維持し、変革を加速します。',
      en: 'In the labor shortage era, automation is essential. Signavio automates processes and eliminates key-person dependencies. Tricentis dramatically reduces testing effort. Maintain quality operations with fewer people while accelerating transformation.',
    },
    salesPlays: ['SP2', 'SP5'],
  },
  {
    keyword: { jp: 'クラウド移行', en: 'Cloud Migration' },
    valueDrivers: [
      { jp: 'クラウド最適化', en: 'Cloud Optimization' },
      { jp: 'データ移行', en: 'Data Migration' },
    ],
    solutions: ['LeanIX', 'Syniti'],
    officialRef: getOfficialRefs(['LeanIX', 'Syniti']),
    thirtySecPitch: {
      jp: 'クラウド移行にはIT全体像の把握とデータ品質が不可欠。LeanIXで依存関係を可視化し、移行優先順位をデータで決定。Synitiでデータの品質を保証し、移行リスクを最小化します。',
      en: 'Cloud migration demands full IT visibility and data quality. LeanIX maps dependencies and data-driven migration prioritization. Syniti ensures data quality and minimizes migration risk.',
    },
    salesPlays: ['SP1', 'SP3'],
  },
  {
    keyword: { jp: 'ガバナンス', en: 'Governance' },
    valueDrivers: [
      { jp: 'ITガバナンス', en: 'IT Governance' },
      { jp: 'プロセスガバナンス', en: 'Process Governance' },
    ],
    solutions: ['LeanIX', 'Signavio'],
    officialRef: getOfficialRefs(['LeanIX', 'Signavio']),
    thirtySecPitch: {
      jp: 'ガバナンスには「可視性」と「ワークフロー」の両方が必要です。LeanIXでIT資産・AIエージェント・SaaSの管理を一元化。Signavioでプロセス・リスク・コントロールのガバナンスを確立。経営とITを橋渡しします。',
      en: 'Governance requires both visibility and workflows. LeanIX centralizes management of IT assets, AI agents, and SaaS. Signavio establishes process, risk, and control governance. Bridging business and IT.',
    },
    salesPlays: ['SP3', 'SP4'],
  },
  {
    keyword: { jp: '内部統制', en: 'Internal Controls' },
    valueDrivers: [
      { jp: 'リスク管理', en: 'Risk Management' },
      { jp: 'コントロール監視', en: 'Control Monitoring' },
    ],
    solutions: ['Signavio'],
    officialRef: getOfficialRefs(['Signavio']),
    thirtySecPitch: {
      jp: '内部統制の強化にはプロセスの透明性が不可欠です。Signavioでプロセス・リスク・コントロールを一元管理し、ガバナンスワークフローで継続的な監視を実現。推測ではなくデータで統制を強化します。',
      en: 'Strengthening internal controls requires process transparency. Signavio centrally manages processes, risks, and controls with governance workflows for continuous monitoring. Strengthen controls with data, not guesswork.',
    },
    salesPlays: ['SP2'],
  },
  {
    keyword: { jp: 'デジタルツイン', en: 'Digital Twin' },
    valueDrivers: [
      { jp: 'プロセスシミュレーション', en: 'Process Simulation' },
      { jp: 'What-if分析', en: 'What-if Analysis' },
    ],
    solutions: ['Signavio'],
    officialRef: getOfficialRefs(['Signavio']),
    thirtySecPitch: {
      jp: 'プロセスのデジタルツインで「もしも」のシナリオを検証。Signavioで業務プロセスをデジタル化し、変更前にシミュレーション。リスクなしで最適化を試し、確実な改善を実行します。',
      en: 'Test "what-if" scenarios with a process digital twin. Signavio digitizes business processes for pre-change simulation. Try optimizations risk-free, then execute with confidence.',
    },
    salesPlays: ['SP2'],
  },
  {
    keyword: { jp: 'マスターデータ', en: 'Master Data' },
    valueDrivers: [
      { jp: 'データ一元管理', en: 'Data Centralization' },
      { jp: 'データ標準化', en: 'Data Standardization' },
    ],
    solutions: ['Syniti'],
    officialRef: getOfficialRefs(['Syniti']),
    thirtySecPitch: {
      jp: 'マスターデータが複数システムに分散していませんか？Synitiで顧客・製品・サプライヤーのマスターデータを一元管理。標準化と重複排除で、信頼できる単一の情報源を構築します。',
      en: 'Is master data scattered across multiple systems? Syniti centralizes customer, product, and supplier master data. Standardization and deduplication build a single trusted source of truth.',
    },
    salesPlays: ['SP1'],
  },
  {
    keyword: { jp: '重複排除', en: 'Deduplication' },
    valueDrivers: [
      { jp: 'データクレンジング', en: 'Data Cleansing' },
      { jp: 'データ品質向上', en: 'Data Quality Improvement' },
    ],
    solutions: ['Syniti'],
    officialRef: getOfficialRefs(['Syniti']),
    thirtySecPitch: {
      jp: '重複データはコスト増とミスの原因です。Synitiの高度なマッチングとマージ機能で、マスターデータの重複を排除。クリーンなデータ基盤で、S/4HANA移行やAI活用の成功を支えます。',
      en: 'Duplicate data drives up costs and causes errors. Syniti\'s advanced matching and merging eliminates master data duplicates. A clean data foundation supports successful S/4HANA migration and AI adoption.',
    },
    salesPlays: ['SP1'],
  },
  {
    keyword: { jp: 'リグレッションテスト', en: 'Regression Testing' },
    valueDrivers: [
      { jp: '継続的テスト', en: 'Continuous Testing' },
      { jp: '品質保証', en: 'Quality Assurance' },
    ],
    solutions: ['Tricentis'],
    officialRef: getOfficialRefs(['Tricentis']),
    thirtySecPitch: {
      jp: 'SAPの変更ごとにリグレッションテストに追われていませんか？Tricentisはビジネスクリティカルプロセスを継続的に自動検証。AIが影響範囲を分析し、必要なテストだけを実行。IDC調査で年間$533万の効果を実証しています。',
      en: 'Drowning in regression testing after every SAP change? Tricentis continuously validates business-critical processes. AI analyzes impact scope, running only necessary tests. IDC research proves $5.33M annual savings.',
    },
    salesPlays: ['SP5'],
  },
  {
    keyword: { jp: 'ポートフォリオ最適化', en: 'Portfolio Optimization' },
    valueDrivers: [
      { jp: 'アプリ合理化', en: 'Application Rationalization' },
      { jp: 'IT投資最適化', en: 'IT Investment Optimization' },
    ],
    solutions: ['LeanIX'],
    officialRef: getOfficialRefs(['LeanIX']),
    thirtySecPitch: {
      jp: 'IT投資の優先順位付けができていますか？LeanIXでアプリケーションポートフォリオを可視化し、TCOとビジネス価値を評価。データに基づいた合理化で、最も価値の高い投資に集中します。',
      en: 'Can you prioritize IT investments effectively? LeanIX visualizes your application portfolio, evaluating TCO and business value. Data-driven rationalization focuses investment on highest-value areas.',
    },
    salesPlays: ['SP3'],
  },
  {
    keyword: { jp: '業務プロセス改善', en: 'Business Process Improvement' },
    valueDrivers: [
      { jp: 'プロセスエクセレンス', en: 'Process Excellence' },
      { jp: '継続的改善', en: 'Continuous Improvement' },
    ],
    solutions: ['Signavio'],
    officialRef: getOfficialRefs(['Signavio']),
    thirtySecPitch: {
      jp: 'プロセスエクセレンスにはコックピットが必要です。Signavioで改善ポテンシャルを発見し、ベストプラクティスで設計、ガバナンスで継続的に改善。推測ではなくデータで、変革を「能力」として組織に根付かせます。',
      en: 'Process excellence needs a cockpit. Signavio discovers improvement potential, designs with best practices, and continuously improves with governance. With data instead of guesswork, transformation becomes an organizational capability.',
    },
    salesPlays: ['SP2'],
  },
]

// Solution color mapping for UI
export const SOLUTION_COLORS = {
  Signavio: { bg: '#EBF2F8', text: '#4A78A0', border: '#B8D0E5' },
  LeanIX: { bg: '#E8F4ED', text: '#3D7A54', border: '#B0D9C2' },
  Syniti: { bg: '#FFF4E8', text: '#B07830', border: '#E5C99A' },
  Tricentis: { bg: '#F0E8F8', text: '#7A50A8', border: '#C8B0E0' },
}
