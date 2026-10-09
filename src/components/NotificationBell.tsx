import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { notificationApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../utils/format'
import type { NotificationResponse } from '../types'

export function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationResponse[]>([])
  const [unread, setUnread] = useState(0)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const [recent, count] = await Promise.all([
        notificationApi.recent(),
        notificationApi.unreadCount(),
      ])
      setItems(recent)
      setUnread(count.unread)
    } catch {
      // Notifications are a convenience: a failure must not break navigation.
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  if (!user) return null

  async function markRead(id: number) {
    try {
      await notificationApi.markRead(id)
      await load()
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="relative rounded-xl p-2 text-ink-600 hover:bg-ink-100"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5">
            <p className="text-sm font-semibold text-ink-900">Notifications</p>
            <span className="text-[11px] text-ink-400">in-app only</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && <p className="px-4 py-6 text-sm text-ink-500">Nothing here yet.</p>}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void markRead(item.id)}
                className={`block w-full border-b border-ink-50 px-4 py-3 text-left last:border-0 hover:bg-ink-50 ${
                  item.read ? 'opacity-70' : ''
                }`}
              >
                <p className="text-sm font-medium text-ink-900">{item.title}</p>
                {item.message && <p className="mt-0.5 text-xs text-ink-500">{item.message}</p>}
                <p className="mt-1 text-[11px] text-ink-400">{formatDateTime(item.createdAt)}</p>
              </button>
            ))}
          </div>
          <div className="border-t border-ink-100 px-4 py-2">
            <Link to="/bookings" className="text-xs font-semibold text-brand-700" onClick={() => setOpen(false)}>
              Go to my bookings
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
