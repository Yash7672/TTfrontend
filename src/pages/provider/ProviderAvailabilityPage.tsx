import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { providerApi } from '../../api'
import { errorMessage } from '../../api/client'
import { Loader } from '../../components/States'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import type { AvailabilityResponse } from '../../types'

const DAYS: AvailabilityResponse['dayOfWeek'][] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

const DEFAULT_WINDOW = { startTime: '09:00', endTime: '18:00', active: true }

export default function ProviderAvailabilityPage() {
  const toast = useToast()
  const existing = useAsync(() => providerApi.myAvailability(), [])

  const [rows, setRows] = useState<Record<string, { startTime: string; endTime: string; active: boolean }>>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const next: Record<string, { startTime: string; endTime: string; active: boolean }> = {}
    for (const day of DAYS) {
      const match = existing.data?.find((window) => window.dayOfWeek === day)
      next[day] = match
        ? { startTime: String(match.startTime).slice(0, 5), endTime: String(match.endTime).slice(0, 5), active: match.active }
        : { ...DEFAULT_WINDOW, active: false }
    }
    setRows(next)
  }, [existing.data])

  async function save() {
    setBusy(true)
    setError(null)

    const windows: AvailabilityResponse[] = DAYS.filter((day) => rows[day]?.active).map((day) => ({
      dayOfWeek: day,
      startTime: `${rows[day].startTime}:00`,
      endTime: `${rows[day].endTime}:00`,
      active: true,
    }))

    try {
      await providerApi.saveMyAvailability(windows)
      toast.success(`Saved ${windows.length} working window${windows.length === 1 ? '' : 's'}.`)
      existing.reload()
    } catch (caught) {
      const message = errorMessage(caught)
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  if (existing.loading) return <Loader label="Loading availability…" />

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-bold text-ink-900">Weekly availability</h2>
        <p className="muted mt-1">
          Bookings are only accepted inside these windows. Each window must end after it starts, and the whole week is
          replaced when you save.
        </p>

        <div className="mt-5 space-y-3">
          {DAYS.map((day) => (
            <div
              key={day}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-200 p-3 sm:flex-nowrap"
            >
              <label className="flex w-40 items-center gap-2 text-sm font-medium text-ink-800">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ink-300"
                  checked={rows[day]?.active ?? false}
                  onChange={(event) =>
                    setRows((current) => ({ ...current, [day]: { ...current[day], active: event.target.checked } }))
                  }
                />
                {day.charAt(0) + day.slice(1).toLowerCase()}
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="time"
                  className="input w-32"
                  value={rows[day]?.startTime ?? DEFAULT_WINDOW.startTime}
                  disabled={!rows[day]?.active}
                  onChange={(event) =>
                    setRows((current) => ({ ...current, [day]: { ...current[day], startTime: event.target.value } }))
                  }
                />
                <span className="text-ink-400">to</span>
                <input
                  type="time"
                  className="input w-32"
                  value={rows[day]?.endTime ?? DEFAULT_WINDOW.endTime}
                  disabled={!rows[day]?.active}
                  onChange={(event) =>
                    setRows((current) => ({ ...current, [day]: { ...current[day], endTime: event.target.value } }))
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
        )}

        <button type="button" className="btn-primary mt-5" onClick={() => void save()} disabled={busy}>
          <Save className="h-4 w-4" />
          {busy ? 'Saving…' : 'Save availability'}
        </button>
      </div>

      <p className="text-xs text-ink-400">
        Tip: seeded demo providers work Monday to Saturday, 09:00–18:00. Mirrored hours here keep the demo bookings
        consistent.
      </p>
    </div>
  )
}
