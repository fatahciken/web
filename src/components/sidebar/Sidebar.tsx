'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageSquare, Settings, ChevronLeft, Bot } from 'lucide-react'
import { useState } from 'react'

interface Props {
  isOpen: boolean
  onToggle: () => void
  chats: { id: string; title: string }[]
  activeChat: string | null
  onNewChat: () => void
  onSelectChat: (id: string) => void
}

export default function Sidebar({ isOpen, onToggle, chats, activeChat, onNewChat, onSelectChat }: Props) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed md:relative z-40 w-80 h-full bg-[#0a0a0a] border-r border-[#1a1a2e] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#1a1a2e]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="text-blue-500" size={24} />
                  <h1 className="text-lg font-bold text-white">CIKEN AI</h1>
                </div>
                <button onClick={onToggle} className="text-gray-400 hover:text-white p-1">
                  <ChevronLeft size={20} />
                </button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNewChat}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Plus size={18} />
                New Chat
              </motion.button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-2">
              <p className="text-xs text-gray-500 px-3 py-2 uppercase tracking-wider">Recent Chats</p>
              {chats.map((chat, i) => (
                <motion.button
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left px-3 py-3 rounded-xl mb-1 flex items-center gap-3 text-sm transition-colors ${
                    activeChat === chat.id
                      ? 'bg-[#1a1a2e] text-white'
                      : 'text-gray-400 hover:bg-[#111] hover:text-white'
                  }`}
                >
                  <MessageSquare size={16} />
                  <span className="truncate">{chat.title}</span>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#1a1a2e]">
              <button className="w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 text-sm text-gray-400 hover:bg-[#111] hover:text-white transition-colors">
                <Settings size={16} />
                Settings
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle button when closed */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2 bg-[#1a1a2e] rounded-xl border border-[#2a2a3e] text-gray-400 hover:text-white"
        >
          <ChevronLeft size={20} className="rotate-180" />
        </motion.button>
      )}
    </>
  )
}
