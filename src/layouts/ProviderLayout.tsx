import { CalendarCheck, Clock, IndianRupee, LayoutDashboard, ListChecks, Star, UserCog } from 'lucide-react'
import { RequireAuth } from '../components/RequireAuth'
import { DashboardLayout, type DashboardNavItem } from './DashboardLayout'

const items: DashboardNavItem[] = [
  { to: '/provider', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
  { to: '/provider/profile', label: 'Profile', icon: <UserCog className="h-4 w-4" /> },
  { to: '/provider/services', label: 'My services', icon: <ListChecks className="h-4 w-4" /> },
  { to: '/provider/availability', label: 'Availability', icon: <Clock className="h-4 w-4" /> },
  { to: '/provider/bookings', label: 'Bookings', icon: <CalendarCheck className="h-4 w-4" /> },
  { to: '/provider/reviews', label: 'Reviews', icon: <Star className="h-4 w-4" /> },
  { to: '/provider/earnings', label: 'Earnings', icon: <IndianRupee className="h-4 w-4" /> },
]

export function ProviderLayout() {
  return (
    <RequireAuth roles={['PROVIDER']}>
      <DashboardLayout
        title="Provider workspace"
        subtitle="Manage your profile, services, availability, bookings and reviews."
        items={items}
      />
    </RequireAuth>
  )
}
