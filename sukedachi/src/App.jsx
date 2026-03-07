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

  // Show drill prompt on app load if not completed today
  useEffect(() => {
    if (!isDrillCompletedToday()) {
      const timer = setTimeout(() => setShowDrillPrompt(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDrillOpen = () => {
    setShowDrillPrompt(false)
    setShowDrill(true)
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
          onDismiss={() => setShowDrillPrompt(false)}
        />
      )}

      {showDrill && (
        <DailyDrill onClose={handleDrillClose} />
      )}

      <ToastContainer toasts={toasts} />
    </>
  )
}
