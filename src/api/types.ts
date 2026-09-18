export type Role = 'CONSUMER' | 'SALESPERSON' | 'AGENCY_ADMIN' | 'PLATFORM_ADMIN'
export type AccountStatus = 'ACTIVE' | 'DISABLED' | 'PENDING'
export type EntitlementStatus = 'UNPAID' | 'PAID' | 'COMPLIMENTARY'

export interface ApiErrorBody {
  code: string
  message: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export interface UserProfile {
  id: string
  email: string
  fullName: string
  role: Role
  status: AccountStatus
  agencyId: string | null
}

export interface AuthResponse {
  user: UserProfile
  accessToken: string
  refreshToken: string
}

export interface MeResponse {
  user: UserProfile
  agencyName: string | null
  websiteCount: number
}

export interface PricingSettings {
  currency: string
  websitePrice: number
  crsMonthlyPrice: number
  crsMonthlyDays: number
  crsQuarterlyPrice: number
  crsQuarterlyDays: number
}

export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'EXPORTED'

export interface ProjectResponse {
  id: string
  ownerId: string
  createdBy: string
  agencyId: string | null
  clientId: string | null
  clientName: string | null
  ownerName: string | null
  ownerEmail: string | null
  templateId: string
  name: string
  status: ProjectStatus
  progressPercent: number
  colorSchemeId: string | null
  layoutVariantId: string | null
  document: unknown
  entitlementStatus: EntitlementStatus
  canExport: boolean
  canCloudSave: boolean
  canEdit: boolean
  lastOpenedAt: string | null
  lastExportedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ClientRecord {
  id: string
  agencyId: string
  name: string
  contactEmail: string | null
  phone: string | null
  createdAt: string
}

export interface ProjectListResponse {
  items: ProjectResponse[]
  recentlyUsed: ProjectResponse[]
}

export interface WebsiteBilling {
  projectId: string
  status: EntitlementStatus
  price: number
  currency: string
  canExport: boolean
  canCloudSave: boolean
}

export interface CheckoutResponse {
  invoiceId: string
  provider: string
  checkoutUrl: string
  amount: number
  currency: string
}
