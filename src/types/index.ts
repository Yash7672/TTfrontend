// ---------------------------------------------------------------------------
// FIXORA shared types — mirrors the backend response DTOs exactly.
// Every price is a number (backend sends BigDecimal as a JSON number).
// ---------------------------------------------------------------------------

export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN'

export type ProviderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type PricingType = 'FIXED_PRICE' | 'STARTING_PRICE' | 'INSPECTION_FEE' | 'QUOTATION'

export type AddressType = 'HOME' | 'WORK' | 'OTHER'

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export type ComplaintCategory =
  | 'SERVICE_QUALITY'
  | 'PROVIDER_BEHAVIOUR'
  | 'PRICING'
  | 'LATE_ARRIVAL'
  | 'CANCELLATION'
  | 'OTHER'

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'

export type NotificationType =
  | 'BOOKING_CREATED'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'SERVICE_STARTED'
  | 'SERVICE_COMPLETED'
  | 'COMPLAINT_STATUS_CHANGED'
  | 'REVIEW_REMINDER'

export interface UserResponse {
  id: number
  fullName: string
  email: string
  phone?: string
  role: UserRole
  active: boolean
  city?: string
  providerId?: number
  providerStatus?: ProviderStatus
  createdAt?: string
}

export interface AuthResponse {
  user: UserResponse
  message: string
  secureAuthentication: boolean
}

export interface AddressResponse {
  id: number
  label?: string
  line1: string
  line2?: string
  city: string
  area?: string
  pincode?: string
  addressType: AddressType
  defaultAddress: boolean
  fullAddress: string
}

export interface CategoryResponse {
  id: number
  name: string
  slug: string
  description?: string
  iconName?: string
  imageUrl?: string
  active: boolean
  displayOrder: number
  serviceCount: number
}

export interface ServiceResponse {
  id: number
  name: string
  slug: string
  shortDescription?: string
  description?: string
  categoryId: number
  categoryName: string
  categorySlug: string
  imageUrl?: string
  basePrice: number
  pricingType: PricingType
  durationMinutes: number
  active: boolean
  featured: boolean
  ratingAverage: number
  ratingCount: number
  packageCount: number
}

export interface ServicePackageResponse {
  id: number
  serviceId: number
  serviceName: string
  name: string
  description?: string
  price: number
  durationMinutes: number
  includedWork?: string
  excludedWork?: string
  pricingType: PricingType
  active: boolean
  displayOrder: number
}

export interface ProviderResponse {
  id: number
  userId: number
  businessName: string
  bio?: string
  city?: string
  area?: string
  experienceYears?: number
  status: ProviderStatus
  ratingAverage: number
  ratingCount: number
  profileImageUrl?: string
  contactName?: string
  serviceCount: number
}

export interface ProviderServiceResponse {
  id: number
  providerId: number
  serviceId: number
  serviceName: string
  categoryName?: string
  customPrice?: number
  cataloguePrice?: number
  active: boolean
}

export interface AvailabilityResponse {
  id?: number
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string
  endTime: string
  active: boolean
}

export interface BookingStatusHistoryResponse {
  status: BookingStatus
  note?: string
  changedAt: string
}

export interface BookingResponse {
  id: number
  bookingRef: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  customerId: number
  customerName: string
  customerEmail?: string
  providerId?: number
  providerName?: string
  serviceId: number
  serviceName: string
  packageId: number
  packageName: string
  agreedPrice: number
  addressId: number
  addressSummary: string
  bookingDate: string
  startTime: string
  endTime: string
  customerNotes?: string
  statusNote?: string
  createdAt?: string
  updatedAt?: string
  hasReview: boolean
  canReview: boolean
  canCancel: boolean
  statusHistory: BookingStatusHistoryResponse[]
}

export interface ReviewResponse {
  id: number
  bookingId?: number
  serviceId?: number
  serviceName?: string
  providerId?: number
  providerName?: string
  customerId?: number
  customerName?: string
  rating: number
  comment?: string
  visible: boolean
  createdAt: string
}

export interface RatingSummary {
  averageRating: number
  reviewCount: number
  hasReviews: boolean
}

export interface ComplaintResponse {
  id: number
  subject: string
  description: string
  category?: ComplaintCategory
  status: ComplaintStatus
  priority?: ComplaintPriority
  bookingId?: number
  bookingRef?: string
  customerId?: number
  customerName?: string
  aiSuggestedCategory?: string
  aiSuggestedSummary?: string
  resolutionNote?: string
  createdAt?: string
  updatedAt?: string
}

export interface NotificationResponse {
  id: number
  type: NotificationType
  title: string
  message?: string
  read: boolean
  relatedBookingId?: number
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface AdminDashboard {
  totalUsers: number
  totalCustomers: number
  totalProviders: number
  approvedProviders: number
  pendingProviders: number
  rejectedProviders: number
  suspendedProviders: number
  totalCategories: number
  totalServices: number
  totalPackages: number
  totalBookings: number
  pendingBookings: number
  acceptedBookings: number
  inProgressBookings: number
  completedBookings: number
  cancelledBookings: number
  rejectedBookings: number
  totalReviews: number
  openComplaints: number
  inProgressComplaints: number
  resolvedComplaints: number
  closedComplaints: number
  aiProvider: string
  aiMode: string
}

export interface AiChatResponse {
  reply: string
  mode: 'fallback' | 'anthropic' | 'rules'
  provider: string
  detectedCategory?: string
  suggestions: string[]
  suggestedServices: ServiceResponse[]
  highlightedPackages: ServicePackageResponse[]
}

export interface AiSearchResponse {
  query: string
  criteria: Record<string, unknown>
  mode: string
  message: string
  services: ServiceResponse[]
}

export interface AiRecommendationResponse {
  mode: string
  explanation: string
  recommendations: { service: ServiceResponse; score: number; reason: string }[]
}

export interface GeneratedDescriptionResponse {
  shortDescription: string
  fullDescription: string
  faqSuggestions: string[]
  packageExplanation: string
  draft: boolean
  mode: string
}

export interface ComplaintClassificationResponse {
  suggestedCategory?: ComplaintCategory
  suggestedPriority?: ComplaintPriority
  summary: string
  note: string
  mode: string
}

export interface AiStatus {
  configuredProvider: string
  activeMode: string
  model: string
  apiKeyConfigured: boolean
  fallbackAvailable: boolean
  catalogueServices: number
  catalogueCategories: number
  note: string
}

export interface ApiError {
  timestamp?: string
  status: number
  error: string
  message: string
  path?: string
  fieldErrors?: Record<string, string>
}
