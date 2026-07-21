'use client'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState } from 'react'
import { Bot, User, Copy, Check } from 'lucide-react'

interface Props {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export default function ChatBubble({ role, content, isStreaming }: Props) {
  const [copied, setCopied] = useState(false)
  const isAI = role === 'assistant'

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isAI ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-green-400 to-emerald-600'
      }`}>
        {isAI ? <Bot size={16} className="text-white" /> : <User size={16} className="text-white" />}
      </div>
      
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isAI ? 'bg-[#1a1a2e] border border-[#2a2a3e]' : 'bg-gradient-to-r from-blue-600 to-blue-500'
      }`}>
        {isAI ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre({ children }) {
                  return <pre className="relative bg-[#0a0a1a] rounded-lg p-4 overflow-x-auto my-2 border border-[#2a2a3e]">{children}</pre>
                },
                code({ className, children, ...props }) {
                  const isBlock = className?.includes('language-')
                  const match = /language-(\w+)/.exec(className || '')
                  return isBlock ? (
                    <div className="relative">
                      <div className="flex justify-between items-center px-4 py-2 bg-[#0f0f23] rounded-t-lg border border-[#2a2a3e] border-b-0">
                        <span className="text-xs text-gray-400">{match?.[1] || 'code'}</span>
                        <button onClick={() => copyCode(String(children))} className="text-gray-400 hover:text-white">
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      <code className={className} {...props}>{children}</code>
                    </div>
                  ) : (
                    <code className="bg-[#1a1a2e] px-1.5 py-0.5 rounded text-pink-400 text-sm" {...props}>{children}</code>
                  )
                }
              }}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1 rounded-sm" />}
          </div>
        ) : (
          <p className="text-white text-sm">{content}</p>
        )}
      </div>
    </motion.div>
  )
}
