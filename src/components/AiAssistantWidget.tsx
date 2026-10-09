import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { aiApi } from '../api'
import { errorMessage } from '../api/client'
import { useCity } from '../context/CityContext'
import { inr } from '../utils/format'
import type { AiChatResponse } from '../types'

interface Message {
  role: 'user' | 'assistant'
  text: string
  payload?: AiChatResponse
}

const STARTERS = [
  'My bathroom tap is leaking',
  'AC not cooling, need a service',
  'Deep cleaning for my apartment',
  'How does cancellation work?',
]

/**
 * Fixora AI Assistant.
 *
 * The widget always shows which mode answered. In fallback mode it says so, and
 * every service/price it mentions came from the backend catalogue — the widget
 * never guesses.
 */
export function AiAssistantWidget() {
  const { city } = useCity()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text:
        'Hi, I am the Fixora AI Assistant. Tell me what needs fixing — for example “my bathroom tap is leaking” — ' +
        'and I will point you to the right Fixora service with its real packages and prices.',
    },
  ])

  async function send(rawText: string) {
    const text = rawText.trim()
    if (!text || busy) return

    setMessages((current) => [...current, { role: 'user', text }])
    setInput('')
    setBusy(true)

    try {
      const response = await aiApi.chat({ message: text, city })
      setMessages((current) => [...current, { role: 'assistant', text: response.reply, payload: response }])
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: `I could not reach the Fixora API: ${errorMessage(error)}` },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-700"
        >
          <Sparkles className="h-4 w-4" />
          Ask Fixora AI
        </button>
      )}

      {open && (
        <section
          className="fixed bottom-5 right-5 z-40 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl"
          aria-label="Fixora AI Assistant"
        >
          <header className="flex items-center gap-2 border-b border-ink-100 bg-brand-600 px-4 py-3 text-white">
            <Bot className="h-4 w-4" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Fixora AI Assistant</p>
              <p className="text-[11px] text-brand-100">Answers come from the Fixora catalogue</p>
            </div>
            <button type="button" aria-label="Close assistant" onClick={() => setOpen(false)} className="rounded p-1 hover:bg-brand-700">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-ink-50 p-3">
            {messages.map((message, index) => (
              <div key={index} className={message.role === 'user' ? 'text-right' : ''}>
                <div
                  className={
                    message.role === 'user'
                      ? 'inline-block max-w-[85%] rounded-2xl bg-brand-600 px-3 py-2 text-left text-sm text-white'
                      : 'inline-block max-w-[92%] whitespace-pre-wrap rounded-2xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700'
                  }
                >
                  {message.text}
                </div>

                {message.payload && (
                  <div className="mt-1 space-y-1">
                    {message.payload.mode === 'fallback' && (
                      <p className="text-[10px] text-ink-400">
                        Deterministic mode — no external AI key configured, so this answer was matched from the Fixora
                        database.
                      </p>
                    )}
                    {message.payload.suggestedServices.slice(0, 3).map((service) => (
                      <Link
                        key={service.id}
                        to={`/services/${service.id}`}
                        className="block rounded-xl border border-ink-200 bg-white px-3 py-2 text-left text-xs hover:border-brand-300"
                        onClick={() => setOpen(false)}
                      >
                        <span className="font-semibold text-ink-800">{service.name}</span>
                        <span className="ml-2 text-ink-500">
                          from {inr(service.basePrice)} · {service.categoryName}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && <p className="text-xs text-ink-400">Checking the Fixora catalogue…</p>}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-ink-100 px-3 py-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => void send(starter)}
                  className="rounded-full border border-ink-200 px-2.5 py-1 text-[11px] text-ink-600 hover:border-brand-300 hover:text-brand-700"
                >
                  {starter}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex items-center gap-2 border-t border-ink-100 p-3"
            onSubmit={(event) => {
              event.preventDefault()
              void send(input)
            }}
          >
            <input
              className="input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Describe what you need…"
              aria-label="Message the Fixora AI assistant"
            />
            <button type="submit" className="btn-primary px-3" disabled={busy} aria-label="Send">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}
    </>
  )
}
