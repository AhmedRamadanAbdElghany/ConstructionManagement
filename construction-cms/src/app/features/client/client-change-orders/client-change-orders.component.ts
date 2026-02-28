import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ClientPortalService, ChangeOrderRequest } from '../../../core/services/client-portal.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-client-change-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">{{ 'client.change_orders' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'client.change_orders_subtitle' | translate }}</p>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl">
              <div class="flex flex-col px-3">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                <select [(ngModel)]="selectedStatus" (change)="loadChangeOrders()" class="bg-transparent border-none text-xs font-black text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none cursor-pointer">
                  <option value="">All</option>
                  <option value="submitted">Submitted</option>
                  <option value="underreview">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div class="flex flex-col px-3">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Project</span>
                <select [(ngModel)]="selectedProjectId" (change)="loadChangeOrders()" class="bg-transparent border-none text-xs font-black text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none cursor-pointer">
                  <option value="">All Projects</option>
                  <option *ngFor="let project of projects" [value]="project.id">{{ project.name }}</option>
                </select>
              </div>
            </div>
            <a routerLink="/client-portal/change-orders/new" class="px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
              {{ 'client.new_change_order' | translate }}
            </a>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <app-loading-spinner [centered]="true"></app-loading-spinner>
          </div>
        }

        <!-- Change Orders List -->
        @if (!isLoading && changeOrders.length > 0) {
          <div class="space-y-4">
            @for (changeOrder of changeOrders; track changeOrder.id) {
              <div class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all">
                <div class="p-8">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
                        📋
                      </div>
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          @if (changeOrder.companyName) {
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {{ changeOrder.companyName }}
                            </span>
                          }
                        </div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white mb-1">{{ changeOrder.title }}</h3>
                        <div class="flex items-center gap-3">
                          <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            {{ changeOrder.requestNumber }}
                          </span>
                          @if (changeOrder.projectName) {
                            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
                              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                              </svg>
                              {{ changeOrder.projectName }}
                            </span>
                          }
                          <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ formatDate(changeOrder.createdAt) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 text-slate-500"
                            [ngClass]="{
                              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10': changeOrder.status === 'Approved',
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10': changeOrder.status === 'Submitted' || changeOrder.status === 'Under Review',
                              'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/10': changeOrder.status === 'Rejected',
                              'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/10': changeOrder.status === 'Cancelled'
                            }">
                        {{ changeOrder.status }}
                      </span>
                      <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                            [ngClass]="{
                              'bg-rose-500/10 text-rose-600 dark:text-rose-400': changeOrder.priority === 'Urgent',
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400': changeOrder.priority === 'High',
                              'bg-slate-500/10 text-slate-600 dark:text-slate-400': changeOrder.priority === 'Medium' || changeOrder.priority === 'Low'
                            }">
                        {{ changeOrder.priority }}
                      </span>
                    </div>
                  </div>
                  
                  <p class="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">{{ changeOrder.description }}</p>
                  
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'client.category' | translate }}</p>
                      <p class="text-sm font-black text-slate-900 dark:text-white">{{ changeOrder.category }}</p>
                    </div>
                    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'client.estimated_cost' | translate }}</p>
                      <p class="text-sm font-black text-slate-900 dark:text-white">{{ formatCurrency(changeOrder.estimatedCost) }}</p>
                    </div>
                    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'client.estimated_days' | translate }}</p>
                      <p class="text-sm font-black text-slate-900 dark:text-white">{{ changeOrder.estimatedDays }} {{ 'client.days' | translate }}</p>
                    </div>
                    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'client.due_date' | translate }}</p>
                      <p class="text-sm font-black text-slate-900 dark:text-white">{{ changeOrder.dueDate ? formatDate(changeOrder.dueDate) : '-' }}</p>
                    </div>
                  </div>

                  @if (changeOrder.status === 'Approved') {
                    <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 mb-6">
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">{{ 'client.approved_details' | translate }}</p>
                          <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {{ 'client.reviewed_by' | translate }}: {{ changeOrder.reviewerName || '-' }}
                          </p>
                        </div>
                        <div class="text-right">
                          <p class="text-sm font-black text-emerald-600 dark:text-emerald-400">{{ formatCurrency(changeOrder.approvedBudget || 0) }}</p>
                          <p class="text-xs text-slate-500 dark:text-slate-400">{{ changeOrder.approvedDays || 0 }} {{ 'client.days' | translate }}</p>
                        </div>
                      </div>
                    </div>
                  }

                  @if (changeOrder.status === 'Rejected' && changeOrder.reviewNotes) {
                    <div class="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 mb-6">
                      <p class="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">{{ 'client.rejection_reason' | translate }}</p>
                      <p class="text-sm text-slate-600 dark:text-slate-400">{{ changeOrder.reviewNotes }}</p>
                    </div>
                  }

                  <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <span class="text-xs text-slate-500 dark:text-slate-400">
                      {{ 'client.created_at' | translate }}: {{ formatDateTime(changeOrder.createdAt) }}
                    </span>
                    <div class="flex gap-3">
                      @if (changeOrder.status === 'Submitted' || changeOrder.status === 'Under Review') {
                        <button (click)="cancelChangeOrder(changeOrder.id)" class="px-4 py-2 rounded-xl border-2 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                          {{ 'client.cancel' | translate }}
                        </button>
                      }
                      <button (click)="viewDetails(changeOrder.id)" class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors">
                        {{ 'client.view_details' | translate }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (!isLoading && changeOrders.length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
              <svg class="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ 'client.no_change_orders' | translate }}</h3>
            <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mb-8">
              {{ 'client.no_change_orders_desc' | translate }}
            </p>
            <a routerLink="/client-portal/change-orders/new" class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              {{ 'client.submit_first_change_order' | translate }}
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    :host ::ng-deep select {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
  `]
})
export class ClientChangeOrdersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private clientPortalService = inject(ClientPortalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private i18nService = inject(I18nService);

  changeOrders: ChangeOrderRequest[] = [];
  projects: any[] = [];
  isLoading = false;
  selectedStatus = '';
  selectedProjectId = '';

  ngOnInit() {
    this.loadChangeOrders();
    this.loadProjects();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadChangeOrders();
        this.loadProjects();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChangeOrders() {
    this.isLoading = true;
    const projectId = this.selectedProjectId ? parseInt(this.selectedProjectId) : undefined;
    this.clientPortalService.getChangeOrderRequests(projectId).subscribe({
      next: (changeOrders) => {
        this.changeOrders = changeOrders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading change orders:', error);
        this.isLoading = false;
      }
    });
  }

  loadProjects() {
    this.clientPortalService.getClientDashboard().subscribe({
      next: (dashboard) => {
        this.projects = dashboard.projects.map(p => ({ id: p.projectId, name: p.projectName }));
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  cancelChangeOrder(id: number) {
    if (confirm('Are you sure you want to cancel this change order request?')) {
      this.clientPortalService.cancelChangeOrderRequest(id).subscribe({
        next: () => {
          this.loadChangeOrders();
        },
        error: (error) => {
          console.error('Error cancelling change order:', error);
        }
      });
    }
  }

  viewDetails(id: number) {
    this.router.navigate(['/client-portal/change-orders', id]);
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
}
