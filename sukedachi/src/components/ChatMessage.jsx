import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Copy, Check, Volume2, VolumeX } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { useSpeechSynthesis, isSynthesisSupported } from '../lib/useSpeech'

export default function ChatMessage({ role, content, variant = 'default', autoSpeak = false, speechRate = 0.9 }) {
  const [copied, setCopied] = useState(false)
  const { t, lang } = useI18n()
  const isUser = role === 'user'

  const { isSpeaking, speak, stop } = useSpeechSynthesis({ lang, rate: speechRate })

  // Auto-speak AI messages when enabled
  useEffect(() => {
    if (autoSpeak && !isUser && content) {
      // Small delay to let the message render
      const timer = setTimeout(() => speak(content), 300)
      return () => clearTimeout(timer)
    }
  }, []) // Only on mount

  const styles = {
    default: {
      user: {
        background: 'var(--chat-user-bg)',
        color: 'var(--ink-800)',
        borderColor: 'var(--chat-user-border)',
      },
      ai: {
        background: 'var(--chat-ai-bg)',
        color: 'var(--ink-800)',
        borderColor: 'var(--chat-ai-border)',
      },
    },
    challenge: {
      user: {
        background: 'var(--chat-challenge-user-bg)',
        color: 'var(--ink-800)',
        borderColor: 'var(--chat-challenge-user-border)',
      },
      ai: {
        background: 'var(--chat-ai-bg)',
        color: 'var(--ink-800)',
        borderColor: 'var(--chat-ai-border)',
      },
    },
    gym: {
      user: {
        background: 'var(--chat-gym-user-bg)',
        color: 'var(--ink-800)',
        borderColor: 'var(--chat-gym-user-border)',
      },
      ai: {
        background: 'var(--chat-ai-bg)',
        color: 'var(--ink-800)',
        borderColor: 'var(--chat-ai-border)',
      },
    },
  }

  const style = isUser ? styles[variant]?.user : styles[variant]?.ai
  const align = isUser ? 'justify-end' : 'justify-start'
  const maxW = isUser ? 'max-w-[85%] md:max-w-[60%]' : 'max-w-[90%] md:max-w-[70%]'

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSpeak = () => {
    if (isSpeaking) {
      stop()
    } else {
      speak(content)
    }
  }

  const showSynthesis = isSynthesisSupported()

  return (
    <div className={`flex ${align} group`}>
      <div
        className={`${maxW} px-4 md:px-5 py-3 md:py-4 text-[14px] rounded-2xl border shadow-sm relative`}
        style={{
          ...style,
          fontWeight: 400,
          lineHeight: 1.8,
        }}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose-sm">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0 text-[var(--ink-800)]" style={{ lineHeight: 1.8 }}>
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="text-[var(--ink-900)]" style={{ fontWeight: 600 }}>
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-2 my-3 pl-0">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="flex gap-2 text-[13px] text-[var(--ink-700)]">
                    <span className="shrink-0 text-[var(--sage)] mt-0.5">•</span>
                    <span>{children}</span>
                  </li>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-2 my-3 pl-0 list-none">{children}</ol>
                ),
                blockquote: ({ children }) => (
                  <div className="rounded-xl p-4 my-3 bg-[var(--washi-warm)] border-l-3 border-[var(--sage)]">
                    <div className="text-[13px] text-[var(--ink-600)] italic">{children}</div>
                  </div>
                ),
                code: ({ children, inline }) =>
                  inline ? (
                    <code className="px-1.5 py-0.5 rounded-md bg-[var(--ink-50)] text-[var(--ink-800)] text-[13px]">
                      {children}
                    </code>
                  ) : (
                    <pre className="rounded-xl p-4 my-3 bg-[var(--ink-50)] overflow-x-auto">
                      <code className="text-[12px] text-[var(--ink-800)]">{children}</code>
                    </pre>
                  ),
                h3: ({ children }) => (
                  <h3 className="text-[15px] mt-4 mb-2 text-[var(--ink-900)]" style={{ fontWeight: 600 }}>
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-[14px] mt-3 mb-2 text-[var(--ink-800)]" style={{ fontWeight: 600 }}>
                    {children}
                  </h4>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {/* Action buttons on AI messages */}
        {!isUser && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Speaker button */}
            {showSynthesis && (
              <button
                onClick={handleSpeak}
                className={`p-1.5 rounded-lg transition-all ${
                  isSpeaking ? 'opacity-100 bg-[var(--sage-tint)]' : 'hover:bg-[var(--ink-50)]'
                }`}
                title={isSpeaking ? t('voice.stopSpeaking') : t('voice.speakButton')}
              >
                {isSpeaking ? (
                  <VolumeX size={14} className="text-[var(--sage)] voice-speaker-active" />
                ) : (
                  <Volume2 size={14} className="text-[var(--ink-400)]" />
                )}
              </button>
            )}

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-[var(--ink-50)]"
              title="Copy"
            >
              {copied ? (
                <Check size={14} className="text-[var(--sage)]" />
              ) : (
                <Copy size={14} className="text-[var(--ink-400)]" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
