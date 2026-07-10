'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import {
  CompareCard,
  FlexibleDatesCard,
  MultiCityCard,
  SaveTripCard,
  SearchFlightsCard,
  SeasonalTrendsCard,
  ToolLoading,
} from '@/components/chat/tool-cards'

/* eslint-disable @typescript-eslint/no-explicit-any */

const SUGGESTIONS = [
  'Find me a flight from New York to London in 3 weeks',
  'Is it cheaper to fly to Tokyo with a layover?',
  'When is the best time of year to fly to Sydney?',
  'Plan a trip: NYC to Paris, Paris to Rome, Rome back to NYC next month',
]

function ToolPart({ part }: { part: any }) {
  const name = part.type.replace('tool-', '')
  if (part.state === 'output-available') {
    switch (name) {
      case 'searchFlights':
        return <SearchFlightsCard output={part.output} />
      case 'planMultiCity':
        return <MultiCityCard output={part.output} />
      case 'compareDirectVsConnecting':
        return <CompareCard output={part.output} />
      case 'flexibleDates':
        return <FlexibleDatesCard output={part.output} />
      case 'seasonalTrends':
        return <SeasonalTrendsCard output={part.output} />
      case 'saveTrip':
        return <SaveTripCard output={part.output} />
      default:
        return null
    }
  }
  if (part.state === 'output-error') {
    return <p className="text-sm text-destructive">Tool failed: {part.errorText}</p>
  }
  return <ToolLoading name={name} />
}

export function ChatPanel({
  conversationId,
  initialMessages,
}: {
  conversationId: string
  initialMessages: UIMessage[]
}) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { conversationId },
    }),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || status !== 'ready') return
    sendMessage({ text: trimmed })
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {messages.length === 0 && (
            <div className="flex flex-col gap-4 pt-8">
              <p className="micro-label" style={{ color: '#C9A96A' }}>
                AI TRAVEL COMPANION
              </p>
              <h2
                className="text-balance"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  fontWeight: 500,
                  lineHeight: 1.1,
                  color: '#F4F1EA',
                }}
              >
                Where would you like to <em style={{ color: '#C9A96A' }}>go</em>?
              </h2>
              <div
                className="h-px w-20"
                style={{ background: 'rgba(201, 169, 106, 0.5)' }}
                aria-hidden="true"
              />
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-body)', color: '#8A8378' }}
              >
                I can search flights, compare direct vs connecting routes, scan
                flexible dates, analyze seasonal pricing, and plan multi-city
                itineraries — personalized to your preferences.
              </p>
              <ul className="flex flex-col gap-2.5">
                {SUGGESTIONS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => submit(s)}
                      className="liquid-glass w-full px-4 py-3 text-left text-sm transition-colors duration-500 hover:text-primary"
                      style={{ fontFamily: 'var(--font-body)', color: '#F4F1EA' }}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {message.parts.map((part: any, i: number) => {
                if (part.type === 'text') {
                  return message.role === 'user' ? (
                    <p
                      key={i}
                      className="max-w-[85%] rounded-md px-4 py-2.5 text-sm leading-relaxed"
                      style={{
                        fontFamily: 'var(--font-body)',
                        background: 'linear-gradient(135deg, #C9A96A, #B8965A)',
                        color: '#0A0908',
                      }}
                    >
                      {part.text}
                    </p>
                  ) : (
                    <p
                      key={i}
                      className="max-w-[92%] whitespace-pre-wrap text-sm leading-relaxed"
                      style={{ fontFamily: 'var(--font-body)', color: '#F4F1EA' }}
                    >
                      {part.text}
                    </p>
                  )
                }
                if (part.type.startsWith('tool-')) {
                  return (
                    <div key={i} className="w-full max-w-[92%]">
                      <ToolPart part={part} />
                    </div>
                  )
                }
                return null
              })}
            </div>
          ))}

          {status === 'submitted' && (
            <p className="micro-label flex items-center gap-2" style={{ color: '#8A8378' }}>
              <span
                className="size-1.5 animate-pulse rounded-full"
                style={{ background: '#C9A96A' }}
                aria-hidden="true"
              />
              THINKING...
            </p>
          )}
          {(error || status === 'error') && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-destructive">
                AI request failed
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                {error?.message ||
                  'The AI model could not be reached. Please try again.'}
              </p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="liquid-glass-bar border-t border-border px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(input)
          }}
          className="mx-auto flex max-w-3xl items-center gap-2"
        >
          <label htmlFor="chat-input" className="sr-only">
            Message the AI travel companion
          </label>
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !(e.nativeEvent.isComposing || e.keyCode === 229)
              ) {
                e.preventDefault()
                submit(input)
              }
            }}
            placeholder="Ask about flights, prices, or trip plans..."
            autoComplete="off"
            className="lux-input flex-1"
          />
          <button
            type="submit"
            disabled={status !== 'ready' || !input.trim()}
            className="editorial-btn editorial-btn--solid px-5 py-2.5 disabled:opacity-50"
            style={{ fontSize: '0.625rem' }}
          >
            <span>SEND</span>
            <span className="arrow">↗</span>
          </button>
        </form>
      </div>
    </div>
  )
}
