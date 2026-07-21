'use client'
import { useState, useRef, useEffect } from 'react'
import { FiSend, FiCommand } from 'react-icons/fi'
import { motion } from 'framer-motion'

interface Props {
  onSend: (message: string) => void
  isStreaming: boolean
}

export default function ChatInput({ onSend, isStreaming }: Props) {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px'
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="relative px-4 pb-4 pt-2">
      {/* Floating glow */}
      <motion.div
        animate={{ opacity: isFocused ? 0.4 : 0.15 }}
        className="absolute inset-x-8 bottom-2 h-32 rounded-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(88,166,255,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        <form onSubmit={handleSubmit}>
          <motion.div 
            animate={{ 
              borderColor: isFocused ? 'rgba(88,166,255,0.25)' : 'rgba(255,255,255,0.06)',
              boxShadow: isFocused ? '0 0 0 1px rgba(88,166,255,0.1), 0 8px 32px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.2)',
            }}
            className="flex items-end gap-3 rounded-2xl px-4 py-2.5 transition-all duration-300"
            style={{ 
              background: 'rgba(22,27,34,0.6)',
              backdropFilter: 'blur(20px) saturate(120%)',
              WebkitBackdropFilter: 'blur(20px) saturate(120%)',
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e as any)
                }
              }}
              placeholder="Ask anything...                                                              "
              rows={1}
              className="flex-1 bg-transparent text-[15px] text-[#e6edf3] resize-none outline-none placeholder:text-[#484f58] py-2 max-h-[180px] leading-relaxed font-medium"
              disabled={isStreaming}
            />
            
            <div className="flex items-center gap-2 pb-1.5">
              <span className="text-[10px] text-[#484f58] bg-white/[0.02] px-2 py-1 rounded-md border border-white/[0.03] font-mono flex items-center gap-1 hidden sm:flex">
                <FiCommand className="w-2.5 h-2.5" />Enter
              </span>
              <motion.button
                whileHover={{ scale: 1.06, background: 'rgba(88,166,255,0.2)' }}
                whileTap={{ scale: 0.94 }}
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="p-2 rounded-xl transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ 
                  background: input.trim() ? 'rgba(88,166,255,0.12)' : 'rgba(255,255,255,0.03)',
                  border: input.trim() ? '1px solid rgba(88,166,255,0.2)' : '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {isStreaming ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2 border-[#58a6ff]/30 border-t-[#58a6ff]"
                  />
                ) : (
                  <FiSend className="w-3.5 h-3.5 text-[#58a6ff]" />
                )}
              </motion.button>
            </div>
          </motion.div>
        </form>
        
        <p className="text-center mt-2.5 text-[11px] text-[#484f58] font-medium select-none">
          Ciken AI may produce inaccurate information about people, places, or facts
        </p>
      </div>
    </div>
  )
}
