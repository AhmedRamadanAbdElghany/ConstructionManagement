import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubcontractorService, Subcontractor, SubcontractorContract, SubcontractorPayment, SubcontractorRating, SubcontractorSummary } from '../../../core/services/subcontractor.service';

@Component({
  selector: 'app-subcontractor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="subcontractor-management">
      <!-- Header -->
      <div class="page-header">
        <h1>Subcontractor Management</h1>
        <button class="btn btn-primary" (click)="showAddModal = true">
          <i class="fas fa-plus"></i> Add Subcontractor
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="card">
          <h3>Total</h3>
          <div class="value">{{ summary?.totalSubcontractors || 0 }}</div>
        </div>
        <div class="card">
          <h3>Active</h3>
          <div class="value">{{ summary?.activeSubcontractors || 0 }}</div>
        </div>
        <div class="card">
          <h3>Pending Approval</h3>
          <div class="value warning">{{ summary?.pendingApproval || 0 }}</div>
        </div>
        <div class="card">
          <h3>Expiring Insurance</h3>
          <div class="value danger">{{ summary?.expiringInsurance || 0 }}</div>
        </div>
        <div class="card">
          <h3>Avg Rating</h3>
          <div class="value">{{ summary?.averageRating?.toFixed(2) || 'N/A' }}</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button [class.active]="activeTab === 'list'" (click)="activeTab = 'list'">List</button>
        <button [class.active]="activeTab === 'contracts'" (click)="activeTab = 'contracts'">Contracts</button>
        <button [class.active]="activeTab === 'payments'" (click)="activeTab = 'payments'">Payments</button>
        <button [class.active]="activeTab === 'ratings'" (click)="activeTab = 'ratings'">Ratings</button>
      </div>

      <!-- Subcontractor List Tab -->
      <div class="tab-content" *ngIf="activeTab === 'list'">
        <div class="filter-bar">
          <input type="text" [(ngModel)]="searchTerm" placeholder="Search..." class="form-control">
          <select [(ngModel)]="filterTrade" class="form-control">
            <option value="">All Trades</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="HVAC">HVAC</option>
            <option value="Concrete">Concrete</option>
            <option value="Steel">Steel</option>
          </select>
          <select [(ngModel)]="filterStatus" class="form-control">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Trade</th>
              <th>Contact</th>
              <th>Rating</th>
              <th>Projects</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let sub of filteredSubcontractors">
              <td>
                <strong>{{ sub.name }}</strong>
                <br><small>{{ sub.licenseNumber }}</small>
              </td>
              <td>{{ sub.tradeSpecialty }}</td>
              <td>
                <div *ngIf="sub.phone">{{ sub.phone }}</div>
                <div *ngIf="sub.email"><small>{{ sub.email }}</small></div>
              </td>
              <td>
                <span class="rating-badge" [class]="'grade-' + sub.ratingGrade">
                  {{ sub.ratingGrade || 'N/A' }} ({{ sub.averageRating?.toFixed(1) || '-' }})
                </span>
              </td>
              <td>
                <span class="badge success">{{ sub.totalProjectsCompleted || 0 }} Completed</span>
                <br><small>{{ sub.totalProjectsOngoing || 0 }} Ongoing</small>
              </td>
              <td>
                <span class="status-badge" [class]="sub.isApproved ? 'approved' : 'pending'">
                  {{ sub.isApproved ? 'Approved' : 'Pending' }}
                </span>
              </td>
              <td>
                <button class="btn-icon" (click)="selectSubcontractor(sub)" title="View Details">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" *ngIf="!sub.isApproved" (click)="approveSubcontractor(sub)" title="Approve">
                  <i class="fas fa-check"></i>
                </button>
                <button class="btn-icon" (click)="editSubcontractor(sub)" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Contracts Tab -->
      <div class="tab-content" *ngIf="activeTab === 'contracts'">
        <div class="contracts-list">
          <div class="contract-card" *ngFor="let contract of contracts">
            <div class="contract-header">
              <h4>{{ contract.title }}</h4>
              <span class="status-badge" [class]="getStatusClass(contract.status)">{{ contract.status }}</span>
            </div>
            <div class="contract-details">
              <p><strong>Contract #:</strong> {{ contract.contractNumber }}</p>
              <p><strong>Subcontractor:</strong> {{ contract.subcontractorName }}</p>
              <p><strong>Project:</strong> {{ contract.projectName }}</p>
              <p><strong>Type:</strong> {{ contract.contractType }}</p>
              <p><strong>Amount:</strong> {{ contract.contractAmount | currency }}</p>
              <p><strong>Completion:</strong> {{ contract.completionPercentage }}%</p>
            </div>
            <div class="contract-progress">
              <div class="progress-bar">
                <div class="progress" [style.width.%]="contract.completionPercentage"></div>
              </div>
            </div>
            <div class="contract-actions">
              <button class="btn btn-sm" (click)="viewContractDetails(contract)">View</button>
              <button class="btn btn-sm btn-primary" (click)="addPayment(contract)">Add Payment</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments Tab -->
      <div class="tab-content" *ngIf="activeTab === 'payments'">
        <div class="filter-bar">
          <select [(ngModel)]="paymentFilter" class="form-control">
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Payment #</th>
              <th>Subcontractor</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Net Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let payment of filteredPayments">
              <td>{{ payment.paymentNumber }}</td>
              <td>{{ payment.subcontractorName }}</td>
              <td>{{ payment.paymentType }}</td>
              <td>{{ payment.amount | currency }}</td>
              <td>{{ payment.netPayment | currency }}</td>
              <td>
                <span class="status-badge" [class]="getPaymentStatusClass(payment.status)">
                  {{ payment.status }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm" *ngIf="payment.status === 'Pending'" (click)="approvePayment(payment)">
                  Approve
                </button>
                <button class="btn btn-sm btn-primary" *ngIf="payment.status === 'Approved'" (click)="markAsPaid(payment)">
                  Mark Paid
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Ratings Tab -->
      <div class="tab-content" *ngIf="activeTab === 'ratings'">
        <div class="ratings-grid">
          <div class="rating-card" *ngFor="let rating of ratings">
            <div class="rating-header">
              <h4>{{ rating.subcontractorName }}</h4>
              <span class="rating-grade">{{ rating.ratingGrade }}</span>
            </div>
            <div class="rating-scores">
              <div class="score-item">
                <span>Quality</span>
                <div class="score-bar">
                  <div class="score" [style.width.%]="rating.qualityOfWork * 20"></div>
                </div>
                <span class="score-value">{{ rating.qualityOfWork }}</span>
              </div>
              <div class="score-item">
                <span>Timeliness</span>
                <div class="score-bar">
                  <div class="score" [style.width.%]="rating.timeliness * 20"></div>
                </div>
                <span class="score-value">{{ rating.timeliness }}</span>
              </div>
              <div class="score-item">
                <span>Communication</span>
                <div class="score-bar">
                  <div class="score" [style.width.%]="rating.communication * 20"></div>
                </div>
                <span class="score-value">{{ rating.communication }}</span>
              </div>
              <div class="score-item">
                <span>Safety</span>
                <div class="score-bar">
                  <div class="score" [style.width.%]="rating.safetyCompliance * 20"></div>
                </div>
                <span class="score-value">{{ rating.safetyCompliance }}</span>
              </div>
            </div>
            <div class="rating-footer">
              <span class="overall-rating">
                <strong>{{ rating.overallRating.toFixed(2) }}</strong> / 5
              </span>
              <span class="evaluator">
                By {{ rating.evaluatorName }} - {{ rating.evaluationDate | date }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Subcontractor Modal -->
      <div class="modal-overlay" *ngIf="showAddModal" (click)="showAddModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Add Subcontractor</h3>
            <button class="close-btn" (click)="showAddModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Name *</label>
              <input type="text" [(ngModel)]="newSubcontractor.name" class="form-control">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Trade</label>
                <select [(ngModel)]="newSubcontractor.tradeSpecialty" class="form-control">
                  <option value="">Select Trade</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Concrete">Concrete</option>
                  <option value="Steel">Steel</option>
                </select>
              </div>
              <div class="form-group">
                <label>License Number</label>
                <input type="text" [(ngModel)]="newSubcontractor.licenseNumber" class="form-control">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Phone</label>
                <input type="text" [(ngModel)]="newSubcontractor.phone" class="form-control">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="newSubcontractor.email" class="form-control">
              </div>
            </div>
            <div class="form-group">
              <label>Address</label>
              <textarea [(ngModel)]="newSubcontractor.address" class="form-control"></textarea>
            </div>
            <div class="form-group">
              <label>Tax Number</label>
              <input type="text" [(ngModel)]="newSubcontractor.taxNumber" class="form-control">
            </div>
            <div class="form-group">
              <label>Insurance Number</label>
              <input type="text" [(ngModel)]="newSubcontractor.insurancePolicyNumber" class="form-control">
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea [(ngModel)]="newSubcontractor.notes" class="form-control"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn" (click)="showAddModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="saveSubcontractor()">Save</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subcontractor-management {
      padding: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 24px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .summary-cards .card {
      background: #fff;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .summary-cards .card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #666;
    }

    .summary-cards .card .value {
      font-size: 28px;
      font-weight: bold;
    }

    .summary-cards .card .value.warning {
      color: #f39c12;
    }

    .summary-cards .card .value.danger {
      color: #e74c3c;
    }

    .tabs {
      display: flex;
      gap: 5px;
      margin-bottom: 20px;
      border-bottom: 2px solid #eee;
    }

    .tabs button {
      padding: 10px 20px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 14px;
      color: #666;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
    }

    .tabs button.active {
      color: #007bff;
      border-bottom-color: #007bff;
    }

    .filter-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .filter-bar .form-control {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .filter-bar input {
      flex: 1;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .data-table th,
    .data-table td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .data-table th {
      background: #f8f9fa;
      font-weight: 600;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.approved {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.active {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.paid {
      background: #cce5ff;
      color: #004085;
    }

    .rating-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: bold;
    }

    .rating-badge.grade-A {
      background: #d4edda;
      color: #155724;
    }

    .rating-badge.grade-B {
      background: #fff3cd;
      color: #856404;
    }

    .rating-badge.grade-C {
      background: #ffeaa7;
      color: #856404;
    }

    .rating-badge.grade-D {
      background: #fadbd8;
      color: #c0392b;
    }

    .btn-icon {
      padding: 6px 8px;
      border: none;
      background: #f8f9fa;
      cursor: pointer;
      border-radius: 4px;
      margin-right: 5px;
    }

    .btn-icon:hover {
      background: #e9ecef;
    }

    .contracts-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .contract-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .contract-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .contract-header h4 {
      margin: 0;
    }

    .contract-details p {
      margin: 5px 0;
      font-size: 14px;
    }

    .contract-progress {
      margin: 15px 0;
    }

    .progress-bar {
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar .progress {
      height: 100%;
      background: #007bff;
      transition: width 0.3s ease;
    }

    .contract-actions {
      display: flex;
      gap: 10px;
    }

    .ratings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .rating-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .rating-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .rating-grade {
      font-size: 24px;
      font-weight: bold;
      color: #28a745;
    }

    .score-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 8px 0;
      font-size: 13px;
    }

    .score-item span:first-child {
      width: 100px;
    }

    .score-bar {
      flex: 1;
      height: 6px;
      background: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
    }

    .score-bar .score {
      height: 100%;
      background: #007bff;
    }

    .score-value {
      width: 25px;
      text-align: right;
      font-weight: bold;
    }

    .rating-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .overall-rating {
      font-size: 18px;
      color: #28a745;
    }

    .evaluator {
      font-size: 12px;
      color: #666;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: #fff;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h3 {
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    }

    .modal-body {
      padding: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .form-row {
      display: flex;
      gap: 15px;
    }

    .form-row .form-group {
      flex: 1;
    }

    .modal-footer {
      padding: 20px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .btn {
      padding: 10px 20px;
      border: 1px solid #ddd;
      background: #fff;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-primary {
      background: #007bff;
      color: #fff;
      border-color: #007bff;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .badge {
      display: inline-block;
      padding: 3px 6px;
      border-radius: 3px;
      font-size: 11px;
    }

    .badge.success {
      background: #d4edda;
      color: #155724;
    }
  `]
})
export class SubcontractorComponent implements OnInit {
  activeTab = 'list';
  searchTerm = '';
  filterTrade = '';
  filterStatus = '';
  paymentFilter = 'all';
  showAddModal = false;

  summary: SubcontractorSummary | null = null;
  subcontractors: Subcontractor[] = [];
  contracts: SubcontractorContract[] = [];
  payments: SubcontractorPayment[] = [];
  ratings: SubcontractorRating[] = [];

  newSubcontractor: Partial<Subcontractor> = {};

  constructor(private subcontractorService: SubcontractorService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.subcontractorService.getSummary().subscribe(s => this.summary = s);
    this.subcontractorService.getSubcontractors().subscribe(s => this.subcontractors = s);
    this.subcontractorService.getAllContracts().subscribe(c => this.contracts = c);
    this.subcontractorService.getAllPayments().subscribe(p => this.payments = p);
    this.subcontractorService.getAllRatings().subscribe(r => this.ratings = r);
  }

  get filteredSubcontractors(): Subcontractor[] {
    return this.subcontractors.filter(sub => {
      const matchesSearch = !this.searchTerm ||
        sub.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesTrade = !this.filterTrade || sub.tradeSpecialty === this.filterTrade;
      const matchesStatus = !this.filterStatus ||
        (this.filterStatus === 'active' && sub.isActive) ||
        (this.filterStatus === 'pending' && !sub.isApproved) ||
        (this.filterStatus === 'inactive' && !sub.isActive);
      return matchesSearch && matchesTrade && matchesStatus;
    });
  }

  get filteredPayments(): SubcontractorPayment[] {
    if (this.paymentFilter === 'all') return this.payments;
    return this.payments.filter(p => p.status.toLowerCase() === this.paymentFilter);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'active';
      case 'completed': return 'approved';
      case 'draft': return 'pending';
      default: return '';
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid': return 'paid';
      case 'approved': return 'approved';
      case 'pending': return 'pending';
      default: return '';
    }
  }

  selectSubcontractor(sub: Subcontractor): void {
    console.log('Selected subcontractor:', sub);
  }

  approveSubcontractor(sub: Subcontractor): void {
    this.subcontractorService.approveSubcontractor(sub.id, { approvedBy: 1 }).subscribe(updated => {
      const index = this.subcontractors.findIndex(s => s.id === sub.id);
      if (index !== -1) {
        this.subcontractors[index] = updated;
      }
    });
  }

  editSubcontractor(sub: Subcontractor): void {
    this.newSubcontractor = { ...sub };
    this.showAddModal = true;
  }

  saveSubcontractor(): void {
    if (this.newSubcontractor.id) {
      this.subcontractorService.updateSubcontractor(this.newSubcontractor.id, this.newSubcontractor)
        .subscribe(updated => {
          const index = this.subcontractors.findIndex(s => s.id === updated.id);
          if (index !== -1) {
            this.subcontractors[index] = updated;
          }
          this.showAddModal = false;
          this.newSubcontractor = {};
        });
    } else {
      this.subcontractorService.createSubcontractor(this.newSubcontractor as any)
        .subscribe(created => {
          this.subcontractors.push(created);
          this.showAddModal = false;
          this.newSubcontractor = {};
        });
    }
  }

  viewContractDetails(contract: SubcontractorContract): void {
    console.log('View contract:', contract);
  }

  addPayment(contract: SubcontractorContract): void {
    console.log('Add payment for contract:', contract);
  }

  approvePayment(payment: SubcontractorPayment): void {
    this.subcontractorService.updatePaymentStatus(payment.id, { status: 'Approved' })
      .subscribe(updated => {
        const index = this.payments.findIndex(p => p.id === payment.id);
        if (index !== -1) {
          this.payments[index] = updated;
        }
      });
  }

  markAsPaid(payment: SubcontractorPayment): void {
    this.subcontractorService.updatePaymentStatus(payment.id, { status: 'Paid', paymentDate: new Date() })
      .subscribe(updated => {
        const index = this.payments.findIndex(p => p.id === payment.id);
        if (index !== -1) {
          this.payments[index] = updated;
        }
      });
  }
}
