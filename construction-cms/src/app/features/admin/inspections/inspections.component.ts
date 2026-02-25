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
      <div class="kpi-card">
        <span class="kpi-value">{{ totalCount() }}</span>
        <span class="kpi-label">{{ 'inspections.kpi.total' | translate }}</span>
      </div>
      <div class="kpi-card pending">
        <span class="kpi-value">{{ pendingCount() }}</span>
        <span class="kpi-label">{{ 'inspections.kpi.pending' | translate }}</span>
      </div>
      <div class="kpi-card active">
        <span class="kpi-value">{{ activeCount() }}</span>
        <span class="kpi-label">{{ 'inspections.kpi.active' | translate }}</span>
      </div>
      <div class="kpi-card complete">
        <span class="kpi-value">{{ completedCount() }}</span>
        <span class="kpi-label">{{ 'inspections.kpi.completed' | translate }}</span>
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
          <div class="inspection-card" (click)="openDetail(insp.id)">
            <div class="card-header">
              <div class="prop-badge">{{ propertyLabel(insp.propertyType) | translate }}</div>
              <span class="status-pill" [style.background]="statusBg(insp.status)" [style.color]="statusColor(insp.status)">
                {{ statusLabel(insp.status) | translate }}
              </span>
            </div>
            <h3 class="card-title">{{ insp.title }}</h3>
            <p class="card-client">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              {{ insp.clientName }}
            </p>
            <p class="card-address">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              {{ insp.address }}
            </p>
            <div class="card-footer">
              @if (insp.inspectionFee) {
                <span class="fee-badge">\${{ insp.inspectionFee | number:'1.0-0' }}</span>
              }
              <span class="date-label">{{ insp.createdAt | date:'mediumDate' }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="pagination">
          <button class="page-btn" [disabled]="currentPage() === 1" (click)="changePage(currentPage() - 1)">‹</button>
          @for (p of pageRange(); track p) {
            <button class="page-btn" [class.active]="p === currentPage()" (click)="changePage(p)">{{ p }}</button>
          }
          <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="changePage(currentPage() + 1)">›</button>
        </div>
      }
    }
  }

  <!-- ===== DETAIL VIEW ===== -->
  @if (view() === 'detail' && selectedInspection()) {
    <div class="detail-layout">
      <!-- Left: Info Panel -->
      <div class="detail-sidebar">
        <div class="info-card">
          <div class="info-header">
            <span class="status-pill large" [style.background]="statusBg(selectedInspection()!.status)" [style.color]="statusColor(selectedInspection()!.status)">
              {{ statusLabel(selectedInspection()!.status) | translate }}
            </span>
            <span class="prop-badge">{{ propertyLabel(selectedInspection()!.propertyType) | translate }}</span>
          </div>
          <h2 class="detail-title">{{ selectedInspection()!.title }}</h2>

          <div class="info-rows">
            <div class="info-row">
              <span class="info-label">{{ 'inspections.client' | translate }}</span>
              <span class="info-value">{{ selectedInspection()!.clientName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ 'inspections.address' | translate }}</span>
              <span class="info-value">{{ selectedInspection()!.address }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ 'inspections.area' | translate }}</span>
              <span class="info-value">{{ selectedInspection()!.approximateArea }} m²</span>
            </div>
            @if (selectedInspection()!.inspectionFee) {
              <div class="info-row">
                <span class="info-label">{{ 'inspections.fee' | translate }}</span>
                <span class="info-value fee">\${{ selectedInspection()!.inspectionFee | number:'1.2-2' }}</span>
              </div>
            }
            @if (selectedInspection()!.scheduledDate) {
              <div class="info-row">
                <span class="info-label">{{ 'inspections.scheduled' | translate }}</span>
                <span class="info-value">{{ selectedInspection()!.scheduledDate | date:'medium' }}</span>
              </div>
            }
            <div class="info-row">
              <span class="info-label">{{ 'inspections.created' | translate }}</span>
              <span class="info-value">{{ selectedInspection()!.createdAt | date:'mediumDate' }}</span>
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
      <div class="detail-main">
        <div class="tab-bar">
          @for (tab of detailTabs(); track tab.id) {
            <button class="tab-btn" [class.active]="activeDetailTab === tab.id" (click)="activeDetailTab = tab.id">
              {{ tab.label | translate }}
              @if (tab.badge) {
                <span class="tab-badge">{{ tab.badge }}</span>
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
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Inter', sans-serif;
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .header-icon {
      width: 46px; height: 46px; border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex; align-items: center; justify-content: center; color: white;
    }
    h1 { font-size: 1.5rem; font-weight: 700; color: #1e1b4b; margin: 0; }
    .subtitle { color: #6b7280; font-size: 0.875rem; margin: 0.2rem 0 0; }

    /* KPI Strip */
    .kpi-strip {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;
    }
    .kpi-card {
      background: white; border-radius: 12px; padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,.08); display: flex; flex-direction: column; gap: 0.25rem;
      border-left: 4px solid #e5e7eb;
    }
    .kpi-card.pending   { border-left-color: #f59e0b; }
    .kpi-card.active    { border-left-color: #3b82f6; }
    .kpi-card.complete  { border-left-color: #22c55e; }
    .kpi-value { font-size: 2rem; font-weight: 800; color: #1e1b4b; }
    .kpi-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; }

    /* Filter Bar */
    .filter-bar {
      display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap;
    }
    .search-wrap { position: relative; flex: 1; min-width: 200px; }
    .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #9ca3af; }
    .search-input {
      width: 100%; padding: 0.6rem 0.75rem 0.6rem 2.25rem;
      border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem;
      outline: none; transition: border-color .2s;
    }
    .search-input:focus { border-color: #667eea; }
    .filter-select {
      padding: 0.6rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px;
      font-size: 0.875rem; background: white; outline: none; cursor: pointer;
    }

    /* Cards Grid */
    .inspection-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 1rem;
    }
    .inspection-card {
      background: white; border-radius: 14px; padding: 1.25rem;
      box-shadow: 0 1px 4px rgba(0,0,0,.08); cursor: pointer;
      transition: transform .2s, box-shadow .2s; border: 1px solid #f3f4f6;
    }
    .inspection-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.12); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .card-title { font-size: 1rem; font-weight: 600; color: #1e1b4b; margin: 0 0 0.5rem; }
    .card-client, .card-address {
      display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: #6b7280; margin: 0.25rem 0;
    }
    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #f3f4f6; }
    .fee-badge { background: #ede9fe; color: #7c3aed; padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
    .date-label { font-size: 0.75rem; color: #9ca3af; }

    /* Status / Property Badges */
    .status-pill {
      padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.72rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: .04em;
    }
    .status-pill.large { font-size: 0.8rem; padding: 0.35rem 0.9rem; }
    .prop-badge {
      background: #f3f4f6; color: #374151; padding: 0.2rem 0.6rem;
      border-radius: 6px; font-size: 0.72rem; font-weight: 500;
    }

    /* Detail Layout */
    .detail-layout { display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem; }
    .detail-sidebar { display: flex; flex-direction: column; gap: 1rem; }

    .info-card {
      background: white; border-radius: 14px; padding: 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
    }
    .info-header { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .detail-title { font-size: 1.2rem; font-weight: 700; color: #1e1b4b; margin: 0 0 1.25rem; }
    .info-rows { display: flex; flex-direction: column; gap: 0.75rem; }
    .info-row { display: flex; flex-direction: column; gap: 0.125rem; }
    .info-label { font-size: 0.72rem; color: #9ca3af; text-transform: uppercase; letter-spacing: .05em; }
    .info-value { font-size: 0.875rem; color: #374151; font-weight: 500; }
    .info-value.fee { color: #7c3aed; font-weight: 700; }
    .description-block { margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid #f3f4f6; }
    .desc-label { font-size: 0.72rem; color: #9ca3af; text-transform: uppercase; margin-bottom: 0.375rem; }
    .desc-text { font-size: 0.875rem; color: #374151; line-height: 1.5; }
    .action-stack { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1.25rem; }

    .qr-panel {
      background: white; border-radius: 14px; padding: 1.5rem; text-align: center;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
    }
    .qr-label { font-size: 0.875rem; color: #374151; margin-bottom: 1rem; }
    .qr-box {
      font-family: monospace; font-size: 1.1rem; font-weight: 700;
      background: #f8f7ff; border: 2px dashed #a78bfa; border-radius: 10px;
      padding: 1.5rem; letter-spacing: .15em; color: #7c3aed;
    }
    .qr-expires { font-size: 0.75rem; color: #9ca3af; margin-top: 0.75rem; }

    /* Detail Main */
    .detail-main { background: white; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,.08); overflow: hidden; }
    .tab-bar { display: flex; border-bottom: 1px solid #f3f4f6; }
    .tab-btn {
      padding: 0.9rem 1.25rem; border: none; background: transparent; font-size: 0.875rem;
      color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; transition: all .2s;
      display: flex; align-items: center; gap: 0.4rem;
    }
    .tab-btn.active { color: #667eea; border-bottom-color: #667eea; font-weight: 600; }
    .tab-badge {
      background: #667eea; color: white; font-size: 0.65rem;
      padding: 0.125rem 0.4rem; border-radius: 10px;
    }
    .tab-content { padding: 1.5rem; }

    /* Time Slots */
    .time-slots-section, .team-section { margin-bottom: 2rem; }
    .time-slots-section h4, .team-section h4 { font-size: 0.9rem; font-weight: 600; color: #374151; margin: 0 0 0.75rem; }
    .slots-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .slot-item {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem;
      border: 1px solid #f3f4f6; border-radius: 8px; font-size: 0.875rem;
    }
    .slot-item.selected { border-color: #667eea; background: #f8f7ff; }
    .slot-date { font-weight: 500; color: #374151; }
    .slot-time { color: #6b7280; }
    .slot-by { color: #9ca3af; font-size: 0.75rem; margin-left: auto; }
    .selected-badge { color: #22c55e; font-weight: 700; }

    /* Team */
    .team-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .team-member { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 8px; background: #f9fafb; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; }
    .member-name { font-size: 0.875rem; font-weight: 500; margin: 0; }
    .member-role { font-size: 0.75rem; color: #9ca3af; margin: 0; }
    .primary-badge { margin-left: auto; background: #fef3c7; color: #92400e; font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 10px; }

    /* Documents */
    .docs-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .docs-header h4 { margin: 0; font-size: 0.9rem; font-weight: 600; color: #374151; }
    .docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.75rem; }
    .doc-card {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem;
      border: 1px solid #f3f4f6; border-radius: 10px; transition: border-color .2s;
    }
    .doc-card:hover { border-color: #667eea; }
    .doc-icon { font-size: 1.5rem; }
    .doc-info { flex: 1; overflow: hidden; }
    .doc-name { font-size: 0.8rem; font-weight: 500; color: #374151; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .doc-meta { font-size: 0.72rem; color: #9ca3af; margin: 0; }

    /* Quotes */
    .quote-form { background: #f9fafb; border-radius: 10px; padding: 1.25rem; margin-bottom: 1.5rem; }
    .quote-form h4 { margin: 0 0 1rem; font-size: 0.9rem; color: #374151; }
    .quotes-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .quote-item { border: 1px solid #f3f4f6; border-radius: 10px; padding: 1rem; }
    .quote-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .quote-amount { font-size: 1.25rem; font-weight: 700; color: #7c3aed; }
    .quote-terms { font-size: 0.8rem; color: #6b7280; margin: 0.5rem 0; }
    .quote-meta { font-size: 0.75rem; color: #9ca3af; margin: 0; }

    /* Session */
    .session-card { background: #f9fafb; border-radius: 10px; padding: 1.25rem; }
    .session-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6; font-size: 0.875rem; }

    /* Chat */
    .chat-tab { display: flex; flex-direction: column; height: 420px; }
    .chat-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; padding-bottom: 0.75rem; }
    .chat-msg { display: flex; }
    .chat-msg.mine { justify-content: flex-end; }
    .msg-bubble { background: #f3f4f6; border-radius: 12px; padding: 0.75rem 1rem; max-width: 70%; }
    .chat-msg.mine .msg-bubble { background: #ede9fe; }
    .msg-bubble p { margin: 0; font-size: 0.875rem; color: #374151; }
    .msg-time { font-size: 0.7rem; color: #9ca3af; display: block; text-align: right; margin-top: 0.25rem; }
    .chat-input-row { display: flex; gap: 0.5rem; padding-top: 0.75rem; border-top: 1px solid #f3f4f6; }
    .chat-input { flex: 1; padding: 0.6rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; outline: none; }

    /* Payment */
    .payment-card { text-align: center; padding: 2rem; }
    .payment-amount { font-size: 2.5rem; font-weight: 800; color: #7c3aed; margin-bottom: 1rem; }
    .payment-meta { display: flex; justify-content: center; gap: 1rem; align-items: center; margin-bottom: 1.5rem; }

    /* Form */
    .form-row { margin-bottom: 1rem; }
    .form-row label { display: block; font-size: 0.72rem; color: #9ca3af; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 0.375rem; }
    .form-input { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; font-family: inherit; outline: none; }
    .form-input:focus { border-color: #667eea; }

    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
      padding: 0.625rem 1.25rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600;
      border: none; cursor: pointer; transition: all .2s; text-decoration: none;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,.4); }
    .btn-success { background: linear-gradient(135deg, #10b981, #059669); color: white; }
    .btn-success:hover:not(:disabled) { transform: translateY(-1px); }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-secondary:hover { background: #e5e7eb; }
    .btn-danger { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
    .btn-ghost { background: transparent; color: #6b7280; padding: 0.5rem 0.75rem; }
    .btn-ghost:hover { background: #f3f4f6; }
    .btn-sm { padding: 0.4rem 0.875rem; font-size: 0.8rem; }
    .btn-xs { padding: 0.25rem 0.6rem; font-size: 0.72rem; border-radius: 6px; background: #ede9fe; color: #7c3aed; border: none; cursor: pointer; }
    .icon-btn { background: transparent; border: none; cursor: pointer; font-size: 1rem; padding: 0.25rem; border-radius: 4px; transition: background .15s; }
    .icon-btn.danger:hover { background: #fef2f2; }
    .upload-btn { cursor: pointer; }

    /* States */
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; gap: 1rem; color: #9ca3af; }
    .spinner { width: 36px; height: 36px; border: 3px solid #f3f4f6; border-top-color: #667eea; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; gap: 0.75rem; }
    .empty-state.small { padding: 2rem; }
    .empty-icon { font-size: 2.5rem; }
    .empty-state h3 { font-size: 1rem; color: #374151; margin: 0; }
    .empty-state p, .empty-msg { font-size: 0.875rem; color: #9ca3af; margin: 0; }

    /* Pagination */
    .pagination { display: flex; justify-content: center; gap: 0.4rem; margin-top: 1.5rem; }
    .page-btn {
      width: 36px; height: 36px; border: 1px solid #e5e7eb; border-radius: 8px;
      background: white; cursor: pointer; font-size: 0.875rem; transition: all .15s;
    }
    .page-btn:hover:not(:disabled) { border-color: #667eea; color: #667eea; }
    .page-btn.active { background: #667eea; color: white; border-color: #667eea; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Toast */
    .toast {
      position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9999;
      background: #22c55e; color: white; padding: 0.875rem 1.5rem;
      border-radius: 10px; font-size: 0.875rem; font-weight: 500;
      box-shadow: 0 4px 20px rgba(0,0,0,.15); animation: slideIn .3s ease;
    }
    .toast.error { background: #ef4444; }
    @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 900px) {
      .kpi-strip { grid-template-columns: repeat(2, 1fr); }
      .detail-layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .inspections-shell { padding: 1rem; }
      .kpi-strip { grid-template-columns: repeat(2, 1fr); }
      .inspection-grid { grid-template-columns: 1fr; }
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
