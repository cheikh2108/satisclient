// ==================== FEEDBACK ====================
export interface Feedback {
  id: string;
  siteId: string;
  organizationId: string;
  overallRating: number;
  criteriaRatings?: Record<string, number>;
  comment?: string | null;
  commentSentiment?: "positive" | "neutral" | "negative" | null;
  commentKeywords?: string[];
  userId?: string | null;
  isAnonymous: boolean;
  respondentName?: string | null;
  respondentEmail?: string | null;
  respondentPhone?: string | null;
  serviceDate?: string | null;
  feedbackChannel?: string;
  isProcessed: boolean;
  processedAt?: string | null;
  needsResponse: boolean;
  responseSentAt?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  updatedAt: string;
  site?: { id: string; name: string; code: string };
}

export interface CreateFeedbackDto {
  siteId: string;
  organizationId: string;
  overallRating: number;
  comment?: string;
  isAnonymous?: boolean;
  respondentName?: string;
  respondentEmail?: string;
  respondentPhone?: string;
  feedbackChannel?: string;
  qrCode?: string;
  needsResponse?: boolean;
}

export interface UpdateFeedbackDto {
  isProcessed?: boolean;
  needsResponse?: boolean;
}

// ==================== COMPLAINT (RÉCLAMATION) ====================
export interface Complaint {
  id: string;
  organizationId: string;
  siteId: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  priority: "low" | "normal" | "high" | "urgent";
  status:
    | "received"
    | "qualified"
    | "assigned"
    | "in_progress"
    | "resolved"
    | "closed";
  isAnonymous: boolean;
  complainantName?: string | null;
  complainantEmail?: string | null;
  complainantPhone?: string | null;
  assignedTo?: string | null;
  slaDueDate?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  isEscalated: boolean;
  isOverdue: boolean;
  isCritical: boolean;
  createdAt: string;
  updatedAt: string;
  site?: { id: string; name: string; code: string };
}

// Backward-compat alias
export type Reclamation = Complaint;

export interface CreateComplaintDto {
  siteId: string;
  title: string;
  description: string;
  category: string;
  priority?: "low" | "normal" | "high" | "urgent";
  isAnonymous?: boolean;
  complainantName?: string;
  complainantEmail?: string;
  complainantPhone?: string;
}

export type CreateReclamationDto = CreateComplaintDto;

export interface UpdateComplaintDto {
  title?: string;
  description?: string;
  priority?: "low" | "normal" | "high" | "urgent";
  status?:
    | "received"
    | "qualified"
    | "assigned"
    | "in_progress"
    | "resolved"
    | "closed";
}

export type UpdateReclamationDto = UpdateComplaintDto;

// ==================== QR CODE ====================
export interface QRCode {
  id: string;
  organizationId: string;
  siteId: string;
  code: string;
  targetType: string;
  destinationUrl: string;
  qrImageUrl?: string | null;
  isActive: boolean;
  scanCount: number;
  lastScannedAt?: string | null;
  site?: { id: string; name: string; code: string };
  createdAt: string;
}

export interface CreateQRCodeDto {
  siteId: string;
  code?: string;
  targetType: string;
  destinationUrl: string;
}

export interface UpdateQRCodeDto {
  isActive?: boolean;
  destinationUrl?: string;
}

// ==================== SITE ====================
export interface Site {
  id: string;
  name: string;
  code: string;
  type: "organization" | "region" | "agency" | "service" | "point";
  organizationId: string;
  isActive: boolean;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  createdAt: string;
}

export interface CreateSiteDto {
  name: string;
  code?: string;
  type: "organization" | "region" | "agency" | "service" | "point";
  organizationId: string;
  isActive?: boolean;
  city?: string;
  region?: string;
  country?: string;
}

export interface UpdateSiteDto {
  name?: string;
  type?: "organization" | "region" | "agency" | "service" | "point";
  isActive?: boolean;
  city?: string;
  region?: string;
  country?: string;
}

// ==================== USER ====================
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role:
    | "super_admin"
    | "org_admin"
    | "quality_manager"
    | "service_manager"
    | "agent"
    | "client";
  status: "active" | "inactive" | "pending";
  organizationId?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role:
    | "super_admin"
    | "org_admin"
    | "quality_manager"
    | "service_manager"
    | "agent"
    | "client";
  organizationId: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?:
    | "super_admin"
    | "org_admin"
    | "quality_manager"
    | "service_manager"
    | "agent"
    | "client";
  status?: "active" | "inactive" | "pending" | "suspended";
}

// ==================== ORGANIZATION ====================
export interface Organization {
  id: string;
  name: string;
  slug: string;
  email?: string | null;
  website?: string | null;
  description?: string | null;
  industry?: string | null;
  country?: string | null;
  billingEmail?: string | null;
  phone?: string | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
  maxSites?: number | null;
  maxUsers?: number | null;
  maxMonthlyFeedbacks?: number | null;
  trialEndsAt?: string | null;
  createdAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  email: string;
  subscriptionPlan?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  website?: string;
  description?: string;
  industry?: string;
  country?: string;
  billingEmail?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
}

// ==================== NOTIFICATION ====================
export interface Notification {
  id: string;
  organizationId: string;
  userId?: string | null;
  notificationType: string;
  channel: string;
  status: string;
  subject: string;
  body: string;
  scheduledFor?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt: string | null;
  retryCount: number;
  createdAt: string;
}

export interface MarkNotificationReadDto {
  notificationId: string;
}

// ==================== QUERY PARAMS ====================
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface FeedbackFilters extends PaginationParams {
  type?: string;
  sentiment?: string;
  commentSentiment?: string;
  status?: string;
  siteId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReclamationFilters extends PaginationParams {
  priority?: string;
  status?: string;
  category?: string;
  siteId?: string;
  startDate?: string;
  endDate?: string;
}

export interface SiteFilters extends PaginationParams {
  type?: string;
  isActive?: boolean;
  organizationId?: string;
}

export interface UserFilters extends PaginationParams {
  role?: string;
  status?: string;
  organizationId?: string;
}
