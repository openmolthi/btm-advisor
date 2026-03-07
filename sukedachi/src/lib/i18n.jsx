import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const translations = {
  // Layout / Navigation
  'nav.coach': { jp: 'コーチ', en: 'Coach' },
  'nav.navigator': { jp: 'ソリューションナビ', en: 'Solutions' },
  'nav.dojo': { jp: '道場', en: 'Dojo' },
  'nav.settings': { jp: '設定', en: 'Settings' },
  'nav.subtitle': { jp: 'BTMポートフォリオコーチ', en: 'BTM Portfolio Coach' },
  'nav.footer': { jp: 'SAP BTM ポートフォリオ', en: 'SAP BTM Portfolio' },
  'nav.home': { jp: 'ホーム', en: 'Home' },
  'nav.advisor': { jp: 'BTM Advisor', en: 'BTM Advisor' },

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

  // Value Map page
  'nav.valuemap': { jp: 'バリューマップ', en: 'Value Map' },
  'vm.title': { jp: 'バリューマップ', en: 'Value Map' },
  'vm.subtitle': { jp: 'キーワードからソリューションを即座に引き出す', en: 'Instantly connect keywords to solutions' },
  'vm.flashcards': { jp: 'フラッシュカード', en: 'Flash Cards' },
  'vm.quiz': { jp: 'クイズ', en: 'Quiz' },
  'vm.browseAll': { jp: '全カード一覧', en: 'Browse All' },
  'vm.shuffle': { jp: 'シャッフル', en: 'Shuffle' },
  'vm.customerSays': { jp: 'お客様のキーワード', en: 'Customer Keyword' },
  'vm.tapToFlip': { jp: 'タップで裏面を表示', en: 'Tap to flip' },
  'vm.valueDrivers': { jp: 'バリュードライバー', en: 'Value Drivers' },
  'vm.solutions': { jp: 'ソリューション', en: 'Solutions' },
  'vm.thirtySecPitch': { jp: '30秒ピッチ', en: '30s Pitch' },
  'vm.quizTitle': { jp: 'ソリューション・クイズ', en: 'Solution Quiz' },
  'vm.quizDesc': { jp: 'お客様のキーワードに合うソリューションを選んでください（10問）', en: 'Match the right solution to customer keywords (10 questions)' },
  'vm.bestScore': { jp: 'ベストスコア', en: 'Best Score' },
  'vm.startQuiz': { jp: 'クイズ開始', en: 'Start Quiz' },
  'vm.whichSolution': { jp: '最適なソリューションは？', en: 'Which solution fits best?' },
  'vm.excellent': { jp: '素晴らしい！', en: 'Excellent!' },
  'vm.good': { jp: '良い結果です', en: 'Good result' },
  'vm.needsWork': { jp: '改善の余地あり', en: 'Room for improvement' },
  'vm.newBest': { jp: 'ベストスコア更新！', en: 'New best score!' },
  'vm.timeout': { jp: '時間切れ', en: 'Timeout' },
  'vm.retry': { jp: 'もう一度', en: 'Try Again' },
  'vm.searchPlaceholder': { jp: 'キーワード・ソリューションで検索...', en: 'Search by keyword or solution...' },
  'vm.noResults': { jp: '該当するカードがありません', en: 'No matching cards found' },

  // Voice features
  'voice.recording': { jp: '録音中...', en: 'Recording...' },
  'voice.micButton': { jp: '音声入力', en: 'Voice input' },
  'voice.speakButton': { jp: '読み上げ', en: 'Read aloud' },
  'voice.stopSpeaking': { jp: '読み上げ停止', en: 'Stop reading' },
  'voice.notSupported': { jp: 'このブラウザは音声機能に対応していません', en: 'Voice features are not supported in this browser' },
  'voice.noPermission': { jp: 'マイクの使用が許可されていません', en: 'Microphone permission denied' },
  'voice.noSpeech': { jp: '音声が検出されませんでした', en: 'No speech detected' },
  'voice.error': { jp: '音声入力エラー', en: 'Voice input error' },
  'voice.active': { jp: '音声モード', en: 'Voice Mode' },
  'voice.settings': { jp: '音声設定', en: 'Voice Settings' },
  'voice.inputToggle': { jp: '音声入力', en: 'Voice Input' },
  'voice.inputToggleDesc': { jp: 'マイクボタンを表示', en: 'Show microphone button' },
  'voice.autoSpeak': { jp: '自動読み上げ', en: 'Auto-speak' },
  'voice.autoSpeakDesc': { jp: 'AIの回答を自動的に読み上げる', en: 'Automatically read AI responses aloud' },
  'voice.speechRate': { jp: '読み上げ速度', en: 'Speech Rate' },
  'voice.slow': { jp: '遅い', en: 'Slow' },
  'voice.fast': { jp: '速い', en: 'Fast' },

  // Progress dashboard
  'progress.title': { jp: '学習進捗', en: 'Learning Progress' },
  'progress.readiness': { jp: '習熟度', en: 'Readiness' },
  'progress.streak': { jp: '学習ストリーク', en: 'Learning Streak' },
  'progress.streakDays': { jp: '日連続', en: ' days' },
  'progress.flashCards': { jp: 'フラッシュカード', en: 'Flash Cards' },
  'progress.quizzes': { jp: 'クイズ', en: 'Quizzes' },
  'progress.dojo': { jp: '道場', en: 'Dojo' },
  'progress.coach': { jp: 'コーチ', en: 'Coach' },
  'progress.cardsSeen': { jp: '枚学習', en: ' seen' },
  'progress.mastered': { jp: '枚習得', en: ' mastered' },
  'progress.quizzesCompleted': { jp: '回完了', en: ' completed' },
  'progress.bestScore': { jp: 'ベスト', en: 'Best' },
  'progress.avgScore': { jp: '平均', en: 'Avg' },
  'progress.sessions': { jp: '回実践', en: ' sessions' },
  'progress.scenarios': { jp: 'シナリオ', en: 'scenarios' },
  'progress.messagesSent': { jp: '通送信', en: ' sent' },
  'progress.coachSessions': { jp: '回セッション', en: ' sessions' },
  'progress.reset': { jp: 'リセット', en: 'Reset' },
  'progress.resetConfirm': { jp: '全ての学習データをリセットしますか？', en: 'Reset all learning data?' },
  'progress.noActivity': { jp: 'まだ活動がありません', en: 'No activity yet' },

  // Daily Drill
  'drill.title': { jp: '今日の訓練', en: "Today's Drill" },
  'drill.subtitle': { jp: '毎日5分の鍛錬で実力を磨く', en: '5-minute daily drill to sharpen your skills' },
  'drill.start': { jp: '訓練を始める', en: 'Start Drill' },
  'drill.dismiss': { jp: 'あとで', en: 'Later' },
  'drill.step': { jp: 'ステップ', en: 'Step' },
  'drill.flashcards': { jp: 'フラッシュカード', en: 'Flash Cards' },
  'drill.flashcardsDesc': { jp: '3枚のカードを確認', en: 'Review 3 cards' },
  'drill.quiz': { jp: 'クイズ', en: 'Quiz' },
  'drill.quizDesc': { jp: '5問に挑戦', en: 'Answer 5 questions' },
  'drill.miniDojo': { jp: 'ミニ道場', en: 'Mini Dojo' },
  'drill.miniDojoDesc': { jp: '短い実践練習', en: 'Quick practice session' },
  'drill.next': { jp: '次へ', en: 'Next' },
  'drill.flipToReveal': { jp: 'タップでめくる', en: 'Tap to flip' },
  'drill.cardsReviewed': { jp: '枚確認', en: ' cards reviewed' },
  'drill.quizScore': { jp: 'クイズスコア', en: 'Quiz Score' },
  'drill.complete': { jp: '今日の訓練完了！', en: "Today's Drill Complete!" },
  'drill.summary': { jp: '訓練結果', en: 'Drill Summary' },
  'drill.seeYouTomorrow': { jp: 'また明日！', en: 'See you tomorrow!' },
  'drill.notDone': { jp: '未完了', en: 'Not done' },
  'drill.done': { jp: '完了', en: 'Done' },
  'drill.promptTitle': { jp: '今日の訓練がまだです', en: "Today's drill is waiting" },
  'drill.promptDesc': { jp: '5分で完了。毎日の鍛錬が力になる。', en: '5 minutes to complete. Daily practice builds strength.' },
  'drill.miniDojoPlaceholder': { jp: 'あなたの返答...', en: 'Your response...' },
  'drill.dojoScenario': { jp: '実践シナリオ', en: 'Practice Scenario' },
  'drill.dojoComplete': { jp: 'ミニ道場完了', en: 'Mini Dojo Complete' },
  'drill.streak': { jp: '日連続訓練', en: ' day streak' },

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
  'japan.intro': {
    jp: 'SAP BTMソリューションにとって、日本市場は今まさに転換点にあります。レガシーシステムの刷新期限、深刻な人手不足、政府主導のDX推進、そして世界有数の製造業基盤 — これらが同時に重なる市場は他にありません。',
    en: 'The Japan market is at a unique inflection point for SAP BTM solutions. A convergence of legacy modernization deadlines, acute labor shortages, government-driven DX mandates, and a world-class manufacturing base creates an opportunity unlike any other market.',
  },
  'japan.cliff': { jp: '2025年の崖', en: '2025 Cliff' },
  'japan.cliff.desc': { jp: 'レガシーモダナイゼーションの期限', en: 'Legacy modernization deadline' },
  'japan.cliff.detail': {
    jp: 'METIの2018年DXレポートが警告した「2025年の崖」— 日本企業の約8割がレガシーシステムを抱え、2025年以降、年間最大12兆円の経済損失リスク。SAP ECC 6.0のメインストリームサポート終了（2027年）と重なり、S/4HANA移行が急務に。多くの大企業が移行プロジェクトを本格化しており、Signavio（プロセス可視化）、LeanIX（IT資産管理）、Syniti（データ移行）、Tricentis（テスト自動化）の需要が急増中。',
    en: 'METI\'s 2018 DX Report warned of the "2025 Cliff" — ~80% of Japanese enterprises run legacy systems, risking ¥12 trillion/year in economic losses post-2025. Combined with SAP ECC 6.0 mainstream support ending (2027), S/4HANA migration is urgent. Major enterprises are accelerating migration projects, driving surging demand for Signavio (process visibility), LeanIX (IT landscape), Syniti (data migration), and Tricentis (test automation).',
  },
  'japan.labor': { jp: '人手不足', en: 'Labor Shortage' },
  'japan.labor.desc': { jp: '自動化への必然的な流れ', en: 'Inevitable push to automation' },
  'japan.labor.detail': {
    jp: '日本の労働人口は2040年までに約1,100万人減少の見込み（国立社会保障・人口問題研究所）。IT人材不足は2030年に最大79万人に達すると予測。製造・物流・小売・金融あらゆる業種で自動化・効率化が経営課題の最上位に。プロセスマイニングによる業務可視化、AIエージェントによる定型業務の自動化、テスト自動化による開発効率向上 — BTMソリューションが直接このペインに応える。',
    en: 'Japan\'s workforce will shrink by ~11 million by 2040 (NIPSSR). IT talent gap projected at 790,000 by 2030. Automation and efficiency are now top-priority board-level issues across manufacturing, logistics, retail, and financial services. Process mining for workflow visibility, AI agents for routine task automation, and test automation for development efficiency — BTM solutions directly address this pain.',
  },
  'japan.dx': { jp: 'DX推進', en: 'DX Promotion' },
  'japan.dx.desc': { jp: '経団連Society 5.0方針', en: 'Keidanren Society 5.0 policy' },
  'japan.dx.detail': {
    jp: '経団連のSociety 5.0構想、デジタル庁の設立（2021年）、そしてDX認定制度により、日本政府は企業のデジタル変革を強力に後押し。2024年のDX白書では、DXに取り組む企業は73.7%に上昇（2021年の55.8%から）。ただし「全社的な変革」に至っている企業はまだ少数。プロセスの可視化・標準化（Signavio）とITアーキテクチャの整理（LeanIX）が、DX推進の基盤として不可欠。',
    en: 'Keidanren\'s Society 5.0 vision, the Digital Agency (est. 2021), and DX Certification create strong government tailwinds. The 2024 DX White Paper shows 73.7% of companies now pursuing DX (up from 55.8% in 2021), but few have achieved enterprise-wide transformation. Process visibility and standardization (Signavio) and IT architecture rationalization (LeanIX) are essential foundations for DX success.',
  },
  'japan.manufacturing': { jp: '製造業大国', en: 'Manufacturing Power' },
  'japan.manufacturing.desc': { jp: 'プロセスマイニング最適市場', en: 'Ideal market for process mining' },
  'japan.manufacturing.detail': {
    jp: '日本は世界第3位の製造業大国であり、「ものづくり」文化はプロセスの継続的改善（カイゼン）と親和性が極めて高い。トヨタ生産方式に代表される改善文化は、プロセスマイニングのデジタル版と言える。自動車、電機、精密機器、化学 — いずれもエンドツーエンドのプロセス可視化、品質管理、サプライチェーン最適化に大きなニーズがある。Signavioは「デジタルカイゼン」として、LeanIXはIT複雑性の管理ツールとして、製造業のDXを支える。',
    en: 'Japan is the world\'s 3rd largest manufacturing economy. The "monozukuri" culture of continuous improvement (kaizen) is a natural fit for process mining — it\'s digital kaizen. Automotive, electronics, precision machinery, and chemicals all have massive needs for end-to-end process visibility, quality control, and supply chain optimization. Signavio as "digital kaizen" and LeanIX for IT complexity management are compelling narratives for manufacturing DX.',
  },
  // News section
  'japan.news.title': { jp: '最新ニュース', en: 'Latest News' },
  'japan.news.fetch': { jp: 'ニュースを取得', en: 'Fetch Latest News' },
  'japan.news.loading': { jp: '取得中...', en: 'Fetching...' },
  'japan.news.sources': {
    jp: '日経新聞・NHKニュース・ITmedia・Nippon.com から取得',
    en: 'From Nikkei Asia · NHK World · Nippon.com · Japan Times',
  },
  'japan.news.empty': {
    jp: 'ボタンを押して日本市場の最新ニュースを取得',
    en: 'Press the button above to fetch the latest Japan market news',
  },
  'japan.news.noResults': {
    jp: 'ニュースを取得できませんでした。後ほどお試しください。',
    en: 'Could not fetch news. Please try again later.',
  },
  'japan.news.lastFetched': { jp: '最終取得', en: 'Last fetched' },

  // Account context
  'account.title': { jp: 'ターゲット顧客を設定', en: 'Account Setup' },
  'account.set': { jp: '顧客設定', en: 'Account' },
  'account.startHere': { jp: '🚀 ここから開始', en: '🚀 Start Here' },
  'account.startHereDesc': { jp: 'まずターゲット顧客を設定', en: 'Set up your target account first' },
  'account.company': { jp: '企業名', en: 'Company Name' },
  'account.companyPlaceholder': { jp: '例: トヨタ自動車', en: 'e.g. Toyota Motor' },
  'account.industry': { jp: '業種', en: 'Industry' },
  'account.selectIndustry': { jp: '業種を選択', en: 'Select industry' },
  'account.pains': { jp: '課題', en: 'Pain Points' },
  'account.bom': { jp: '関連製品', en: 'Related Products' },
  'account.aiFill': { jp: 'AI提案', en: 'AI Suggest' },
  'account.noKey': { jp: 'APIキーが未設定です。設定画面で入力してください。', en: 'No API key. Set it in Settings first.' },
  'account.save': { jp: '保存', en: 'Save' },
  'account.clear': { jp: 'クリア', en: 'Clear' },

  // Debrief page
  'nav.debrief': { jp: '振り返り', en: 'Debrief' },
  'debrief.title': { jp: '振り返り', en: 'Debrief' },
  'debrief.subtitle': { jp: '会議メモからフォローアップとSAメモを自動生成', en: 'Auto-generate follow-up email and SA memo from meeting notes' },
  'debrief.notesLabel': { jp: '会議メモ', en: 'Meeting Notes' },
  'debrief.notesPlaceholder': { jp: '会議メモをペーストしてください...', en: 'Paste your meeting notes here...' },
  'debrief.generate': { jp: '生成', en: 'Generate' },
  'debrief.output': { jp: '生成結果', en: 'Generated Output' },
  'debrief.upload': { jp: 'ファイル', en: 'Upload' },
  'debrief.voice': { jp: '音声入力', en: 'Voice' },
  'debrief.stopVoice': { jp: '停止', en: 'Stop' },
  'debrief.noSpeech': { jp: '音声認識はこのブラウザでサポートされていません', en: 'Speech recognition not supported in this browser' },
  'debrief.attachedFile': { jp: '添付ファイル', en: 'Attached file' },

  // Battlecards page
  'nav.battlecards': { jp: '切返し', en: 'Battlecards' },
  'battlecards.title': { jp: '切返しカード', en: 'Battlecards' },
  'battlecards.subtitle': { jp: 'よくある反論への切り返し', en: 'Counter common objections' },
  'battlecards.rebuttal': { jp: '切り返し', en: 'Rebuttal' },
  'battlecards.reframe': { jp: 'リフレーム', en: 'Reframe' },
  'battlecards.valueTie': { jp: '価値提案', en: 'Value Tie-in' },
  'battlecards.nextStep': { jp: 'ネクストステップ', en: 'Next Step' },
  'battlecards.aiTailor': { jp: 'AIカスタマイズ', en: 'AI Tailor' },

  // AI News curation
  'japan.news.aiCurate': { jp: 'AIキュレーション', en: 'AI Curate' },
  'japan.news.aiCurating': { jp: 'キュレーション中...', en: 'Curating...' },

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
