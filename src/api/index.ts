import { api } from './client'
import { cachedRequest } from './cache'
import type {
  AddressResponse,
  AdminDashboard,
  AiChatResponse,
  AiRecommendationResponse,
  AiSearchResponse,
  AiStatus,
  AuthResponse,
  AvailabilityResponse,
  BookingResponse,
  CategoryResponse,
  ComplaintClassificationResponse,
  ComplaintResponse,
  ComplaintStatus,
  GeneratedDescriptionResponse,
  NotificationResponse,
  PageResponse,
  ProviderResponse,
  ProviderServiceResponse,
  ProviderStatus,
  RatingSummary,
  ReviewResponse,
  ServicePackageResponse,
  ServiceResponse,
  UserResponse,
  UserRole,
  BookingStatus,
  ComplaintCategory,
  ComplaintPriority,
  PricingType,
} from '../types'

// ------------------------------------------------------------------ auth

export const authApi = {
  register: (body: {
    fullName: string
    email: string
    password: string
    phone?: string
    role?: UserRole
    businessName?: string
    city?: string
  }) => api.post<AuthResponse>('/auth/register', body).then((r) => r.data),

  login: (body: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', body).then((r) => r.data),
}

export const userApi = {
  me: () => api.get<UserResponse>('/users/me').then((r) => r.data),
  updateMe: (body: { fullName: string; phone?: string; city?: string }) =>
    api.put<UserResponse>('/users/me', body).then((r) => r.data),
}

// -------------------------------------------------------------- catalogue

/** Structural catalogue data changes rarely; cache it briefly to stop Home/Search
 *  refetching the same lists on every navigation. Never user-specific. */
const CATALOGUE_TTL_MS = 5 * 60 * 1000

export const catalogApi = {
  categories: () =>
    cachedRequest('categories', CATALOGUE_TTL_MS, () =>
      api.get<CategoryResponse[]>('/categories').then((r) => r.data),
    ),

  category: (id: number) =>
    cachedRequest(`category:${id}`, CATALOGUE_TTL_MS, () =>
      api.get<CategoryResponse>(`/categories/${id}`).then((r) => r.data),
    ),

  categoryServices: (id: number, page = 0, size = 12) =>
    api
      .get<PageResponse<ServiceResponse>>(`/categories/${id}/services`, { params: { page, size } })
      .then((r) => r.data),

  services: (params: {
    categoryId?: number
    keyword?: string
    minPrice?: number
    maxPrice?: number
    city?: string
    page?: number
    size?: number
    sort?: string
  }) => api.get<PageResponse<ServiceResponse>>('/services', { params }).then((r) => r.data),

  featured: () =>
    cachedRequest('services:featured', CATALOGUE_TTL_MS, () =>
      api.get<ServiceResponse[]>('/services/featured').then((r) => r.data),
    ),

  popular: (limit = 8) =>
    cachedRequest(`services:popular:${limit}`, CATALOGUE_TTL_MS, () =>
      api.get<ServiceResponse[]>('/services/popular', { params: { limit } }).then((r) => r.data),
    ),

  service: (id: number) => api.get<ServiceResponse>(`/services/${id}`).then((r) => r.data),

  packages: (serviceId: number) =>
    api.get<ServicePackageResponse[]>(`/services/${serviceId}/packages`).then((r) => r.data),

  serviceReviews: (serviceId: number, page = 0, size = 10) =>
    api
      .get<PageResponse<ReviewResponse>>(`/services/${serviceId}/reviews`, { params: { page, size } })
      .then((r) => r.data),

  serviceRating: (serviceId: number) =>
    api.get<RatingSummary>(`/services/${serviceId}/rating`).then((r) => r.data),
}

// -------------------------------------------------------------- providers

export const providerApi = {
  search: (params: {
    city?: string
    area?: string
    keyword?: string
    serviceId?: number
    page?: number
    size?: number
  }) => api.get<PageResponse<ProviderResponse>>('/providers/search', { params }).then((r) => r.data),

  get: (id: number) => api.get<ProviderResponse>(`/providers/${id}`).then((r) => r.data),

  services: (id: number) =>
    api.get<ProviderServiceResponse[]>(`/providers/${id}/services`).then((r) => r.data),

  availability: (id: number) =>
    api.get<AvailabilityResponse[]>(`/providers/${id}/availability`).then((r) => r.data),

  reviews: (id: number, page = 0, size = 10) =>
    api
      .get<PageResponse<ReviewResponse>>(`/providers/${id}/reviews`, { params: { page, size } })
      .then((r) => r.data),

  // provider's own area
  me: () => api.get<ProviderResponse>('/providers/me').then((r) => r.data),

  createMe: (body: {
    businessName: string
    bio?: string
    city: string
    area?: string
    experienceYears?: number
    profileImageUrl?: string
  }) => api.post<ProviderResponse>('/providers', body).then((r) => r.data),

  updateMe: (body: {
    businessName: string
    bio?: string
    city: string
    area?: string
    experienceYears?: number
    profileImageUrl?: string
  }) => api.put<ProviderResponse>('/providers/me', body).then((r) => r.data),

  myServices: () => api.get<ProviderServiceResponse[]>('/providers/me/services').then((r) => r.data),

  addMyService: (body: { serviceId: number; customPrice?: number; active?: boolean }) =>
    api.post<ProviderServiceResponse>('/providers/me/services', body).then((r) => r.data),

  removeMyService: (id: number) => api.delete(`/providers/me/services/${id}`).then(() => undefined),

  myAvailability: () =>
    api.get<AvailabilityResponse[]>('/providers/me/availability').then((r) => r.data),

  saveMyAvailability: (windows: AvailabilityResponse[]) =>
    api.put<AvailabilityResponse[]>('/providers/me/availability', windows).then((r) => r.data),

  earnings: () => api.get<Record<string, unknown>>('/providers/me/earnings').then((r) => r.data),
}

// --------------------------------------------------------------- addresses

export const addressApi = {
  list: () => api.get<AddressResponse[]>('/addresses').then((r) => r.data),

  create: (body: {
    label?: string
    line1: string
    line2?: string
    city: string
    area?: string
    pincode?: string
    addressType?: string
    defaultAddress?: boolean
  }) => api.post<AddressResponse>('/addresses', body).then((r) => r.data),

  update: (
    id: number,
    body: {
      label?: string
      line1: string
      line2?: string
      city: string
      area?: string
      pincode?: string
      addressType?: string
      defaultAddress?: boolean
    },
  ) => api.put<AddressResponse>(`/addresses/${id}`, body).then((r) => r.data),

  remove: (id: number) => api.delete(`/addresses/${id}`).then(() => undefined),

  setDefault: (id: number) =>
    api.put<AddressResponse>(`/addresses/${id}/default`).then((r) => r.data),
}

// ---------------------------------------------------------------- bookings

export const bookingApi = {
  create: (body: {
    packageId: number
    providerId?: number
    addressId: number
    bookingDate: string
    startTime: string
    durationMinutes?: number
    customerNotes?: string
  }) => api.post<BookingResponse>('/bookings', body).then((r) => r.data),

  mine: (params: { status?: BookingStatus; page?: number; size?: number } = {}) =>
    api.get<PageResponse<BookingResponse>>('/bookings/me', { params }).then((r) => r.data),

  get: (id: number) => api.get<BookingResponse>(`/bookings/${id}`).then((r) => r.data),

  providerQueue: (params: { status?: BookingStatus; page?: number; size?: number } = {}) =>
    api.get<PageResponse<BookingResponse>>('/provider/bookings', { params }).then((r) => r.data),

  accept: (id: number) => api.put<BookingResponse>(`/bookings/${id}/accept`).then((r) => r.data),

  reject: (id: number, note?: string) =>
    api.put<BookingResponse>(`/bookings/${id}/reject`, { note }).then((r) => r.data),

  start: (id: number) => api.put<BookingResponse>(`/bookings/${id}/start`).then((r) => r.data),

  complete: (id: number) => api.put<BookingResponse>(`/bookings/${id}/complete`).then((r) => r.data),

  cancel: (id: number, note?: string) =>
    api.put<BookingResponse>(`/bookings/${id}/cancel`, { note }).then((r) => r.data),
}

// ----------------------------------------------------------------- reviews

export const reviewApi = {
  create: (body: { bookingId: number; rating: number; comment?: string }) =>
    api.post<ReviewResponse>('/reviews', body).then((r) => r.data),
}

// -------------------------------------------------------------- complaints

export const complaintApi = {
  create: (body: {
    subject: string
    description: string
    bookingId?: number
    category?: ComplaintCategory
  }) => api.post<ComplaintResponse>('/complaints', body).then((r) => r.data),

  mine: () => api.get<ComplaintResponse[]>('/complaints/me').then((r) => r.data),
}

// ----------------------------------------------------------- notifications

export const notificationApi = {
  list: (page = 0, size = 20) =>
    api
      .get<PageResponse<NotificationResponse>>('/notifications', { params: { page, size } })
      .then((r) => r.data),

  recent: () => api.get<NotificationResponse[]>('/notifications/recent').then((r) => r.data),

  unreadCount: () =>
    api.get<{ unread: number }>('/notifications/unread-count').then((r) => r.data),

  markRead: (id: number) =>
    api.put<NotificationResponse>(`/notifications/${id}/read`).then((r) => r.data),
}

// --------------------------------------------------------------------- AI

export const aiApi = {
  chat: (body: { message: string; city?: string }) =>
    api.post<AiChatResponse>('/ai/chat', body).then((r) => r.data),

  search: (body: { query: string; city?: string; maxPrice?: number }) =>
    api.post<AiSearchResponse>('/ai/search', body).then((r) => r.data),

  recommendations: (body: { query?: string; city?: string; maxPrice?: number; limit?: number }) =>
    api.post<AiRecommendationResponse>('/ai/recommendations', body).then((r) => r.data),

  bookingAssistance: (body: { message: string; serviceId?: number; packageId?: number }) =>
    api.post<AiChatResponse>('/ai/booking-assistance', body).then((r) => r.data),

  generateDescription: (body: {
    serviceName: string
    categoryName?: string
    packageNames?: string
    includedWork?: string
    excludedWork?: string
    pricingType?: PricingType
  }) => api.post<GeneratedDescriptionResponse>('/ai/generate-service-description', body).then((r) => r.data),

  classifyComplaint: (body: { subject: string; description: string; bookingRef?: string }) =>
    api
      .post<ComplaintClassificationResponse>('/ai/classify-complaint', body)
      .then((r) => r.data),

  status: () => api.get<AiStatus>('/ai/status').then((r) => r.data),
}

// ------------------------------------------------------------------ admin

export const adminApi = {
  dashboard: () => api.get<AdminDashboard>('/admin/dashboard').then((r) => r.data),

  aiStatus: () => api.get<AiStatus>('/admin/ai/status').then((r) => r.data),

  users: (params: { role?: UserRole; page?: number; size?: number } = {}) =>
    api.get<PageResponse<UserResponse>>('/admin/users', { params }).then((r) => r.data),

  providers: (params: { status?: ProviderStatus; page?: number; size?: number } = {}) =>
    api.get<PageResponse<ProviderResponse>>('/admin/providers', { params }).then((r) => r.data),

  verifyProvider: (id: number, body: { status: ProviderStatus; note?: string }) =>
    api.put<ProviderResponse>(`/admin/providers/${id}/status`, body).then((r) => r.data),

  bookings: (params: { status?: BookingStatus; page?: number; size?: number } = {}) =>
    api.get<PageResponse<BookingResponse>>('/admin/bookings', { params }).then((r) => r.data),

  assignProvider: (bookingId: number, providerId: number) =>
    api
      .put<BookingResponse>(`/admin/bookings/${bookingId}/assign`, null, { params: { providerId } })
      .then((r) => r.data),

  services: (page = 0, size = 20) =>
    api
      .get<PageResponse<ServiceResponse>>('/admin/services', { params: { page, size } })
      .then((r) => r.data),

  createCategory: (body: Record<string, unknown>) =>
    api.post<CategoryResponse>('/admin/categories', body).then((r) => r.data),

  updateCategory: (id: number, body: Record<string, unknown>) =>
    api.put<CategoryResponse>(`/admin/categories/${id}`, body).then((r) => r.data),

  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`).then(() => undefined),

  createService: (body: Record<string, unknown>) =>
    api.post<ServiceResponse>('/admin/services', body).then((r) => r.data),

  updateService: (id: number, body: Record<string, unknown>) =>
    api.put<ServiceResponse>(`/admin/services/${id}`, body).then((r) => r.data),

  deleteService: (id: number) => api.delete(`/admin/services/${id}`).then(() => undefined),

  createPackage: (body: Record<string, unknown>) =>
    api.post<ServicePackageResponse>('/admin/packages', body).then((r) => r.data),

  updatePackage: (id: number, body: Record<string, unknown>) =>
    api.put<ServicePackageResponse>(`/admin/packages/${id}`, body).then((r) => r.data),

  deletePackage: (id: number) => api.delete(`/admin/packages/${id}`).then(() => undefined),

  complaints: (params: { status?: ComplaintStatus; page?: number; size?: number } = {}) =>
    api.get<PageResponse<ComplaintResponse>>('/admin/complaints', { params }).then((r) => r.data),

  updateComplaint: (
    id: number,
    body: {
      status: ComplaintStatus
      priority?: ComplaintPriority
      category?: ComplaintCategory
      resolutionNote?: string
    },
  ) => api.put<ComplaintResponse>(`/admin/complaints/${id}/status`, body).then((r) => r.data),

  reviews: (page = 0, size = 20) =>
    api.get<PageResponse<ReviewResponse>>('/admin/reviews', { params: { page, size } }).then((r) => r.data),

  setReviewVisibility: (id: number, visible: boolean) =>
    api
      .put<ReviewResponse>(`/admin/reviews/${id}/visibility`, null, { params: { visible } })
      .then((r) => r.data),
}

export const healthApi = {
  check: () => api.get<Record<string, unknown>>('/health').then((r) => r.data),
}
