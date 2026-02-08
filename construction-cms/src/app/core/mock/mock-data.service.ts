import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User, Project, BOQItem, DailyLog, SiteMedia, Transaction, VacationRequest, AppNotification, WorkerPerformance, Role, ProjectBill, ClientPayment, Design, DesignCategory } from '../../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private users: User[] = [
    { id: 1, fullName: 'Ahmed Ali', email: 'ahmed@company.com', role: 'CompanyAdmin', status: 'Working', salary: 5000, notes: 'Senior Manager - Has full access to all projects' },
    { id: 2, fullName: 'Maria Hassan', email: 'maria@company.com', role: 'CompanyUser', status: 'Working', salary: 3500, notes: 'Site Engineer - Assigned to Dubai Tower project' },
    { id: 3, fullName: 'John Doe', email: 'john@client.com', role: 'NormalUser', status: 'Client', salary: 0, notes: 'Client for Residential Tower Dubai' },
    { id: 4, fullName: 'Omar Khalil', email: 'omar@company.com', role: 'CompanyUser', status: 'Working', salary: 3200, notes: 'Field Supervisor - Excellent performance' },
    { id: 5, fullName: 'Super Admin', email: 'admin@saas.com', role: 'SuperAdmin', status: 'Working', salary: 0, notes: 'SaaS Administrator' },
    { id: 6, fullName: 'Sara Ibrahim', email: 'sara@company.com', role: 'CompanyUser', status: 'Absent', salary: 2800, notes: 'Junior Engineer - On annual leave' },
    { id: 7, fullName: 'Mohamed Farid', email: 'mohamed@company.com', role: 'CompanyUser', status: 'Working', salary: 4000, notes: 'Senior Site Engineer' },
    { id: 8, fullName: 'Client Two', email: 'client2@email.com', role: 'NormalUser', status: 'Client', salary: 0, notes: 'Client for Commercial Mall project' }
  ];

  private projects: Project[] = [
    {
      id: 1,
      name: 'Residential Tower Dubai',
      status: 'Active',
      progress: 65,
      cashFlow: { earned: 1200000, collected: 900000 },
      location: { lat: 25.2048, lng: 55.2708, address: 'Downtown Dubai, UAE' },
      startDate: '2024-01-15T00:00:00Z',
      endDate: '2025-06-30T00:00:00Z',
      generalManagerUserId: 2
    },
    {
      id: 2,
      name: 'Commercial Mall Cairo',
      status: 'Delayed',
      progress: 30,
      cashFlow: { earned: 500000, collected: 300000 },
      location: { lat: 30.0444, lng: 31.2357, address: 'New Cairo, Egypt' },
      startDate: '2024-03-01T00:00:00Z',
      endDate: '2025-12-31T00:00:00Z',
      generalManagerUserId: 2
    },
    {
      id: 3,
      name: 'Villa Complex Riyadh',
      status: 'Active',
      progress: 45,
      cashFlow: { earned: 850000, collected: 650000 },
      location: { lat: 24.7136, lng: 46.6753, address: 'Al Olaya District, Riyadh' },
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2025-08-15T00:00:00Z',
      generalManagerUserId: 4
    },
    {
      id: 4,
      name: 'Office Building Abu Dhabi',
      status: 'Completed',
      progress: 100,
      cashFlow: { earned: 2500000, collected: 2400000 },
      location: { lat: 24.4539, lng: 54.3773, address: 'ADGM, Abu Dhabi' },
      startDate: '2023-01-01T00:00:00Z',
      endDate: '2024-06-30T00:00:00Z',
      generalManagerUserId: 4
    },
    {
      id: 5,
      name: 'Shopping Center Kuwait',
      status: 'Active',
      progress: 78,
      cashFlow: { earned: 1800000, collected: 1500000 },
      location: { lat: 29.3759, lng: 47.9774, address: 'Kuwait City, Kuwait' },
      startDate: '2023-09-01T00:00:00Z',
      endDate: '2025-03-31T00:00:00Z',
      generalManagerUserId: 7
    },
    {
      id: 6,
      name: 'Airport Extension Phase 1',
      status: 'Delayed',
      progress: 15,
      cashFlow: { earned: 200000, collected: 50000 },
      location: { lat: 29.3759, lng: 47.9774, address: 'Kuwait City, Kuwait' },
      startDate: '2024-05-01T00:00:00Z',
      endDate: '2026-03-31T00:00:00Z',
      generalManagerUserId: 2
    }
  ];

  private boqItems: BOQItem[] = [
    { id: 1, projectId: 1, description: 'Excavation Works', unit: 'm³', totalQuantity: 5000, executedQuantity: 4500, rate: 50 },
    { id: 2, projectId: 1, description: 'Concrete Foundation', unit: 'm³', totalQuantity: 2000, executedQuantity: 1200, rate: 300 },
    { id: 3, projectId: 1, description: 'Reinforcement Steel', unit: 'ton', totalQuantity: 500, executedQuantity: 350, rate: 1500 },
    { id: 4, projectId: 1, description: 'Formwork', unit: 'm²', totalQuantity: 8000, executedQuantity: 5200, rate: 45 },
    { id: 5, projectId: 1, description: 'Waterproofing Membrane', unit: 'm²', totalQuantity: 3000, executedQuantity: 1800, rate: 80 },
    { id: 6, projectId: 2, description: 'Brick Works', unit: 'm²', totalQuantity: 1000, executedQuantity: 200, rate: 80 },
    { id: 7, projectId: 2, description: 'Plastering', unit: 'm²', totalQuantity: 5000, executedQuantity: 1000, rate: 25 },
    { id: 8, projectId: 3, description: 'Landscaping', unit: 'm²', totalQuantity: 2500, executedQuantity: 1200, rate: 35 }
  ];

  private dailyLogs: DailyLog[] = [
    {
      id: 1,
      projectId: 1,
      date: '2024-01-25T00:00:00Z',
      isClosed: true,
      items: [
        { id: 1, boqItemId: 1, quantity: 150, notes: 'Completed excavation section A', startTime: '2024-01-25T08:00:00Z' },
        { id: 2, boqItemId: 2, quantity: 50, notes: 'Foundation pouring for columns 1-5', startTime: '2024-01-25T10:30:00Z' }
      ]
    },
    {
      id: 2,
      projectId: 1,
      date: '2024-01-26T00:00:00Z',
      isClosed: true,
      items: [
        { id: 3, boqItemId: 3, quantity: 25, notes: 'Installed rebar for level 2', startTime: '2024-01-26T07:30:00Z' }
      ]
    },
    {
      id: 3,
      projectId: 1,
      date: new Date().toISOString(),
      isClosed: false,
      items: []
    }
  ];

  private siteMedia: SiteMedia[] = [
    { id: 1, projectId: 1, url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=300&fit=crop', type: 'image', status: 'Approved', uploadedByUserId: 2, uploadedAt: '2024-01-20T10:00:00Z' },
    { id: 2, projectId: 1, url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=300&fit=crop', type: 'image', status: 'Approved', uploadedByUserId: 4, uploadedAt: '2024-01-21T14:00:00Z' },
    { id: 3, projectId: 1, url: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=300&h=300&fit=crop', type: 'image', status: 'Pending', uploadedByUserId: 2, uploadedAt: '2024-01-22T09:00:00Z' },
    { id: 4, projectId: 2, url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300&h=300&fit=crop', type: 'image', status: 'Approved', uploadedByUserId: 6, uploadedAt: '2024-01-18T11:00:00Z' },
    { id: 5, projectId: 3, url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=300&fit=crop', type: 'image', status: 'Rejected', uploadedByUserId: 7, uploadedAt: '2024-01-19T16:00:00Z' }
  ];

  private transactions: Transaction[] = [
    { id: 1, projectId: 1, amount: 250000, type: 'Income', date: '2024-01-15T00:00:00Z', description: 'Initial Payment - Phase 1' },
    { id: 2, projectId: 1, amount: 45000, type: 'Expense', date: '2024-01-18T00:00:00Z', description: 'Material Purchase - Cement & Steel' },
    { id: 3, projectId: 1, amount: 350000, type: 'Income', date: '2024-01-25T00:00:00Z', description: 'Milestone Payment - Foundation Complete' },
    { id: 4, projectId: 1, amount: 28000, type: 'Expense', date: '2024-01-28T00:00:00Z', description: 'Equipment Rental' },
    { id: 5, projectId: 2, amount: 150000, type: 'Income', date: '2024-01-10T00:00:00Z', description: 'Initial Deposit' }
  ];

  private vacationRequests: VacationRequest[] = [
    { id: 1, userId: 2, type: 'Annual', startDate: '2024-02-01T00:00:00Z', endDate: '2024-02-08T00:00:00Z', status: 'Approved' },
    { id: 2, userId: 6, type: 'Sick', startDate: '2024-01-28T00:00:00Z', endDate: '2024-01-30T00:00:00Z', status: 'Pending' },
    { id: 3, userId: 4, type: 'Emergency', startDate: '2024-03-15T00:00:00Z', endDate: '2024-03-17T00:00:00Z', status: 'Pending' }
  ];

  private notifications: AppNotification[] = [
    { id: 1, type: 'warning', message: 'Daily log pending submission - Dubai Tower', route: '/worker/daily-log', timestamp: new Date().toISOString(), read: false },
    { id: 2, type: 'info', message: 'New team member added to Villa Complex project', route: '/admin/projects/3', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
    { id: 3, type: 'success', message: 'Payment received for Office Building - $350,000', route: '/admin/projects/4', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true },
    { id: 4, type: 'warning', message: 'Media rejected - requires higher resolution', route: '/worker/daily-log', timestamp: new Date(Date.now() - 86400000).toISOString(), read: false },
    { id: 5, type: 'info', message: 'Project milestone reached - 65% complete', route: '/admin/projects/1', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true }
  ];

  private workerPerformance: WorkerPerformance[] = [
    { userId: 2, userName: 'Maria Hassan', projectName: 'Residential Tower Dubai', tasksCompleted: 45, efficiency: 92, attendance: 98, approvedItems: 42, rejectedItems: 3, status: 'Peak' },
    { userId: 4, userName: 'Omar Khalil', projectName: 'Residential Tower Dubai', tasksCompleted: 38, efficiency: 88, attendance: 95, approvedItems: 35, rejectedItems: 3, status: 'Peak' },
    { userId: 6, userName: 'Sara Ibrahim', projectName: 'Commercial Mall Cairo', tasksCompleted: 12, efficiency: 65, attendance: 60, approvedItems: 8, rejectedItems: 4, status: 'Below Average' },
    { userId: 7, userName: 'Mohamed Farid', projectName: 'Villa Complex Riyadh', tasksCompleted: 52, efficiency: 95, attendance: 100, approvedItems: 50, rejectedItems: 2, status: 'Peak' }
  ];

  private roles: Role[] = [
    { id: 1, name: 'CompanyAdmin', description: 'Full access to all company projects and settings' },
    { id: 2, name: 'CompanyUser', description: 'Access to assigned projects and daily logs' },
    { id: 3, name: 'SiteManager', description: 'Management of site operations and worker logs' },
    { id: 4, name: 'Accountant', description: 'Access to financial records and project budgets' },
    { id: 5, name: 'SiteEngineer', description: 'Technical oversight and BOQ management' }
  ];

  private bills: ProjectBill[] = [
    { id: 1, projectId: 1, billNumber: 'INV-2024-001', amount: 15000, date: '2024-01-20T10:00:00Z', status: 'Approved', actionBy: 'Ahmed Ali', actionAt: '2024-01-22T09:30:00Z', photoUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800' },
    { id: 2, projectId: 1, billNumber: 'INV-2024-005', amount: 8500, date: '2024-02-15T14:20:00Z', status: 'Pending', photoUrl: 'https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?w=800' },
    { id: 3, projectId: 1, billNumber: 'INV-2024-002', amount: 4200, date: '2024-01-25T11:00:00Z', status: 'Rejected', actionBy: 'Maria Hassan', actionAt: '2024-01-26T15:45:00Z', notes: 'Incomplete documentation', photoUrl: 'https://images.unsplash.com/photo-1554672408-730436b60dde?w=800' },
    { id: 4, projectId: 2, billNumber: 'INV-2024-C01', amount: 25000, date: '2024-02-01T08:00:00Z', status: 'Approved', actionBy: 'Ahmed Ali', actionAt: '2024-02-03T10:00:00Z', photoUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800' }
  ];

  private clientPayments: ClientPayment[] = [
    { id: 1, projectId: 1, projectName: 'Luxury Villa Project', amount: 50000, date: '2024-01-25T10:00:00Z', method: 'Bank Transfer', referenceNumber: 'TX-9821-001', status: 'Received' },
    { id: 2, projectId: 1, projectName: 'Luxury Villa Project', amount: 25000, date: '2024-02-10T11:30:00Z', method: 'Cash', referenceNumber: 'RCP-552', status: 'Received' },
    { id: 3, projectId: 1, projectName: 'Luxury Villa Project', amount: 15000, date: '2024-02-28T09:15:00Z', method: 'Bank Transfer', referenceNumber: 'TX-9950-042', status: 'Pending' }
  ];

  getUsers(): Observable<User[]> { return of(this.users); }
  getProjects(): Observable<Project[]> { return of(this.projects); }
  getBOQItems(projectId: number): Observable<BOQItem[]> { return of(this.boqItems.filter(i => i.projectId === projectId)); }
  getDailyLogs(projectId: number): Observable<DailyLog[]> { return of(this.dailyLogs.filter(l => l.projectId === projectId)); }
  getSiteMedia(projectId: number): Observable<SiteMedia[]> { return of(this.siteMedia.filter(m => m.projectId === projectId)); }
  getTransactions(projectId: number): Observable<Transaction[]> { return of(this.transactions.filter(t => t.projectId === projectId)); }
  getVacationRequests(userId: number): Observable<VacationRequest[]> { return of(this.vacationRequests.filter(r => r.userId === userId)); }
  getAllVacationRequests(): Observable<VacationRequest[]> { return of(this.vacationRequests); }
  getNotifications(): Observable<AppNotification[]> { return of(this.notifications); }
  getWorkerPerformance(): Observable<WorkerPerformance[]> { return of(this.workerPerformance); }
  getRoles(): Observable<Role[]> { return of(this.roles); }
  getBills(projectId: number): Observable<ProjectBill[]> { return of(this.bills.filter(b => b.projectId === projectId)); }
  getClientPayments(projectId: number): Observable<ClientPayment[]> { return of(this.clientPayments.filter(p => p.projectId === projectId)); }

  // Dashboard stats
  getDashboardStats(): Observable<{ activeProjects: number; completedProjects: number; delayedProjects: number; totalRevenue: number }> {
    return of({
      activeProjects: this.projects.filter(p => p.status === 'Active').length,
      completedProjects: this.projects.filter(p => p.status === 'Completed').length,
      delayedProjects: this.projects.filter(p => p.status === 'Delayed').length,
      totalRevenue: this.projects.reduce((sum, p) => sum + p.cashFlow.earned, 0)
    });
  }

  // Helper to simulate adding data
  addDailyLogItem(logId: number, item: any): Observable<boolean> {
    const log = this.dailyLogs.find(l => l.id === logId);
    if (log) {
      log.items.push({ ...item, id: Math.floor(Math.random() * 1000) });
      return of(true);
    }
    return of(false);
  }

  closeDailyLog(logId: number): Observable<boolean> {
    const log = this.dailyLogs.find(l => l.id === logId);
    if (log) {
      log.isClosed = true;
      return of(true);
    }
    return of(false);
  }

  addVacationRequest(request: Omit<VacationRequest, 'id'>): Observable<VacationRequest> {
    const newRequest: VacationRequest = {
      ...request,
      id: Math.floor(Math.random() * 1000)
    };
    this.vacationRequests.push(newRequest);
    return of(newRequest);
  }

  markNotificationRead(id: number): Observable<boolean> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      return of(true);
    }
    return of(false);
  }

  markAllNotificationsRead(): Observable<boolean> {
    this.notifications.forEach(n => n.read = true);
    return of(true);
  }  // SuperAdmin specialized stats
  getSuperAdminStats(): Observable<{
    totalCompanies: number;
    activeSubscriptions: number;
    monthlyRecurringRevenue: number;
    pendingOnboardings: number
  }> {
    return of({
      totalCompanies: 45,
      activeSubscriptions: 42,
      monthlyRecurringRevenue: 125000,
      pendingOnboardings: 3
    });
  }

  getCompanySubscriptions(): Observable<any[]> {
    return of([
      { id: 1, companyName: 'Al-Massa Construction', plan: 'Enterprise', status: 'Active', nextPayment: '2024-03-15', amount: 5000 },
      { id: 2, companyName: 'BuildIt Solutions', plan: 'Professional', status: 'Active', nextPayment: '2024-03-20', amount: 1500 },
      { id: 3, companyName: 'Skyline Architects', plan: 'Starter', status: 'Canceled', nextPayment: '-', amount: 0 },
      { id: 4, companyName: 'Urban Development', plan: 'Enterprise', status: 'Active', nextPayment: '2024-03-10', amount: 5000 },
      { id: 5, companyName: 'Desert Rock Ltd', plan: 'Professional', status: 'Active', nextPayment: '2024-03-25', amount: 1500 }
    ]);
  }


  getDelayedProjectsStats(): Observable<{ managerName: string, count: number }[]> {
    const delayedProjects = this.projects.filter(p => p.status === 'Delayed');
    const stats = new Map<string, number>();

    delayedProjects.forEach(p => {
      if (p.generalManagerUserId) {
        const manager = this.users.find(u => u.id === p.generalManagerUserId);
        if (manager) {
          const count = stats.get(manager.fullName) || 0;
          stats.set(manager.fullName, count + 1);
        }
      }
    });

    const result = Array.from(stats, ([managerName, count]) => ({ managerName, count }));
    // Add dummy data for visual balance if needed
    if (result.length === 0) {
      result.push({ managerName: 'Maria Hassan', count: 2 });
    }
    return of(result);
  }

  getWorkerProjectStats(userId: number): Observable<{
    totalProjects: number,
    active: number,
    completed: number,
    delayed: number,
    causedDelayCount: number,
    projects: { project: Project, role: string, causedDelay: boolean }[]
  }> {
    // Simulate user involvement in projects
    // For demo purposes, we'll assign the user to all projects but with different statuses
    const userProjects = this.projects.map((p, index) => {
      // Mock some logic for "Reason for Delay" - Assign specifically to Project ID 2 for demo
      const causedDelay = p.status === 'Delayed' && (p.id === 2 || p.id === 6) && userId === 2; // Maria Hassan caused delay in Cairo & Airport
      return {
        project: p,
        role: 'Site Engineer',
        causedDelay: causedDelay
      };
    });

    const stats = {
      totalProjects: userProjects.length,
      active: userProjects.filter(up => up.project.status === 'Active').length,
      completed: userProjects.filter(up => up.project.status === 'Completed').length,
      delayed: userProjects.filter(up => up.project.status === 'Delayed').length,
      causedDelayCount: userProjects.filter(up => up.causedDelay).length,
      projects: userProjects
    };

    return of(stats);
  }

  // =====================
  // Design Categories Mock Data
  // =====================
  private designCategories: DesignCategory[] = [
    {
      id: 1,
      name: 'Architectural',
      description: 'Architectural drawings and plans',
      projectId: 1,
      order: 1,
      createdAt: '2024-01-15T10:00:00Z',
      photoUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
      createdByUserId: 2,
      childCategories: [],
      designs: [],
      designCount: 0
    },
    {
      id: 2,
      name: 'Structural',
      description: 'Structural engineering designs',
      projectId: 1,
      order: 2,
      createdAt: '2024-01-15T10:30:00Z',
      photoUrl: 'https://images.unsplash.com/photo-1518098268026-4e1875127430?w=400&h=300&fit=crop',
      createdByUserId: 2,
      childCategories: [],
      designs: [],
      designCount: 0
    },
    {
      id: 3,
      name: 'Electrical',
      description: 'Electrical systems and schematics',
      projectId: 1,
      order: 3,
      createdAt: '2024-01-16T09:00:00Z',
      photoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      createdByUserId: 2,
      childCategories: [],
      designs: [],
      designCount: 0
    },
    {
      id: 4,
      name: 'Floor Plans',
      description: 'Detailed floor plans and layouts',
      parentCategoryId: 1,
      projectId: 1,
      order: 1,
      createdAt: '2024-01-17T08:00:00Z',
      photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
      createdByUserId: 2,
      childCategories: [],
      designs: [],
      designCount: 0
    },
    {
      id: 5,
      name: 'Elevations',
      description: 'Building elevations and facades',
      parentCategoryId: 1,
      projectId: 1,
      order: 2,
      createdAt: '2024-01-18T14:00:00Z',
      photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      createdByUserId: 2,
      childCategories: [],
      designs: [],
      designCount: 0
    }
  ];

  // =====================
  // Designs Mock Data with versions
  // =====================
  private designs: Design[] = [
    // Architectural - Floor Plans - Multiple versions
    {
      id: 1,
      name: 'Ground Floor Plan v1',
      description: 'Initial ground floor layout',
      categoryId: 4,
      projectId: 1,
      version: 1,
      fileName: 'ground_floor_v1.pdf',
      fileType: 'application/pdf',
      fileSize: 2456000,
      fileUrl: '/assets/designs/ground_floor_v1.pdf',
      status: 'Active',
      createdByUserId: 2,
      createdByUserName: 'Maria Hassan',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
      approvalStatus: 'Approved',
      approvedByUserId: 1,
      approvedByUserName: 'Ahmed Ali',
      approvedDate: '2024-01-22T14:30:00Z',
      versionCount: 3,
      changeNotes: 'Initial version'
    },
    {
      id: 2,
      name: 'Ground Floor Plan v2',
      description: 'Updated ground floor layout with modifications',
      categoryId: 4,
      projectId: 1,
      version: 2,
      fileName: 'ground_floor_v2.pdf',
      fileType: 'application/pdf',
      fileSize: 2680000,
      fileUrl: '/assets/designs/ground_floor_v2.pdf',
      status: 'Active',
      createdByUserId: 2,
      createdByUserName: 'Maria Hassan',
      createdAt: '2024-02-05T09:00:00Z',
      updatedAt: '2024-02-05T09:00:00Z',
      approvalStatus: 'Approved',
      approvedByUserId: 1,
      approvedByUserName: 'Ahmed Ali',
      approvedDate: '2024-02-07T11:00:00Z',
      versionCount: 3,
      parentDesignId: 1,
      changeNotes: 'Modified entrance layout and added additional restroom'
    },
    {
      id: 3,
      name: 'Ground Floor Plan v3',
      description: 'Final approved version with all changes',
      categoryId: 4,
      projectId: 1,
      version: 3,
      fileName: 'ground_floor_v3.pdf',
      fileType: 'application/pdf',
      fileSize: 2890000,
      fileUrl: '/assets/designs/ground_floor_v3.pdf',
      status: 'Active',
      createdByUserId: 2,
      createdByUserName: 'Maria Hassan',
      createdAt: '2024-03-10T15:00:00Z',
      updatedAt: '2024-03-10T15:00:00Z',
      approvalStatus: 'Approved',
      approvedByUserId: 1,
      approvedByUserName: 'Ahmed Ali',
      approvedDate: '2024-03-12T09:00:00Z',
      versionCount: 3,
      parentDesignId: 2,
      changeNotes: 'Final revision incorporating client feedback'
    },
    // Structural - Foundation designs
    {
      id: 4,
      name: 'Foundation Layout v1',
      description: 'Main foundation design',
      categoryId: 2,
      projectId: 1,
      version: 1,
      fileName: 'foundation_v1.dwg',
      fileType: 'application/dwg',
      fileSize: 5200000,
      fileUrl: '/assets/designs/foundation_v1.dwg',
      status: 'Active',
      createdByUserId: 7,
      createdByUserName: 'Mohamed Farid',
      createdAt: '2024-01-25T08:00:00Z',
      updatedAt: '2024-01-25T08:00:00Z',
      approvalStatus: 'Approved',
      approvedByUserId: 1,
      approvedByUserName: 'Ahmed Ali',
      approvedDate: '2024-01-28T10:00:00Z',
      versionCount: 1,
      changeNotes: 'Initial foundation design'
    },
    // Electrical - Single version
    {
      id: 5,
      name: 'Electrical Wiring Diagram v1',
      description: 'Complete electrical wiring layout',
      categoryId: 3,
      projectId: 1,
      version: 1,
      fileName: 'electrical_wiring_v1.pdf',
      fileType: 'application/pdf',
      fileSize: 1850000,
      fileUrl: '/assets/designs/electrical_wiring_v1.pdf',
      status: 'Active',
      createdByUserId: 2,
      createdByUserName: 'Maria Hassan',
      createdAt: '2024-02-15T11:00:00Z',
      updatedAt: '2024-02-15T11:00:00Z',
      approvalStatus: 'Pending',
      versionCount: 1,
      changeNotes: 'Initial electrical design'
    },
    // Architectural - Elevations - Rejected version
    {
      id: 6,
      name: 'Main Facade Elevation v1',
      description: 'Initial facade design',
      categoryId: 5,
      projectId: 1,
      version: 1,
      fileName: 'facade_v1.pdf',
      fileType: 'application/pdf',
      fileSize: 3200000,
      fileUrl: '/assets/designs/facade_v1.pdf',
      status: 'Archived',
      createdByUserId: 2,
      createdByUserName: 'Maria Hassan',
      createdAt: '2024-02-20T14:00:00Z',
      updatedAt: '2024-02-20T14:00:00Z',
      approvalStatus: 'Rejected',
      approvedByUserId: 1,
      approvedByUserName: 'Ahmed Ali',
      approvedDate: '2024-02-25T16:00:00Z',
      versionCount: 2,
      rejectionReason: 'Does not match client requirements. Please revise facade to include more glass elements.',
      changeNotes: 'Initial facade design'
    },
    {
      id: 7,
      name: 'Main Facade Elevation v2',
      description: 'Revised facade with glass elements',
      categoryId: 5,
      projectId: 1,
      version: 2,
      fileName: 'facade_v2.pdf',
      fileType: 'application/pdf',
      fileSize: 3500000,
      fileUrl: '/assets/designs/facade_v2.pdf',
      status: 'Active',
      createdByUserId: 2,
      createdByUserName: 'Maria Hassan',
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-01T10:00:00Z',
      approvalStatus: 'Approved',
      approvedByUserId: 1,
      approvedByUserName: 'Ahmed Ali',
      approvedDate: '2024-03-05T14:00:00Z',
      versionCount: 2,
      parentDesignId: 6,
      changeNotes: 'Added 40% glass coverage per client request'
    }
  ];

  getDesignCategoriesByProject(projectId: number): Observable<DesignCategory[]> {
    const categories = this.designCategories.filter(c => c.projectId === projectId);
    return of(categories);
  }

  getDesignsByProject(projectId: number): Observable<Design[]> {
    const designs = this.designs.filter(d => d.projectId === projectId);
    return of(designs);
  }

  getDesignsByCategory(categoryId: number): Observable<Design[]> {
    const designs = this.designs.filter(d => d.categoryId === categoryId);
    return of(designs);
  }

  getDesignVersions(designId: number): Observable<Design[]> {
    // Find the design and get all its versions
    const design = this.designs.find(d => d.id === designId);
    if (!design) {
      return of([]);
    }

    // If it's a child version, find all siblings with same parentDesignId
    // If it's a parent, find all its children
    let versions: Design[];
    if (design.parentDesignId) {
      versions = this.designs.filter(d => d.parentDesignId === design.parentDesignId || d.id === design.parentDesignId);
    } else {
      versions = this.designs.filter(d => d.parentDesignId === designId || d.id === designId);
    }

    // Sort by version descending (latest first)
    versions.sort((a, b) => b.version - a.version);
    return of(versions);
  }

  getLatestDesignVersions(projectId: number): Observable<Design[]> {
    // Get all designs for project
    const projectDesigns = this.designs.filter(d => d.projectId === projectId);

    // Group by parentDesignId and get latest
    const latestVersions: Map<number, Design> = new Map();

    projectDesigns.forEach(design => {
      const key = design.parentDesignId || design.id;
      const existing = latestVersions.get(key);
      if (!existing || design.version > existing.version) {
        latestVersions.set(key, design);
      }
    });

    return of(Array.from(latestVersions.values()));
  }
}
