import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Coach from './pages/Coach'
import Navigator from './pages/Navigator'
import ValueMap from './pages/ValueMap'
import Dojo from './pages/Dojo'
import Debrief from './pages/Debrief'
import Battlecards from './pages/Battlecards'
import Settings from './pages/Settings'
import DailyDrill, { DrillPrompt } from './pages/DailyDrill'
import ToastContainer from './components/Toast'
import { isDrillCompletedToday } from './lib/progressTracker'
import { useToast } from './lib/useToast'

export default function App() {
  const [activeTab, setActiveTab] = useState('coach')
  const [showDrill, setShowDrill] = useState(false)
  const [showDrillPrompt, setShowDrillPrompt] = useState(false)
  const { toasts } = useToast()

  // Show drill prompt on app load — max once/day, suppressed after 7 consecutive dismissals
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const lastPromptDate = localStorage.getItem('sukedachi_drill_last_prompt')
    const dismissStreak = parseInt(localStorage.getItem('sukedachi_drill_dismiss_streak') || '0', 10)

    if (lastPromptDate === today) return // already shown today
    if (dismissStreak >= 7) return // suppressed — user dismissed 7 days in a row
    if (isDrillCompletedToday()) return // already done today

    const timer = setTimeout(() => {
      setShowDrillPrompt(true)
      localStorage.setItem('sukedachi_drill_last_prompt', today)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleDrillOpen = () => {
    setShowDrillPrompt(false)
    setShowDrill(true)
    localStorage.setItem('sukedachi_drill_dismiss_streak', '0') // reset streak on engagement
  }

  const handleDrillDismiss = () => {
    setShowDrillPrompt(false)
    const streak = parseInt(localStorage.getItem('sukedachi_drill_dismiss_streak') || '0', 10)
    localStorage.setItem('sukedachi_drill_dismiss_streak', String(streak + 1))
  }

  const handleDrillClose = () => {
    setShowDrill(false)
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'coach':
        return <Coach />
      case 'navigator':
        return <Navigator />
      case 'valuemap':
        return <ValueMap />
      case 'dojo':
        return <Dojo />
      case 'debrief':
        return <Debrief />
      case 'battlecards':
        return <Battlecards />
      case 'settings':
        return <Settings />
      default:
        return <Coach />
    }
  }

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={setActiveTab} onDrillOpen={handleDrillOpen}>
        {renderPage()}
      </Layout>

      {showDrillPrompt && (
        <DrillPrompt
          onStart={handleDrillOpen}
          onDismiss={handleDrillDismiss}
        />
      )}

      {showDrill && (
        <DailyDrill onClose={handleDrillClose} />
      )}

      <ToastContainer toasts={toasts} />
    </>
  )
}
