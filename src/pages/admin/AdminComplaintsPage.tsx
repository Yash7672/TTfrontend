import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { adminApi, aiApi } from '../../api'
import { errorMessage } from '../../api/client'
import { EmptyState, ErrorState, Loader } from '../../components/States'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { cn, formatDateTime, titleCase } from '../../utils/format'
import type {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintResponse,
  ComplaintStatus,
} from '../../types'

const STATUSES: ComplaintStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const PRIORITIES: ComplaintPriority[] = ['LOW', 'MEDIUM', 'HIGH']
const STATUS_FILTERS: { label: string; value?: ComplaintStatus }[] = [
  { label: 'All' },
  ...STATUSES.map((value) => ({ label: titleCase(value), value })),
]

const CATEGORIES: ComplaintCategory[] = [
  'SERVICE_QUALITY',
  'PROVIDER_BEHAVIOUR',
  'PRICING',
  'LATE_ARRIVAL',
  'CANCELLATION',
  'OTHER',
]

export default function AdminComplaintsPage() {
  const toast = useToast()
  const [status, setStatus] = useState<ComplaintStatus | undefined>(undefined)
  const complaints = useAsync(() => adminApi.complaints({ status, size: 40 }), [status])
  const [busyId, setBusyId] = useState<number | null>(null)
  const statusFilters = STATUS_FILTERS

  async function apply(id: number, payload: {
    status: ComplaintStatus
    priority?: ComplaintPriority
    category?: ComplaintCategory
    resolutionNote?: string
  }) {
    setBusyId(id)
    try {
      await adminApi.updateComplaint(id, payload)
      toast.success('Complaint updated and the customer was notified in-app.')
      complaints.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-900">Complaints</h2>
        <p className="muted mt-1">
          The AI suggestion is stored for reference only. The category, priority and status below are yours to decide —
          Fixora never resolves a complaint or suspends a provider automatically.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => setStatus(filter.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              status === filter.value
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {complaints.loading && <Loader />}
      {complaints.error && <ErrorState error={complaints.error} onRetry={complaints.reload} />}
      {complaints.data && complaints.data.content.length === 0 && (
        <EmptyState title="No complaints in this view" description="Nothing to triage right now." />
      )}

      <div className="space-y-4">
        {complaints.data?.content.map((complaint: ComplaintResponse) => (
          <ComplaintRow
            key={complaint.id}
            complaint={complaint}
            busy={busyId === complaint.id}
            onApply={apply}
          />
        ))}
      </div>
    </div>
  )
}

function ComplaintRow({
  complaint,
  busy,
  onApply,
}: {
  complaint: ComplaintResponse
  busy: boolean
  onApply: (
    id: number,
    payload: { status: ComplaintStatus; priority?: ComplaintPriority; category?: ComplaintCategory; resolutionNote?: string },
  ) => Promise<void>
}) {
  const toast = useToast()
  const [state, setState] = useState<ComplaintStatus>(complaint.status)
  const [priority, setPriority] = useState<ComplaintPriority>(complaint.priority ?? 'MEDIUM')
  const [category, setCategory] = useState<ComplaintCategory>(complaint.category ?? 'OTHER')
  const [note, setNote] = useState(complaint.resolutionNote ?? '')
  const [aiSummary, setAiSummary] = useState<string | null>(complaint.aiSuggestedSummary ?? null)

  async function classify() {
    try {
      const result = await aiApi.classifyComplaint({
        subject: complaint.subject,
        description: complaint.description,
        bookingRef: complaint.bookingRef,
      })
      setAiSummary(`${titleCase(result.suggestedCategory ?? 'OTHER')} · ${result.suggestedPriority ?? 'MEDIUM'} — ${result.summary}`)
      toast.info(`AI suggestion (${result.mode}) available below. Your decision still wins.`)
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink-900">{complaint.subject}</h3>
          <p className="muted mt-1">
            {complaint.customerName} · filed {formatDateTime(complaint.createdAt)}
            {complaint.bookingRef ? ` · booking ${complaint.bookingRef}` : ''}
          </p>
        </div>
        <span className="chip bg-ink-100 text-ink-700 ring-ink-200">{titleCase(complaint.status)}</span>
      </div>

      <p className="mt-2 text-sm text-ink-600">{complaint.description}</p>

      {aiSummary && (
        <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs text-ink-700">
          <p className="font-semibold">Suggested classification (advisory)</p>
          <p className="mt-1">{aiSummary}</p>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-medium text-ink-600">
          Status
          <select className="input mt-1" value={state} onChange={(event) => setState(event.target.value as ComplaintStatus)}>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {titleCase(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-ink-600">
          Priority
          <select className="input mt-1" value={priority} onChange={(event) => setPriority(event.target.value as ComplaintPriority)}>
            {PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-ink-600">
          Category
          <select className="input mt-1" value={category} onChange={(event) => setCategory(event.target.value as ComplaintCategory)}>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {titleCase(value)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <input
        className="input mt-3"
        placeholder="Resolution note (shown to the customer)"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary btn-sm"
          disabled={busy}
          onClick={() => void onApply(complaint.id, { status: state, priority, category, resolutionNote: note || undefined })}
        >
          Save decision
        </button>
        <button type="button" className="btn-secondary btn-sm" onClick={() => void classify()}>
          <Sparkles className="h-3.5 w-3.5" />
          Ask AI to classify
        </button>
      </div>
    </article>
  )
}
