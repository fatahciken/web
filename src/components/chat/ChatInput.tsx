'use client'
import { useState, useRef, useEffect } from 'react'
import { FiSend, FiLoader } from 'react-icons/fi'
import { MdOutlineAutoAwesome } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onSend: (message: string) => void
  isStreaming: boolean
}

export default function ChatInput({ onSend, isStreaming }: Props) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="border-t border-[#232326] bg-[#0a0a0b]/80 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-3 bg-[#111113] border border-[#232326] rounded-2xl px-4 py-2 focus-within:border-[#3b82f6]/40 focus-within:ring-1 focus-within:ring-[#3b82f6]/20 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e as any)
                }
              }}
              placeholder="Ask anything..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-[#fafafa] resize-none outline-none placeholder:text-[#71717a] py-2 max-h-40 leading-relaxed"
              disabled={isStreaming}
            />
            
            <div className="flex items-center gap-2 pb-1">
              <AnimatePresence mode="wait">
                {isStreaming ? (
                  <motion.div
                    key="loading"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="w-8 h-8 rounded-lg bg-[#232326] flex items-center justify-center"
                  >
                    <FiLoader className="w-4 h-4 text-[#71717a] animate-spin" />
                  </motion.div>
                ) : (
                  <motion.button
                    key="send"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!input.trim()}
                    className="w-8 h-8 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#232326] disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <FiSend className="w-3.5 h-3.5 text-white disabled:text-[#71717a]" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <p className="text-center mt-2 text-[11px] text-[#71717a] font-medium">
            Ciken AI may produce inaccurate information
          </p>
        </form>
      </div>
    </div>
  )
}
