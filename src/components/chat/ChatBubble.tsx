'use client'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, User } from 'lucide-react'

interface Props {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export default function ChatBubble({ role, content, isStreaming }: Props) {
  const isAI = role === 'assistant'

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
                pre: ({ children }) => (
                  <pre className="bg-[#0a0a1a] rounded-lg p-4 overflow-x-auto my-2 border border-[#2a2a3e] text-sm">
                    {children}
                  </pre>
                ),
                code: ({ className, children, ...props }) => {
                  const isBlock = className?.includes('language-')
                  const match = /language-(\w+)/.exec(className || '')
                  return isBlock ? (
                    <div>
                      {match && (
                        <div className="bg-[#0f0f23] rounded-t-lg px-4 py-1 text-xs text-gray-400 border border-[#2a2a3e] border-b-0">
                          {match[1]}
                        </div>
                      )}
                      <pre className="bg-[#0a0a1a] rounded-b-lg rounded-t-none p-4 overflow-x-auto border border-[#2a2a3e] text-sm">
                        <code className={className} {...props}>{children}</code>
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-[#1a1a2e] px-1.5 py-0.5 rounded text-pink-400 text-sm" {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {content || '...'}
            </ReactMarkdown>
            {isStreaming && content && (
              <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1 rounded-sm align-middle" />
            )}
          </div>
        ) : (
          <p className="text-white text-sm whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </motion.div>
  )
}
