import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import {
  InspectionService,
  InspectionRequestList,
  InspectionRequest,
  InspectionFilter,
  CreateQuote,
  CreateWorkRequest
} from '../../../core/services/inspection.service';

type ViewMode = 'list' | 'detail' | 'create';
type DetailTab = 'overview' | 'documents' | 'quotes' | 'session' | 'chat' | 'payment';

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: 'inspections.status.pending', color: '#f59e0b' },
  2: { label: 'inspections.status.quoted', color: '#3b82f6' },
  3: { label: 'inspections.status.approved', color: '#10b981' },
  4: { label: 'inspections.status.rejected', color: '#ef4444' },
  5: { label: 'inspections.status.ready', color: '#8b5cf6' },
  6: { label: 'inspections.status.in_progress', color: '#06b6d4' },
  7: { label: 'inspections.status.completed', color: '#22c55e' },
  8: { label: 'inspections.status.cancelled', color: '#6b7280' },
};

const PROPERTY_TYPE_MAP: Record<number, string> = {
  1: 'inspections.property_type.villa',
  2: 'inspections.property_type.apartment',
  3: 'inspections.property_type.house',
  4: 'inspections.property_type.land',
  5: 'inspections.property_type.commercial',
  6: 'inspections.property_type.office',
  7: 'inspections.property_type.warehouse',
  99: 'inspections.property_type.other',
};

@Component({
  selector: 'app-inspections',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
<div class="inspections-shell">

  <!-- ===== HEADER ===== -->
  <div class="page-header">
    <div class="header-left">
      <div class="header-icon">
        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
        </svg>
      </div>
      <div>
        <h1>{{ 'inspections.title' | translate }}</h1>
        <p class="subtitle">{{ 'inspections.subtitle' | translate }}</p>
      </div>
    </div>
    <div class="header-actions">
      @if (view() === 'detail') {
        <button class="btn btn-ghost" (click)="goToList()">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          {{ 'common.back' | translate }}
        </button>
      }
    </div>
  </div>

  <!-- ===== KPI STRIP ===== -->
  @if (view() === 'list') {
    <div class="kpi-strip">
      <!-- Total -->
      <div class="kpi-card total glass-morph">
        <div class="kpi-icon"><i class="fas fa-list-ul"></i></div>
        <div class="kpi-data">
          <span class="kpi-value">{{ totalCount() }}</span>
          <span class="kpi-label">{{ 'inspections.kpi.total' | translate }}</span>
        </div>
      </div>
      <!-- Pending -->
      <div class="kpi-card pending glass-morph">
        <div class="kpi-icon"><i class="fas fa-clock"></i></div>
        <div class="kpi-data">
          <span class="kpi-value">{{ pendingCount() }}</span>
          <span class="kpi-label">{{ 'inspections.kpi.pending' | translate }}</span>
        </div>
      </div>
      <!-- In Progress -->
      <div class="kpi-card active glass-morph">
        <div class="kpi-icon"><i class="fas fa-sync-alt"></i></div>
        <div class="kpi-data">
          <span class="kpi-value">{{ activeCount() }}</span>
          <span class="kpi-label">{{ 'inspections.kpi.active' | translate }}</span>
        </div>
      </div>
      <!-- Completed -->
      <div class="kpi-card complete glass-morph">
        <div class="kpi-icon"><i class="fas fa-check-double"></i></div>
        <div class="kpi-data">
          <span class="kpi-value">{{ completedCount() }}</span>
          <span class="kpi-label">{{ 'inspections.kpi.completed' | translate }}</span>
        </div>
      </div>
    </div>
  }

  <!-- ===== LIST VIEW ===== -->
  @if (view() === 'list') {
    <!-- Filters -->
    <div class="filter-bar">
      <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input type="text" class="search-input" placeholder="{{ 'inspections.search_placeholder' | translate }}"
          [(ngModel)]="searchTerm" (ngModelChange)="onSearch()"/>
      </div>
      <select class="filter-select" [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()">
        <option value="">{{ 'inspections.all_statuses' | translate }}</option>
        @for (s of statusOptions; track s.value) {
          <option [value]="s.value">{{ s.label | translate }}</option>
        }
      </select>
      <select class="filter-select" [(ngModel)]="propertyFilter" (ngModelChange)="onFilterChange()">
        <option value="">{{ 'inspections.all_types' | translate }}</option>
        @for (p of propertyOptions; track p.value) {
          <option [value]="p.value">{{ p.label | translate }}</option>
        }
      </select>
    </div>

    @if (isLoading()) {
      <div class="loading-state">
        <div class="spinner"></div>
        <p>{{ 'common.loading' | translate }}</p>
      </div>
    } @else if (inspections().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>{{ 'inspections.no_results' | translate }}</h3>
        <p>{{ 'inspections.no_results_desc' | translate }}</p>
      </div>
    } @else {
      <div class="inspection-grid">
        @for (insp of inspections(); track insp.id) {
          <div class="inspection-card-premium glass-morph" (click)="openDetail(insp.id)">
            <div class="card-glow"></div>
            <div class="card-header">
              <div class="prop-badge-premium">{{ propertyLabel(insp.propertyType) | translate }}</div>
              <span class="status-pill-premium" [style.background]="statusBg(insp.status)" [style.color]="statusColor(insp.status)">
                <span class="status-dot" [style.background]="statusColor(insp.status)"></span>
                {{ statusLabel(insp.status) | translate }}
              </span>
            </div>
            <h3 class="card-title">{{ insp.title }}</h3>
            <div class="card-meta">
              <p class="card-client">
                <i class="fas fa-user-circle"></i>
                {{ insp.clientName }}
              </p>
              <p class="card-address">
                <i class="fas fa-map-marker-alt"></i>
                {{ insp.address }}
              </p>
            </div>
            <div class="card-footer">
              @if (insp.inspectionFee) {
                <span class="fee-badge-premium">\${{ insp.inspectionFee | number:'1.0-0' }}</span>
              }
              <span class="date-label-premium">
                <i class="far fa-calendar-alt"></i>
                {{ insp.createdAt | date:'mediumDate' }}
              </span>
            </div>
          </div>
        }
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="pagination">
          <button class="page-action glass-morph" [disabled]="currentPage() === 1" (click)="changePage(currentPage() - 1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="page-numbers">
            @for (p of pageRange(); track p) {
              <button class="page-number glass-morph" [class.active]="p === currentPage()" (click)="changePage(p)">{{ p }}</button>
            }
          </div>
          <button class="page-action glass-morph" [disabled]="currentPage() === totalPages()" (click)="changePage(currentPage() + 1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      }
    }
  }

  <!-- ===== DETAIL VIEW ===== -->
  @if (view() === 'detail' && selectedInspection()) {
    <div class="detail-layout">
      <!-- Left: Info Panel -->
      <div class="detail-sidebar">
        <div class="info-card glass-morph">
          <div class="info-header">
            <span class="status-pill-premium large" [style.background]="statusBg(selectedInspection()!.status)" [style.color]="statusColor(selectedInspection()!.status)">
              <span class="status-dot" [style.background]="statusColor(selectedInspection()!.status)"></span>
              {{ statusLabel(selectedInspection()!.status) | translate }}
            </span>
            <span class="prop-badge-premium">{{ propertyLabel(selectedInspection()!.propertyType) | translate }}</span>
          </div>
          <h2 class="detail-title">{{ selectedInspection()!.title }}</h2>

          <div class="info-rows">
            <div class="info-row">
              <span class="info-label">{{ 'inspections.client' | translate }}</span>
              <span class="info-value">
                <i class="fas fa-user-circle"></i>
                {{ selectedInspection()!.clientName }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ 'inspections.address' | translate }}</span>
              <span class="info-value">
                <i class="fas fa-map-marker-alt"></i>
                {{ selectedInspection()!.address }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ 'inspections.area' | translate }}</span>
              <span class="info-value">
                <i class="fas fa-expand-arrows-alt"></i>
                {{ selectedInspection()!.approximateArea }} m²
              </span>
            </div>
            @if (selectedInspection()!.inspectionFee) {
              <div class="info-row">
                <span class="info-label">{{ 'inspections.fee' | translate }}</span>
                <span class="info-value fee">
                  <i class="fas fa-money-bill-wave"></i>
                  \${{ selectedInspection()!.inspectionFee | number:'1.2-2' }}
                </span>
              </div>
            }
            @if (selectedInspection()!.scheduledDate) {
              <div class="info-row">
                <span class="info-label">{{ 'inspections.scheduled' | translate }}</span>
                <span class="info-value">
                  <i class="far fa-calendar-check"></i>
                  {{ selectedInspection()!.scheduledDate | date:'medium' }}
                </span>
              </div>
            }
            <div class="info-row">
              <span class="info-label">{{ 'inspections.created' | translate }}</span>
              <span class="info-value">
                <i class="far fa-clock"></i>
                {{ selectedInspection()!.createdAt | date:'mediumDate' }}
              </span>
            </div>
          </div>

          @if (selectedInspection()!.description) {
            <div class="description-block">
              <p class="desc-label">{{ 'inspections.description' | translate }}</p>
              <p class="desc-text">{{ selectedInspection()!.description }}</p>
            </div>
          }

          <!-- Action Buttons -->
          <div class="action-stack">
            @if (selectedInspection()!.status === 1) {
              <button class="btn btn-primary" (click)="activeDetailTab = 'quotes'">
                {{ 'inspections.send_quote' | translate }}
              </button>
            }
            @if (selectedInspection()!.status === 5) {
              <button class="btn btn-success" (click)="startInspection()">
                {{ 'inspections.start_inspection' | translate }}
              </button>
              <button class="btn btn-secondary" (click)="generateQR()">
                {{ 'inspections.generate_qr' | translate }}
              </button>
            }
            @if (selectedInspection()!.status === 6) {
              <button class="btn btn-success" (click)="completeInspection()">
                {{ 'inspections.complete_inspection' | translate }}
              </button>
            }
            @if (selectedInspection()!.status === 7 && selectedInspection()!.workRequest?.status === 1) {
              <button class="btn btn-primary" (click)="respondToWorkRequest(true)">
                {{ 'inspections.accept_work_request' | translate }}
              </button>
              <button class="btn btn-danger" (click)="respondToWorkRequest(false)">
                {{ 'inspections.reject_work_request' | translate }}
              </button>
            }
          </div>
        </div>

        <!-- QR Panel -->
        @if (qrCode()) {
          <div class="qr-panel">
            <p class="qr-label">{{ 'inspections.scan_to_start' | translate }}</p>
            <div class="qr-box">{{ qrCode() }}</div>
            <p class="qr-expires">{{ 'inspections.qr_expires' | translate }}: {{ qrExpiry() | date:'shortTime' }}</p>
          </div>
        }
      </div>

      <!-- Right: Tabs -->
      <div class="detail-main glass-morph">
        <div class="tab-bar">
          @for (tab of detailTabs(); track tab.id) {
            <button class="tab-btn" [class.active]="activeDetailTab === tab.id" (click)="activeDetailTab = tab.id">
              <i [class]="tabIcon(tab.id)"></i>
              {{ tab.label | translate }}
              @if (tab.badge) {
                <span class="tab-badge-premium">{{ tab.badge }}</span>
              }
            </button>
          }
        </div>

        <!-- Overview Tab -->
        @if (activeDetailTab === 'overview') {
          <div class="tab-content">
            <div class="time-slots-section">
              <h4>{{ 'inspections.details.time_slots' | translate }}</h4>
              @if (selectedInspection()!.timeSlots.length) {
                <div class="slots-list">
                  @for (slot of selectedInspection()!.timeSlots; track slot.id) {
                    <div class="slot-item" [class.selected]="slot.isSelected">
                      <span class="slot-date">{{ slot.date | date:'mediumDate' }}</span>
                      <span class="slot-time">{{ slot.timeStart }} – {{ slot.timeEnd }}</span>
                      <span class="slot-by">{{ slot.proposedBy === 1 ? ('inspections.client' | translate) : ('inspections.company' | translate) }}</span>
                      @if (slot.isSelected) { <span class="selected-badge">✓</span> }
                      @if (!slot.isSelected && selectedInspection()!.status <= 3) {
                        <button class="btn btn-xs" (click)="selectSlot(slot.id)">{{ 'inspections.details.select' | translate }}</button>
                      }
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-msg">{{ 'inspections.details.no_slots' | translate }}</p>
              }
            </div>

            <div class="team-section">
              <h4>{{ 'inspections.details.team' | translate }}</h4>
              @if (selectedInspection()!.teamMembers.length) {
                <div class="team-list">
                  @for (m of selectedInspection()!.teamMembers; track m.id) {
                    <div class="team-member">
                      <div class="avatar">{{ m.userName.charAt(0) }}</div>
                      <div>
                        <p class="member-name">{{ m.userName }}</p>
                        <p class="member-role">{{ m.role }}</p>
                      </div>
                      @if (m.isPrimary) { <span class="primary-badge">Lead</span> }
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-msg">{{ 'inspections.details.no_team' | translate }}</p>
              }
            </div>
          </div>
        }

        <!-- Documents Tab -->
        @if (activeDetailTab === 'documents') {
          <div class="tab-content">
            <div class="docs-header">
              <h4>{{ 'inspections.details.documents' | translate }}</h4>
              @if ([5,6].includes(selectedInspection()!.status)) {
                <label class="btn btn-primary btn-sm upload-btn">
                  {{ 'inspections.upload_document' | translate }}
                  <input type="file" hidden multiple (change)="uploadFiles($event)"/>
                </label>
              }
            </div>
            @if (selectedInspection()!.documents.length) {
              <div class="docs-grid">
                @for (doc of selectedInspection()!.documents; track doc.id) {
                  <div class="doc-card">
                    <div class="doc-icon">{{ docIcon(doc.type) }}</div>
                    <div class="doc-info">
                      <p class="doc-name">{{ doc.fileName }}</p>
                      <p class="doc-meta">{{ doc.uploadedByName }} · {{ doc.uploadedAt | date:'shortDate' }}</p>
                    </div>
                    <button class="icon-btn danger" (click)="deleteDoc(doc.id)">🗑</button>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state small">
                <div class="empty-icon">📎</div>
                <p>{{ 'inspections.details.no_docs' | translate }}</p>
              </div>
            }
          </div>
        }

        <!-- Quotes Tab -->
        @if (activeDetailTab === 'quotes') {
          <div class="tab-content">
            @if (selectedInspection()!.status === 1) {
              <div class="quote-form">
                <h4>{{ 'inspections.details.create_quote' | translate }}</h4>
                <div class="form-row">
                  <label>{{ 'inspections.details.fee_amount' | translate }}</label>
                  <input type="number" class="form-input" [(ngModel)]="quoteForm.amount" placeholder="0.00"/>
                </div>
                <div class="form-row">
                  <label>{{ 'inspections.details.currency' | translate }}</label>
                  <select class="form-input" [(ngModel)]="quoteForm.currency">
                    <option value="USD">USD</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                    <option value="EGP">EGP</option>
                  </select>
                </div>
                <div class="form-row">
                  <label>{{ 'inspections.details.valid_until' | translate }}</label>
                  <input type="date" class="form-input" [(ngModel)]="quoteForm.validUntilStr"/>
                </div>
                <div class="form-row">
                  <label>{{ 'inspections.details.terms' | translate }}</label>
                  <textarea class="form-input" rows="3" [(ngModel)]="quoteForm.terms" placeholder="{{ 'inspections.details.terms_placeholder' | translate }}"></textarea>
                </div>
                <button class="btn btn-primary" [disabled]="isSaving()" (click)="sendQuote()">
                  {{ isSaving() ? ('common.saving' | translate) : ('inspections.details.send_quote' | translate) }}
                </button>
              </div>
            }
            @if (selectedInspection()!.quotes.length) {
              <div class="quotes-list">
                @for (q of selectedInspection()!.quotes; track q.id) {
                  <div class="quote-item">
                    <div class="quote-top">
                      <span class="quote-amount">{{ q.currency }} {{ q.amount | number:'1.2-2' }}</span>
                      <span class="status-pill" [style.background]="quoteStatusBg(q.status)">{{ quoteStatusLabel(q.status) | translate }}</span>
                    </div>
                    @if (q.terms) { <p class="quote-terms">{{ q.terms }}</p> }
                    <p class="quote-meta">{{ 'inspections.details.valid_until' | translate }}: {{ q.validUntil | date:'mediumDate' }}</p>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Session Tab -->
        @if (activeDetailTab === 'session') {
          <div class="tab-content">
            @if (selectedInspection()!.session) {
              <div class="session-card">
                <div class="session-row">
                  <span>{{ 'inspections.details.started_at' | translate }}</span>
                  <span>{{ selectedInspection()!.session!.startedAt | date:'medium' }}</span>
                </div>
                @if (selectedInspection()!.session!.completedAt) {
                  <div class="session-row">
                    <span>{{ 'inspections.details.completed_at' | translate }}</span>
                    <span>{{ selectedInspection()!.session!.completedAt | date:'medium' }}</span>
                  </div>
                }
                <div class="session-row">
                  <span>{{ 'inspections.details.inspector' | translate }}</span>
                  <span>{{ selectedInspection()!.session!.companyUserName }}</span>
                </div>
              </div>
            } @else {
              <div class="empty-state small">
                <div class="empty-icon">📋</div>
                 <p>{{ 'inspections.details.session_not_started' | translate }}</p>
              </div>
            }
          </div>
        }

        <!-- Chat Tab -->
        @if (activeDetailTab === 'chat') {
          <div class="tab-content chat-tab">
            <div class="chat-messages">
              @for (msg of chatMessages(); track msg.id) {
                <div class="chat-msg" [class.mine]="msg.isCompany">
                  <div class="msg-bubble">
                    <p>{{ msg.message }}</p>
                    <span class="msg-time">{{ msg.createdAt | date:'shortTime' }}</span>
                  </div>
                </div>
              }
              @if (!chatMessages().length) {
                <div class="empty-state small"><p>{{ 'inspections.details.no_messages' | translate }}</p></div>
              }
            </div>
            <div class="chat-input-row">
              <input type="text" class="chat-input" [(ngModel)]="chatMessage" placeholder="{{ 'inspections.details.type_message' | translate }}"
                (keyup.enter)="sendMessage()"/>
              <button class="btn btn-primary btn-sm" (click)="sendMessage()">{{ 'common.send' | translate }}</button>
            </div>
          </div>
        }

        <!-- Payment Tab -->
        @if (activeDetailTab === 'payment') {
          <div class="tab-content">
            @if (selectedInspection()!.payment) {
              <div class="payment-card">
                <div class="payment-amount">{{ selectedInspection()!.payment!.currency }} {{ selectedInspection()!.payment!.amount | number:'1.2-2' }}</div>
                <div class="payment-meta">
                  <span class="status-pill" [style.background]="paymentStatusBg(selectedInspection()!.payment!.status)">
                    {{ paymentStatusLabel(selectedInspection()!.payment!.status) }}
                  </span>
                  @if (selectedInspection()!.payment!.paidAt) {
                    <span>{{ selectedInspection()!.payment!.paidAt | date:'mediumDate' }}</span>
                  }
                </div>
                @if (selectedInspection()!.payment!.status === 1 && selectedInspection()!.status === 7) {
                  <button class="btn btn-success" (click)="confirmCash()">
                    {{ 'inspections.details.confirm_cash' | translate }}
                  </button>
                }
              </div>
            } @else {
              <div class="empty-state small">
                <div class="empty-icon">💳</div>
                <p>{{ 'inspections.details.no_payment' | translate }}</p>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Toast Notification -->
    @if (toastMsg()) {
      <div class="toast" [class.error]="toastError()">{{ toastMsg() }}</div>
    }
  }

</div>
  `,
  styles: [`
    :host { display: block; }

    .inspections-shell {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      background: var(--app-bg);
      color: var(--app-text);
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--app-text);
      margin: 0;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 0.9rem;
      color: var(--muted-text);
      margin: 0.25rem 0 0;
      font-weight: 500;
    }
    .header-actions { display: flex; gap: 0.75rem; }
    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      border-radius: 12px;
      border: 1px solid var(--glass-border);
      background: var(--glass-bg);
      color: var(--muted-text);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-ghost:hover {
      background: var(--input-bg);
      color: var(--app-text);
      border-color: var(--accent-blue);
    }

    /* Filter Bar */
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: center;
    }
    .search-wrap {
      position: relative;
      flex: 1;
      min-width: 250px;
    }
    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted-text);
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 2.75rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 14px;
      color: var(--app-text);
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s;
    }
    .search-input:focus {
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .search-input::placeholder { color: var(--muted-text); opacity: 0.7; }
    .filter-select {
      padding: 0.875rem 1rem;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 14px;
      color: var(--app-text);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      min-width: 160px;
      transition: all 0.2s;
      -webkit-appearance: none;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      padding-right: 2.5rem;
    }
    .filter-select:focus {
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 2rem;
      color: var(--muted-text);
      gap: 1.5rem;
    }
    .loading-state p { margin: 0; font-size: 0.9rem; font-weight: 600; }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--glass-border);
      border-top-color: var(--accent-blue);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 2rem;
      text-align: center;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
    }
    .empty-state.small { padding: 3rem 2rem; background: transparent; border: none; }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.6;
    }
    .empty-state h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--app-text);
      margin: 0 0 0.5rem;
    }
    .empty-state p {
      font-size: 0.9rem;
      color: var(--muted-text);
      margin: 0;
    }
    .empty-msg {
      font-size: 0.9rem;
      color: var(--muted-text);
      font-style: italic;
    }

    /* Session */
    .session-card {
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      overflow: hidden;
    }
    .session-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--glass-border);
      font-size: 0.95rem;
    }
    .session-row:last-child { border-bottom: none; }
    .session-row span:first-child { color: var(--muted-text); font-weight: 600; }
    .session-row span:last-child { color: var(--app-text); font-weight: 700; }

    /* Icon Button */
    .icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1rem;
      background: transparent;
      transition: all 0.2s;
    }
    .icon-btn.danger { color: #ef4444; }
    .icon-btn.danger:hover { background: rgba(239, 68, 68, 0.1); }
    .btn-sm { padding: 0.5rem 1rem; font-size: 0.8rem; border-radius: 10px; }

    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .kpi-card {
      padding: 1.5rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      transition: transform 0.3s;
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--glass-border);
    }
    .kpi-card:hover { transform: translateY(-4px); }
    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .kpi-data { display: flex; flex-direction: column; }
    .kpi-value { font-size: 1.5rem; font-weight: 800; line-height: 1; }
    .kpi-label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.4rem; }
    
    .kpi-card.total .kpi-icon { color: #38bdf8; background: rgba(56, 189, 248, 0.1); }
    .kpi-card.pending .kpi-icon { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
    .kpi-card.active .kpi-icon { color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }
    .kpi-card.complete .kpi-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }

    .glass-morph {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--glass-border);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    /* List View Styles */
    .inspection-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .inspection-card-premium {
      border-radius: 24px;
      padding: 2rem;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
      
      &:hover {
        transform: translateY(-8px);
        background: var(--glass-bg);
        border-color: rgba(56, 189, 248, 0.3);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        
        .card-glow { opacity: 1; }
      }
    }

    .card-glow {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at top right, rgba(56, 189, 248, 0.1), transparent 70%);
      opacity: 0;
      transition: opacity 0.4s;
      pointer-events: none;
    }

    .card-header { display: flex; justify-content: space-between; align-items: flex-start; }

    .prop-badge-premium {
      background: rgba(56, 189, 248, 0.1);
      color: #38bdf8;
      padding: 0.4rem 0.8rem;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }

    .status-pill-premium {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.8rem;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 700;
      &.large { padding: 0.6rem 1rem; font-size: 0.85rem; }
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      box-shadow: 0 0 8px currentColor;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--app-text);
      margin: 0;
      line-height: 1.4;
    }

    .card-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      p {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.9rem;
        color: var(--muted-text);
        i { color: var(--muted-text); opacity: 0.6; width: 16px; }
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .fee-badge-premium {
      font-size: 1.25rem;
      font-weight: 800;
      color: #a78bfa;
    }

    .date-label-premium {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Detail Layout */
    .detail-layout { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; margin-top: 1rem; }
    .detail-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }

    .info-card {
      border-radius: 20px; padding: 2rem;
    }
    .info-header { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .detail-title { font-size: 1.5rem; font-weight: 800; color: var(--app-text); margin: 0 0 1.5rem; letter-spacing: -0.01em; }
    .info-rows { display: flex; flex-direction: column; gap: 1rem; }
    .info-row { display: flex; flex-direction: column; gap: 0.25rem; }
    .info-label { font-size: 0.7rem; color: #64748b; text-transform: uppercase; letter-spacing: .05em; font-weight: 700; }
    .info-value { display: flex; align-items: center; gap: 0.75rem; font-size: 0.95rem; color: var(--app-text); font-weight: 500; }
    .info-value i { color: var(--muted-text); opacity: 0.6; width: 16px; }
    .info-value.fee { color: #a78bfa; font-weight: 700; font-size: 1.1rem; }
    .description-block { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.05); }
    .desc-label { font-size: 0.7rem; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; font-weight: 700; }
    .desc-text { font-size: 0.95rem; color: #94a3b8; line-height: 1.6; }
    .action-stack { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem; }

    .qr-panel {
      background: var(--input-bg); border-radius: 20px; padding: 1.5rem; text-align: center;
      border: 1px solid var(--glass-border);
    }
    .qr-label { font-size: 0.9rem; color: #94a3b8; margin-bottom: 1rem; }
    .qr-box {
      font-family: 'JetBrains Mono', monospace; font-size: 1.25rem; font-weight: 800;
      background: rgba(139, 92, 246, 0.05); border: 2px dashed #a78bfa; border-radius: 12px;
      padding: 1.5rem; letter-spacing: .2em; color: #a78bfa;
    }
    .qr-expires { font-size: 0.75rem; color: #475569; margin-top: 0.75rem; }

    /* Detail Main */
    .detail-main { border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; }
    .tab-bar { display: flex; background: var(--input-bg); padding: 0.5rem 0.5rem 0; border-bottom: 1px solid var(--glass-border); }
    .tab-btn {
      padding: 1rem 1.5rem; border: none; background: transparent; font-size: 0.9rem;
      color: #94a3b8; cursor: pointer; border-bottom: 2px solid transparent; transition: all .2s;
      display: flex; align-items: center; gap: 0.75rem; font-weight: 600;
    }
    .tab-btn i { font-size: 1rem; opacity: 0.7; }
    .tab-btn:hover { color: var(--app-text); background: var(--glass-bg); }
    .tab-btn.active { color: var(--accent-blue); border-bottom-color: var(--accent-blue); i { opacity: 1; } }
    .tab-badge-premium {
      background: #38bdf8; color: #0f172a; font-size: 0.65rem; font-weight: 800;
      padding: 0.15rem 0.4rem; border-radius: 12px;
    }
    .tab-content { padding: 2rem; flex: 1; }

    /* Time Slots */
    .time-slots-section, .team-section { margin-bottom: 2.5rem; }
    .time-slots-section h4, .team-section h4 { font-size: 1rem; font-weight: 700; color: #f1f5f9; margin: 0 0 1rem; }
    .slots-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .slot-item {
      display: flex; align-items: center; gap: 1rem; padding: 1.25rem;
      background: var(--input-bg); border: 1px solid var(--glass-border);
      border-radius: 12px; font-size: 0.95rem; transition: all 0.2s;
    }
    .slot-item:hover { border-color: var(--accent-blue); background: var(--glass-bg); }
    .slot-item.selected { border-color: #38bdf8; background: rgba(56, 189, 248, 0.05); }
    .slot-date { font-weight: 700; color: #f1f5f9; }
    .slot-time { color: #94a3b8; }
    .slot-by { color: #64748b; font-size: 0.8rem; font-weight: 600; margin-left: auto; text-transform: uppercase; letter-spacing: 0.02em; }
    .selected-badge { color: #22c55e; font-weight: 800; font-size: 1.1rem; margin-left: 1rem; }

    /* Team */
    .team-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .team-member { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 14px; background: rgba(15, 23, 42, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); }
    .avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #38bdf8, #2563eb); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
    .member-name { font-size: 0.95rem; font-weight: 700; color: #f1f5f9; margin: 0; }
    .member-role { font-size: 0.8rem; color: #64748b; margin: 0; }
    .primary-badge { margin-left: auto; background: rgba(245, 158, 11, 0.1); color: #f59e0b; font-size: 0.65rem; padding: 0.25rem 0.6rem; border-radius: 8px; font-weight: 800; text-transform: uppercase; }

    /* Documents */
    .docs-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .docs-header h4 { margin: 0; font-size: 1rem; font-weight: 700; color: #f1f5f9; }
    .docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    .doc-card {
      display: flex; align-items: center; gap: 1rem; padding: 1rem;
      background: rgba(15, 23, 42, 0.3); border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px; transition: all 0.2s;
    }
    .doc-card:hover { border-color: #38bdf8; background: rgba(56, 189, 248, 0.02); }
    .doc-icon { font-size: 1.75rem; background: rgba(255, 255, 255, 0.03); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
    .doc-info { flex: 1; overflow: hidden; }
    .doc-name { font-size: 0.9rem; font-weight: 700; color: #f1f5f9; margin: 0 0 0.125rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .doc-meta { font-size: 0.75rem; color: #64748b; margin: 0; }

    /* Quotes */
    .quote-form { background: rgba(15, 23, 42, 0.3); border-radius: 20px; padding: 2rem; margin-bottom: 2rem; border: 1px solid rgba(255, 255, 255, 0.05); }
    .quote-form h4 { margin: 0 0 1.5rem; font-size: 1.1rem; color: #f1f5f9; font-weight: 700; }
    .quotes-list { display: flex; flex-direction: column; gap: 1rem; }
    .quote-item { background: rgba(15, 23, 42, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 1.5rem; }
    .quote-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .quote-amount { font-size: 1.5rem; font-weight: 800; color: #a78bfa; }
    .quote-terms { font-size: 0.9rem; color: #94a3b8; margin: 1rem 0; line-height: 1.5; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 10px; }
    .quote-meta { font-size: 0.8rem; color: #64748b; margin: 0; font-weight: 600; }

    /* Chat */
    .chat-tab { display: flex; flex-direction: column; height: 500px; }
    .chat-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; padding-bottom: 1rem; padding-right: 0.5rem; }
    .chat-messages::-webkit-scrollbar { width: 6px; }
    .chat-messages::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
    .chat-msg { display: flex; }
    .chat-msg.mine { justify-content: flex-end; }
    .msg-bubble { background: var(--input-bg); border: 1px solid var(--glass-border); border-radius: 18px 18px 18px 4px; padding: 1rem 1.25rem; max-width: 80%; }
    .chat-msg.mine .msg-bubble { background: rgba(139, 92, 246, 0.15); border-color: rgba(139, 92, 246, 0.2); border-radius: 18px 18px 4px 18px; color: var(--app-text); }
    .msg-bubble p { margin: 0; font-size: 0.95rem; line-height: 1.5; }
    .msg-time { font-size: 0.7rem; color: var(--muted-text); display: block; text-align: right; margin-top: 0.5rem; font-weight: 600; }
    .chat-input-row { display: flex; gap: 0.75rem; padding-top: 1.5rem; border-top: 1px solid var(--glass-border); }
    .chat-input { flex: 1; padding: 0.875rem 1.25rem; background: var(--input-bg); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--app-text); font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
    .chat-input:focus { border-color: var(--accent-blue); }

    /* Payment */
    .payment-card { text-align: center; padding: 3rem 2rem; background: rgba(56, 189, 248, 0.02); border-radius: 24px; border: 1px dashed rgba(56, 189, 248, 0.1); }
    .payment-amount { font-size: 3rem; font-weight: 800; color: var(--app-text); margin-bottom: 1.5rem; letter-spacing: -0.02em; }
    .payment-meta { display: flex; justify-content: center; gap: 1.5rem; align-items: center; margin-bottom: 2rem; color: var(--muted-text); font-weight: 600; }

    /* Form */
    .form-row { margin-bottom: 1.5rem; }
    .form-row label { display: block; font-size: 0.75rem; color: var(--muted-text); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 0.6rem; font-weight: 700; }
    .form-input { width: 100%; padding: 0.875rem 1rem; background: var(--input-bg); border: 1px solid var(--glass-border); border-radius: 10px; color: var(--app-text); font-size: 0.95rem; outline: none; transition: all 0.2s; }
    .form-input:focus { border-color: var(--accent-blue); background: var(--glass-bg); }

    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem;
      padding: 0.875rem 1.75rem; border-radius: 12px; font-size: 0.95rem; font-weight: 700;
      border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative; overflow: hidden;
    }
    .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .btn:active:not(:disabled) { transform: translateY(0); }
    .btn-primary { background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%); color: white; }
    .btn-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
    .btn-secondary { background: rgba(255, 255, 255, 0.05); color: #f1f5f9; border: 1px solid rgba(255, 255, 255, 0.1); }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }
    .btn-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.2); }
    .btn-xs { padding: 0.4rem 0.8rem; font-size: 0.75rem; border-radius: 8px; }

    /* Pagination */
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 3rem; }
    .page-action {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 1rem;
      color: #94a3b8; transition: all 0.2s; cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .page-action:hover:not(:disabled) { background: #38bdf8; color: #010101; border-color: #38bdf8; }
    .page-action:disabled { opacity: 0.3; cursor: not-allowed; }
    
    .page-numbers { display: flex; gap: 0.5rem; }
    .page-number {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 1rem;
      color: #94a3b8; transition: all 0.2s; cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.1); font-weight: 700;
    }
    .page-number:hover { border-color: #38bdf8; color: #38bdf8; }
    .page-number.active { background: #38bdf8; color: #0f172a; border-color: #38bdf8; }

    /* Toast */
    .toast {
      position: fixed; bottom: 2rem; right: 2rem; z-index: 10000;
      background: #10b981; color: white; padding: 1.25rem 2rem;
      border-radius: 16px; font-size: 0.95rem; font-weight: 700;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3); animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex; align-items: center; gap: 1rem; border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .toast.error { background: #ef4444; }
    @keyframes slideIn { from { transform: translateX(100%) scale(0.9); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }

    @media (max-width: 1100px) {
      .detail-layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .inspections-shell { padding: 1rem; }
      .detail-layout { grid-template-columns: 1fr; }
      .tab-bar { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      .tab-btn { white-space: nowrap; padding: 0.75rem 1rem; }
      h1 { font-size: 1.75rem; }
    }
  `]
})
export class InspectionsComponent implements OnInit, OnDestroy {
  private svc = inject(InspectionService);
  private destroy$ = new Subject<void>();

  // View state
  view = signal<ViewMode>('list');
  activeDetailTab: DetailTab = 'overview';

  // Data
  inspections = signal<InspectionRequestList[]>([]);
  selectedInspection = signal<InspectionRequest | null>(null);
  chatMessages = signal<any[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  toastMsg = signal('');
  toastError = signal(false);
  qrCode = signal('');
  qrExpiry = signal<Date | null>(null);

  // Filters
  searchTerm = '';
  statusFilter = '';
  propertyFilter = '';
  currentPage = signal(1);
  totalCount = signal(0);
  pageSize = 12;

  // Forms
  quoteForm = { amount: 0, currency: 'USD', validUntilStr: '', terms: '' };
  chatMessage = '';

  // Computed
  pendingCount = computed(() => this.inspections().filter(i => i.status === 1).length);
  activeCount = computed(() => this.inspections().filter(i => [5, 6].includes(i.status)).length);
  completedCount = computed(() => this.inspections().filter(i => i.status === 7).length);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize));
  pageRange = computed(() => {
    const t = this.totalPages(); const c = this.currentPage();
    return Array.from({ length: Math.min(t, 7) }, (_, i) => Math.max(1, c - 3) + i).filter(p => p <= t);
  });
  detailTabs = computed(() => {
    const i = this.selectedInspection();
    if (!i) return [];
    return [
      { id: 'overview' as DetailTab, label: 'inspections.tab.overview' },
      { id: 'quotes' as DetailTab, label: 'inspections.tab.quotes', badge: i.quotes?.length || 0 },
      { id: 'documents' as DetailTab, label: 'inspections.tab.documents', badge: i.documents?.length || 0 },
      { id: 'session' as DetailTab, label: 'inspections.tab.session' },
      { id: 'chat' as DetailTab, label: 'inspections.tab.chat' },
      { id: 'payment' as DetailTab, label: 'inspections.tab.payment' },
    ];
  });

  statusOptions = [1, 2, 3, 4, 5, 6, 7, 8].map(v => ({ value: v, label: STATUS_MAP[v]?.label ?? v.toString() }));
  propertyOptions = Object.entries(PROPERTY_TYPE_MAP).map(([v, l]) => ({ value: +v, label: l }));

  ngOnInit(): void { this.loadList(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadList(): void {
    this.isLoading.set(true);
    const filter: InspectionFilter = {
      page: this.currentPage(),
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      status: this.statusFilter ? +this.statusFilter : undefined,
      propertyType: this.propertyFilter ? +this.propertyFilter : undefined,
    };
    this.svc.getInspections(filter).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.inspections.set(data?.items ?? data ?? []);
        this.totalCount.set(data?.totalCount ?? this.inspections().length);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); this.toast('Failed to load inspections', true); }
    });
  }

  openDetail(id: number): void {
    this.isLoading.set(true);
    this.svc.getInspectionById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.selectedInspection.set(res?.data ?? res);
        this.view.set('detail');
        this.activeDetailTab = 'overview';
        this.isLoading.set(false);
        this.loadChat(id);
      },
      error: () => { this.isLoading.set(false); this.toast('Failed to load inspection', true); }
    });
  }

  goToList(): void { this.view.set('list'); this.selectedInspection.set(null); this.qrCode.set(''); }

  onSearch(): void { this.currentPage.set(1); this.loadList(); }
  onFilterChange(): void { this.currentPage.set(1); this.loadList(); }
  changePage(p: number): void { this.currentPage.set(p); this.loadList(); }

  selectSlot(slotId: number): void {
    const id = this.selectedInspection()!.id;
    this.svc.selectTimeSlot(id, slotId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.toast('Time slot selected'); this.openDetail(id); },
      error: () => this.toast('Failed to select slot', true)
    });
  }

  sendQuote(): void {
    if (!this.quoteForm.amount || !this.quoteForm.validUntilStr) {
      this.toast('Please fill all required fields', true); return;
    }
    this.isSaving.set(true);
    const id = this.selectedInspection()!.id;
    const payload: CreateQuote = {
      amount: this.quoteForm.amount,
      currency: this.quoteForm.currency,
      validUntil: new Date(this.quoteForm.validUntilStr),
      terms: this.quoteForm.terms || undefined,
    };
    this.svc.createQuote(id, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.isSaving.set(false); this.toast('Quote sent successfully'); this.openDetail(id); },
      error: () => { this.isSaving.set(false); this.toast('Failed to send quote', true); }
    });
  }

  generateQR(): void {
    const id = this.selectedInspection()!.id;
    this.svc.generateQRCode(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const d = res?.data ?? res;
        this.qrCode.set(d?.code ?? '');
        this.qrExpiry.set(d?.expiresAt ? new Date(d.expiresAt) : null);
        this.toast('QR Code generated');
      },
      error: () => this.toast('Failed to generate QR', true)
    });
  }

  startInspection(): void {
    const id = this.selectedInspection()!.id;
    this.svc.startInspection(id, '').pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.toast('Inspection started'); this.openDetail(id); },
      error: () => this.toast('Failed to start inspection', true)
    });
  }

  completeInspection(): void {
    const id = this.selectedInspection()!.id;
    this.svc.completeInspection(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.toast('Inspection completed'); this.openDetail(id); },
      error: () => this.toast('Failed to complete inspection', true)
    });
  }

  uploadFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const id = this.selectedInspection()!.id;
    Array.from(input.files).forEach(file => {
      this.svc.uploadDocument(id, { type: 1, file }).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { this.toast('File uploaded'); this.openDetail(id); },
        error: () => this.toast('Failed to upload file', true)
      });
    });
  }

  deleteDoc(docId: number): void {
    const id = this.selectedInspection()!.id;
    this.svc.deleteDocument(id, docId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.toast('Document deleted'); this.openDetail(id); },
      error: () => this.toast('Failed to delete document', true)
    });
  }

  loadChat(id: number): void {
    this.svc.getChatMessages(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => this.chatMessages.set(res?.data ?? res ?? []),
      error: () => { }
    });
  }

  sendMessage(): void {
    if (!this.chatMessage.trim()) return;
    const id = this.selectedInspection()!.id;
    this.svc.sendChatMessage(id, this.chatMessage).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.chatMessage = ''; this.loadChat(id); }
    });
  }

  confirmCash(): void {
    const id = this.selectedInspection()!.id;
    this.svc.createPayment(id, { amount: this.selectedInspection()!.inspectionFee ?? 0, currency: 'USD', paymentMethod: 'Cash' })
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { this.toast('Cash payment confirmed'); this.openDetail(id); },
        error: () => this.toast('Failed to confirm payment', true)
      });
  }

  respondToWorkRequest(accept: boolean): void {
    const id = this.selectedInspection()!.id;
    this.svc.respondToWorkRequest(id, accept).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.toast(accept ? 'Work request accepted' : 'Work request rejected'); this.openDetail(id); },
      error: () => this.toast('Failed', true)
    });
  }

  // Helpers
  statusLabel(s: number): string { return STATUS_MAP[s]?.label ?? 'Unknown'; }
  tabIcon(tabId: string): string {
    const icons: Record<string, string> = {
      'overview': 'fas fa-info-circle',
      'documents': 'fas fa-file-alt',
      'quotes': 'fas fa-file-invoice-dollar',
      'session': 'fas fa-clipboard-check',
      'chat': 'fas fa-comments',
      'payment': 'fas fa-credit-card'
    };
    return icons[tabId] || 'fas fa-folder';
  }

  statusColor(s: number): string { return STATUS_MAP[s]?.color ?? '#6b7280'; }
  statusBg(s: number): string { return STATUS_MAP[s]?.color ? STATUS_MAP[s].color + '22' : '#f3f4f6'; }
  propertyLabel(t: number): string { return PROPERTY_TYPE_MAP[t] ?? 'Other'; }
  quoteStatusLabel(s: number): string {
    return ['', 'inspections.quote_status.pending', 'inspections.quote_status.accepted', 'inspections.quote_status.rejected', 'inspections.quote_status.expired'][s] ?? 'Unknown';
  }
  quoteStatusBg(s: number): string { return ['', '#fef3c7', '#d1fae5', '#fee2e2', '#f3f4f6'][s] ?? '#f3f4f6'; }
  paymentStatusLabel(s: number): string {
    return ['', 'inspections.payment_status.pending', 'inspections.payment_status.paid', 'inspections.payment_status.failed', 'inspections.payment_status.refunded'][s] ?? 'Unknown';
  }
  paymentStatusBg(s: number): string { return ['', '#fef3c7', '#d1fae5', '#fee2e2', '#f3f4f6'][s] ?? '#f3f4f6'; }
  docIcon(t: number): string { return ['', '📷', '🎥', '📄', '🎵', '📎'][t] ?? '📎'; }

  private toastTimer: any;
  toast(msg: string, isError = false): void {
    this.toastMsg.set(msg);
    this.toastError.set(isError);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMsg.set(''), 3500);
  }
}
