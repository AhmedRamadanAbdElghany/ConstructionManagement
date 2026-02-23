import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

const API_URL = '/api';

interface JoinRequest {
    id: number;
    userId: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    roleName: string;
    experience: string;
    notes: string;
}

interface Role {
    id: number;
    name: string;
    nameAr: string;
}

@Component({
    selector: 'app-join-requests',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule
    ],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {{ 'WAREHOUSE_HR.JOIN_REQUESTS.TITLE' | translate }} 📋
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium mt-1">
            {{ 'WAREHOUSE_HR.JOIN_REQUESTS.SUBTITLE' | translate }}
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_HR.JOIN_REQUESTS.PENDING_REQUESTS' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ requestStats().pending }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_HR.JOIN_REQUESTS.APPROVED_REQUESTS' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ requestStats().approved }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_HR.JOIN_REQUESTS.REJECTED_REQUESTS' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ requestStats().rejected }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex gap-2 mb-6">
          <button 
            (click)="statusFilter.set('all')"
            [class]="statusFilter() === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'"
            class="px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-slate-200 dark:border-slate-700">
            {{ 'WAREHOUSE_HR.JOIN_REQUESTS.ALL_REQUESTS' | translate }}
          </button>
          <button 
            (click)="statusFilter.set('pending')"
            [class]="statusFilter() === 'pending' ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'"
            class="px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-slate-200 dark:border-slate-700">
            {{ 'WAREHOUSE_HR.JOIN_REQUESTS.STATUS_PENDING' | translate }}
          </button>
          <button 
            (click)="statusFilter.set('approved')"
            [class]="statusFilter() === 'approved' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'"
            class="px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-slate-200 dark:border-slate-700">
            {{ 'WAREHOUSE_HR.JOIN_REQUESTS.STATUS_APPROVED' | translate }}
          </button>
          <button 
            (click)="statusFilter.set('rejected')"
            [class]="statusFilter() === 'rejected' ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'"
            class="px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-slate-200 dark:border-slate-700">
            {{ 'WAREHOUSE_HR.JOIN_REQUESTS.STATUS_REJECTED' | translate }}
          </button>
        </div>

        <!-- Requests List -->
        <div class="space-y-4">
          @for (request of filteredRequests(); track request.id) {
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
              <div class="p-6">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      {{ request.fullName.charAt(0) }}
                    </div>
                    <div>
                      <h3 class="font-bold text-slate-900 dark:text-white text-lg">{{ request.fullName }}</h3>
                      <div class="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          {{ request.email }}
                        </span>
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                          </svg>
                          {{ request.phoneNumber }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    @if (request.status === 'pending') {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        {{ 'WAREHOUSE_HR.JOIN_REQUESTS.STATUS_PENDING' | translate }}
                      </span>
                    } @else if (request.status === 'approved') {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {{ 'WAREHOUSE_HR.JOIN_REQUESTS.STATUS_APPROVED' | translate }}
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        {{ 'WAREHOUSE_HR.JOIN_REQUESTS.STATUS_REJECTED' | translate }}
                      </span>
                    }
                  </div>
                </div>
                
                <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p class="text-slate-500 dark:text-slate-400">{{ 'WAREHOUSE_HR.JOIN_REQUESTS.REQUESTED_ROLE' | translate }}</p>
                      <p class="font-medium text-slate-900 dark:text-white">{{ request.roleName || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-slate-500 dark:text-slate-400">{{ 'WAREHOUSE_HR.JOIN_REQUESTS.EXPERIENCE' | translate }}</p>
                      <p class="font-medium text-slate-900 dark:text-white">{{ request.experience || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-slate-500 dark:text-slate-400">{{ 'WAREHOUSE_HR.JOIN_REQUESTS.REQUESTED_AT' | translate }}</p>
                      <p class="font-medium text-slate-900 dark:text-white">{{ request.requestedAt | date:'mediumDate' }}</p>
                    </div>
                  </div>
                  
                  @if (request.notes) {
                    <div class="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p class="text-sm text-slate-600 dark:text-slate-300">{{ request.notes }}</p>
                    </div>
                  }
                </div>
                
                @if (request.status === 'pending') {
                  <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3">
                    <select 
                      [(ngModel)]="selectedRoles[request.id]"
                      class="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                      <option value="">{{ 'WAREHOUSE_HR.JOIN_REQUESTS.SELECT_ROLE' | translate }}</option>
                      @for (role of roles(); track role.id) {
                        <option [value]="role.id">{{ role.name }}</option>
                      }
                    </select>
                    
                    <button 
                      (click)="approveRequest(request)"
                      class="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {{ 'WAREHOUSE_HR.JOIN_REQUESTS.APPROVE' | translate }}
                    </button>
                    
                    <button 
                      (click)="rejectRequest(request)"
                      class="px-6 py-2 bg-rose-500 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-rose-500/30 transition-all flex items-center justify-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      {{ 'WAREHOUSE_HR.JOIN_REQUESTS.REJECT' | translate }}
                    </button>
                  </div>
                }
              </div>
            </div>
          } @empty {
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-16 text-center">
              <svg class="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <p class="text-slate-500 dark:text-slate-400 font-medium">{{ 'WAREHOUSE_HR.JOIN_REQUESTS.NO_REQUESTS' | translate }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class JoinRequestsComponent {
    private http = inject(HttpClient);

    // State
    requests = signal<JoinRequest[]>([]);
    roles = signal<Role[]>([]);
    statusFilter = signal<string>('all');
    selectedRoles: { [key: number]: string } = {};

    // Computed
    requestStats = computed(() => {
        const reqs = this.requests();
        return {
            pending: reqs.filter(r => r.status === 'pending').length,
            approved: reqs.filter(r => r.status === 'approved').length,
            rejected: reqs.filter(r => r.status === 'rejected').length
        };
    });

    filteredRequests = computed(() => {
        const filter = this.statusFilter();
        const reqs = this.requests();

        if (filter === 'all') {
            return reqs;
        }

        return reqs.filter(r => r.status === filter);
    });

    constructor() {
        this.loadRequests();
        this.loadRoles();
    }

    loadRequests() {
        this.http.get<JoinRequest[]>(`${API_URL}/vendor/join-requests`).subscribe({
            next: (data) => this.requests.set(data),
            error: (err) => console.error('Failed to load join requests:', err)
        });
    }

    loadRoles() {
        this.http.get<Role[]>(`${API_URL}/company/roles`).subscribe({
            next: (data) => this.roles.set(data),
            error: (err) => console.error('Failed to load roles:', err)
        });
    }

    approveRequest(request: JoinRequest) {
        const roleId = this.selectedRoles[request.id];

        this.http.put(`${API_URL}/vendor/join-requests/${request.id}/approve`, {
            roleId: roleId
        }).subscribe({
            next: () => {
                this.requests.update(reqs =>
                    reqs.map(r => r.id === request.id ? { ...r, status: 'approved' as const } : r)
                );
            },
            error: (err) => console.error('Failed to approve request:', err)
        });
    }

    rejectRequest(request: JoinRequest) {
        if (confirm(`Are you sure you want to reject ${request.fullName}'s request?`)) {
            this.http.put(`${API_URL}/vendor/join-requests/${request.id}/reject`, {}).subscribe({
                next: () => {
                    this.requests.update(reqs =>
                        reqs.map(r => r.id === request.id ? { ...r, status: 'rejected' as const } : r)
                    );
                },
                error: (err) => console.error('Failed to reject request:', err)
            });
        }
    }
}
