export type UserRole = 'SuperAdmin' | 'CompanyAdmin' | 'CompanyUser' | 'NormalUser';

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
