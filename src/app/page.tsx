'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/sidebar/Sidebar'
import ChatBubble from '@/components/chat/ChatBubble'
import ChatInput from '@/components/chat/ChatInput'
import { useChat } from '@/hooks/useChat'
import { motion } from 'framer-motion'
import { HiOutlineSparkles } from 'react-icons/hi2'
import { MdOutlineAutoAwesome } from 'react-icons/md'

const MODELS = [
  { id: 'noderouter/gpt-5.5' },
  { id: 'noderouter/deepseek-reasoner' },
  { id: 'noderouter/grok-4-fast-reasoning' },
  { id: 'noderouter/qwen-3.6-plus' },
  { id: 'noderouter/deepseek-v3.2' },
  { id: 'noderouter/gemini-3-flash' },
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
    <div className="flex h-screen bg-[#0a0a0b] text-[#fafafa] overflow-hidden font-sans">
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
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#111113] border border-[#232326] mb-6">
                <MdOutlineAutoAwesome className="text-[#3b82f6] w-8 h-8" />
              </div>
              <h1 className="text-4xl font-semibold mb-3 tracking-tight">
                Ciken AI
              </h1>
              <p className="text-[#a1a1a7] text-sm font-medium flex items-center gap-2 justify-center">
                <HiOutlineSparkles className="text-[#3b82f6] w-4 h-4" />
                Intelligent Code Assistant
              </p>
              
              <div className="mt-10 grid grid-cols-2 gap-3 max-w-md mx-auto">
                {[
                  { icon: '{}', label: 'Code Generation' },
                  { icon: '<>', label: 'Debug & Fix' },
                  { icon: '()', label: 'Refactor Code' },
                  { icon: '##', label: 'Documentation' },
                ].map((item, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    onClick={() => sendMessage(item.label)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#232326] bg-[#111113] hover:border-[#3b82f6]/30 hover:bg-[#18181b] transition-all text-left group"
                  >
                    <span className="text-[#3b82f6] text-xs font-mono bg-[#3b82f6]/10 px-2 py-1 rounded-md group-hover:bg-[#3b82f6]/20 transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-sm text-[#a1a1a7] group-hover:text-[#fafafa] transition-colors font-medium">
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto relative z-10">
            <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
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
