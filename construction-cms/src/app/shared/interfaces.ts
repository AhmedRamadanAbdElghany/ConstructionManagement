export type UserRole = 'SuperAdmin' | 'CompanyAdmin' | 'CompanyUser' | 'NormalUser';

export interface Company {
  id: number;
  name: string;
  isActive: boolean;
  packageId?: number;
  settings?: any;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  status: 'Working' | 'Absent' | 'Client';
  salary: number;
  notes?: string; // Admin private notes
}

export interface Project {
  id: number;
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
}

export interface BOQItem {
  id: number;
  projectId: number;
  description: string;
  unit: string;
  totalQuantity: number;
  executedQuantity: number;
  rate: number;
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
  boqItemId: number;
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
  status: 'Peak' | 'Steady' | 'Below Average';
}

export interface CompanySettings {
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
  clientCanSeeBOQ: boolean;
  defaultMoneyCalculationMethod: string;
  allowMeasured: boolean;
  allowSupervision: boolean;
  allowPackages: boolean;
  allowLocations: boolean;
  allowHR: boolean;
  defaultSupervisionPercentage?: number;
  autoCloseDay: boolean;
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
  clientCanSeeBOQ: boolean | null;
  moneyCalculationMethod: string | null;
  autoCloseDay: boolean | null;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  maxTeamMembers: number;
  maxDailyPhotos: number;
  maxBOQItems: number;
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
  boqItemId: number;
  itemName: string;
  estimatedBudget: number;
  totalSpent: number;
  currentProfit: number;
  profitPercentage: number;
}

export interface CreateBOQItemRequest {
  itemCode?: string;
  itemName: string;
  description?: string;
  unit?: string;
  startDate?: string;
  endDate?: string;
  accountingType: string;
  agreedQuantity?: number;
  unitPrice?: number;
  supervisionPercentage?: number;
  baseCalculation?: string;
  customBaseAmount?: number;
  estimatedTotalCost?: number;
}

export interface UpdateBOQItemRequest {
  itemName?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
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
  description?: string;
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

