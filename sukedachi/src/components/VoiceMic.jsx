import { Mic, MicOff } from 'lucide-react'
import { useSpeechRecognition, isSpeechSupported } from '../lib/useSpeech'
import { useI18n } from '../lib/i18n'

/**
 * Drop-in voice mic button that appends transcribed text to a setter.
 * Usage: <VoiceMic onResult={(text) => setText(prev => prev + ' ' + text)} />
 * Or with autoSend=false to just append to a textarea without auto-sending.
 */
export default function VoiceMic({ onResult, className = '' }) {
  const { t, lang } = useI18n()
  const supported = isSpeechSupported()

  const { isListening, transcript, startListening, stopListening, error } = useSpeechRecognition({
    lang,
    autoSend: true,
    autoSendDelay: 2500,
    onResult: (text) => {
      if (text && onResult) onResult(text)
    },
  })

  if (!supported) return null

  const handleClick = () => {
    if (isListening) stopListening()
    else startListening()
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] border transition-colors ${
          isListening
            ? 'bg-red-50 border-red-300 text-red-600'
            : 'border-[var(--ink-200)] text-[var(--ink-500)] hover:bg-[var(--ink-50)]'
        }`}
        style={{ fontWeight: 500 }}
        title={t('voice.micButton')}
      >
        {isListening ? <MicOff size={14} /> : <Mic size={14} />}
        {isListening && <span className="voice-pulse-dot" />}
      </button>
      {isListening && transcript && (
        <span className="text-[11px] text-[var(--ink-400)] max-w-[150px] truncate">{transcript}</span>
      )}
      {error && (
        <span className="text-[10px] text-red-500">{t('voice.error')}</span>
      )}
    </span>
  )
}
