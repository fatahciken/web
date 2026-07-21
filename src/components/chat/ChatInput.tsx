'use client'
import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  onSend: (message: string) => void
  isStreaming: boolean
}

export default function ChatInput({ onSend, isStreaming }: Props) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <motion.form
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      onSubmit={handleSubmit}
      className="border-t border-[#1a1a2e] bg-[#0a0a0a] p-4"
    >
      <div className="max-w-4xl mx-auto flex gap-3 items-end">
        <div className="flex-1 bg-[#111] border border-[#2a2a3e] rounded-2xl flex items-end overflow-hidden focus-within:border-blue-500/50 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
            placeholder="Ask me anything about code..."
            rows={1}
            className="flex-1 bg-transparent text-white px-4 py-3 resize-none outline-none placeholder:text-gray-500 text-sm max-h-32"
            disabled={isStreaming}
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {isStreaming ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </motion.button>
      </div>
    </motion.form>
  )
}
