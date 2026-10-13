import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

import { MainLayout } from './layouts/MainLayout'
import { ProviderLayout } from './layouts/ProviderLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { RequireAuth } from './components/RequireAuth'
import { RouteFallback } from './components/RouteFallback'

/*
 * Every page is code-split with React.lazy so the initial bundle only contains the
 * app shell (layouts + header/footer) plus the page actually being visited. Vite
 * emits one chunk per page, and the Suspense boundary in each layout keeps the
 * header, footer and sidebar on screen while a chunk downloads.
 */
const HomePage = lazy(() => import('./pages/HomePage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'))
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const BookingConfirmationPage = lazy(() => import('./pages/BookingConfirmationPage'))
const ProviderProfilePage = lazy(() => import('./pages/ProviderProfilePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AddressesPage = lazy(() => import('./pages/AddressesPage'))
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'))
const BookingDetailPage = lazy(() => import('./pages/BookingDetailPage'))
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const SupportPage = lazy(() => import('./pages/SupportPage'))
const AssistantPage = lazy(() => import('./pages/AssistantPage'))
const BecomeProviderPage = lazy(() => import('./pages/BecomeProviderPage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const ProviderDashboardPage = lazy(() => import('./pages/provider/ProviderDashboardPage'))
const ProviderProfilePage2 = lazy(() => import('./pages/provider/ProviderProfilePage'))
const ProviderServicesPage = lazy(() => import('./pages/provider/ProviderServicesPage'))
const ProviderAvailabilityPage = lazy(() => import('./pages/provider/ProviderAvailabilityPage'))
const ProviderBookingsPage = lazy(() => import('./pages/provider/ProviderBookingsPage'))
const ProviderBookingDetailPage = lazy(() => import('./pages/provider/ProviderBookingDetailPage'))
const ProviderReviewsPage = lazy(() => import('./pages/provider/ProviderReviewsPage'))
const ProviderEarningsPage = lazy(() => import('./pages/provider/ProviderEarningsPage'))

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminProvidersPage = lazy(() => import('./pages/admin/AdminProvidersPage'))
const AdminCataloguePage = lazy(() => import('./pages/admin/AdminCataloguePage'))
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'))
const AdminComplaintsPage = lazy(() => import('./pages/admin/AdminComplaintsPage'))
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'))
const AdminAiPage = lazy(() => import('./pages/admin/AdminAiPage'))

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* ------------------------------ storefront ------------------------------ */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
          <Route
            path="/services/:serviceId/checkout"
            element={
              <RequireAuth roles={['CUSTOMER', 'ADMIN']}>
                <CheckoutPage />
              </RequireAuth>
            }
          />
          <Route
            path="/bookings/:bookingId/confirmation"
            element={
              <RequireAuth>
                <BookingConfirmationPage />
              </RequireAuth>
            }
          />
          <Route path="/providers/:providerId" element={<ProviderProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/addresses"
            element={
              <RequireAuth roles={['CUSTOMER', 'ADMIN']}>
                <AddressesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/bookings"
            element={
              <RequireAuth>
                <MyBookingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/bookings/:bookingId"
            element={
              <RequireAuth>
                <BookingDetailPage />
              </RequireAuth>
            }
          />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route
            path="/support"
            element={
              <RequireAuth>
                <SupportPage />
              </RequireAuth>
            }
          />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/become-provider" element={<BecomeProviderPage />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ------------------------------- provider ------------------------------- */}
        <Route path="/provider" element={<ProviderLayout />}>
          <Route index element={<ProviderDashboardPage />} />
          <Route path="profile" element={<ProviderProfilePage2 />} />
          <Route path="services" element={<ProviderServicesPage />} />
          <Route path="availability" element={<ProviderAvailabilityPage />} />
          <Route path="bookings" element={<ProviderBookingsPage />} />
          <Route path="bookings/:bookingId" element={<ProviderBookingDetailPage />} />
          <Route path="reviews" element={<ProviderReviewsPage />} />
          <Route path="earnings" element={<ProviderEarningsPage />} />
        </Route>

        {/* -------------------------------- admin -------------------------------- */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="providers" element={<AdminProvidersPage />} />
          <Route path="catalogue" element={<AdminCataloguePage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="complaints" element={<AdminComplaintsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="ai" element={<AdminAiPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
