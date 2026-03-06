import { MessageCircle, Compass, Map, Swords, Settings, Globe, WifiOff, Moon, Sun, Zap, Home, ExternalLink } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { useOnlineStatus } from '../lib/useOnlineStatus'
import { useTheme } from '../lib/useTheme'
import { isDrillCompletedToday } from '../lib/progressTracker'

const NAV_ITEMS = [
  { id: 'coach', labelKey: 'nav.coach', icon: MessageCircle },
  { id: 'navigator', labelKey: 'nav.navigator', icon: Compass },
  { id: 'valuemap', labelKey: 'nav.valuemap', icon: Map },
  { id: 'dojo', labelKey: 'nav.dojo', icon: Swords },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings },
]

export default function Layout({ activeTab, onTabChange, onDrillOpen, children }) {
  const { t, lang, setLang } = useI18n()
  const { isOnline } = useOnlineStatus()
  const { isDark, toggleTheme } = useTheme()
  const drillDone = isDrillCompletedToday()

  const toggleLang = () => setLang(lang === 'jp' ? 'en' : 'jp')

  return (
    <div className="h-screen flex bg-[var(--washi)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[220px] flex-col flex-shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--ink-200)]">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[var(--ink-200)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--sage-tint)] flex items-center justify-center">
              <span className="text-lg">⚔️</span>
            </div>
            <div>
              <h1 className="text-[15px] tracking-wide text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                助太刀
              </h1>
              <p className="text-[11px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>
                {t('nav.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Daily Drill button */}
        <div className="px-3 py-2 border-b border-[var(--ink-200)]">
          <button
            onClick={onDrillOpen}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all hover:bg-[var(--sage-tint)] border border-[var(--ink-200)]"
            style={{ background: drillDone ? 'var(--success-bg)' : 'var(--sage-tint)' }}
          >
            <Zap size={16} className="text-[var(--sage-dark)]" />
            <span className="text-[13px] text-[var(--ink-800)] flex-1 text-left" style={{ fontWeight: 500 }}>
              {t('drill.title')}
            </span>
            {!drillDone && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded border"
                style={{ background: 'var(--streak-bg)', borderColor: 'var(--streak-border)', color: 'var(--streak-text)', fontWeight: 600 }}
              >
                {t('drill.notDone')}
              </span>
            )}
            {drillDone && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded border"
                style={{ background: 'var(--success-bg)', borderColor: 'var(--success-border)', color: 'var(--success-text)', fontWeight: 600 }}
              >
                {t('drill.done')}
              </span>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2">
          <div className="space-y-0.5">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[var(--sidebar-active-bg)] text-white shadow-sm'
                      : 'text-[var(--ink-600)] hover:bg-[var(--ink-200)] hover:text-[var(--ink-800)]'
                  }`}
                  style={{ fontWeight: isActive ? 500 : 400 }}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span className="text-[13px]">{t(item.labelKey)}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer with theme & language toggle */}
        <div className="px-4 py-3 border-t border-[var(--ink-200)]">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-[var(--ink-500)] hover:bg-[var(--ink-200)] hover:text-[var(--ink-700)] transition-colors w-full mb-0.5"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            <span style={{ fontWeight: 400 }}>{isDark ? t('theme.light') : t('theme.dark')}</span>
          </button>
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-[var(--ink-500)] hover:bg-[var(--ink-200)] hover:text-[var(--ink-700)] transition-colors w-full"
          >
            <Globe size={14} />
            <span style={{ fontWeight: 400 }}>{lang === 'jp' ? 'English' : '日本語'}</span>
          </button>
          <div className="mt-1.5 pt-1.5 border-t border-[var(--ink-100)]">
            <a
              href="../"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-[var(--ink-500)] hover:bg-[var(--ink-200)] hover:text-[var(--ink-700)] transition-colors w-full"
              style={{ fontWeight: 400 }}
            >
              <Home size={14} />
              <span>{t('nav.home')}</span>
            </a>
            <a
              href="../advisor/"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-[var(--ink-500)] hover:bg-[var(--ink-200)] hover:text-[var(--ink-700)] transition-colors w-full"
              style={{ fontWeight: 400 }}
            >
              <ExternalLink size={14} />
              <span>{t('nav.advisor')}</span>
            </a>
          </div>
          <p className="text-[10px] text-[var(--ink-400)] tracking-wide mt-2 px-2" style={{ fontWeight: 400 }}>
            {t('nav.footer')}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5 px-2">
            {['Signavio', 'LeanIX', 'Syniti', 'Tricentis'].map(name => (
              <span
                key={name}
                className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--ink-100)] text-[var(--ink-600)]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--ink-200)] safe-area-bottom" style={{ background: 'var(--mobile-bar-bg)' }}>
        <div className="flex justify-around py-2 px-2" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[60px]"
                style={{
                  background: isActive ? 'var(--sage-tint)' : 'transparent',
                }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={isActive ? 'text-[var(--sage-dark)]' : 'text-[var(--ink-400)]'}
                />
                <span
                  className={`text-[10px] ${isActive ? 'text-[var(--sage-dark)]' : 'text-[var(--ink-400)]'}`}
                  style={{ fontWeight: isActive ? 500 : 400 }}
                >
                  {t(item.labelKey)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content — constrained width */}
      <main className="flex-1 flex flex-col min-h-0 pb-20 md:pb-0 overflow-hidden">
        {/* Offline banner */}
        {!isOnline && (
          <div className="px-4 py-2 border-b flex items-center justify-center gap-2" style={{ background: 'var(--amber-bg)', borderColor: 'var(--amber-border)' }}>
            <WifiOff size={14} style={{ color: 'var(--amber-icon)' }} className="flex-shrink-0" />
            <p className="text-[12px]" style={{ fontWeight: 500, color: 'var(--amber-text)' }}>
              {t('offline.banner')}
            </p>
          </div>
        )}
        <div className="flex-1 flex flex-col min-h-0 max-w-[1200px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
