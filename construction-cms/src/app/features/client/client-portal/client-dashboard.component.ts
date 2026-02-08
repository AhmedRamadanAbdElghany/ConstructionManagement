import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientPortalService, ClientDashboard, ClientProjectSummary, ClientPaymentSummary, ClientMessage, ClientActivity } from '../../../core/services/client-portal.service';

@Component({
    selector: 'app-client-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1>Welcome back, {{ clientUser?.firstName || 'Client' }}</h1>
          <p>Here's an overview of your projects and account activity</p>
        </div>
        <div class="header-actions">
          <a routerLink="/client-portal/messages/new" class="btn btn-primary">
            <i class="icon-message"></i> New Message
          </a>
          <a routerLink="/client-portal/change-orders/new" class="btn btn-secondary">
            <i class="icon-change-order"></i> Change Request
          </a>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon projects">
            <i class="icon-project"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ dashboard?.projects?.length || 0 }}</span>
            <span class="stat-label">Active Projects</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon payments">
            <i class="icon-payment"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ formatCurrency(dashboard?.paymentSummary?.pendingAmount || 0) }}</span>
            <span class="stat-label">Pending Payment</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon messages">
            <i class="icon-message"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ dashboard?.unreadMessagesCount || 0 }}</span>
            <span class="stat-label">Unread Messages</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon change-orders">
            <i class="icon-change-order"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ dashboard?.pendingChangeOrdersCount || 0 }}</span>
            <span class="stat-label">Pending Change Orders</span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Projects Section -->
        <div class="card projects-card">
          <div class="card-header">
            <h2>Your Projects</h2>
            <a routerLink="/client-portal/projects" class="view-all">View All</a>
          </div>
          <div class="card-content">
            <div *ngIf="!dashboard?.projects?.length" class="empty-state">
              <i class="icon-project"></i>
              <p>No active projects</p>
            </div>
            <div class="project-list">
              <div *ngFor="let project of dashboard?.projects" class="project-item">
                <div class="project-info">
                  <h3>{{ project.projectName }}</h3>
                  <span class="project-location" *ngIf="project.location">
                    <i class="icon-location"></i> {{ project.location }}
                  </span>
                </div>
                <div class="project-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="project.progressPercentage"></div>
                  </div>
                  <span class="progress-text">{{ project.progressPercentage }}% Complete</span>
                </div>
                <div class="project-status">
                  <span [class]="'badge badge-' + getStatusClass(project.status)">
                    {{ project.status }}
                  </span>
                  <span *ngIf="project.hasUpdates" class="update-badge">New Updates</span>
                </div>
                <a [routerLink]="['/client-portal/projects', project.projectId, 'progress']" class="btn btn-sm btn-outline">
                  View Details
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Summary Section -->
        <div class="card payments-card">
          <div class="card-header">
            <h2>Payment Summary</h2>
            <a routerLink="/client-portal/payments" class="view-all">View All</a>
          </div>
          <div class="card-content">
            <div class="payment-summary-grid">
              <div class="payment-stat">
                <span class="payment-label">Total Invoiced</span>
                <span class="payment-value">{{ formatCurrency(dashboard?.paymentSummary?.totalInvoiced || 0) }}</span>
              </div>
              <div class="payment-stat">
                <span class="payment-label">Total Paid</span>
                <span class="payment-value success">{{ formatCurrency(dashboard?.paymentSummary?.totalPaid || 0) }}</span>
              </div>
              <div class="payment-stat">
                <span class="payment-label">Pending</span>
                <span class="payment-value warning">{{ formatCurrency(dashboard?.paymentSummary?.pendingAmount || 0) }}</span>
              </div>
              <div class="payment-stat">
                <span class="payment-label">Overdue</span>
                <span class="payment-value danger">{{ formatCurrency(dashboard?.paymentSummary?.overdueAmount || 0) }}</span>
              </div>
            </div>
            <div class="recent-payments" *ngIf="dashboard?.paymentSummary?.recentPayments?.length">
              <h4>Recent Payments</h4>
              <div class="payment-list">
                <div *ngFor="let payment of dashboard?.paymentSummary?.recentPayments" class="payment-item">
                  <div class="payment-info">
                    <span class="payment-project">{{ payment.projectName }}</span>
                    <span class="payment-date">{{ formatDate(payment.paidDate || payment.invoiceDate) }}</span>
                  </div>
                  <span class="payment-amount">{{ formatCurrency(payment.amount) }}</span>
                  <span [class]="'badge badge-' + getStatusClass(payment.status)">
                    {{ payment.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Messages Section -->
        <div class="card messages-card">
          <div class="card-header">
            <h2>Recent Messages</h2>
            <a routerLink="/client-portal/messages" class="view-all">View All</a>
          </div>
          <div class="card-content">
            <div *ngIf="!dashboard?.recentMessages?.length" class="empty-state">
              <i class="icon-message"></i>
              <p>No messages yet</p>
            </div>
            <div class="message-list">
              <div *ngFor="let message of dashboard?.recentMessages" class="message-item" [class.unread]="message.isUnread">
                <div class="message-status">
                  <i *ngIf="message.isUnread" class="icon-unread"></i>
                </div>
                <div class="message-content">
                  <div class="message-header">
                    <h4>{{ message.subject }}</h4>
                    <span [class]="'badge badge-' + getStatusClass(message.status)">
                      {{ message.status }}
                    </span>
                  </div>
                  <p class="message-preview">{{ message.content | slice:0:100 }}{{ message.content.length > 100 ? '...' : '' }}</p>
                  <div class="message-meta">
                    <span *ngIf="message.projectName" class="message-project">
                      <i class="icon-project"></i> {{ message.projectName }}
                    </span>
                    <span class="message-date">{{ formatDate(message.createdAt) }}</span>
                  </div>
                </div>
                <a [routerLink]="['/client-portal/messages', message.id]" class="btn btn-sm btn-outline">
                  View
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Activities Section -->
        <div class="card activities-card">
          <div class="card-header">
            <h2>Recent Activity</h2>
            <a routerLink="/client-portal/activities" class="view-all">View All</a>
          </div>
          <div class="card-content">
            <div *ngIf="!dashboard?.recentActivities?.length" class="empty-state">
              <i class="icon-activity"></i>
              <p>No recent activity</p>
            </div>
            <div class="activity-list">
              <div *ngFor="let activity of dashboard?.recentActivities" class="activity-item">
                <div class="activity-icon" [class]="'type-' + activity.activityType.toLowerCase()">
                  <i [class]="getActivityIcon(activity.activityType)"></i>
                </div>
                <div class="activity-content">
                  <p class="activity-description">{{ activity.description }}</p>
                  <div class="activity-meta">
                    <span *ngIf="activity.projectName" class="activity-project">
                      {{ activity.projectName }}
                    </span>
                    <span class="activity-date">{{ formatDateTime(activity.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="quick-links">
        <h3>Quick Links</h3>
        <div class="links-grid">
          <a routerLink="/client-portal/documents" class="quick-link">
            <i class="icon-document"></i>
            <span>Project Documents</span>
          </a>
          <a routerLink="/client-portal/payments" class="quick-link">
            <i class="icon-payment"></i>
            <span>Payment History</span>
          </a>
          <a routerLink="/client-portal/change-orders" class="quick-link">
            <i class="icon-change-order"></i>
            <span>Change Orders</span>
          </a>
          <a routerLink="/client-portal/settings" class="quick-link">
            <i class="icon-settings"></i>
            <span>Account Settings</span>
          </a>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .welcome-section h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .welcome-section p {
      color: #6b7280;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover {
      background: #f9fafb;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .btn-outline {
      background: transparent;
      border: 1px solid #d1d5db;
      color: #374151;
    }

    .btn-outline:hover {
      background: #f3f4f6;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .stat-icon.projects {
      background: #ede9fe;
      color: #7c3aed;
    }

    .stat-icon.payments {
      background: #d1fae5;
      color: #059669;
    }

    .stat-icon.messages {
      background: #dbeafe;
      color: #2563eb;
    }

    .stat-icon.change-orders {
      background: #fef3c7;
      color: #d97706;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
    }

    .stat-label {
      font-size: 13px;
      color: #6b7280;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .card-header h2 {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .view-all {
      font-size: 13px;
      color: #667eea;
      text-decoration: none;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    .card-content {
      padding: 20px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #9ca3af;
    }

    .empty-state i {
      font-size: 48px;
      margin-bottom: 12px;
      display: block;
    }

    .project-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .project-item {
      display: grid;
      grid-template-columns: 1fr auto auto auto;
      gap: 16px;
      align-items: center;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .project-info h3 {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 4px;
    }

    .project-location {
      font-size: 12px;
      color: #6b7280;
    }

    .project-progress {
      min-width: 150px;
    }

    .progress-bar {
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 11px;
      color: #6b7280;
    }

    .project-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
    }

    .badge-success {
      background: #d1fae5;
      color: #059669;
    }

    .badge-warning {
      background: #fef3c7;
      color: #d97706;
    }

    .badge-danger {
      background: #fee2e2;
      color: #dc2626;
    }

    .badge-info {
      background: #dbeafe;
      color: #2563eb;
    }

    .update-badge {
      background: #ede9fe;
      color: #7c3aed;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
    }

    .payment-summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .payment-stat {
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .payment-label {
      display: block;
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .payment-value {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .payment-value.success {
      color: #059669;
    }

    .payment-value.warning {
      color: #d97706;
    }

    .payment-value.danger {
      color: #dc2626;
    }

    .recent-payments h4 {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 12px;
    }

    .payment-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .payment-item {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 12px;
      align-items: center;
      padding: 10px;
      background: #f9fafb;
      border-radius: 6px;
    }

    .payment-project {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }

    .payment-date {
      font-size: 11px;
      color: #9ca3af;
    }

    .payment-amount {
      font-size: 13px;
      font-weight: 600;
      color: #1f2937;
    }

    .message-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .message-item.unread {
      background: #eff6ff;
    }

    .message-status {
      padding-top: 2px;
    }

    .message-content {
      flex: 1;
      min-width: 0;
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .message-header h4 {
      font-size: 13px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .message-preview {
      font-size: 12px;
      color: #6b7280;
      margin: 0 0 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .message-meta {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: #9ca3af;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .activity-item {
      display: flex;
      gap: 12px;
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .activity-icon.type-update {
      background: #dbeafe;
      color: #2563eb;
    }

    .activity-icon.type-payment {
      background: #d1fae5;
      color: #059669;
    }

    .activity-icon.type-message {
      background: #fef3c7;
      color: #d97706;
    }

    .activity-icon.type-change-order {
      background: #ede9fe;
      color: #7c3aed;
    }

    .activity-icon.type-document {
      background: #f3f4f6;
      color: #6b7280;
    }

    .activity-content {
      flex: 1;
    }

    .activity-description {
      font-size: 13px;
      color: #374151;
      margin: 0 0 4px;
    }

    .activity-meta {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: #9ca3af;
    }

    .quick-links {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .quick-links h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 16px;
    }

    .links-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .quick-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .quick-link:hover {
      background: #f3f4f6;
      transform: translateY(-2px);
    }

    .quick-link i {
      font-size: 24px;
      color: #667eea;
    }

    .quick-link span {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }

    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .links-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .project-item {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .links-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClientDashboardComponent implements OnInit {
    private clientPortalService = inject(ClientPortalService);

    dashboard?: ClientDashboard;
    clientUser?: any;

    ngOnInit(): void {
        this.loadDashboard();
        this.loadClientUser();
    }

    private loadDashboard(): void {
        this.clientPortalService.getClientDashboard().subscribe({
            next: (data) => this.dashboard = data,
            error: (err) => console.error('Failed to load dashboard:', err)
        });
    }

    private loadClientUser(): void {
        const userStr = localStorage.getItem('clientUser');
        if (userStr) {
            this.clientUser = JSON.parse(userStr);
        }
    }

    formatCurrency(value: number): string {
        return this.clientPortalService.formatCurrency(value);
    }

    formatDate(dateString: string): string {
        return this.clientPortalService.formatDate(dateString);
    }

    formatDateTime(dateString: string): string {
        return this.clientPortalService.formatDateTime(dateString);
    }

    getStatusClass(status: string): string {
        return this.clientPortalService.getStatusClass(status);
    }

    getActivityIcon(type: string): string {
        switch (type.toLowerCase()) {
            case 'update': return 'icon-update';
            case 'payment': return 'icon-payment';
            case 'message': return 'icon-message';
            case 'change-order': return 'icon-change-order';
            case 'document': return 'icon-document';
            default: return 'icon-activity';
        }
    }
}
