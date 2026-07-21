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
