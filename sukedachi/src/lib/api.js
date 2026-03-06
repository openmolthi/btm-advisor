/**
 * AI API client for Sukedachi
 * Uses Gemini API directly (no backend required)
 * API key stored in localStorage for GitHub Pages deployment
 */

import { buildOfficialDocsContext } from '../data/officialDocs'

const GEMINI_MODEL = 'gemini-2.5-pro'

function getApiKey() {
  return localStorage.getItem('btm-suite-gemini-key') || localStorage.getItem('sukedachi-gemini-key') || ''
}

export function hasApiKey() {
  return !!getApiKey()
}

// System prompts per mode
export const SYSTEM_PROMPTS = {
  learn: (lang) => `あなたは「助太刀」— SAP BTMポートフォリオの営業コーチです。
SSE（Solution Sales Expert）が、Signavio、LeanIX、Syniti、Tricentisについて学ぶのを助けます。

回答のルール：
- ${lang === 'en' ? '英語で回答してください' : '日本語で回答してください'}
- 簡潔で明確に、専門用語を避けて説明
- 具体例や数字を使う（顧客事例、市場データ）
- 営業に役立つヒントを添える
- 日本市場の文脈を意識する（2025年の崖、人手不足、DX推進、ものづくり文化）
- 該当するセールスプレイ（SP1〜SP6）を示す
- 「デジタルカイゼン」などの日本の製造業に響くキーワードを活用
- 回答はSAP公式ドキュメントに基づいてください。機能を引用する際はSAP Help Portalを参照元としてください。
- 特定の機能や仕様を引用する場合、回答の末尾に「📚 出典: SAP Help Portal」と記載してください。

ポートフォリオ：
- Signavio: プロセスマイニング＆マネジメント（SP1, SP2, SP4）
- LeanIX: エンタープライズ・アーキテクチャ管理（SP1, SP3, SP4）
- Syniti: データ品質＆マイグレーション（SP1）
- Tricentis: テスト自動化＆品質保証（SP1, SP5）
- WalkMe: デジタルアダプション（SP6、二次的）

公式ドキュメントに基づくソリューション情報：
${buildOfficialDocsContext()}`,

  challenge: (lang) => `あなたは「助太刀」のチャレンジモードです。
懐疑的な同僚やお客様の役を演じ、SSEの確信を鍛えます。

ルール：
- ${lang === 'en' ? '英語で回答' : '日本語で回答'}
- SSEの主張に対して、建設的に反論する
- データや市場動向で反論を裏付ける
- 最後に「あなたの番」と促して、SSEに考えさせる
- 厳しすぎず、学びになるトーンで
- 実際によくある社内の反対意見を使う`,

  gym: (scenario, lang) => `あなたは助太刀の実践練習（道場）モードです。
以下のお客様役を演じてください：

${scenario.persona}

ルール：
- ${lang === 'en' ? '英語で、ビジネスの場にふさわしい丁寧な言葉で会話' : '日本語で、ビジネスの場にふさわしい敬語で会話'}
- リアルで現実的なお客様として振る舞う
- 簡単には納得しないが、敵対的でもない
- 5〜10回のやり取りの後、会話を自然に終了
- 終了時にJSON形式でスコアを返す：
{"scores": {"value": 0-100, "discovery": 0-100, "product": 0-100, "objection": 0-100, "dealSize": 0-100, "crossSell": 0-100}, "feedback": "コーチのコメント"}`,
}

/**
 * Send a chat message to Gemini API
 * @param {Array} messages - Chat history [{role: 'user'|'assistant', content: string}]
 * @param {Object} options - { mode, scenario, onChunk, lang }
 * @returns {Promise<string>} AI response
 */
export async function sendMessage(messages, options = {}) {
  const { mode = 'learn', scenario = null, onChunk = null, lang = 'jp' } = options

  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error(lang === 'en'
      ? 'No API key configured. Go to Settings to add your Gemini API key.'
      : 'APIキーが設定されていません。設定画面でGemini APIキーを入力してください。')
  }

  const systemPrompt = mode === 'gym' && scenario
    ? SYSTEM_PROMPTS.gym(scenario, lang)
    : (SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.learn)(lang)

  // Convert messages to Gemini format
  const geminiContents = []

  // Add system instruction via first user context
  for (const msg of messages) {
    geminiContents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:${onChunk ? 'streamGenerateContent' : 'generateContent'}?key=${apiKey}`

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: geminiContents,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 4096,
    },
  }

  if (onChunk) {
    body.generationConfig.responseMimeType = undefined
  }

  const response = await fetch(url + (onChunk ? '&alt=sse' : ''), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    if (response.status === 400 && errorBody.includes('API_KEY')) {
      throw new Error(lang === 'en' ? 'Invalid API key. Check your Gemini API key in Settings.' : 'APIキーが無効です。設定画面で確認してください。')
    }
    throw new Error(`Gemini API error: ${response.status}`)
  }

  // Streaming
  if (onChunk && response.body) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
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
          fullText += text
          onChunk(fullText)
        } catch { /* skip parse errors in stream */ }
      }
    }
    // Process remaining buffer
    if (buffer.startsWith('data: ')) {
      try {
        const parsed = JSON.parse(buffer.slice(6).trim())
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || ''
        fullText += text
        onChunk(fullText)
      } catch { /* skip */ }
    }
    return fullText
  }

  // Non-streaming
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

/**
 * Parse gym scorecard from AI response
 */
export function parseScorecard(text) {
  const jsonMatch = text.match(/\{[\s\S]*"scores"[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}
