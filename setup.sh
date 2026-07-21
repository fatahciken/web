#!/bin/bash
set -e

echo "🚀 CIKEN AI - Setup Lengkap Frontend + Backend Python"
echo "======================================================"

# ==================== BACKEND PYTHON ====================
echo "📦 [1/8] Setup Backend Python..."

mkdir -p backend
cat > backend/server.py << 'BACKEOF'
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_BASE = "https://noderouter.groups.id/v1"
API_KEY = os.getenv("API_KEY", "sk-anything")

@app.get("/api/models")
async def get_models():
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{API_BASE}/models", headers={"Authorization": f"Bearer {API_KEY}"})
        return res.json()

@app.post("/api/chat")
async def chat(request: Request):
    body = await request.json()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    if body.get("stream"):
        async def stream_response():
            async with httpx.AsyncClient() as client:
                async with client.stream("POST", f"{API_BASE}/chat/completions", json=body, headers=headers) as res:
                    async for chunk in res.aiter_text():
                        if chunk.startswith("data: "):
                            yield chunk + "\n\n"
        
        return StreamingResponse(stream_response(), media_type="text/event-stream")
    else:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{API_BASE}/chat/completions", json=body, headers=headers)
            return res.json()

@app.get("/")
async def root():
    return {"status": "CIKEN AI Backend Running 🚀"}
BACKEOF

cat > backend/requirements.txt << 'REQEOF'
fastapi==0.104.1
uvicorn==0.24.0
httpx==0.25.2
python-dotenv==1.0.0
REQEOF

cat > backend/Procfile << 'PROCEOF'
web: uvicorn server:app --host 0.0.0.0 --port $PORT
PROCEOF

echo "✅ Backend selesai"

# ==================== FRONTEND ====================
echo "🎨 [2/8] Setup Next.js Frontend..."

npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm 2>/dev/null || true
cd frontend

# Install dependencies
echo "📚 [3/8] Install Dependencies..."
npm install framer-motion react-markdown remark-gfm rehype-highlight lucide-react @tanstack/react-query date-fns
npm install -D @types/node

# Setup shadcn/ui
echo "🎯 [4/8] Setup shadcn/ui..."
npx shadcn@latest init -y -d 2>/dev/null || true
npx shadcn@latest add button input textarea scroll-area separator sheet dialog dropdown-menu tooltip avatar -y 2>/dev/null || true

# Install shiki
echo "💎 [5/8] Install Shiki..."
npm install shiki

# Create folder structure
echo "📁 [6/8] Create Structure..."
mkdir -p src/components/{sidebar,chat,ui,markdown,animations}
mkdir -p src/hooks
mkdir -p src/lib

# ==================== LIB FILES ====================
echo "📝 [7/8] Writing Code..."

# API Client
cat > src/lib/api.ts << 'APIEOF'
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export async function fetchModels() {
  const res = await fetch(`${API_URL}/models`)
  return res.json()
}

export async function sendMessage(messages: any[], model: string, stream: boolean = true, tools?: any[]) {
  const body: any = { model, messages, stream }
  if (tools) body.tools = tools
  
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  
  if (stream) {
    return res.body
  }
  return res.json()
}
APIEOF

# Hooks
cat > src/hooks/useChat.ts << 'HOOKEOF'
'use client'
import { useState, useRef, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  tool_calls?: any[]
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState('noderouter/gpt-5.5')
  const abortRef = useRef<AbortController>()

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setIsStreaming(true)

    const aiMsg: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, aiMsg])

    try {
      abortRef.current = new AbortController()
      const stream = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...messages, userMsg],
          stream: true,
        }),
        signal: abortRef.current.signal,
      })

      const reader = stream.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content
              if (delta) {
                setMessages(prev => {
                  const updated = [...prev]
                  const lastIdx = updated.length - 1
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    content: updated[lastIdx].content + delta,
                  }
                  return updated
                })
              }
            } catch {}
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Stream error:', error)
      }
    } finally {
      setIsStreaming(false)
    }
  }, [messages, selectedModel])

  return { messages, isStreaming, sendMessage, selectedModel, setSelectedModel, setMessages }
}
HOOKEOF

# UI Components
cat > src/components/chat/ChatBubble.tsx << 'BUBEOF'
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
BUBEOF

# Sidebar
cat > src/components/sidebar/Sidebar.tsx << 'SIDEOF'
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
SIDEOF

# Chat Input
cat > src/components/chat/ChatInput.tsx << 'INPUTEOF'
'use client'
import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  onSend: (message: string) => void
  isStreaming: boolean
}

export default function ChatInput({ onSend, isStreaming }: Props) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <motion.form
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      onSubmit={handleSubmit}
      className="border-t border-[#1a1a2e] bg-[#0a0a0a] p-4"
    >
      <div className="max-w-4xl mx-auto flex gap-3 items-end">
        <div className="flex-1 bg-[#111] border border-[#2a2a3e] rounded-2xl flex items-end overflow-hidden focus-within:border-blue-500/50 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
            placeholder="Ask me anything about code..."
            rows={1}
            className="flex-1 bg-transparent text-white px-4 py-3 resize-none outline-none placeholder:text-gray-500 text-sm max-h-32"
            disabled={isStreaming}
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {isStreaming ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </motion.button>
      </div>
    </motion.form>
  )
}
INPUTEOF

# Main Page
cat > src/app/page.tsx << 'PAGEEOF'
'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/sidebar/Sidebar'
import ChatBubble from '@/components/chat/ChatBubble'
import ChatInput from '@/components/chat/ChatInput'
import { useChat } from '@/hooks/useChat'
import { Bot, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { messages, isStreaming, sendMessage, setMessages } = useChat()
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
                <ChatBubble key={i} role={msg.role} content={msg.content} isStreaming={isStreaming && i === messages.length - 1} />
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
PAGEEOF

# Layout
cat > src/app/layout.tsx << 'LAYEOF'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'CIKEN AI - Coding Assistant',
  description: 'AI-powered coding assistant with multiple models',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
LAYEOF

# Global CSS
cat > src/app/globals.css << 'CSSEOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 3.5%;
    --foreground: 0 0% 98%;
    --card: 0 0% 6%;
    --card-foreground: 0 0% 98%;
    --border: 0 0% 15%;
    --primary: 217 100% 65%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 63%;
    --muted: 0 0% 10%;
    --muted-foreground: 0 0% 63%;
    --radius: 0.75rem;
  }

  * {
    border-color: hsl(var(--border));
  }

  body {
    background: hsl(var(--background));
    color: hsl(var(--foreground));
  }
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}

pre {
  font-family: 'JetBrains Mono', monospace;
}

.aurora-bg {
  background: radial-gradient(ellipse at top, rgba(79, 140, 255, 0.08), transparent 50%),
              radial-gradient(ellipse at bottom, rgba(147, 51, 234, 0.05), transparent 50%);
}
CSSEOF

# Next Config
cat > next.config.js << 'NEXTCONF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig
NEXTCONF

# Tailwind Config
cat > tailwind.config.ts << 'TAILEOF'
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
TAILEOF

cd ..

# ==================== VERCEl CONFIG ====================
echo "⚙️ [8/8] Setup Vercel Config..."

cat > vercel.json << 'VERCELEOF'
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://ciken-backend.vercel.app/api/:path*"
    }
  ]
}
VERCELEOF

# Create .env files
cat > frontend/.env.local << 'ENVEOF'
NEXT_PUBLIC_API_URL=https://ciken-backend.vercel.app
ENVEOF

cat > backend/.env << 'BENVEOF'
API_KEY=sk-anything
BENVEOF

# ==================== DONE ====================
echo ""
echo "✨ SETUP COMPLETE! ✨"
echo "======================"
echo ""
echo "📁 Struktur Project:"
echo "  ├── frontend/    (Next.js 15 + Tailwind + shadcn/ui)"
echo "  ├── backend/     (FastAPI Python)"
echo "  └── vercel.json  (Vercel config)"
echo ""
echo "🚀 Untuk menjalankan lokal:"
echo "  Terminal 1 (Backend): cd backend && pip install -r requirements.txt && uvicorn server:app --reload"
echo "  Terminal 2 (Frontend): cd frontend && npm run dev"
echo ""
echo "🌐 Buka: http://localhost:3000"
echo ""
echo "📦 Push ke GitHub dan deploy ke Vercel:"
echo "  git add . && git commit -m 'CIKEN AI Setup' && git push"
echo ""
echo "Domain kamu nanti: fatahciken.vercel.app"
