'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/sidebar/Sidebar'
import ChatBubble from '@/components/chat/ChatBubble'
import ChatInput from '@/components/chat/ChatInput'
import { useChat } from '@/hooks/useChat'
import { motion } from 'framer-motion'
import { MdOutlineAutoAwesome } from 'react-icons/md'
import { FiCode, FiZap, FiTerminal, FiBookOpen } from 'react-icons/fi'

const MODELS = [
  { id: 'noderouter/gpt-5.5' },
  { id: 'noderouter/deepseek-reasoner' },
  { id: 'noderouter/grok-4-fast-reasoning' },
  { id: 'noderouter/qwen-3.6-plus' },
  { id: 'noderouter/deepseek-v3.2' },
  { id: 'noderouter/gemini-3-flash' },
]

const suggestions = [
  { icon: FiCode, label: 'Generate code', query: 'Write a React component with TypeScript' },
  { icon: FiZap, label: 'Optimize', query: 'Optimize this code for performance' },
  { icon: FiTerminal, label: 'Debug', query: 'Help me debug this error' },
  { icon: FiBookOpen, label: 'Explain', query: 'Explain how this code works' },
]

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { messages, isStreaming, sendMessage, selectedModel, setSelectedModel, setMessages } = useChat()
  const [chats, setChats] = useState([{ id: '1', title: 'New Chat' }])
  const [activeChat, setActiveChat] = useState('1')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleNewChat = () => {
    const newChat = { id: Date.now().toString(), title: 'New Chat' }
    setChats(prev => [newChat, ...prev])
    setActiveChat(newChat.id)
    setMessages([])
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: '#0d1117' }}>
      {/* Subtle background aura */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(88,166,255,0.04) 0%, transparent 50%),
          radial-gradient(ellipse 40% 40% at 100% 80%, rgba(88,166,255,0.02) 0%, transparent 50%),
          radial-gradient(ellipse 40% 40% at 0% 80%, rgba(88,166,255,0.01) 0%, transparent 50%)
        `,
      }} />

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chats={chats}
        activeChat={activeChat}
        onNewChat={handleNewChat}
        onSelectChat={setActiveChat}
        models={MODELS}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center max-w-lg mx-auto px-6"
            >
              <motion.div 
                animate={{ 
                  boxShadow: [
                    '0 0 0 0px rgba(88,166,255,0)', 
                    '0 0 0 8px rgba(88,166,255,0.03)', 
                    '0 0 0 0px rgba(88,166,255,0)'
                  ],
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                style={{ 
                  background: 'rgba(88,166,255,0.06)', 
                  border: '1px solid rgba(88,166,255,0.1)',
                }}
              >
                <MdOutlineAutoAwesome className="text-[#58a6ff] w-7 h-7" />
              </motion.div>
              
              <h1 className="text-3xl font-semibold mb-2 tracking-tight text-[#e6edf3]">
                Ciken AI
              </h1>
              <p className="text-[#8b949e] text-sm font-medium mb-10">
                Intelligent code assistant powered by advanced AI
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((item, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * i, duration: 0.3 }}
                    onClick={() => sendMessage(item.query)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left group transition-all"
                    style={{ 
                      background: 'rgba(255,255,255,0.015)', 
                      border: '1px solid rgba(255,255,255,0.03)',
                    }}
                    whileHover={{ 
                      background: 'rgba(88,166,255,0.04)', 
                      borderColor: 'rgba(88,166,255,0.12)',
                    }}
                  >
                    <item.icon className="w-4 h-4 text-[#484f58] group-hover:text-[#58a6ff] transition-colors flex-shrink-0" />
                    <span className="text-xs text-[#8b949e] group-hover:text-[#c9d1d9] transition-colors font-medium">
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto relative z-10">
            <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
              {messages.map((msg, i) => (
                <ChatBubble
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isStreaming && i === messages.length - 1}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        )}

        <ChatInput onSend={sendMessage} isStreaming={isStreaming} />
      </main>
    </div>
  )
}
