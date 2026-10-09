import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Info, Sparkles } from 'lucide-react'
import { aiApi } from '../api'
import { errorMessage } from '../api/client'
import { PackageCard } from '../components/Cards'
import { useCity } from '../context/CityContext'
import { inr } from '../utils/format'
import type { AiChatResponse } from '../types'

interface Turn {
  role: 'user' | 'assistant'
  text: string
  payload?: AiChatResponse
}

const EXAMPLES = [
  'My bathroom tap is leaking.',
  'I need deep cleaning for my apartment.',
  'Find laptop repair under 1000.',
  'My AC is not cooling.',
  'How does cancellation work?',
  'I want to become a provider.',
]

export default function AssistantPage() {
  const { city } = useCity()
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)

  async function ask(question: string) {
    const message = question.trim()
    if (!message || busy) return

    setTurns((current) => [...current, { role: 'user', text: message }])
    setInput('')
    setBusy(true)
    try {
      const response = await aiApi.chat({ message, city })
      setTurns((current) => [...current, { role: 'assistant', text: response.reply, payload: response }])
    } catch (error) {
      setTurns((current) => [...current, { role: 'assistant', text: `Request failed: ${errorMessage(error)}` }])
    } finally {
      setBusy(false)
    }
  }

  const lastPayload = [...turns].reverse().find((turn) => turn.payload)?.payload

  return (
    <div className="container-page py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink-900">
        <Sparkles className="h-6 w-6 text-brand-600" />
        Fixora AI Assistant
      </h1>
      <p className="muted mt-1">
        Describe the problem in your own words. The assistant matches it against the live Fixora catalogue and answers
        with real services, real packages and real prices.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="card flex h-[32rem] flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto bg-ink-50 p-4">
            {turns.length === 0 && (
              <div className="rounded-2xl border border-ink-200 bg-white p-4 text-sm text-ink-600">
                <p className="font-semibold text-ink-900">Try one of these</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      className="rounded-full border border-ink-200 px-3 py-1.5 text-xs hover:border-brand-300 hover:text-brand-700"
                      onClick={() => void ask(example)}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {turns.map((turn, index) => (
              <div key={index} className={turn.role === 'user' ? 'text-right' : ''}>
                <div
                  className={
                    turn.role === 'user'
                      ? 'inline-block max-w-[85%] rounded-2xl bg-brand-600 px-4 py-2.5 text-left text-sm text-white'
                      : 'inline-block max-w-[95%] whitespace-pre-wrap rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-700'
                  }
                >
                  {turn.text}
                </div>
              </div>
            ))}

            {busy && <p className="text-sm text-ink-400">Searching the Fixora catalogue…</p>}
          </div>

          <form
            className="flex items-center gap-2 border-t border-ink-100 p-3"
            onSubmit={(event) => {
              event.preventDefault()
              void ask(input)
            }}
          >
            <input
              className="input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Describe the service you need…"
              aria-label="Message the assistant"
            />
            <button type="submit" className="btn-primary" disabled={busy}>
              Send
            </button>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Bot className="h-4 w-4 text-brand-600" />
              How this assistant behaves
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li>It only names services, packages and prices that exist in the Fixora database.</li>
              <li>It never invents availability, provider names or booking status.</li>
              <li>It will not create a booking — you always confirm it yourself.</li>
              <li>It avoids hazardous repair instructions and points you to a professional.</li>
            </ul>
          </div>

          {lastPayload && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-ink-900">Answer mode</h2>
              <p className="mt-1">
                <span className="chip bg-ink-100 text-ink-700 ring-ink-200">provider: {lastPayload.provider}</span>{' '}
                <span className="chip bg-ink-100 text-ink-700 ring-ink-200">mode: {lastPayload.mode}</span>
              </p>
              <p className="muted mt-2">
                {lastPayload.mode === 'fallback'
                  ? 'No external AI key is configured, so a deterministic engine produced this answer from the Fixora database. Everything except language-model phrasing still works.'
                  : 'An external language model phrased this answer, using only Fixora database rows as grounding.'}
              </p>
            </div>
          )}

          {lastPayload && lastPayload.suggestedServices.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-ink-900">Matching services</h2>
              <ul className="mt-3 space-y-2">
                {lastPayload.suggestedServices.map((service) => (
                  <li key={service.id}>
                    <Link
                      to={`/services/${service.id}`}
                      className="flex items-center justify-between rounded-xl border border-ink-200 px-3 py-2 text-sm hover:border-brand-300"
                    >
                      <span className="truncate">{service.name}</span>
                      <span className="ml-2 shrink-0 font-semibold">from {inr(service.basePrice)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lastPayload && lastPayload.highlightedPackages.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-ink-900">Packages mentioned</h2>
              <div className="mt-3 space-y-2">
                {lastPayload.highlightedPackages.slice(0, 3).map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </div>
          )}

          <div className="card p-5">
            <p className="flex items-start gap-2 text-xs text-ink-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
              <span>
                Set AI_PROVIDER=anthropic and ANTHROPIC_API_KEY in your .env to route answers through the Anthropic API.
                The key stays on the backend and is never sent to this page.
              </span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
