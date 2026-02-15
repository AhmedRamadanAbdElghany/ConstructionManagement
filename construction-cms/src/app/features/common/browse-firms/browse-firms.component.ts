import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PendingRequestsService, PublicCompany, JoinRequest } from '../../../core/services/pending-requests.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-browse-firms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-10">
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">My Companies & Firms</h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">Manage your company memberships and find new firms to join.</p>
        </div>

        <!-- Search -->
        <div class="mb-12">
          <div class="relative max-w-md">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input [(ngModel)]="searchQuery" type="text" placeholder="Search available firms..."
                   class="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-bold placeholder-slate-300 dark:placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all shadow-sm" />
          </div>
        </div>

        <!-- Approved Companies (My Companies) -->
        @if (approvedCompanies.length > 0) {
          <div class="mb-12">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-1 h-6 rounded-full bg-emerald-500"></div>
              <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">My Active Companies</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (req of approvedCompanies; track req.id) {
                <div class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                  
                  <div class="relative z-10">
                    <div class="flex items-center justify-between mb-6">
                      <div class="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl">
                        {{ req.companyName.charAt(0) }}
                      </div>
                      <span class="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20">
                        Active Member
                      </span>
                    </div>
                    
                    <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">{{ req.companyName }}</h3>
                    <p class="text-xs text-slate-400 font-medium mb-6">Joined {{ req.createdAt | date:'mediumDate' }}</p>
                    
                    <a routerLink="/client-portal/dashboard" class="flex items-center justify-center w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white transition-all shadow-lg shadow-emerald-500/10">
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Pending Requests -->
        @if (pendingRequests.length > 0) {
          <div class="mb-12">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-1 h-6 rounded-full bg-amber-500"></div>
              <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Pending Approval</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (req of pendingRequests; track req.id) {
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-amber-200 dark:border-amber-500/20 shadow-xl p-8 relative overflow-hidden">
                   <div class="absolute inset-0 bg-amber-50/50 dark:bg-amber-900/5"></div>
                   
                   <div class="relative z-10 flex flex-col h-full">
                     <div class="flex items-center justify-between mb-6">
                        <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-lg">
                          {{ req.companyName.charAt(0) }}
                        </div>
                        <span class="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-500/20">
                          Pending
                        </span>
                     </div>
                     
                     <h3 class="text-lg font-black text-slate-900 dark:text-white mb-1">{{ req.companyName }}</h3>
                     <p class="text-xs text-slate-500 dark:text-slate-400 mb-6 flex-grow">Request sent on {{ req.createdAt | date:'mediumDate' }}</p>
                     
                     <div class="w-full py-3 rounded-xl bg-white/50 dark:bg-black/20 border border-amber-200 dark:border-amber-500/20 text-center">
                        <span class="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Waiting for Admin</span>
                     </div>
                   </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Available Companies -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-1 h-6 rounded-full bg-indigo-500"></div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Available Firms</h2>
          </div>

          @if (filteredAvailableCompanies.length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (company of filteredAvailableCompanies; track company.id) {
                <div class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
                  
                  <div class="p-8 relative z-10">
                    <div class="flex items-start justify-between mb-6">
                      <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                        {{ company.name.charAt(0) }}
                      </div>
                    </div>
                    
                    <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ company.name }}</h3>
                    @if (company.address) {
                      <p class="text-xs text-slate-400 font-bold flex items-center uppercase tracking-widest mb-6">
                         <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                         <span class="truncate">{{ company.address }}</span>
                      </p>
                    } @else {
                      <p class="text-xs text-slate-400 font-medium mb-6">Location not specified</p>
                    }

                    <button (click)="openJoinModal(company)"
                      class="flex items-center justify-center w-full py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all group-hover:shadow-lg">
                      Request to Join
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else if (!loading) {
            <div class="text-center py-20 rounded-[3rem] bg-slate-100/50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700">
               <p class="text-slate-400 font-bold">No available firms found matching your search.</p>
            </div>
          }
        </div>

        @if (loading) {
          <div class="text-center py-20">
            <svg class="animate-spin h-10 w-10 mx-auto text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-slate-400 font-black uppercase tracking-widest text-sm">Loading directory...</p>
          </div>
        }
      </div>

      <!-- Join Request Modal -->
      @if (showJoinModal && selectedCompany) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-[0.98] duration-300 border border-white/10">
            
            <!-- Modal Header -->
            <div class="p-8 pb-4 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30">
                  {{ selectedCompany.name.charAt(0) }}
                </div>
                <div>
                  <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Join Request</h2>
                  <p class="text-xs text-slate-400 font-bold">To: {{ selectedCompany.name }}</p>
                </div>
              </div>
              <button (click)="showJoinModal = false" class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all text-slate-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-8 space-y-6">
              <!-- Message -->
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Message (Optional)</label>
                <textarea [(ngModel)]="joinForm.message" rows="3" placeholder="Briefly explain why you want to join..."
                  class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"></textarea>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-8 pt-4 flex justify-end space-x-4 shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <button (click)="showJoinModal = false" class="px-6 py-3 rounded-xl text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-800 dark:hover:text-white transition-all">
                Cancel
              </button>
              <button (click)="submitJoinRequest()" [disabled]="isSubmitting"
                class="px-8 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                @if (isSubmitting) {
                  <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                }
                {{ isSubmitting ? 'Sending...' : 'Send Request' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Success Toast -->
      @if (showSuccess) {
        <div class="fixed bottom-8 right-8 z-[70] bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span>Request Sent Successfully!</span>
        </div>
      }
    </div>
  `
})
export class BrowseFirmsComponent implements OnInit {
  private service = inject(PendingRequestsService);
  private authService = inject(AuthService);

  // Data Sources
  allCompanies: PublicCompany[] = [];
  allRequests: JoinRequest[] = [];

  // Categorized Lists
  approvedCompanies: JoinRequest[] = [];
  pendingRequests: JoinRequest[] = [];
  availableCompanies: PublicCompany[] = [];

  searchQuery = '';
  loading = true;

  // Modal State
  showJoinModal = false;
  selectedCompany: PublicCompany | null = null;
  isSubmitting = false;
  showSuccess = false;

  joinForm = {
    requestedRole: 'NormalUser',
    message: ''
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    // Fetch both datasets
    // In a real app, use forkJoin here
    this.service.getPublicCompanies().subscribe({
      next: (companies) => {
        this.allCompanies = companies;
        this.checkDataLoaded();
      },
      error: () => this.loading = false
    });

    this.service.getMyJoinRequests().subscribe({
      next: (requests) => {
        this.allRequests = requests;
        this.checkDataLoaded();
      },
      error: () => this.loading = false
    });
  }

  checkDataLoaded() {
    // Organize data ONLY when both are (potentially) loaded
    // Simple check: if we have arrays (even empty), processed them.
    // Ideally use forkJoin to wait for both.
    this.processCategories();
    this.loading = false;
  }

  processCategories() {
    // 1. Approved
    this.approvedCompanies = this.allRequests.filter(r => r.status === 'Approved');

    // 2. Pending
    this.pendingRequests = this.allRequests.filter(r => r.status === 'Pending');

    // 3. Available (All Companies excluding those I have requests for)
    // Create a set of company IDs from my requests
    const myCompanyIds = new Set(this.allRequests.map(r => r.companyId));

    this.availableCompanies = this.allCompanies.filter(c => !myCompanyIds.has(c.id));
  }

  get filteredAvailableCompanies(): PublicCompany[] {
    if (!this.searchQuery.trim()) return this.availableCompanies;
    const q = this.searchQuery.toLowerCase();
    return this.availableCompanies.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  }

  openJoinModal(company: PublicCompany) {
    this.selectedCompany = company;
    const user = this.authService.getCurrentUser();
    // Use the role name from the user object if available, otherwise fallback to User
    const role = user?.role || 'User';
    this.joinForm = { requestedRole: role, message: '' };
    this.showJoinModal = true;
  }

  submitJoinRequest() {
    if (!this.selectedCompany) return;
    this.isSubmitting = true;

    this.service.submitJoinRequest(this.selectedCompany.id, this.joinForm.message, this.joinForm.requestedRole).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        this.showJoinModal = false;

        // Add to local requests list
        this.allRequests.push(result);

        // Re-process categories to update UI immediately
        this.processCategories();

        this.showSuccess = true;
        setTimeout(() => this.showSuccess = false, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err?.error?.message || 'Failed to send request.';
        alert(msg);
      }
    });
  }
}
