'use client'

import { useState } from 'react'
import useSWR from 'swr'
import type { UIMessage } from 'ai'
import { ChatPanel } from '@/components/chat/chat-panel'

type Conversation = { id: string; title: string; updated_at: string }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ChatShell({ initialConversationId }: { initialConversationId: string }) {
  const [activeId, setActiveId] = useState(initialConversationId)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: convData, mutate: mutateConvs } = useSWR<{
    conversations: Conversation[]
  }>('/api/conversations', fetcher)

  const { data: msgData, isLoading: messagesLoading } = useSWR<{
    messages: UIMessage[]
  }>(`/api/conversations/${activeId}/messages`, fetcher, {
    revalidateOnFocus: false,
  })

  const newConversation = async () => {
    const res = await fetch('/api/conversations', { method: 'POST' })
    if (!res.ok) return
    const json = await res.json()
    setActiveId(json.conversation.id)
    mutateConvs()
    setSidebarOpen(false)
  }

  const conversations = convData?.conversations ?? []

  return (
    <div className="flex h-[calc(100dvh-3.5rem)]">
      <aside
        aria-label="Conversations"
        className={`${
          sidebarOpen ? 'flex' : 'hidden'
        } liquid-glass-bar absolute z-30 h-full w-64 flex-col border-r border-border md:static md:flex`}
      >
        <div className="flex items-center justify-between border-b border-border p-3">
          <span className="micro-label" style={{ color: '#8A8378' }}>
            CONVERSATIONS
          </span>
          <button
            type="button"
            onClick={newConversation}
            className="editorial-btn px-2 py-1"
            style={{ fontSize: '0.5625rem', borderColor: 'rgba(201, 169, 106, 0.3)' }}
          >
            <span>NEW</span>
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto p-2">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  setActiveId(c.id)
                  setSidebarOpen(false)
                }}
                className={`w-full truncate rounded-sm px-3 py-2 text-left text-sm transition-colors duration-500 ${
                  c.id === activeId
                    ? 'bg-accent text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {c.title || 'New conversation'}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-expanded={sidebarOpen}
            className="editorial-btn px-3 py-1"
            style={{ fontSize: '0.5625rem', color: '#8A8378' }}
          >
            <span>{sidebarOpen ? 'CLOSE' : 'HISTORY'}</span>
          </button>
        </div>
        {messagesLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="micro-label animate-pulse" style={{ color: '#8A8378' }}>
              LOADING CONVERSATION...
            </p>
          </div>
        ) : (
          <ChatPanel
            key={activeId}
            conversationId={activeId}
            initialMessages={msgData?.messages ?? []}
          />
        )}
      </div>
    </div>
  )
}
