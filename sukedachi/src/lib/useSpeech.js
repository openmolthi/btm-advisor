import { useState, useEffect, useRef, useCallback } from 'react'

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

export function isSpeechSupported() {
  return !!SpeechRecognition
}

export function isSynthesisSupported() {
  return !!synth
}

export function useSpeechRecognition({ lang = 'jp', onResult, autoSend = true, autoSendDelay = 2000 } = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const autoSendTimerRef = useRef(null)
  const onResultRef = useRef(onResult)

  onResultRef.current = onResult

  const clearAutoSendTimer = useCallback(() => {
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current)
      autoSendTimerRef.current = null
    }
  }, [])

  const stopListening = useCallback(() => {
    clearAutoSendTimer()
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [clearAutoSendTimer])

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError('not-supported')
      return
    }

    setError(null)
    setTranscript('')
    clearAutoSendTimer()

    const recognition = new SpeechRecognition()
    recognition.lang = lang === 'jp' ? 'ja-JP' : 'en-US'
    recognition.interimResults = true
    recognition.continuous = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      const fullText = finalTranscript + interimTranscript
      setTranscript(fullText)

      // Reset auto-send timer on new speech
      clearAutoSendTimer()
      if (autoSend && fullText.trim()) {
        autoSendTimerRef.current = setTimeout(() => {
          if (onResultRef.current && fullText.trim()) {
            onResultRef.current(fullText.trim())
            setTranscript('')
          }
          recognition.stop()
          setIsListening(false)
        }, autoSendDelay)
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('not-allowed')
      } else if (event.error === 'no-speech') {
        setError('no-speech')
      } else {
        setError(event.error)
      }
      setIsListening(false)
      clearAutoSendTimer()
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [lang, autoSend, autoSendDelay, clearAutoSendTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoSendTimer()
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [clearAutoSendTimer])

  return { isListening, transcript, startListening, stopListening, error, setTranscript }
}

export function useSpeechSynthesis({ lang = 'jp', rate = 0.9 } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef(null)

  const stop = useCallback(() => {
    if (synth) {
      synth.cancel()
    }
    setIsSpeaking(false)
  }, [])

  const speak = useCallback((text) => {
    if (!synth) return

    // Cancel any ongoing speech
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === 'jp' ? 'ja-JP' : 'en-US'
    utterance.rate = rate

    // Try to find a matching voice
    const voices = synth.getVoices()
    const targetLang = lang === 'jp' ? 'ja' : 'en'
    const matchingVoice = voices.find(v => v.lang.startsWith(targetLang))
    if (matchingVoice) {
      utterance.voice = matchingVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    utteranceRef.current = utterance
    synth.speak(utterance)
  }, [lang, rate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synth) synth.cancel()
    }
  }, [])

  return { isSpeaking, speak, stop }
}
