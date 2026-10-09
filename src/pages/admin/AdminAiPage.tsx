import { useState } from 'react'
import { Bot, Info, Send, Terminal } from 'lucide-react'
import { adminApi, aiApi } from '../../api'
import { errorMessage } from '../../api/client'
import { ErrorState, Loader } from '../../components/States'
import { useAsync } from '../../hooks/useAsync'

export default function AdminAiPage() {
  const status = useAsync(() => adminApi.aiStatus(), [])
  const [message, setMessage] = useState('my bathroom tap is leaking')
  const [output, setOutput] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function testChat() {
    setBusy(true)
    try {
      const reply = await aiApi.chat({ message })
      setOutput(
        `mode: ${reply.mode}\nprovider: ${reply.provider}\ndetected category: ${reply.detectedCategory ?? '—'}\n` +
          `matched services: ${reply.suggestedServices.map((s) => s.name).join(', ') || 'none'}\n\n${reply.reply}`,
      )
    } catch (error) {
      setOutput(`Error: ${errorMessage(error)}`)
    } finally {
      setBusy(false)
    }
  }

  if (status.loading) return <Loader label="Reading AI configuration…" />
  if (status.error) return <ErrorState error={status.error} onRetry={status.reload} />

  const data = status.data!

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-bold text-ink-900">AI configuration</h2>
        <p className="muted mt-1">
          Reported by the backend from its own configuration. API keys are never sent to the browser — only whether a key
          exists.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Configured provider', value: data.configuredProvider },
            { label: 'Active mode', value: data.activeMode },
            { label: 'Model', value: data.model },
            { label: 'API key present', value: data.apiKeyConfigured ? 'yes' : 'no' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-ink-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-ink-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-ink-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <span>{data.note}</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-ink-50 p-4 text-sm">
            <p className="font-semibold text-ink-900">Catalogue available to the AI</p>
            <p className="mt-1 text-ink-600">
              {data.catalogueServices} services across {data.catalogueCategories} categories, queried live from MySQL.
            </p>
          </div>
          <div className="rounded-2xl bg-ink-50 p-4 text-sm">
            <p className="font-semibold text-ink-900">Fallback availability</p>
            <p className="mt-1 text-ink-600">
              {data.fallbackAvailable
                ? 'Always available. If the external provider fails, the deterministic engine answers instead.'
                : 'Unavailable — configure a provider.'}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
          <Terminal className="h-5 w-5 text-brand-600" />
          Test the assistant
        </h2>
        <p className="muted mt-1">
          Send a message through the same endpoint the storefront uses and inspect which mode answered.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            className="input"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            aria-label="Test message"
          />
          <button type="button" className="btn-primary" onClick={() => void testChat()} disabled={busy}>
            <Send className="h-4 w-4" />
            {busy ? 'Sending…' : 'Send'}
          </button>
        </div>

        {output && (
          <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-ink-900 p-4 text-xs text-ink-50">
            {output}
          </pre>
        )}
      </div>

      <div className="card p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
          <Bot className="h-5 w-5 text-brand-600" />
          How to switch to a language model
        </h2>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-ink-600">
          <li>
            Put <code className="rounded bg-ink-100 px-1">AI_PROVIDER=anthropic</code> in your{' '}
            <code className="rounded bg-ink-100 px-1">.env</code> file.
          </li>
          <li>
            Set <code className="rounded bg-ink-100 px-1">ANTHROPIC_API_KEY</code> to your own key, and optionally{' '}
            <code className="rounded bg-ink-100 px-1">AI_MODEL</code>.
          </li>
          <li>
            Restart with <code className="rounded bg-ink-100 px-1">docker compose up -d --build backend</code>.
          </li>
          <li>
            If a call fails or times out, Fixora automatically answers deterministically — the app never becomes
            unusable.
          </li>
        </ol>
      </div>
    </div>
  )
}
