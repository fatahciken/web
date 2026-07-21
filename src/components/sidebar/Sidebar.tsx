'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { 
  FiPlus, FiMessageSquare, FiChevronLeft, 
  FiSettings, FiCommand, FiChevronDown, FiZap,
  FiSearch
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

const springConfig = { type: "spring" as const, stiffness: 400, damping: 35 }

export default function Sidebar({ isOpen, onToggle, chats, activeChat, onNewChat, onSelectChat, models, selectedModel, onSelectModel }: Props) {
  const [modelOpen, setModelOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={springConfig}
            className="fixed md:relative z-50 w-[272px] h-full flex flex-col"
            style={{ 
              background: 'rgba(13, 17, 23, 0.65)',
              backdropFilter: 'blur(24px) saturate(140%)',
              WebkitBackdropFilter: 'blur(24px) saturate(140%)',
              borderRight: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            {/* Subtle inner glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at top, rgba(88,166,255,0.04) 0%, transparent 50%)',
              }}
            />

            {/* Header */}
            <div className="relative px-5 pt-5 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(88,166,255,0.1)', border: '1px solid rgba(88,166,255,0.15)' }}
                  >
                    <MdOutlineAutoAwesome className="text-[#58a6ff] w-3.5 h-3.5" />
                  </motion.div>
                  <span className="text-sm font-semibold text-[#e6edf3] tracking-tight">Ciken AI</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggle} 
                  className="p-1.5 rounded-lg hover:bg-white/5 text-[#8b949e] hover:text-[#e6edf3]"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" />
                </motion.button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(88,166,255,0.15)' }}
                whileTap={{ scale: 0.98 }}
                onClick={onNewChat}
                className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs font-semibold transition-colors"
                style={{ background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.12)', color: '#58a6ff' }}
              >
                <FiPlus className="w-3.5 h-3.5" />
                New Chat
              </motion.button>
            </div>

            {/* Model Selector */}
            <div className="relative px-5 pb-4">
              <button
                onClick={() => setModelOpen(!modelOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <span className="text-[#8b949e] font-medium truncate">
                  {selectedModel.replace('noderouter/', '')}
                </span>
                <motion.span animate={{ rotate: modelOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FiChevronDown className="w-3 h-3 text-[#6e7681]" />
                </motion.span>
              </button>
              <AnimatePresence>
                {modelOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 space-y-0.5 overflow-hidden rounded-lg"
                    style={{ background: 'rgba(22,27,34,0.8)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    {models.map((m, i) => (
                      <motion.button
                        key={m.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => { onSelectModel(m.id); setModelOpen(false) }}
                        className="w-full text-left px-3 py-2 text-xs transition-all flex items-center gap-2"
                        style={{
                          color: selectedModel === m.id ? '#58a6ff' : '#8b949e',
                          background: selectedModel === m.id ? 'rgba(88,166,255,0.06)' : 'transparent',
                        }}
                      >
                        <FiZap className="w-2.5 h-2.5 flex-shrink-0 opacity-60" />
                        <span className="truncate">{m.id.replace('noderouter/', '')}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search */}
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#6e7681]"
                style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <FiSearch className="w-3 h-3" />
                <span>Search chats...</span>
                <span className="ml-auto text-[10px] opacity-40">
                  <FiCommand className="w-2.5 h-2.5 inline" />F
                </span>
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 relative">
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold mb-2 px-2">History</p>
              <div className="space-y-0.5">
                {chats.map((chat, i) => (
                  <motion.button
                    key={chat.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, ...springConfig }}
                    onClick={() => onSelectChat(chat.id)}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-all group"
                    style={{
                      background: activeChat === chat.id ? 'rgba(255,255,255,0.03)' : 'transparent',
                    }}
                  >
                    <FiMessageSquare className="w-3 h-3 flex-shrink-0" style={{ color: activeChat === chat.id ? '#58a6ff' : '#484f58' }} />
                    <span className="text-xs truncate font-medium" style={{ color: activeChat === chat.id ? '#e6edf3' : '#8b949e' }}>
                      {chat.title}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="relative px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#8b949e] hover:bg-white/[0.02] hover:text-[#e6edf3] transition-all">
                <FiSettings className="w-3.5 h-3.5" />
                <span className="font-medium">Settings</span>
                <span className="ml-auto text-[10px] opacity-40" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: '4px' }}>
                  <FiCommand className="w-2.5 h-2.5 inline mr-0.5" />S
                </span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle button when closed */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2 rounded-xl text-[#8b949e] hover:text-[#e6edf3]"
          style={{ 
            background: 'rgba(22,27,34,0.8)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <FiChevronLeft className="w-3.5 h-3.5 rotate-180" />
        </motion.button>
      )}
    </>
  )
}
