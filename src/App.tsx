import { Route, Routes } from 'react-router-dom'

import { MainLayout } from './layouts/MainLayout'
import { ProviderLayout } from './layouts/ProviderLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { RequireAuth } from './components/RequireAuth'

import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import SearchResultsPage from './pages/SearchResultsPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import BookingConfirmationPage from './pages/BookingConfirmationPage'
import ProviderProfilePage from './pages/ProviderProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import AddressesPage from './pages/AddressesPage'
import MyBookingsPage from './pages/MyBookingsPage'
import BookingDetailPage from './pages/BookingDetailPage'
import ReviewsPage from './pages/ReviewsPage'
import FaqPage from './pages/FaqPage'
import SupportPage from './pages/SupportPage'
import AssistantPage from './pages/AssistantPage'
import BecomeProviderPage from './pages/BecomeProviderPage'
import LegalPage from './pages/LegalPage'
import NotFoundPage from './pages/NotFoundPage'

import ProviderDashboardPage from './pages/provider/ProviderDashboardPage'
import ProviderProfilePage2 from './pages/provider/ProviderProfilePage'
import ProviderServicesPage from './pages/provider/ProviderServicesPage'
import ProviderAvailabilityPage from './pages/provider/ProviderAvailabilityPage'
import ProviderBookingsPage from './pages/provider/ProviderBookingsPage'
import ProviderBookingDetailPage from './pages/provider/ProviderBookingDetailPage'
import ProviderReviewsPage from './pages/provider/ProviderReviewsPage'
import ProviderEarningsPage from './pages/provider/ProviderEarningsPage'

import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminProvidersPage from './pages/admin/AdminProvidersPage'
import AdminCataloguePage from './pages/admin/AdminCataloguePage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage'
import AdminReviewsPage from './pages/admin/AdminReviewsPage'
import AdminAiPage from './pages/admin/AdminAiPage'

export default function App() {
  return (
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
  )
}
