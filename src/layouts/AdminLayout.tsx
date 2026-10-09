import { Bot, CalendarDays, LayoutDashboard, MessageSquareWarning, ShieldCheck, Star, Tags, Users } from 'lucide-react'
import { RequireAuth } from '../components/RequireAuth'
import { DashboardLayout, type DashboardNavItem } from './DashboardLayout'

const items: DashboardNavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
  { to: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { to: '/admin/providers', label: 'Providers', icon: <ShieldCheck className="h-4 w-4" /> },
  { to: '/admin/catalogue', label: 'Catalogue', icon: <Tags className="h-4 w-4" /> },
  { to: '/admin/bookings', label: 'Bookings', icon: <CalendarDays className="h-4 w-4" /> },
  { to: '/admin/complaints', label: 'Complaints', icon: <MessageSquareWarning className="h-4 w-4" /> },
  { to: '/admin/reviews', label: 'Reviews', icon: <Star className="h-4 w-4" /> },
  { to: '/admin/ai', label: 'AI status', icon: <Bot className="h-4 w-4" /> },
]

export function AdminLayout() {
  return (
    <RequireAuth roles={['ADMIN']}>
      <DashboardLayout
        title="Fixora administration"
        subtitle="Platform counters, user and provider management, catalogue, bookings and complaints."
        items={items}
      />
    </RequireAuth>
  )
}
