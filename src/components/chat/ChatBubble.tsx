'use client'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { HiOutlineUser } from 'react-icons/hi2'
import { MdOutlineAutoAwesome } from 'react-icons/md'
import { useState } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'

interface Props {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export default function ChatBubble({ role, content, isStreaming }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const isAI = role === 'assistant'

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-4 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
        ${isAI 
          ? 'bg-[#111113] border border-[#232326]' 
          : 'bg-[#3b82f6]/10 border border-[#3b82f6]/20'
        }
      `}>
        {isAI 
          ? <MdOutlineAutoAwesome className="text-[#3b82f6] w-4 h-4" />
          : <HiOutlineUser className="text-[#3b82f6] w-4 h-4" />
        }
      </div>
      
      {/* Content */}
      <div className={`max-w-[78%] ${isAI ? '' : 'ml-auto'}`}>
        <div className={`
          rounded-2xl px-4 py-3
          ${isAI 
            ? 'bg-[#111113] border border-[#232326]' 
            : 'bg-[#3b82f6] text-white'
          }
        `}>
          {isAI ? (
            <div className="text-sm leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-lg font-semibold mb-2 mt-4 text-[#fafafa]">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-semibold mb-2 mt-3 text-[#fafafa]">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1.5 mt-3 text-[#fafafa]">{children}</h3>,
                  p: ({ children }) => <p className="mb-2 text-[#d4d4d8] leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-[#d4d4d8]">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-[#d4d4d8]">{children}</ol>,
                  li: ({ children }) => <li className="ml-2">{children}</li>,
                  strong: ({ children }) => <strong className="text-[#fafafa] font-semibold">{children}</strong>,
                  code: ({ className, children, ...props }) => {
                    const isBlock = className?.includes('language-')
                    const match = /language-(\w+)/.exec(className || '')
                    const codeStr = String(children).replace(/\n$/, '')
                    
                    if (isBlock) {
                      return (
                        <div className="my-3 rounded-xl overflow-hidden border border-[#232326] bg-[#0a0a0b]">
                          <div className="flex items-center justify-between px-4 py-2 bg-[#111113] border-b border-[#232326]">
                            <span className="text-xs text-[#71717a] font-mono font-medium">
                              {match?.[1] || 'code'}
                            </span>
                            <button
                              onClick={() => handleCopy(codeStr)}
                              className="text-[#71717a] hover:text-[#fafafa] transition-colors p-1 rounded-md hover:bg-[#232326]"
                            >
                              {copiedId === codeStr 
                                ? <FiCheck className="w-3.5 h-3.5 text-[#22c55e]" />
                                : <FiCopy className="w-3.5 h-3.5" />
                              }
                            </button>
                          </div>
                          <pre className="p-4 overflow-x-auto">
                            <code className={`${className} text-sm font-mono leading-relaxed text-[#d4d4d8]`} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      )
                    }
                    return (
                      <code className="bg-[#232326] text-[#3b82f6] px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children }) => <>{children}</>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-[#3b82f6]/30 pl-4 my-2 text-[#a1a1a7] italic">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3">
                      <table className="w-full border-collapse border border-[#232326] rounded-lg overflow-hidden">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-[#232326] bg-[#111113] px-4 py-2 text-left text-sm font-medium text-[#fafafa]">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-[#232326] px-4 py-2 text-sm text-[#d4d4d8]">
                      {children}
                    </td>
                  ),
                }}
              >
                {content || ''}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-[#3b82f6] animate-pulse ml-0.5 rounded-full align-middle opacity-70" />
              )}
            </div>
          ) : (
            <p className="text-sm leading-relaxed font-medium">{content}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
