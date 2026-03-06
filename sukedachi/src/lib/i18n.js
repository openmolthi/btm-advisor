import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const translations = {
  // Layout / Navigation
  'nav.coach': { jp: 'コーチ', en: 'Coach' },
  'nav.navigator': { jp: 'ソリューションナビ', en: 'Solutions' },
  'nav.dojo': { jp: '道場', en: 'Dojo' },
  'nav.settings': { jp: '設定', en: 'Settings' },
  'nav.subtitle': { jp: 'BTMポートフォリオコーチ', en: 'BTM Portfolio Coach' },
  'nav.footer': { jp: 'SAP BTM ポートフォリオ', en: 'SAP BTM Portfolio' },

  // Coach page
  'coach.learn': { jp: '学ぶ', en: 'Learn' },
  'coach.challenge': { jp: '挑戦', en: 'Challenge' },
  'coach.learn.title': { jp: '学ぶ', en: 'Learn' },
  'coach.challenge.title': { jp: '挑戦する', en: 'Challenge Mode' },
  'coach.learn.subtitle': { jp: 'BTMポートフォリオについて質問', en: 'Ask about the BTM portfolio' },
  'coach.challenge.subtitle': { jp: '懐疑的な相手に立ち向かう', en: 'Face a skeptical counterpart' },
  'coach.learn.placeholder': { jp: 'BTMポートフォリオについて何でも質問...', en: 'Ask anything about the BTM portfolio...' },
  'coach.challenge.placeholder': { jp: 'あなたの主張を述べてください...', en: 'State your argument...' },
  'coach.welcome.learn': {
    jp: '**助太刀、参上！**\n\nBTMポートフォリオの戦いに、あなたの味方として馳せ参じました。\n\n**Signavio**、**LeanIX**、**Syniti**、**Tricentis** について、何でも聞いてください。',
    en: '**Sukedachi, at your service!**\n\nI\'m here as your ally in mastering the BTM portfolio.\n\nAsk me anything about **Signavio**, **LeanIX**, **Syniti**, or **Tricentis**.',
  },
  'coach.welcome.challenge': {
    jp: '**挑戦モードへようこそ**\n\n懐疑的な同僚やお客様として立ちはだかります。あなたの主張に反論し、鍛えます。\n\n一本取ってみてください。',
    en: '**Welcome to Challenge Mode**\n\nI\'ll play the role of a skeptical colleague or customer. I\'ll push back on your arguments to sharpen your skills.\n\nTry to convince me.',
  },
  'coach.thinking': { jp: '考え中...', en: 'Thinking...' },
  'coach.micHint': { jp: 'ヒント：キーボードの🎤で音声入力できます', en: 'Tip: Use your keyboard mic for voice input' },
  'coach.fileUpload': { jp: 'ファイルをアップロード', en: 'Upload file' },
  'coach.send': { jp: '送信', en: 'Send' },

  // Navigator page
  'nav.page.title': { jp: 'ソリューションナビゲーター', en: 'Solution Navigator' },
  'nav.page.subtitle': { jp: 'ソリューションカードをタップして詳細を表示', en: 'Tap a solution card for details' },
  'nav.japan.title': { jp: 'なぜ今、日本なのか', en: 'Why Japan, Why Now' },
  'nav.pitch.30s': { jp: '30秒ピッチ', en: '30s Pitch' },
  'nav.pitch.2min': { jp: '2分ピッチ', en: '2min Pitch' },
  'nav.pitch.5min': { jp: '5分ピッチ', en: '5min Pitch' },
  'nav.personas': { jp: 'ペルソナ', en: 'Personas' },
  'nav.triggers': { jp: 'トリガー', en: 'Triggers' },
  'nav.targetPersonas': { jp: 'ターゲットペルソナ', en: 'Target Personas' },
  'nav.engagementTriggers': { jp: 'エンゲージメント・トリガー', en: 'Engagement Triggers' },
  'nav.elevatorPitch': { jp: 'エレベーターピッチ', en: 'Elevator Pitch' },
  'nav.discoveryQuestions': { jp: 'ディスカバリー質問', en: 'Discovery Questions' },
  'nav.copy': { jp: 'コピー', en: 'Copy' },

  // Dojo page
  'dojo.title': { jp: '道場', en: 'Dojo' },
  'dojo.subtitle': { jp: '実戦さながらの稽古', en: 'Practice like the real thing' },
  'dojo.roleplay': { jp: 'ロールプレイ', en: 'Roleplay' },
  'dojo.crosssell': { jp: 'クロスセル・プレイブック', en: 'Cross-sell Playbook' },
  'dojo.selectPrompt': { jp: 'シナリオを選んで、AIのお客様と実践練習', en: 'Pick a scenario to practice with an AI customer' },
  'dojo.crosssellPrompt': { jp: 'お客様の発言から、最適なソリューションの組み合わせを学ぶ', en: 'Learn the best solution combinations from customer signals' },
  'dojo.inProgress': { jp: '実践中', en: 'In Progress' },
  'dojo.back': { jp: '戻る', en: 'Back' },
  'dojo.placeholder': { jp: 'あなたの返答...', en: 'Your response...' },
  'dojo.scorecard': { jp: '実践スコアカード', en: 'Practice Scorecard' },
  'dojo.scoreItems': { jp: '評価項目', en: 'Evaluation Criteria' },
  'dojo.coachComment': { jp: 'コーチのコメント', en: 'Coach Comments' },
  'dojo.backToSelect': { jp: 'シナリオ選択へ', en: 'Back to Scenarios' },
  'dojo.retry': { jp: 'もう一度挑戦', en: 'Try Again' },
  'dojo.thinkBig': { jp: 'もっと大きく考えよう', en: 'Think Bigger' },
  'dojo.singleProduct': { jp: '単一ソリューション：〜¥5,000万', en: 'Single solution: ~¥50M' },
  'dojo.portfolio': { jp: 'ポートフォリオ：¥1.5億〜3億+', en: 'Portfolio: ¥150M-300M+' },
  'dojo.alwaysLook': { jp: '常に2番目、3番目のソリューションを探す', en: 'Always look for the 2nd and 3rd solution' },
  'dojo.excellent': { jp: '優秀', en: 'Excellent' },
  'dojo.decent': { jp: 'まあまあ', en: 'Decent' },
  'dojo.needsWork': { jp: '改善が必要', en: 'Needs Work' },
  'dojo.gradeA': { jp: '素晴らしい内容です！', en: 'Excellent performance!' },
  'dojo.gradeB': { jp: '良い内容です。', en: 'Good performance.' },
  'dojo.gradeC': { jp: '改善の余地があります。', en: 'Room for improvement.' },

  // Score criteria
  'score.value': { jp: 'ビジネス価値で訴求', en: 'Business Value Articulation' },
  'score.discovery': { jp: 'ヒアリング質問', en: 'Discovery Questions' },
  'score.product': { jp: '適切なソリューション提案', en: 'Solution Fit' },
  'score.objection': { jp: '反論への対応', en: 'Objection Handling' },
  'score.dealSize': { jp: '案件規模の発想', en: 'Deal Size Thinking' },
  'score.crossSell': { jp: 'クロスセル意識', en: 'Cross-sell Awareness' },

  // Difficulty
  'difficulty.easy': { jp: '易しい', en: 'Easy' },
  'difficulty.normal': { jp: '普通', en: 'Normal' },
  'difficulty.hard': { jp: '難しい', en: 'Hard' },
  'difficulty.veryHard': { jp: '非常に難しい', en: 'Very Hard' },

  // Scenario Builder
  'dojo.createScenario': { jp: 'シナリオ作成', en: 'Create Scenario' },
  'dojo.scenarioName': { jp: 'シナリオ名', en: 'Scenario Name' },
  'dojo.scenarioNamePlaceholder': { jp: '例: トヨタ CIO meeting', en: 'e.g. Toyota CIO meeting' },
  'dojo.industry': { jp: '業種', en: 'Industry' },
  'dojo.industry.manufacturing': { jp: '製造業', en: 'Manufacturing' },
  'dojo.industry.finance': { jp: '金融', en: 'Finance' },
  'dojo.industry.retail': { jp: '小売', en: 'Retail' },
  'dojo.industry.logistics': { jp: '物流', en: 'Logistics' },
  'dojo.industry.pharma': { jp: '製薬', en: 'Pharma' },
  'dojo.industry.public': { jp: '公共', en: 'Public' },
  'dojo.industry.other': { jp: 'その他', en: 'Other' },
  'dojo.customerRole': { jp: '相手の役職', en: 'Customer Role' },
  'dojo.customerRoleCustom': { jp: '役職を入力', en: 'Enter role' },
  'dojo.situation': { jp: '状況説明', en: 'Situation' },
  'dojo.situationPlaceholder': { jp: '例: S/4HANA移行を検討中、現在Celonis導入済み', en: 'e.g. Considering S/4HANA migration, currently using Celonis' },
  'dojo.difficultyLabel': { jp: '難易度', en: 'Difficulty' },
  'dojo.relatedSolutions': { jp: '関連ソリューション', en: 'Related Solutions' },
  'dojo.relatedSalesPlays': { jp: '関連セールスプレイ', en: 'Related Sales Plays' },
  'dojo.save': { jp: '保存', en: 'Save' },
  'dojo.cancel': { jp: 'キャンセル', en: 'Cancel' },
  'dojo.customBadge': { jp: 'カスタム', en: 'Custom' },
  'dojo.edit': { jp: '編集', en: 'Edit' },
  'dojo.delete': { jp: '削除', en: 'Delete' },
  'dojo.deleteConfirm': { jp: 'このシナリオを削除しますか？', en: 'Delete this scenario?' },
  'dojo.myScenarios': { jp: 'マイシナリオ', en: 'My Scenarios' },
  'dojo.noCustomScenarios': { jp: 'カスタムシナリオはまだありません', en: 'No custom scenarios yet' },
  'dojo.update': { jp: '更新', en: 'Update' },

  // Settings page
  'settings.title': { jp: '設定', en: 'Settings' },
  'settings.subtitle': { jp: 'アプリの情報と設定', en: 'App info & configuration' },
  'settings.appName': { jp: '助太刀', en: 'Sukedachi' },
  'settings.appDesc': { jp: 'BTMポートフォリオ・トレーニングコーチ', en: 'BTM Portfolio Training Coach' },
  'settings.appStory': {
    jp: '「助太刀」— 武士の伝統で、戦いの中で仲間の助けに駆けつけること。\n新人SSEが自分の刀を持てるようになるまで、\n学び、挑戦し、コーチングします。',
    en: '"Sukedachi" — In samurai tradition, rushing to aid a comrade in battle.\nWe coach new SSEs until they can wield their own sword:\nlearn, challenge, and grow.',
  },
  'settings.portfolio': { jp: '対象ポートフォリオ', en: 'Target Portfolio' },
  'settings.salesPlays': { jp: 'セールスプレイ（SP1〜SP6）', en: 'Sales Plays (SP1-SP6)' },
  'settings.japanFocus': { jp: '日本市場フォーカス', en: 'Japan Market Focus' },
  'settings.japanDesc': {
    jp: 'このアプリはSAP Japan SSE向けに設計されています。2025年の崖、人手不足、製造業DXなど、日本市場特有の文脈を反映しています。',
    en: 'This app is designed for SAP Japan SSEs. It reflects Japan-specific context including the 2025 cliff, labor shortages, and manufacturing DX.',
  },
  'settings.language': { jp: '言語', en: 'Language' },
  'settings.languageDesc': { jp: 'UIの表示言語を切り替え', en: 'Switch UI display language' },
  'settings.apiKey': { jp: 'Gemini APIキー', en: 'Gemini API Key' },
  'settings.apiKeyDesc': { jp: 'Gemini APIに直接接続するためのキー', en: 'API key for direct Gemini API connection' },
  'settings.apiKeyPlaceholder': { jp: 'AIza...で始まるキーを入力', en: 'Enter key starting with AIza...' },
  'settings.apiKeySaved': { jp: '保存しました', en: 'Saved' },
  'settings.apiKeySave': { jp: '保存', en: 'Save' },
  'settings.footer': { jp: 'SAP BTM Portfolio Training App for Japan SSEs', en: 'SAP BTM Portfolio Training App for Japan SSEs' },

  // Theme
  'theme.title': { jp: '表示設定', en: 'Display Settings' },
  'theme.desc': { jp: 'テーマを切り替え', en: 'Switch theme' },
  'theme.light': { jp: 'ライト', en: 'Light' },
  'theme.dark': { jp: 'ダーク', en: 'Dark' },
  'theme.system': { jp: 'システム', en: 'System' },

  // API key banner
  'banner.noApiKey': { jp: 'APIキーを設定してください（設定 → Gemini APIキー）', en: 'Please set your API key (Settings → Gemini API Key)' },

  // Offline mode
  'offline.banner': { jp: 'オフラインモード — AI機能は利用できません', en: 'Offline mode — AI features unavailable' },
  'offline.needsInternet': { jp: 'インターネット接続が必要です', en: 'Internet connection required' },

  // Onboarding
  'onboarding.title': { jp: '助太刀へようこそ', en: 'Welcome to Sukedachi' },
  'onboarding.desc': {
    jp: 'SAP BTMポートフォリオ（Signavio, LeanIX, Syniti, Tricentis）を学び、実践するためのAIトレーニングアプリです。',
    en: 'An AI training app to learn and practice the SAP BTM portfolio (Signavio, LeanIX, Syniti, Tricentis).',
  },
  'onboarding.feature1.title': { jp: 'コーチ', en: 'Coach' },
  'onboarding.feature1.desc': { jp: 'AIに何でも質問。挑戦モードで鍛える。', en: 'Ask AI anything. Sharpen skills in challenge mode.' },
  'onboarding.feature2.title': { jp: 'ソリューションナビ', en: 'Solutions' },
  'onboarding.feature2.desc': { jp: 'ピッチ、ペルソナ、トリガーを素早く参照。', en: 'Quick reference for pitches, personas, triggers.' },
  'onboarding.feature3.title': { jp: '道場', en: 'Dojo' },
  'onboarding.feature3.desc': { jp: 'AIのお客様と実戦ロールプレイ。', en: 'Practice roleplay with AI customers.' },
  'onboarding.start': { jp: '始める', en: 'Get Started' },

  // Official docs
  'nav.officialDocs': { jp: '公式ドキュメント', en: 'Official Docs' },

  // Copied toast / export
  'copied': { jp: 'コピーしました', en: 'Copied' },
  'toast.copied': { jp: 'コピーしました！', en: 'Copied!' },
  'toast.exported': { jp: 'エクスポートしました', en: 'Exported' },

  // Export / Share
  'export.pdfExport': { jp: 'PDFエクスポート', en: 'PDF Export' },
  'export.chatHistory': { jp: '会話をエクスポート', en: 'Export Conversation' },
  'export.shareScorecard': { jp: '共有', en: 'Share' },
  'export.copyScorecard': { jp: 'スコアをコピー', en: 'Copy Score' },

  // Japan context items
  'japan.cliff': { jp: '2025年の崖', en: '2025 Cliff' },
  'japan.cliff.desc': { jp: 'レガシーモダナイゼーションの期限', en: 'Legacy modernization deadline' },
  'japan.labor': { jp: '人手不足', en: 'Labor Shortage' },
  'japan.labor.desc': { jp: '自動化への必然的な流れ', en: 'Inevitable push to automation' },
  'japan.dx': { jp: 'DX推進', en: 'DX Promotion' },
  'japan.dx.desc': { jp: '経団連Society 5.0方針', en: 'Keidanren Society 5.0 policy' },
  'japan.manufacturing': { jp: '製造業大国', en: 'Manufacturing Power' },
  'japan.manufacturing.desc': { jp: 'プロセスマイニング最適市場', en: 'Ideal market for process mining' },

  // Product domains (for i18n product cards)
  'product.signavio.domain': { jp: 'プロセスマイニング＆マネジメント', en: 'Process Mining & Management' },
  'product.leanix.domain': { jp: 'エンタープライズ・アーキテクチャ管理', en: 'Enterprise Architecture Management' },
  'product.syniti.domain': { jp: 'データ品質＆マイグレーション', en: 'Data Quality & Migration' },
  'product.tricentis.domain': { jp: 'テスト自動化＆品質保証', en: 'Testing & QA Automation' },
  'product.signavio.tagline': {
    jp: '業務プロセスの実態を可視化。問題を発見し、改善し、自動化する。',
    en: 'Visualize actual business processes. Discover, improve, and automate.',
  },
  'product.leanix.tagline': {
    jp: 'IT資産の全体像を把握。計画的に最適化。Excelの混乱から脱却。',
    en: 'See the full IT landscape. Optimize strategically. Escape Excel chaos.',
  },
  'product.syniti.tagline': {
    jp: 'S/4HANA移行の成否はデータ品質で決まる。Synitiがそれを保証する。',
    en: 'S/4HANA migration success depends on data quality. Syniti guarantees it.',
  },
  'product.tricentis.tagline': {
    jp: 'SAP変更のリスクを最小化。人が見逃すバグを継続的に検出。',
    en: 'Minimize SAP change risk. Continuously catch bugs humans miss.',
  },

  // Sales play names
  'sp1': { jp: 'ERP変革のための統合ツールチェーン', en: 'Integrated Toolchain for ERP Transformation' },
  'sp2': { jp: 'LoB向けプロセスエクセレンス', en: 'Process Excellence for LoBs' },
  'sp3': { jp: 'エンタープライズアーキテクチャでIT複雑性を管理', en: 'Manage IT Complexity with EA' },
  'sp4': { jp: 'AIエージェントの管理とガバナンス', en: 'Manage & Govern AI Agents' },
  'sp5': { jp: 'エンタープライズアプリケーション品質保証', en: 'Enterprise Application QA' },
  'sp6': { jp: 'エンタープライズ・デジタルアダプション（二次的）', en: 'Enterprise Digital Adoption (secondary)' },
}

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('sukedachi-lang') || 'jp')

  const changeLang = useCallback((newLang) => {
    setLang(newLang)
    localStorage.setItem('sukedachi-lang', newLang)
  }, [])

  const t = useCallback((key) => {
    const entry = translations[key]
    if (!entry) return key
    return entry[lang] || entry.jp || key
  }, [lang])

  return (
    <I18nContext value={{ lang, setLang: changeLang, t }}>
      {children}
    </I18nContext>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
