import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PendingRequestsService, PublicCompany, JoinRequest } from '../../../core/services/pending-requests.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-browse-firms',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-10">
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Browse Firms</h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">Find and join a construction firm to start collaborating</p>
        </div>

        <!-- Search -->
        <div class="mb-8">
          <div class="relative max-w-md">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input [(ngModel)]="searchQuery" type="text" placeholder="Search firms..."
                   class="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-bold placeholder-slate-300 dark:placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all shadow-sm" />
          </div>
        </div>

        <!-- My Pending Requests Banner -->
        @if (myPendingRequests.length > 0) {
          <div class="mb-8 p-6 rounded-[2rem] bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 dark:border-amber-500/10">
            <h3 class="text-sm font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4">Your Pending Requests</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (req of myPendingRequests; track req.id) {
                <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <p class="text-sm font-black text-slate-900 dark:text-white">{{ req.companyName }}</p>
                    <p class="text-xs text-slate-400 font-bold">{{ req.createdAt | date:'mediumDate' }}</p>
                  </div>
                  <span class="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        [ngClass]="{
                          'bg-amber-500/10 text-amber-600': req.status === 'Pending',
                          'bg-emerald-500/10 text-emerald-600': req.status === 'Approved',
                          'bg-rose-500/10 text-rose-600': req.status === 'Rejected'
                        }">
                    {{ req.status }}
                  </span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Firms Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (company of filteredCompanies; track company.id) {
            <div class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-cyan-500/30 transition-all duration-300 overflow-hidden relative">
              <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/15 transition-colors"></div>
              <div class="p-8">
                <div class="flex items-start space-x-4 mb-6">
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-cyan-500/20 shrink-0">
                    {{ company.name.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-xl font-black text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors tracking-tight leading-tight mb-1 truncate">{{ company.name }}</h3>
                    @if (company.address) {
                      <p class="text-xs text-slate-400 font-bold flex items-center uppercase tracking-widest">
                        <svg class="w-3.5 h-3.5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        </svg>
                        <span class="truncate">{{ company.address }}</span>
                      </p>
                    }
                  </div>
                </div>

                @if (hasPendingRequest(company.id)) {
                  <div class="w-full py-4 rounded-[1.5rem] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-[0.2em] text-center border border-amber-500/20">
                    Request Pending
                  </div>
                } @else {
                  <button (click)="openJoinModal(company)"
                    class="flex items-center justify-center w-full py-5 rounded-[1.5rem] bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-white hover:scale-[1.02] transition-all group/btn border border-white/10 dark:border-none">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                    Request to Join
                  </button>
                }
              </div>
            </div>
          }
        </div>

        @if (filteredCompanies.length === 0 && !loading) {
          <div class="text-center py-20">
            <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">No Firms Found</h3>
            <p class="text-slate-400 font-medium">No registered firms match your search</p>
          </div>
        }

        @if (loading) {
          <div class="text-center py-20">
            <svg class="animate-spin h-10 w-10 mx-auto text-cyan-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-slate-400 font-black uppercase tracking-widest text-sm">Loading firms...</p>
          </div>
        }
      </div>

      <!-- Join Request Modal -->
      @if (showJoinModal && selectedCompany) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-700">
          <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-[0_40px_150px_-20px_rgba(0,0,0,0.7)] flex flex-col relative overflow-hidden animate-in zoom-in-[0.98] duration-500 border border-white/10">
            <div class="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

            <!-- Modal Header -->
            <div class="p-8 pb-4 flex items-center justify-between shrink-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 relative z-10">
              <div class="flex items-center space-x-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-cyan-500/20">
                  {{ selectedCompany.name.charAt(0) }}
                </div>
                <div>
                  <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Join {{ selectedCompany.name }}</h2>
                  <p class="text-xs text-slate-400 font-bold">Send a request to join this firm</p>
                </div>
              </div>
              <button (click)="showJoinModal = false" class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all text-slate-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-8 space-y-6">
              <!-- Role Selection -->
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Your Role</label>
                <div class="grid grid-cols-3 gap-3">
                  @for (role of availableRoles; track role.key) {
                    <button (click)="joinForm.requestedRole = role.key"
                      [ngClass]="{
                        'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20': joinForm.requestedRole === role.key,
                        'border-slate-200 dark:border-white/5 text-slate-500 hover:border-slate-300 dark:hover:border-white/10': joinForm.requestedRole !== role.key
                      }"
                      class="p-4 rounded-2xl border text-center transition-all">
                      <div class="w-10 h-10 mx-auto rounded-xl mb-2 flex items-center justify-center"
                           [ngClass]="{
                             'bg-blue-500/10': role.key === 'NormalUser',
                             'bg-amber-500/10': role.key === 'Worker',
                             'bg-purple-500/10': role.key === 'InventoryOwner'
                           }">
                        <svg class="w-5 h-5" [ngClass]="{'text-blue-500': role.key === 'NormalUser', 'text-amber-500': role.key === 'Worker', 'text-purple-500': role.key === 'InventoryOwner'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          @if (role.key === 'NormalUser') {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          } @else if (role.key === 'Worker') {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          } @else {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                          }
                        </svg>
                      </div>
                      <p class="text-[10px] font-black uppercase tracking-widest">{{ role.label }}</p>
                    </button>
                  }
                </div>
              </div>

              <!-- Message -->
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Message (Optional)</label>
                <textarea [(ngModel)]="joinForm.message" rows="3" placeholder="Introduce yourself or explain why you'd like to join..."
                  class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-bold placeholder-slate-300 dark:placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all resize-none"></textarea>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-8 pt-4 flex justify-end space-x-4 shrink-0 border-t border-slate-100 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
              <button (click)="showJoinModal = false" class="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                Cancel
              </button>
              <button (click)="submitJoinRequest()" [disabled]="isSubmitting"
                class="px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-cyan-500/30 hover:scale-[1.03] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-3">
                @if (isSubmitting) {
                  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Sending...</span>
                } @else {
                  <span>Send Request</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Success Toast -->
      @if (showSuccess) {
        <div class="fixed bottom-8 right-8 z-[70] bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-500/30 animate-in slide-in-from-bottom-4 duration-500 flex items-center space-x-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
          <span>Join request sent successfully!</span>
        </div>
      }
    </div>
  `
})
export class BrowseFirmsComponent implements OnInit {
    private service = inject(PendingRequestsService);

    companies: PublicCompany[] = [];
    myPendingRequests: JoinRequest[] = [];
    searchQuery = '';
    loading = true;
    showJoinModal = false;
    selectedCompany: PublicCompany | null = null;
    isSubmitting = false;
    showSuccess = false;

    joinForm = {
        requestedRole: 'NormalUser',
        message: ''
    };

    availableRoles = [
        { key: 'NormalUser', label: 'User' },
        { key: 'Worker', label: 'Worker' },
        { key: 'InventoryOwner', label: 'Inventory' }
    ];

    get filteredCompanies(): PublicCompany[] {
        if (!this.searchQuery.trim()) return this.companies;
        const q = this.searchQuery.toLowerCase();
        return this.companies.filter(c =>
            c.name.toLowerCase().includes(q) ||
            (c.address && c.address.toLowerCase().includes(q))
        );
    }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.service.getPublicCompanies().subscribe({
            next: (companies) => {
                this.companies = companies;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });

        // Load user's own requests
        this.service.getJoinRequests().subscribe({
            next: (requests) => {
                this.myPendingRequests = requests;
            },
            error: () => { }
        });
    }

    hasPendingRequest(companyId: number): boolean {
        return this.myPendingRequests.some(r => r.companyId === companyId && r.status === 'Pending');
    }

    openJoinModal(company: PublicCompany) {
        this.selectedCompany = company;
        this.joinForm = { requestedRole: 'NormalUser', message: '' };
        this.showJoinModal = true;
    }

    submitJoinRequest() {
        if (!this.selectedCompany) return;
        this.isSubmitting = true;

        this.service.submitJoinRequest(this.selectedCompany.id, this.joinForm.message).subscribe({
            next: (result) => {
                this.isSubmitting = false;
                this.showJoinModal = false;
                this.myPendingRequests.push(result);
                this.showSuccess = true;
                setTimeout(() => this.showSuccess = false, 4000);
            },
            error: (err) => {
                this.isSubmitting = false;
                const msg = err?.error?.message || err?.error || 'Failed to send request. Please try again.';
                alert(msg);
            }
        });
    }
}
