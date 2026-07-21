'use client'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MdOutlineAutoAwesome } from 'react-icons/md'
import { HiOutlineUser } from 'react-icons/hi2'
import { useState } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'

interface Props {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export default function ChatBubble({ role, content, isStreaming }: Props) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const isAI = role === 'assistant'

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex gap-4 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar - subtle */}
      <motion.div 
        whileHover={{ scale: 1.08 }}
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isAI 
            ? '' 
            : ''
        }`}
        style={{
          background: isAI ? 'rgba(88,166,255,0.06)' : 'rgba(88,166,255,0.08)',
          border: isAI ? '1px solid rgba(88,166,255,0.1)' : '1px solid rgba(88,166,255,0.12)',
        }}
      >
        {isAI 
          ? <MdOutlineAutoAwesome className="text-[#58a6ff] w-3.5 h-3.5" />
          : <HiOutlineUser className="text-[#58a6ff] w-3.5 h-3.5" />
        }
      </motion.div>
      
      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isAI ? 'pr-12' : 'pl-12'}`}>
        {isAI ? (
          <div className="text-[15px] leading-relaxed text-[#e6edf3]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-lg font-semibold mb-3 mt-6 text-[#e6edf3]">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold mb-2 mt-5 text-[#e6edf3]">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 mt-4 text-[#e6edf3]">{children}</h3>,
                p: ({ children }) => <p className="mb-3 text-[#c9d1d9] leading-[1.7]">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-outside mb-3 pl-5 space-y-1 text-[#c9d1d9]">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-outside mb-3 pl-5 space-y-1 text-[#c9d1d9]">{children}</ol>,
                li: ({ children }) => <li className="pl-1">{children}</li>,
                strong: ({ children }) => <strong className="text-[#e6edf3] font-semibold">{children}</strong>,
                a: ({ href, children }) => <a href={href} className="text-[#58a6ff] hover:underline underline-offset-2" target="_blank" rel="noopener">{children}</a>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#58a6ff]/20 pl-4 my-3 text-[#8b949e] italic">
                    {children}
                  </blockquote>
                ),
                code: ({ className, children, ...props }) => {
                  const isBlock = className?.includes('language-')
                  const match = /language-(\w+)/.exec(className || '')
                  const codeStr = String(children).replace(/\n$/, '')
                  
                  if (isBlock) {
                    return (
                      <div className="my-4 rounded-xl overflow-hidden" style={{ 
                        background: 'rgba(13,17,23,0.9)', 
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                      }}>
                        {/* Code header */}
                        <div className="flex items-center justify-between px-4 py-2.5" style={{ 
                          background: 'rgba(22,27,34,0.6)', 
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                        }}>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f56' }} />
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffbd2e' }} />
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#27c93f' }} />
                            </div>
                            <span className="text-[11px] text-[#484f58] font-medium ml-2">
                              {match?.[1] || 'code'}
                            </span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCopy(codeStr)}
                            className="p-1.5 rounded-md transition-colors"
                            style={{ background: 'rgba(255,255,255,0.03)' }}
                          >
                            {copiedCode === codeStr 
                              ? <FiCheck className="w-3 h-3 text-[#3fb950]" />
                              : <FiCopy className="w-3 h-3 text-[#484f58]" />
                            }
                          </motion.button>
                        </div>
                        {/* Code content */}
                        <div className="flex">
                          {/* Line numbers */}
                          <div className="select-none py-4 pl-4 pr-3 text-right text-xs font-mono leading-[1.7] text-[#30363d]" style={{ 
                            background: 'rgba(255,255,255,0.01)',
                            borderRight: '1px solid rgba(255,255,255,0.03)',
                            minWidth: '3rem',
                          }}>
                            {codeStr.split('\n').map((_, i) => (
                              <div key={i}>{i + 1}</div>
                            ))}
                          </div>
                          {/* Code */}
                          <pre className="p-4 overflow-x-auto flex-1" style={{ background: 'transparent' }}>
                            <code className={`${className} text-sm font-mono leading-[1.7] text-[#c9d1d9]`} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <code className="px-1.5 py-0.5 rounded-md text-[13px] font-mono text-[#58a6ff]" style={{ 
                      background: 'rgba(88,166,255,0.08)',
                      border: '1px solid rgba(88,166,255,0.1)',
                    }} {...props}>
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => <>{children}</>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <table className="w-full border-collapse text-sm">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#e6edf3]" style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2.5 text-[#c9d1d9]" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {children}
                  </td>
                ),
              }}
            >
              {content || ''}
            </ReactMarkdown>
            
            {/* Streaming cursor */}
            {isStreaming && (
              <motion.span 
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="inline-block w-[7px] h-[18px] ml-0.5 rounded-sm align-text-bottom"
                style={{ background: '#58a6ff' }}
              />
            )}
          </div>
        ) : (
          <div className="flex justify-end">
            <p className="text-[15px] leading-relaxed inline-block px-4 py-2.5 rounded-2xl font-medium"
              style={{ 
                background: 'rgba(88,166,255,0.1)',
                border: '1px solid rgba(88,166,255,0.12)',
                color: '#e6edf3',
                maxWidth: '85%',
              }}
            >
              {content}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
