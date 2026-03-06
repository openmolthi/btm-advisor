import { useState, useRef, useEffect } from 'react'
import { Paperclip, Send, Mic, MicOff } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { useSpeechRecognition, isSpeechSupported } from '../lib/useSpeech'

export default function ChatInput({
  onSend,
  onFileUpload,
  placeholder,
  variant = 'default',
  disabled = false,
  showMic = false,
  onListeningChange,
}) {
  const [text, setText] = useState('')
  const fileRef = useRef(null)
  const textareaRef = useRef(null)
  const { t, lang } = useI18n()

  const variants = {
    default: { accent: 'var(--sage)' },
    challenge: { accent: 'var(--challenge-accent)' },
    gym: { accent: 'var(--gym-accent)' },
  }

  const colors = variants[variant] || variants.default

  const handleVoiceResult = (voiceText) => {
    if (voiceText && onSend) {
      onSend(voiceText)
    }
  }

  const { isListening, transcript, startListening, stopListening, error } = useSpeechRecognition({
    lang,
    onResult: handleVoiceResult,
    autoSend: true,
    autoSendDelay: 2000,
  })

  // Notify parent about listening state changes
  useEffect(() => {
    onListeningChange?.(isListening)
  }, [isListening, onListeningChange])

  // Show transcript in textarea while recording
  useEffect(() => {
    if (transcript) {
      setText(transcript)
    }
  }, [transcript])

  const handleSubmit = () => {
    if (!text.trim() || disabled) return
    // Stop listening if active
    if (isListening) stopListening()
    onSend(text.trim())
    setText('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleSubmit()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e) => {
    setText(e.target.value)
    // Auto-resize
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (file && onFileUpload) {
      onFileUpload(file)
    }
    e.target.value = ''
  }

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
      // If there's transcript text, keep it in the input for manual editing
    } else {
      setText('')
      startListening()
    }
  }

  const speechSupported = isSpeechSupported()

  return (
    <form
      onSubmit={handleFormSubmit}
      className="border-t border-[var(--ink-200)] px-4 md:px-6 py-3"
      style={{ background: 'var(--surface)' }}
    >
      {/* Recording indicator */}
      {isListening && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="voice-pulse-dot" />
          <span className="text-[12px] text-red-500" style={{ fontWeight: 500 }}>
            {t('voice.recording')}
          </span>
        </div>
      )}

      {/* Voice error message */}
      {error && (
        <div className="mb-2 px-1">
          <span className="text-[12px] text-[var(--ink-500)]" style={{ fontWeight: 400 }}>
            {error === 'not-supported' ? t('voice.notSupported')
              : error === 'not-allowed' ? t('voice.noPermission')
              : error === 'no-speech' ? t('voice.noSpeech')
              : t('voice.error')}
          </span>
        </div>
      )}

      <div className="flex items-end gap-2 md:gap-3">
        {/* File upload button */}
        {onFileUpload && (
          <>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="p-2.5 rounded-xl hover:bg-[var(--ink-50)] transition-colors flex-shrink-0 mb-0.5"
              style={{ color: 'var(--ink-400)' }}
              title={t('coach.fileUpload')}
              disabled={disabled}
            >
              <Paperclip size={20} strokeWidth={1.5} />
            </button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.pptx,.txt,.md,.png,.jpg,.jpeg"
              onChange={handleFile}
            />
          </>
        )}

        {/* Mic button */}
        {showMic && speechSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            disabled={disabled}
            className={`p-2.5 rounded-xl transition-all flex-shrink-0 mb-0.5 ${
              isListening
                ? 'voice-mic-active'
                : 'hover:bg-[var(--sage-tint)]'
            }`}
            style={{
              color: isListening ? 'white' : 'var(--sage)',
              background: isListening ? 'var(--sage)' : 'transparent',
            }}
            title={t('voice.micButton')}
          >
            {isListening ? <MicOff size={20} strokeWidth={1.5} /> : <Mic size={20} strokeWidth={1.5} />}
          </button>
        )}

        {/* Textarea input — Enter to send, Shift+Enter for newline */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full rounded-2xl px-5 py-3 text-[14px] bg-[var(--washi)] border border-[var(--ink-200)]
              outline-none focus:border-[var(--sage)] focus:ring-2 focus:ring-[var(--sage-tint)]
              transition-all placeholder:text-[var(--ink-400)] resize-none"
            style={{
              fontWeight: 400,
              color: 'var(--ink-800)',
              minHeight: '44px',
              maxHeight: '120px',
            }}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="p-3 rounded-2xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed
            hover:shadow-md active:scale-95 flex-shrink-0 mb-0.5"
          style={{
            background: colors.accent,
          }}
          title={t('coach.send')}
        >
          <Send size={20} strokeWidth={2} />
        </button>
      </div>
    </form>
  )
}
