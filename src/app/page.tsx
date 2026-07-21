'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/sidebar/Sidebar'
import ChatBubble from '@/components/chat/ChatBubble'
import ChatInput from '@/components/chat/ChatInput'
import { useChat } from '@/hooks/useChat'
import { Bot, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden">
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

      <main className="flex-1 flex flex-col min-w-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="inline-block mb-6"
              >
                <Bot size={64} className="text-blue-500" />
              </motion.div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                CIKEN AI
              </h1>
              <p className="text-gray-400 flex items-center gap-2 justify-center">
                <Sparkles size={16} className="text-yellow-400" />
                Your AI Coding Assistant
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="max-w-3xl mx-auto">
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
