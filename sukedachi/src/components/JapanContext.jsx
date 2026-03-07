import { useState, useCallback } from 'react'
import { Newspaper, RefreshCw, ExternalLink, ChevronDown, ChevronUp, TrendingUp, Sparkles } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { useAccount, buildAccountContextString } from '../contexts/AccountContext'
import { hasApiKey } from '../lib/api'

// Expanded Japan context data with rich content
const JAPAN_THEMES = [
  {
    key: 'cliff',
    titleKey: 'japan.cliff',
    descKey: 'japan.cliff.desc',
    detailKey: 'japan.cliff.detail',
    icon: '⏰',
    color: '#c2410c',
    bg: '#fff7ed',
    searchTerms: ['2025 cliff japan IT', 'SAP ERP legacy japan', 'japan digital transformation deadline'],
  },
  {
    key: 'labor',
    titleKey: 'japan.labor',
    descKey: 'japan.labor.desc',
    detailKey: 'japan.labor.detail',
    icon: '👥',
    color: '#0369a1',
    bg: '#f0f9ff',
    searchTerms: ['japan labor shortage', 'japan workforce automation', 'japan aging population workforce'],
  },
  {
    key: 'dx',
    titleKey: 'japan.dx',
    descKey: 'japan.dx.desc',
    detailKey: 'japan.dx.detail',
    icon: '🚀',
    color: '#7c3aed',
    bg: '#f5f3ff',
    searchTerms: ['japan DX digital transformation', 'Society 5.0 japan', 'japan enterprise software'],
  },
  {
    key: 'manufacturing',
    titleKey: 'japan.manufacturing',
    descKey: 'japan.manufacturing.desc',
    detailKey: 'japan.manufacturing.detail',
    icon: '🏭',
    color: '#047857',
    bg: '#ecfdf5',
    searchTerms: ['japan manufacturing digital', 'japan monozukuri technology', 'japan factory automation'],
  },
]

// RSS feed sources — bilingual (JP originals + EN)
const RSS_FEEDS_JP = [
  { id: 'nikkei-jp', name: '日経新聞', url: 'https://assets.wor.jp/rss/rdf/nikkei/news.rdf', icon: '📊' },
  { id: 'nhk-jp', name: 'NHKニュース', url: 'https://www.nhk.or.jp/rss/news/cat0.xml', icon: '📺' },
  { id: 'itmedia', name: 'ITmedia', url: 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml', icon: '💻' },
  { id: 'nippon-jp', name: 'Nippon.com', url: 'https://www.nippon.com/ja/rss/latestdata_ja.xml', icon: '🗾' },
]

const RSS_FEEDS_EN = [
  { id: 'nikkei', name: 'Nikkei Asia', url: 'https://asia.nikkei.com/rss/feed/nar', icon: '📊' },
  { id: 'nhk', name: 'NHK World', url: 'https://www3.nhk.or.jp/rj/podcast/rss/english.xml', icon: '📺' },
  { id: 'nippon', name: 'Nippon.com', url: 'https://www.nippon.com/en/rss/latestdata_en.xml', icon: '🗾' },
  { id: 'japantimes', name: 'Japan Times', url: 'https://www.japantimes.co.jp/feed/', icon: '📰' },
]

// CORS proxy for static site RSS fetching
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

function parseRSS(xmlText, sourceName) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')
  const items = doc.querySelectorAll('item')
  const results = []

  items.forEach((item) => {
    const title = item.querySelector('title')?.textContent?.trim() || ''
    const link = item.querySelector('link')?.textContent?.trim() || ''
    const pubDate = item.querySelector('pubDate')?.textContent?.trim() || ''
    const description = item.querySelector('description')?.textContent?.trim() || ''
    // Strip HTML from description
    const cleanDesc = description.replace(/<[^>]*>/g, '').slice(0, 200)

    if (title && link) {
      results.push({ title, link, pubDate, description: cleanDesc, source: sourceName })
    }
  })

  return results
}

// Keyword matching for Japan business/tech relevance
// High-weight: directly SAP/BTM relevant
const HIGH_KEYWORDS = [
  'sap', 'erp', 'legacy system', 'digital transformation', 'dx', 'process mining',
  'enterprise architecture', 'data migration', 'test automation', 'data quality',
  'signavio', 'leanix', 'syniti', 'tricentis', 's/4hana', 'cloud erp',
]
// Medium-weight: industry/tech relevant
const MED_KEYWORDS = [
  'automation', 'manufacturing', 'labor shortage', 'workforce', 'ai ',
  'enterprise software', 'supply chain', 'semiconductor', 'robot',
  'factory', 'industry 4.0', 'kaizen', 'monozukuri', 'keidanren',
  'digital agency', 'society 5.0', 'it modernization', 'cloud',
]
// Low-weight: general business
const LOW_KEYWORDS = [
  'economy', 'gdp', 'trade', 'export', 'investment', 'reform',
  'sustainability', 'energy', 'startup', 'innovation', 'regulation',
]
// Negative: filter out irrelevant noise
const NEGATIVE_KEYWORDS = [
  'assault', 'murder', 'celebrity', 'entertainment', 'movie', 'film',
  'sport', 'baseball', 'soccer', 'football', 'tennis', 'olympic',
  'earthquake', 'tsunami', 'typhoon', 'crime', 'arrested', 'scandal',
  'anime', 'manga', 'music', 'concert', 'festival', 'tourism',
  'cooking', 'recipe', 'fashion', 'wedding', 'divorce',
]

function relevanceScore(title, description) {
  const text = `${title} ${description}`.toLowerCase()
  // Negative filter — if negative keyword found, return -1
  for (const kw of NEGATIVE_KEYWORDS) {
    if (text.includes(kw)) return -1
  }
  let score = 0
  for (const kw of HIGH_KEYWORDS) { if (text.includes(kw)) score += 3 }
  for (const kw of MED_KEYWORDS) { if (text.includes(kw)) score += 2 }
  for (const kw of LOW_KEYWORDS) { if (text.includes(kw)) score += 1 }
  return score
}

function ThemeCard({ theme, t, expanded, onToggle }) {
  return (
    <div
      className="rounded-xl border border-[var(--ink-200)] overflow-hidden transition-all"
      style={{ background: 'var(--surface)' }}
    >
      <div
        className="p-3 cursor-pointer flex items-start gap-3"
        onClick={onToggle}
      >
        <span className="text-xl flex-shrink-0 mt-0.5">{theme.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
            {t(theme.titleKey)}
          </p>
          <p className="text-[11px] text-[var(--ink-500)] mt-0.5" style={{ fontWeight: 400 }}>
            {t(theme.descKey)}
          </p>
        </div>
        <button className="p-1 rounded-lg hover:bg-[var(--ink-50)] flex-shrink-0">
          {expanded ? (
            <ChevronUp size={14} className="text-[var(--ink-400)]" />
          ) : (
            <ChevronDown size={14} className="text-[var(--ink-400)]" />
          )}
        </button>
      </div>
      {expanded && (
        <div className="px-3 pb-3 border-t border-[var(--ink-100)]">
          <p
            className="text-[13px] text-[var(--ink-700)] mt-3 whitespace-pre-line"
            style={{ fontWeight: 400, lineHeight: 1.8 }}
          >
            {t(theme.detailKey)}
          </p>
        </div>
      )}
    </div>
  )
}

function NewsItem({ article, pitchHook }) {
  const date = article.pubDate
    ? new Date(article.pubDate).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : ''

  return (
    <div className="rounded-xl border border-[var(--ink-200)] overflow-hidden">
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-3 hover:bg-[var(--ink-50)] transition-colors group"
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-[var(--ink-800)] group-hover:text-[var(--sage)]" style={{ fontWeight: 500, lineHeight: 1.6 }}>
              {article.title}
            </p>
            {article.description && (
              <p className="text-[11px] text-[var(--ink-500)] mt-1 line-clamp-2" style={{ fontWeight: 400 }}>
                {article.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--washi)] text-[var(--ink-500)]" style={{ fontWeight: 500 }}>
                {article.source}
              </span>
              {date && (
                <span className="text-[10px] text-[var(--ink-400)]">{date}</span>
              )}
            </div>
          </div>
          <ExternalLink size={14} className="text-[var(--ink-300)] group-hover:text-[var(--sage)] flex-shrink-0 mt-1" />
        </div>
      </a>
      {pitchHook && (
        <div className="px-3 pb-3 pt-1 border-t border-[var(--ink-100)]">
          <p className="text-[12px] text-[var(--sage-dark)] italic" style={{ fontWeight: 400, lineHeight: 1.6 }}>
            💡 {pitchHook}
          </p>
        </div>
      )}
    </div>
  )
}

export default function JapanContext() {
  const { t, lang } = useI18n()
  const account = useAccount()
  const [expandedTheme, setExpandedTheme] = useState(null)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetched, setLastFetched] = useState(null)
  const [pitchHooks, setPitchHooks] = useState({})
  const [curateLoading, setCurateLoading] = useState(false)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    const allArticles = []

    const feeds = lang === 'jp' ? RSS_FEEDS_JP : RSS_FEEDS_EN
    const fetchPromises = feeds.map(async (feed) => {
      try {
        const proxyUrl = CORS_PROXY + encodeURIComponent(feed.url)
        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) })
        if (!res.ok) return []
        const text = await res.text()
        return parseRSS(text, feed.name)
      } catch {
        // Silently skip failed feeds
        return []
      }
    })

    const results = await Promise.allSettled(fetchPromises)
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        allArticles.push(...result.value)
      }
    }

    if (allArticles.length === 0) {
      setError(t('japan.news.noResults'))
      setLoading(false)
      return
    }

    // Score and sort by relevance, then recency
    const scored = allArticles.map(a => ({
      ...a,
      _score: relevanceScore(a.title, a.description),
      _date: a.pubDate ? new Date(a.pubDate).getTime() : 0,
    }))

    // Filter out negative-scored (irrelevant) and zero-scored articles
    const filtered = scored.filter(a => a._score >= 1)

    filtered.sort((a, b) => {
      // Primary: relevance score (desc), secondary: date (desc)
      if (b._score !== a._score) return b._score - a._score
      return b._date - a._date
    })

    // Take top 12 most relevant
    setNews(filtered.slice(0, 12))
    setLastFetched(new Date())
    setLoading(false)
  }, [t, lang])

  const handleAiCurate = useCallback(async () => {
    if (!hasApiKey() || news.length === 0) return
    setCurateLoading(true)
    try {
      const apiKey = localStorage.getItem('btm-suite-gemini-key') || localStorage.getItem('sukedachi-gemini-key') || ''
      const accountCtx = buildAccountContextString(account)
      const headlines = news.slice(0, 10).map((a, i) => `${i + 1}. ${a.title}`).join('\n')
      const prompt = `For each headline below, write a one-line pitch hook connecting it to SAP BTM solutions (Signavio, LeanIX, Syniti, Tricentis, WalkMe). Be specific and actionable.
${accountCtx ? `\nAccount context: ${accountCtx}` : ''}

Headlines:
${headlines}

Respond as JSON: {"hooks": ["hook1", "hook2", ...]}`

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }),
        }
      )
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const match = text.match(/\{[\s\S]*"hooks"[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        const hooks = {}
        parsed.hooks?.forEach((hook, i) => { if (i < news.length) hooks[i] = hook })
        setPitchHooks(hooks)
      }
    } catch { /* ignore */ }
    setCurateLoading(false)
  }, [news, account])

  return (
    <div className="mt-5 rounded-2xl border border-[var(--ink-200)] p-5" style={{ background: 'var(--surface)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🇯🇵</span>
        <h3 className="text-[15px] text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
          {t('nav.japan.title')}
        </h3>
      </div>
      <p className="text-[12px] text-[var(--ink-500)] mb-4" style={{ fontWeight: 400, lineHeight: 1.7 }}>
        {t('japan.intro')}
      </p>

      {/* Theme cards — expandable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        {JAPAN_THEMES.map((theme) => (
          <ThemeCard
            key={theme.key}
            theme={theme}
            t={t}
            expanded={expandedTheme === theme.key}
            onToggle={() => setExpandedTheme(expandedTheme === theme.key ? null : theme.key)}
          />
        ))}
      </div>

      {/* News section */}
      <div className="border-t border-[var(--ink-200)] pt-4 mt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--ink-500)]" />
            <h4 className="text-[13px] text-[var(--ink-700)]" style={{ fontWeight: 600 }}>
              {t('japan.news.title')}
            </h4>
          </div>
          <button
            onClick={fetchNews}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border border-[var(--ink-200)] hover:bg-[var(--ink-50)] transition-colors disabled:opacity-50"
            style={{ color: 'var(--ink-600)', fontWeight: 500 }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {loading ? t('japan.news.loading') : t('japan.news.fetch')}
          </button>
        </div>

        <p className="text-[11px] text-[var(--ink-400)] mb-3" style={{ fontWeight: 400 }}>
          {t('japan.news.sources')}
        </p>

        {error && (
          <div className="rounded-lg p-3 bg-[#fef2f2] border border-[#fecaca] text-[12px] text-[#991b1b]">
            {error}
          </div>
        )}

        {news.length > 0 && (
          <>
            {hasApiKey() && (
              <div className="mb-3">
                <button
                  onClick={handleAiCurate}
                  disabled={curateLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border border-[var(--sage-light)] text-[var(--sage-dark)] hover:bg-[var(--sage-tint)] transition-colors disabled:opacity-50"
                  style={{ fontWeight: 500 }}
                >
                  <Sparkles size={13} className={curateLoading ? 'animate-spin' : ''} />
                  {curateLoading ? t('japan.news.aiCurating') : t('japan.news.aiCurate')}
                </button>
              </div>
            )}
            <div className="space-y-2">
              {news.map((article, i) => (
                <NewsItem key={`${article.source}-${i}`} article={article} pitchHook={pitchHooks[i]} />
              ))}
            </div>
            {lastFetched && (
              <p className="text-[10px] text-[var(--ink-400)] mt-3 text-right">
                {t('japan.news.lastFetched')}: {lastFetched.toLocaleTimeString()}
              </p>
            )}
          </>
        )}

        {!loading && news.length === 0 && !error && (
          <div className="rounded-xl border border-dashed border-[var(--ink-200)] p-6 text-center">
            <Newspaper size={24} className="text-[var(--ink-300)] mx-auto mb-2" />
            <p className="text-[12px] text-[var(--ink-400)]" style={{ fontWeight: 400 }}>
              {t('japan.news.empty')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
