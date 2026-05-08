import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TYPEWRITER_CONFIG = {
  charDelay: 35,
  linePause: 600,
  lines: [
    'Analyzing biomarkers...',
    'Running predictive model...',
    'Generating risk assessment...'
  ]
}

export default function TypewriterLoading({ onAnimationComplete }) {
  const [lineIndex, setLineIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    if (lineIndex >= TYPEWRITER_CONFIG.lines.length) {
      if (onAnimationComplete) onAnimationComplete()
      return
    }

    const currentLine = TYPEWRITER_CONFIG.lines[lineIndex]
    
    if (isTyping) {
      if (displayedText.length < currentLine.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentLine.slice(0, displayedText.length + 1))
        }, TYPEWRITER_CONFIG.charDelay)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, TYPEWRITER_CONFIG.linePause)
        return () => clearTimeout(timeout)
      }
    } else {
      // Pause between lines
      const timeout = setTimeout(() => {
        setLineIndex(i => i + 1)
        setDisplayedText('')
        setIsTyping(true)
      }, TYPEWRITER_CONFIG.linePause)
      return () => clearTimeout(timeout)
    }
  }, [displayedText, isTyping, lineIndex, onAnimationComplete])

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={lineIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center h-8"
        >
          <span className="font-mono-dm text-xl text-textData font-400 tracking-wide">
            {lineIndex < TYPEWRITER_CONFIG.lines.length 
              ? `> ${displayedText}`
              : `> ${TYPEWRITER_CONFIG.lines[TYPEWRITER_CONFIG.lines.length - 1]}`
            }
          </span>
          {/* Blinking Cursor */}
          {lineIndex < TYPEWRITER_CONFIG.lines.length && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
              className="inline-block w-2.5 h-5 bg-textData ml-1.5"
            />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-12 flex gap-2">
        {TYPEWRITER_CONFIG.lines.map((_, i) => (
          <div key={i} className="h-px w-10 transition-colors duration-500"
            style={{ backgroundColor: i < lineIndex || (i === lineIndex && !isTyping) ? '#0D9488' : 'rgba(153,246,228,0.1)' }} />
        ))}
      </div>
    </div>
  )
}
