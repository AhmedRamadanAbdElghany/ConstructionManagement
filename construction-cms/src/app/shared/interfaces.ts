export type UserRole = 'SuperAdmin' | 'CompanyAdmin' | 'CompanyUser' | 'NormalUser';

export type UserType = 0 | 1 | 2 | 3; // ConstructionClient=0, ConstructionWorker=1, ContractorOwner=2, MaterialsSupplier=3

export interface Company {
  id: number;
  name: string;
  isActive: boolean;
  packageId?: number;
  settings?: any;

  // Feature Toggles
  enableUserManagement: boolean;
  enableProjectManagement: boolean;
  enableProjectItemsManagement: boolean;
  enableDailyLogs: boolean;
  enableSiteMedia: boolean;
  enableEquipmentManagement: boolean;
  enableInventoryManagement: boolean;
  enableQualityControl: boolean;
  enableSafetyManagement: boolean;
  enableSubcontractorManagement: boolean;
  enableFinancialManagement: boolean;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableDocumentManagement: boolean;
  enableDesignManagement: boolean;
  enableClientPortal: boolean;
  enableAccessControl: boolean;
  enableHRManagement: boolean;
  enableVendorManagement: boolean;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  roles?: string[]; // For backward compatibility
  userType?: UserType; // 0=ConstructionClient, 1=ConstructionWorker, 2=ContractorOwner, 3=MaterialsSupplier
  status: 'Working' | 'Absent' | 'Client';
  salary: number;
  notes?: string; // Admin private notes
  reportsToId?: number;
}

export interface Project {
  id: number;
  companyId: number;
  name: string;
  status: 'Active' | 'Completed' | 'Delayed';
  progress: number;
  cashFlow: {
    earned: number;
    collected: number;
  };
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  startDate: string; // ISO string
  endDate?: string; // ISO string
  packageId?: number;
  calculationMethod?: 'Measured' | 'Supervision' | 'Packages';
  totalContractValue?: number;
  supervisionPercentage?: number;
  useCompanyPercentage?: boolean;
  extraFees?: number;
  extraFeesDescription?: string;
  deductedAmount?: number;
  deductedAmountDescription?: string;
  generalManagerUserId?: number;
}

export interface ProjectItem {
  id: number;
  projectId: number;
  phaseId?: number; // Linked phase in hierarchy
  itemCode: string;
  itemName: string;
  description?: string;
  unit?: string;
  status: string;
  startDate?: string;
  endDate?: string;

  // Accounting determined by Project.AccountingSystem

  // Measured data (for Measured accounting)
  agreedQuantity?: number;
  executedQuantity?: number;
  unitPrice?: number;

  // Supervision data (for Supervision accounting)
  estimatedTotalCost?: number;
  supervisionPercentage?: number;

  // Package data (for Packages accounting)
  totalPackageValue?: number;

  // Computed
  estimatedBudget?: number;
  progressPercentage?: number;
}

export interface DailyLog {
  id: number;
  projectId: number;
  date: string; // ISO string
  isClosed: boolean;
  items: DailyLogItem[];
}

export interface DailyLogItem {
  id: number;
  projectItemId: number;
  quantity: number;
  notes: string;
  startTime?: string; // ISO string
}

export interface SiteMedia {
  id: number;
  projectId: number;
  dailyLogId?: number;
  url: string;
  type: 'image' | 'video';
  status: 'Pending' | 'Approved' | 'Rejected';
  uploadedByUserId: number;
  uploadedAt: string; // ISO string
}

export interface Transaction {
  id: number;
  projectId: number;
  amount: number;
  type: 'Income' | 'Expense';
  date: string; // ISO string
  description: string;
}

export interface VacationRequest {
  id: number;
  userId: number;
  type: 'Sick' | 'Annual' | 'Emergency';
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
}

export interface AppNotification {
  id: number;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  route?: string;  // Deep link route
  timestamp: string;
  read: boolean;
}

export interface SalaryRecord {
  id: number;
  userId: number;
  month: string; // Format: "YYYY-MM"
  basicSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Pending';
}

export interface WorkerPerformance {
  userId: number;
  userName: string;
  projectName: string;
  tasksCompleted: number;
  efficiency: number;
  attendance: number;
  approvedItems: number;
  rejectedItems: number;
  status: 'Peak' | 'Steady' | 'Below Average';
}

export interface CompanySettings {
  [key: string]: any;
  id: number;
  name?: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  logoUrl?: string;
  // Master Switches
  enableUserManagement: boolean;
  enableProjectManagement: boolean;
  enableProjectItemsManagement: boolean;
  enableDailyLogs: boolean;
  enableSiteMedia: boolean;
  enableInventoryManagement: boolean;
  enableEquipmentManagement: boolean;
  enableQualityControl: boolean;
  enableSafetyManagement: boolean;
  enableSubcontractorManagement: boolean;
  enableFinancialManagement: boolean;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableDocumentManagement: boolean;
  enableDesignManagement: boolean;
  enableClientPortal: boolean;
  enableAccessControl: boolean;
  enableHRManagement: boolean;
  enableVendorManagement: boolean;

  // General Settings
  enableDelayNotification: boolean;
  delayNotificationIsOneTimeOnly: boolean;
  delayNotificationIntervalDays: number;
  delayNotificationSendEmail: boolean;
  delayGracePeriodDays: number;
  enablePhotoUpload: boolean;
  requirePhotoReview: boolean;
  photoApproverRole: string;
  enableInvoiceReview: boolean;
  enableInvoiceAggregation: boolean;
  maxPhotosPerUpload: number | null;
  clientCanSeeFinancials: boolean;
  clientCanSeeMedia: boolean;
  clientCanSeeProjectItems: boolean;
  defaultMoneyCalculationMethod: string;
  allowMeasured: boolean;
  allowSupervision: boolean;
  allowPackages: boolean;
  allowLocations: boolean;
  allowHR: boolean;
  defaultSupervisionPercentage?: number;

  // Daily Log Settings
  allowAddProgressEntry: boolean;
  allowReopenClosedDay: boolean;
  autoCloseDay: boolean;
  autoCloseDayTime?: string;

  // Inventory Settings
  requireMaterialRequestApproval?: boolean;
  materialRequestApproverRole?: string;
  enableMultiWarehouse?: boolean;
  enableStockAlerts?: boolean;
  defaultLowStockThreshold?: number;

  // Equipment Settings
  enableEquipmentGpsTracking?: boolean;
  enableEquipmentRentalBilling?: boolean;
  enableEquipmentUtilizationTracking?: boolean;
  maintenanceReminderDays?: number;
  requireEquipmentAssignmentApproval?: boolean;
  equipmentAssignmentApproverRole?: string;
  requireMaintenanceSchedule?: boolean;
  enableEquipmentInsuranceTracking?: boolean;
  enableEquipmentDepreciation?: boolean;
  defaultDepreciationYears?: number;

  // Safety Settings
  requireSafetyInspections?: boolean;
  safetyInspectionFrequencyDays?: number;
  incidentReportingHours?: number;
  enableIncidentEscalation?: boolean;
  requireSafetyTraining?: boolean;
  safetyTrainingRenewalMonths?: number;
  enableSafetyComplianceTracking?: boolean;
  safetyChecklistApproverRole?: string;
  incidentInvestigatorRole?: string;
  requireEquipmentOperatorCertification?: boolean;

  // Subcontractor Settings
  requireSubcontractorApproval?: boolean;
  requireSubcontractorInsurance?: boolean;
  subcontractorInsuranceWarningDays?: number;
  defaultRetentionPercentage?: number;
  requireSubcontractorContract?: boolean;
  requireSubcontractorPaymentApproval?: boolean;
  subcontractorPaymentApproverRole?: string;
  maxPaymentWithoutApproval?: number;
  enableSubcontractorRatings?: boolean;
  requireRatingOnCompletion?: boolean;
  enableSubcontractorSafetyScore?: boolean;
  minimumRatingThreshold?: number;

  // Document Settings
  maxFileSizeMB?: number;
  allowedFileTypes?: string;
  requireDocumentApproval?: boolean;
  enableVersionControl?: boolean;
  enableExpirationTracking?: boolean;
  documentExpirationWarningDays?: number;
  documentApproverRole?: string;
  enableDocumentCategories?: boolean;
  maxVersionsPerDocument?: number;

  // Quality Control Settings
  requireQualityInspections?: boolean;
  qualityInspectionFrequencyDays?: number;
  defectTrackingEnabled?: boolean;
  punchListEnabled?: boolean;
  qualityScoreThreshold?: number;
  autoEscalateCriticalDefects?: boolean;
  defectResponseHours?: number;

  // Analytics Settings
  enableAnalyticsReporting?: boolean;

  // New Feature Flags
  enableLeaveManagement?: boolean;
  enablePerformanceEvaluation?: boolean;
  enableTrainingTracking?: boolean;
  enableVideoCalls?: boolean;
  enableMultiCurrency?: boolean;
  enablePaymentGateway?: boolean;

  // Additional Feature Flags (default to false for security)
  enableInspections?: boolean;
  enableTasks?: boolean;
  enableEscalations?: boolean;
  enableMessaging?: boolean;
  enableSocialWall?: boolean;
  enableMarketplace?: boolean;
  enableInventoryOwner?: boolean;

  // Location & Geofencing Feature Flags (default to false for security)
  enableLocationTracking?: boolean;
  enableGeofenceManagement?: boolean;
  enableLocationSubmit?: boolean;
}

export interface ProjectSettings {
  enableDelayNotification: boolean | null;
  delayNotificationIsOneTimeOnly: boolean | null;
  delayNotificationIntervalDays: number | null;
  delayNotificationSendEmail: boolean | null;
  delayGracePeriodDays: number | null;
  enablePhotoUpload: boolean | null;
  requirePhotoReview: boolean | null;
  photoApproverRole: string | null;
  enableInvoiceReview: boolean | null;
  enableInvoiceAggregation: boolean | null;
  maxPhotosPerUpload: number | null;
  clientCanSeeFinancials: boolean | null;
  clientCanSeeMedia: boolean | null;
  clientCanSeeProjectItems: boolean | null;
  moneyCalculationMethod: string | null;
  // Daily Log Settings (null = inherit from Company)
  allowAddProgressEntry: boolean | null;
  allowReopenClosedDay: boolean | null;
  autoCloseDay: boolean | null;
  autoCloseDayTime: string | null;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  maxTeamMembers: number;
  maxDailyPhotos: number;
  maxProjectItems: number;
  allowAdvancedReports: boolean;
  allowCustomBranding: boolean;
  allowAIAssistance: boolean;
}

export interface CreateProjectRequest {
  projectName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  generalManagerUserId?: number;
  accountingSystem: string;
  totalContractValue?: number;
  settings?: Partial<ProjectSettings>;
}

export interface UpdateProjectRequest {
  projectName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  totalContractValue?: number;
  generalManagerUserId?: number;
}

export interface ProjectProfitability {
  projectId: number;
  totalEstimatedBudget: number;
  totalSpent: number;
  totalProfit: number;
  profitPercentage: number;
  itemsCount: number;
}

export interface ItemProfitability {
  projectItemId: number;
  itemName: string;
  estimatedBudget: number;
  totalSpent: number;
  currentProfit: number;
  profitPercentage: number;
}

export interface CreateProjectItemRequest {
  itemCode?: string;
  itemName: string;
  description?: string;
  unit?: string;
  phaseId?: number;
  startDate?: string;
  endDate?: string;
  // Measured data
  agreedQuantity?: number;
  unitPrice?: number;
  // Supervision data
  supervisionPercentage?: number;
  estimatedTotalCost?: number;
  // Package data
  totalPackageValue?: number;
}

export interface UpdateProjectItemRequest {
  itemName?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  // Financial fields matching Create request
  agreedQuantity?: number;
  unitPrice?: number;
  supervisionPercentage?: number;
  estimatedTotalCost?: number;
  totalPackageValue?: number;
}

export interface CompanyPackage {
  id: number;
  companyId?: number;
  name: string;
  description: string;
  price: number;
  includedItemsDescription: string;
  variationCalculation: 'AddFullCost' | 'AddDifference';
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  companyId?: number;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  desc?: string;
  companyId?: number;
}

export interface RolePermission {
  roleId: number;
  permissionId: number;
  companyId?: number;
}

export interface CatalogItem {
  id: number;
  companyId?: number;
  projectId?: number; // If null, it's a company-wide general item
  name: string;
  description?: string;
  unit: string;
  defaultRate?: number;
  category?: string;
}

export interface ProjectBill {
  id: number;
  projectId: number;
  billNumber: string;
  amount: number;
  date: string; // ISO string
  status: 'Pending' | 'Approved' | 'Rejected';
  actionBy?: string; // Full name of the user who approved/rejected
  actionAt?: string; // ISO string
  notes?: string;
  photoUrl?: string; // URL to the bill image
}

export interface ClientPayment {
  id: number;
  projectId: number;
  amount: number;
  date: string; // ISO string
  method: 'Bank Transfer' | 'Cash' | 'Cheque';
  referenceNumber: string;
  status: 'Received' | 'Pending' | 'Bounced';
  notes?: string;
  photoUrl?: string;
  actionBy?: string;
}

export interface ProjectActivity {
  id: number;
  projectId: number;
  userId: number;
  userName: string;
  type: 'Log' | 'Finance' | 'Team' | 'Setting' | 'Media';
  action: string;
  details: string;
  timestamp: string; // ISO string
}

// Design Management

export type DesignStatus = 'Draft' | 'Active' | 'Archived' | 'Deprecated' | 'Pending' | 'Approved' | 'Rejected';

export type DesignApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Design {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  status: DesignStatus;
  version: number;
  fileUrl?: string;
  fileName?: string;
  originalFileName?: string;
  fileSize?: number;
  fileType?: string;
  createdByUserId?: number;
  createdByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
  versionCount?: number;
  changeNotes?: string;
  // Approval fields
  approvalStatus?: DesignApprovalStatus;
  approvedByUserId?: number;
  approvedByUserName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  parentDesignId?: number;
}

export interface DesignCategory {
  id: number;
  companyId?: number;
  projectId?: number;
  name: string;
  description?: string;
  order: number;
  parentCategoryId?: number;
  childCategories?: DesignCategory[];
  designs?: Design[];
  designCount?: number;
  // Additional properties
  createdAt?: string;
  photoUrl?: string;
  createdByUserId?: number;
}

export interface CreateDesignRequest {
  name: string;
  description?: string;
  categoryId?: number;
  file?: File;
  status: 'Draft' | 'Active' | 'Archived' | 'Deprecated';
  createAsNewVersion: boolean;
  parentDesignId?: number;
  changeNotes?: string;
}

export interface UpdateDesignRequest {
  name?: string;
  description?: string;
  categoryId?: number;
  file?: File;
  status?: 'Draft' | 'Active' | 'Archived' | 'Deprecated';
  changeNotes?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentCategoryId?: number;
  projectId?: number;
  companyId?: number;
  order: number;
  file?: File;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentCategoryId?: number;
  order?: number;
  file?: File;
}

// Analytics & Reports Interfaces
export interface ReportFilter {
  key: string;
  label: string;
  type: 'select' | 'text' | 'number' | 'date' | 'boolean';
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface ReportGenerationRequest {
  reportId: number;
  filters: any;
  format: string;
  schedule?: {
    frequency: string;
    dayOfWeek?: number;
    time?: string;
  };
}

export interface GeneratedReport {
  id: string;
  name: string;
  format: string;
  generatedAt: string;
  status: string;
  downloadUrl?: string;
}

// Client Portal Interfaces
export interface ClientPayment {
  id: number;
  projectId: number;
  projectName: string;
  amount: number;
  date: string;
  method: 'Bank Transfer' | 'Cash' | 'Cheque';
  referenceNumber: string;
  status: 'Received' | 'Pending' | 'Bounced';
  notes?: string;
  photoUrl?: string;
  actionBy?: string;
}

export interface ClientPaymentSummary {
  totalInvoiced: number;
  totalPaid: number;
  pendingAmount: number;
  overdueAmount: number;
  paymentCount: number;
}

export interface ClientMessage {
  id: number;
  projectId: number;
  projectName: string;
  subject: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  replies?: ClientMessageReply[];
}

export interface ClientMessageReply {
  id: number;
  message: string;
  createdAt: string;
  createdBy: string;
  isFromClient: boolean;
}

export interface ChangeOrderRequest {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  description: string;
  estimatedCost: number;
  estimatedTimeImpact: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface ClientUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  avatarUrl?: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// Quality Control Interfaces
export interface QualityInspection {
  id: number;
  projectId: number;
  projectName: string;
  inspectionType: string;
  location: string;
  scheduledDate: string;
  completedDate?: string;
  inspectorId: number;
  inspectorName: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  score: number;
  notes?: string;
  checklistItems: QualityChecklistItem[];
}

export interface QualityChecklistItem {
  id: number;
  description: string;
  category: string;
  isRequired: boolean;
  isPassed: boolean;
  notes?: string;
  photos?: string[];
}

export interface QualityDefect {
  id: number;
  projectId: number;
  projectName: string;
  location: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Verified';
  reportedDate: string;
  reportedBy: string;
  assignedTo?: string;
  dueDate?: string;
  resolvedDate?: string;
  photos?: string[];
  costImpact?: number;
}

export interface PunchListItem {
  id: number;
  projectId: number;
  projectName: string;
  location: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Completed';
  assignedTo?: string;
  dueDate?: string;
  completedDate?: string;
  photos?: string[];
}

// Safety Management Interfaces
export interface SafetyInspection {
  id: number;
  projectId: number;
  projectName: string;
  inspectionType: string;
  location: string;
  scheduledDate: string;
  completedDate?: string;
  inspectorId: number;
  inspectorName: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  score: number;
  findings: SafetyFinding[];
  notes?: string;
}

export interface SafetyFinding {
  id: number;
  category: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Corrected' | 'Verified';
  dueDate?: string;
  correctedDate?: string;
}

export interface SafetyIncident {
  id: number;
  projectId: number;
  projectName: string;
  incidentType: string;
  severity: 'Minor' | 'Moderate' | 'Major' | 'Critical';
  description: string;
  location: string;
  incidentDate: string;
  reportedDate: string;
  reportedBy: string;
  status: 'Open' | 'Investigating' | 'Resolved' | 'Closed';
  assignedTo?: string;
  investigationNotes?: string;
  rootCause?: string;
  correctiveActions?: string;
  photos?: string[];
  witnesses?: string[];
}

export interface SafetyTraining {
  id: number;
  trainingType: string;
  title: string;
  description: string;
  trainer: string;
  trainingDate: string;
  duration: number;
  location: string;
  attendees: SafetyTrainingAttendee[];
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface SafetyTrainingAttendee {
  userId: number;
  userName: string;
  attended: boolean;
  score?: number;
  certificateIssued: boolean;
  certificateExpiryDate?: string;
}

// Equipment Management Interfaces
export interface EquipmentAssignment {
  id: number;
  equipmentId: number;
  equipmentName: string;
  projectId: number;
  projectName: string;
  assignedDate: string;
  returnedDate?: string;
  assignedBy: string;
  status: 'Active' | 'Returned' | 'Transferred';
  operatingHours: number;
  fuelConsumed: number;
  notes?: string;
}

export interface EquipmentMaintenance {
  id: number;
  equipmentId: number;
  equipmentName: string;
  maintenanceType: 'Preventive' | 'Corrective' | 'Emergency';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  performedBy: string;
  cost: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  partsUsed?: string[];
  notes?: string;
}

// Inventory Management Interfaces
export interface InventoryTransaction {
  id: number;
  itemId: number;
  itemName: string;
  transactionType: 'In' | 'Out' | 'Transfer' | 'Adjustment';
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  transactionDate: string;
  referenceNumber?: string;
  projectId?: number;
  projectName?: string;
  performedBy: string;
  notes?: string;
}

// Subcontractor Management Interfaces
export interface SubcontractorContract {
  id: number;
  subcontractorId: number;
  subcontractorName: string;
  projectId: number;
  projectName: string;
  contractNumber: string;
  contractType: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  status: 'Draft' | 'Active' | 'Completed' | 'Terminated';
  scopeOfWork: string;
  paymentTerms: string;
  signedDate?: string;
  documents?: string[];
}

export interface SubcontractorPayment {
  id: number;
  contractId: number;
  subcontractorId: number;
  subcontractorName: string;
  projectId: number;
  projectName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'Cancelled';
  invoiceNumber?: string;
  notes?: string;
}

export interface SubcontractorRating {
  id: number;
  subcontractorId: number;
  subcontractorName: string;
  projectId: number;
  projectName: string;
  ratingDate: string;
  ratedBy: string;
  qualityRating: number;
  timelinessRating: number;
  communicationRating: number;
  safetyRating: number;
  overallRating: number;
  comments?: string;
}
