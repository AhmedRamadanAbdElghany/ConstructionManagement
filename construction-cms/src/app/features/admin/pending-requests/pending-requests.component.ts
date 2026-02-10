import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PendingRequestsService, CompanyRequest, JoinRequest } from '../../../core/services/pending-requests.service';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pending-requests',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div class="space-y-1">
            <h1 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-4">
              <span class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">⏳</span>
              {{ 'sidebar.pending_requests' | translate }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'pending_requests.subtitle' | translate }}</p>
          </div>
        </div>

        <!-- Navigation Hub -->
        <div class="flex items-center space-x-2 bg-slate-200/50 dark:bg-white/5 rounded-[2rem] p-2 mb-10 w-fit backdrop-blur-md">
          @if (isSuperAdmin()) {
            <button (click)="activeTab = 'companies'"
                    [class.bg-white]="activeTab === 'companies'"
                    [class.dark:bg-slate-800]="activeTab === 'companies'"
                    [class.shadow-xl]="activeTab === 'companies'"
                    [class.text-amber-600]="activeTab === 'companies'"
                    [class.dark:text-white]="activeTab === 'companies'"
                    class="px-10 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all">
              {{ 'pending_requests.company_requests' | translate }}
              <span class="ml-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px]">{{ companyRequests().length }}</span>
            </button>
          }

          @if (isCompanyAdmin()) {
            <button (click)="activeTab = 'joins'"
                    [class.bg-white]="activeTab === 'joins'"
                    [class.dark:bg-slate-800]="activeTab === 'joins'"
                    [class.shadow-xl]="activeTab === 'joins'"
                    [class.text-amber-600]="activeTab === 'joins'"
                    [class.dark:text-white]="activeTab === 'joins'"
                    class="px-10 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all text-slate-400 hover:text-slate-600">
              {{ 'pending_requests.join_requests' | translate }}
              <span class="ml-2 px-2 py-0.5 rounded-full bg-slate-400 text-white text-[9px]">{{ joinRequests().length }}</span>
            </button>
          }
        </div>

        <!-- Viewport -->
        <main class="animate-in slide-in-from-bottom-5 duration-700">
          @if (activeTab === 'companies') {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (request of companyRequests(); track request.id) {
                <div class="premium-card group">
                  <div class="flex items-start justify-between mb-6">
                    <div class="flex items-center gap-4">
                      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">🏢</div>
                      <div>
                        <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ request.companyName }}</h3>
                        <p class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ request.userFullName }} ({{ request.userEmail }})</p>
                      </div>
                    </div>
                    <span class="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase">{{ request.status }}</span>
                  </div>
                  
                  <div class="space-y-4 mb-8">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400 font-bold uppercase tracking-widest">{{ 'pending_requests.business_id' | translate }}</span>
                      <span class="text-slate-900 dark:text-white font-black">{{ request.businessId || 'N/A' }}</span>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400 font-bold uppercase tracking-widest">{{ 'pending_requests.request_date' | translate }}</span>
                      <span class="text-slate-900 dark:text-white font-black">{{ request.createdAt | date:'medium' }}</span>
                    </div>
                    @if (request.notes) {
                      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 italic text-xs text-slate-500">
                        "{{ request.notes }}"
                      </div>
                    }
                  </div>

                  <div class="flex gap-4">
                    <button (click)="approveCompany(request.id)" class="flex-1 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                      {{ 'pending_requests.approve' | translate }}
                    </button>
                    <button (click)="rejectCompany(request.id)" class="flex-1 py-4 rounded-xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                      {{ 'pending_requests.reject' | translate }}
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/5">
                   <p class="text-4xl mb-4 opacity-30">📭</p>
                   <p class="text-slate-400 font-black uppercase tracking-widest">{{ 'pending_requests.no_company_requests' | translate }}</p>
                </div>
              }
            </div>
          }

          @if (activeTab === 'joins') {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (request of joinRequests(); track request.id) {
                <div class="premium-card group">
                  <div class="flex items-start justify-between mb-6">
                    <div class="flex items-center gap-4">
                      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">👤</div>
                      <div>
                        <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ request.userFullName }}</h3>
                        <p class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ request.userEmail }}</p>
                      </div>
                    </div>
                    <span class="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 text-[9px] font-black uppercase">{{ request.status }}</span>
                  </div>
                  
                  <div class="space-y-4 mb-8">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400 font-bold uppercase tracking-widest">{{ 'pending_requests.target_company' | translate }}</span>
                      <span class="text-slate-900 dark:text-white font-black">{{ request.companyName }}</span>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-400 font-bold uppercase tracking-widest">{{ 'pending_requests.request_date' | translate }}</span>
                      <span class="text-slate-900 dark:text-white font-black">{{ request.createdAt | date:'medium' }}</span>
                    </div>
                    @if (request.message) {
                      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 italic text-xs text-slate-500">
                        "{{ request.message }}"
                      </div>
                    }
                  </div>

                  <div class="flex gap-4">
                    <button (click)="approveJoin(request.id)" class="flex-1 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                      {{ 'pending_requests.approve' | translate }}
                    </button>
                    <button (click)="rejectJoin(request.id)" class="flex-1 py-4 rounded-xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                      {{ 'pending_requests.reject' | translate }}
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/5">
                   <p class="text-4xl mb-4 opacity-30">📭</p>
                   <p class="text-slate-400 font-black uppercase tracking-widest">{{ 'pending_requests.no_join_requests' | translate }}</p>
                </div>
              }
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .premium-card {
      @apply bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-500;
    }
  `]
})
export class PendingRequestsComponent implements OnInit {
  private service = inject(PendingRequestsService);
  private authService = inject(AuthService);

  isSuperAdmin = computed(() => this.authService.hasRole('SuperAdmin'));
  isCompanyAdmin = computed(() => this.authService.hasRole('CompanyAdmin'));

  activeTab: 'companies' | 'joins' = 'companies';
  companyRequests = signal<CompanyRequest[]>([]);
  joinRequests = signal<JoinRequest[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    if (this.isSuperAdmin()) {
      this.activeTab = 'companies';
      this.service.getPendingCompanyRequests().subscribe(reqs => this.companyRequests.set(reqs));
    }

    if (this.isCompanyAdmin()) {
      this.activeTab = 'joins';
      this.service.getPendingJoinRequests().subscribe(reqs => this.joinRequests.set(reqs));
    }
  }

  approveCompany(id: number) {
    this.service.approveCompanyRequest(id).subscribe(() => this.loadData());
  }

  rejectCompany(id: number) {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.service.rejectCompanyRequest(id, reason).subscribe(() => this.loadData());
    }
  }

  approveJoin(id: number) {
    this.service.approveJoinRequest(id).subscribe(() => this.loadData());
  }

  rejectJoin(id: number) {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.service.rejectJoinRequest(id, reason).subscribe(() => this.loadData());
    }
  }
}
