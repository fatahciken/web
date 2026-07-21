'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { 
  FiPlus, FiMessageSquare, FiChevronLeft, 
  FiSettings, FiCommand, FiChevronDown, FiZap 
} from 'react-icons/fi'
import { MdOutlineAutoAwesome } from 'react-icons/md'

interface Props {
  isOpen: boolean
  onToggle: () => void
  chats: { id: string; title: string }[]
  activeChat: string | null
  onNewChat: () => void
  onSelectChat: (id: string) => void
  models: { id: string }[]
  selectedModel: string
  onSelectModel: (model: string) => void
}

export default function Sidebar({ isOpen, onToggle, chats, activeChat, onNewChat, onSelectChat, models, selectedModel, onSelectModel }: Props) {
  const [modelOpen, setModelOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed md:relative z-40 w-[280px] h-full bg-[#0a0a0b] border-r border-[#232326] flex flex-col"
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-[#232326]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center">
                    <MdOutlineAutoAwesome className="text-[#3b82f6] w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="text-sm font-semibold text-[#fafafa] tracking-tight">Ciken AI</h1>
                    <p className="text-[10px] text-[#71717a] font-medium">Code Assistant</p>
                  </div>
                </div>
                <button 
                  onClick={onToggle} 
                  className="text-[#71717a] hover:text-[#fafafa] p-1.5 rounded-lg hover:bg-[#111113] transition-colors"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onNewChat}
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                New Chat
              </motion.button>
            </div>

            {/* Model Selector */}
            <div className="px-4 py-3 border-b border-[#232326]">
              <p className="text-[10px] text-[#71717a] uppercase tracking-wider font-semibold mb-2 px-1">
                Model
              </p>
              <button
                onClick={() => setModelOpen(!modelOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#111113] border border-[#232326] hover:border-[#3b82f6]/30 text-sm transition-all group"
              >
                <span className="text-[#d4d4d8] text-xs truncate font-medium">
                  {selectedModel.replace('noderouter/', '')}
                </span>
                <FiChevronDown className={`w-3.5 h-3.5 text-[#71717a] transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {modelOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 space-y-0.5 overflow-hidden"
                  >
                    {models.map(m => (
                      <button
                        key={m.id}
                        onClick={() => { onSelectModel(m.id); setModelOpen(false) }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                          selectedModel === m.id 
                            ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20' 
                            : 'text-[#a1a1a7] hover:bg-[#111113] hover:text-[#fafafa]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FiZap className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{m.id.replace('noderouter/', '')}</span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <p className="text-[10px] text-[#71717a] uppercase tracking-wider font-semibold mb-2 px-2">
                History
              </p>
              <div className="space-y-0.5">
                {chats.map((chat, i) => (
                  <motion.button
                    key={chat.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => onSelectChat(chat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-all group ${
                      activeChat === chat.id
                        ? 'bg-[#111113] border border-[#232326]'
                        : 'hover:bg-[#111113] border border-transparent'
                    }`}
                  >
                    <FiMessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${
                      activeChat === chat.id ? 'text-[#3b82f6]' : 'text-[#71717a]'
                    }`} />
                    <span className={`text-xs truncate font-medium ${
                      activeChat === chat.id ? 'text-[#fafafa]' : 'text-[#a1a1a7]'
                    }`}>
                      {chat.title}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[#232326]">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#a1a1a7] hover:bg-[#111113] hover:text-[#fafafa] transition-all">
                <FiSettings className="w-4 h-4" />
                <span className="text-xs font-medium">Settings</span>
                <span className="ml-auto text-[10px] text-[#71717a] bg-[#111113] px-1.5 py-0.5 rounded border border-[#232326]">
                  <FiCommand className="w-3 h-3 inline mr-0.5" />S
                </span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle when closed */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2 bg-[#111113] rounded-xl border border-[#232326] text-[#a1a1a7] hover:text-[#fafafa] hover:border-[#3b82f6]/30 transition-all"
        >
          <FiChevronLeft className="w-4 h-4 rotate-180" />
        </motion.button>
      )}
    </>
  )
}
