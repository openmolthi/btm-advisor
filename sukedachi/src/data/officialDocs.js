// Official SAP Help Portal documentation references
// Source of truth for all solution capabilities and positioning

export const OFFICIAL_DOCS = {
  signavio: {
    name: 'SAP Signavio',
    officialUrls: [
      {
        label: 'Process Intelligence User Guide',
        url: 'https://help.sap.com/docs/signavio-process-intelligence/user-guide/process-analysis-and-mining',
      },
      {
        label: 'Feature Scope Description',
        url: 'https://help.sap.com/docs/signavio-process-intelligence/feature-scope-description/sap-signavio-process-intelligence',
      },
      {
        label: 'Process Insights',
        url: 'https://help.sap.com/docs/signavio-process-insights/user-guide/introduction',
      },
    ],
    keyCapabilities: [
      'プロセスマイニングによる業務フローの可視化と分析',
      'データ駆動のプロセス改善ポテンシャル発見',
      'Value Accelerator Libraryによるベストプラクティス活用',
      'プロセス・リスク・コントロールのガバナンスワークフロー',
      '業界ベンチマークによる競合比較',
      'SAP・非SAPプロセスの統合分析',
    ],
    officialDescription: 'SAP Signavio Process Transformation Suiteは、クラウドベースのプロセス変革ソリューションです。企業がビジネスプロセスを理解、改善、変革するためのデータ駆動型プラットフォームを提供します。',
    useCases: [
      'プロセスマイニングによるAs-Is分析',
      'プロセスモデリングによるTo-Be設計',
      'KPI監視と継続的改善',
      'コンプライアンスとガバナンスの確立',
    ],
  },
  leanix: {
    name: 'SAP LeanIX',
    officialUrls: [
      {
        label: 'EA Getting Started',
        url: 'https://help.sap.com/docs/leanix/ea/getting-started',
      },
      {
        label: 'EA Management',
        url: 'https://help.sap.com/docs/leanix/ea/',
      },
    ],
    keyCapabilities: [
      'IT資産（SAP・非SAP・SaaS・AIエージェント）の統一ビュー',
      'アプリケーションポートフォリオの可視化と合理化',
      'TCO（総所有コスト）評価',
      'ビジネスとITの連携（単一の真実の情報源）',
      'クラウド移行とモダナイゼーション計画',
      'AIエージェントの発見・管理',
    ],
    officialDescription: 'SAP LeanIXは、エンタープライズアーキテクチャ管理を通じてIT複雑性を管理するソリューションです。IT資産全体の透明性を提供し、データに基づいた意思決定を支援します。',
    useCases: [
      'エンタープライズアーキテクチャの可視化と管理',
      'アプリケーションポートフォリオの合理化',
      'クラウド移行の計画と実行',
      'M&A後のIT統合',
    ],
  },
  syniti: {
    name: 'SAP Advanced Data Migration and Management by Syniti',
    officialUrls: [
      {
        label: 'Advanced Data Migration & Management',
        url: 'https://help.sap.com/docs/SAP_ADVANCED_DATA_MIGRATION_AND_MANAGEMENT_BY_SYNITI',
      },
    ],
    keyCapabilities: [
      'マスターデータの標準化と重複排除',
      'S/4HANA移行前のデータレディネス評価',
      '品質保証付きのデータ移行実行',
      '継続的なデータガバナンス',
      'データクレンジングと変換',
    ],
    officialDescription: 'SAP Advanced Data Migration and Management by Synitiは、マスターデータ管理とデータ移行の品質を保証するソリューションです。S/4HANA移行の成功に不可欠なデータ品質を確保します。',
    useCases: [
      'S/4HANA移行のデータ準備',
      'マスターデータの一元管理',
      'データ品質の継続的改善',
      'システム統合時のデータ移行',
    ],
  },
  tricentis: {
    name: 'Tricentis Test Automation for SAP',
    officialUrls: [
      {
        label: 'Test Automation Overview',
        url: 'https://help.sap.com/docs/cloud-alm/tricentis-test-automation-for-sap/overview',
      },
      {
        label: 'Setup & Administration',
        url: 'https://help.sap.com/docs/cloud-alm/setup-administration/tricentis-test-automation-for-sap',
      },
    ],
    keyCapabilities: [
      'AIベースの変更影響分析',
      'SAP＋160以上の周辺技術の継続的テスト自動化',
      'リスクベースのテスト優先順位付け',
      'パフォーマンステストと安定性検証',
      'ビジネスクリティカルプロセスの継続的検証',
    ],
    officialDescription: 'Tricentis Test Automation for SAPは、SAP中心のエンタープライズランドスケープ向けの継続的品質保証ソリューションです。変更リスクを低減し、イノベーションを加速します。',
    useCases: [
      'SAPアップグレード・移行のテスト自動化',
      '継続的インテグレーション/デリバリーでのテスト',
      'パフォーマンス・負荷テスト',
      'リグレッションテストの自動化',
    ],
  },
}

// Helper: get the primary official URL for a solution
export function getOfficialUrl(solutionId) {
  const doc = OFFICIAL_DOCS[solutionId]
  return doc?.officialUrls?.[0]?.url || null
}

// Helper: build system prompt context from official docs
export function buildOfficialDocsContext() {
  return Object.entries(OFFICIAL_DOCS)
    .map(([id, doc]) => {
      const urls = doc.officialUrls.map(u => `  - ${u.label}: ${u.url}`).join('\n')
      const caps = doc.keyCapabilities.map(c => `  - ${c}`).join('\n')
      return `【${doc.name}】\n${doc.officialDescription}\n公式ドキュメント:\n${urls}\n主要機能:\n${caps}`
    })
    .join('\n\n')
}
