import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubcontractorService, Subcontractor, SubcontractorContract, SubcontractorPayment, SubcontractorRating } from '../../../../core/services/subcontractor.service';

@Component({
    selector: 'app-subcontractor-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <button (click)="goBack()" class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <svg class="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ subcontractor?.name || 'Loading...' }}</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ subcontractor?.tradeSpecialty || '' }}</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button (click)="editSubcontractor()" class="px-6 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
              {{ 'admin.edit' | translate }}
            </button>
            <button (click)="approveSubcontractor()" *ngIf="subcontractor && !subcontractor.isApproved" class="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors">
              {{ 'admin.approve' | translate }}
            </button>
          </div>
        </div>

        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        } @else if (subcontractor) {
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Status</span>
              </div>
              <h3 class="text-2xl font-black" [class.text-emerald-500]="subcontractor.isApproved" [class.text-amber-500]="!subcontractor.isApproved">
                {{ subcontractor.isApproved ? 'Approved' : 'Pending' }}
              </h3>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                  </svg>
                </div>
                <span class="text-[10px] font-black text-violet-500 uppercase tracking-widest">Rating</span>
              </div>
              <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ subcontractor.averageRating?.toFixed(1) || 'N/A' }}</h3>
              <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Grade: {{ subcontractor.ratingGrade || 'N/A' }}</p>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <span class="text-[10px] font-black text-blue-500 uppercase tracking-widest">Projects</span>
              </div>
              <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ subcontractor.totalProjectsCompleted || 0 }}</h3>
              <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Completed</p>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">Total Paid</span>
              </div>
              <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ formatCurrency(subcontractor.totalPaid || 0) }}</h3>
              <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Lifetime</p>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column: Details -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Contact Information -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Contact Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone</label>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">{{ subcontractor.phone || 'N/A' }}</p>
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email</label>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">{{ subcontractor.email || 'N/A' }}</p>
                  </div>
                  <div class="md:col-span-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Address</label>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">{{ subcontractor.address || 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <!-- Business Information -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Business Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">License Number</label>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">{{ subcontractor.licenseNumber || 'N/A' }}</p>
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tax Number</label>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">{{ subcontractor.taxNumber || 'N/A' }}</p>
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Insurance Policy</label>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">{{ subcontractor.insurancePolicyNumber || 'N/A' }}</p>
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Insurance Expiry</label>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">{{ formatDate(subcontractor.insuranceExpiryDate) }}</p>
                  </div>
                </div>
              </div>

              <!-- Contracts -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Contracts</h3>
                  <button (click)="createContract()" class="px-4 py-2 rounded-xl bg-violet-500 text-white font-black text-xs uppercase tracking-widest hover:bg-violet-600 transition-colors">
                    + New Contract
                  </button>
                </div>
                <div class="space-y-4">
                  @for (contract of contracts; track contract.id) {
                    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <div class="flex items-start justify-between mb-3">
                        <div>
                          <h4 class="font-bold text-slate-900 dark:text-white">{{ contract.title }}</h4>
                          <p class="text-[10px] text-slate-500 mt-1">{{ contract.projectName }}</p>
                        </div>
                        <span class="px-2 py-0.5 rounded-md text-[8px] font-black uppercase"
                              [class.bg-emerald-500/10]="contract.status === 'Active'"
                              [class.text-emerald-500]="contract.status === 'Active'"
                              [class.bg-amber-500/10]="contract.status === 'Pending'"
                              [class.text-amber-500]="contract.status === 'Pending'"
                              [class.bg-slate-500/10]="contract.status === 'Completed'"
                              [class.text-slate-500]="contract.status === 'Completed'">
                          {{ contract.status }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <div class="text-[10px] text-slate-500">
                          <span class="font-bold text-slate-900 dark:text-white">{{ formatCurrency(contract.contractAmount) }}</span>
                          <span class="mx-2">•</span>
                          {{ contract.completionPercentage }}% Complete
                        </div>
                        <button (click)="viewContract(contract)" class="text-xs font-black text-violet-500 uppercase tracking-widest hover:text-violet-600">View</button>
                      </div>
                    </div>
                  }
                  @if (!contracts.length) {
                    <p class="text-[10px] text-slate-400 italic text-center py-8">No contracts found</p>
                  }
                </div>
              </div>

              <!-- Payments -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Payments</h3>
                  <button (click)="createPayment()" class="px-4 py-2 rounded-xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors">
                    + New Payment
                  </button>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="border-b border-slate-100 dark:border-white/5">
                        <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Payment #</th>
                        <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Type</th>
                        <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Amount</th>
                        <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
                        <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (payment of payments; track payment.id) {
                        <tr class="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                          <td class="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white">{{ payment.paymentNumber }}</td>
                          <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{{ payment.paymentType }}</td>
                          <td class="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(payment.amount) }}</td>
                          <td class="px-4 py-3">
                            <span class="px-2 py-0.5 rounded-md text-[8px] font-black uppercase"
                                  [class.bg-emerald-500/10]="payment.status === 'Paid'"
                                  [class.text-emerald-500]="payment.status === 'Paid'"
                                  [class.bg-blue-500/10]="payment.status === 'Approved'"
                                  [class.text-blue-500]="payment.status === 'Approved'"
                                  [class.bg-amber-500/10]="payment.status === 'Pending'"
                                  [class.text-amber-500]="payment.status === 'Pending'">
                              {{ payment.status }}
                            </span>
                          </td>
                          <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{{ formatDate(payment.paymentDate) }}</td>
                        </tr>
                      }
                      @if (!payments.length) {
                        <tr>
                          <td colspan="5" class="px-4 py-8 text-center">
                            <p class="text-[10px] text-slate-400 italic">No payments found</p>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Right Column: Ratings & Notes -->
            <div class="space-y-8">
              <!-- Ratings -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Ratings</h3>
                  <button (click)="createRating()" class="px-4 py-2 rounded-xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-colors">
                    + Rate
                  </button>
                </div>
                <div class="space-y-4">
                  @for (rating of ratings; track rating.id) {
                    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                      <div class="flex items-center justify-between mb-3">
                        <span class="text-2xl font-black text-amber-500">{{ rating.ratingGrade }}</span>
                        <span class="text-[8px] text-slate-400">{{ formatDate(rating.evaluationDate) }}</span>
                      </div>
                      <div class="space-y-2">
                        <div class="flex items-center justify-between text-[10px]">
                          <span class="text-slate-500">Quality</span>
                          <span class="font-bold text-slate-900 dark:text-white">{{ rating.qualityOfWork }}/5</span>
                        </div>
                        <div class="flex items-center justify-between text-[10px]">
                          <span class="text-slate-500">Timeliness</span>
                          <span class="font-bold text-slate-900 dark:text-white">{{ rating.timeliness }}/5</span>
                        </div>
                        <div class="flex items-center justify-between text-[10px]">
                          <span class="text-slate-500">Communication</span>
                          <span class="font-bold text-slate-900 dark:text-white">{{ rating.communication }}/5</span>
                        </div>
                        <div class="flex items-center justify-between text-[10px]">
                          <span class="text-slate-500">Safety</span>
                          <span class="font-bold text-slate-900 dark:text-white">{{ rating.safetyCompliance }}/5</span>
                        </div>
                      </div>
                      <div class="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                        <p class="text-[8px] text-slate-400">By {{ rating.evaluatorName }}</p>
                      </div>
                    </div>
                  }
                  @if (!ratings.length) {
                    <p class="text-[10px] text-slate-400 italic text-center py-8">No ratings found</p>
                  }
                </div>
              </div>

              <!-- Notes -->
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Notes</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">{{ subcontractor.notes || 'No notes available' }}</p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SubcontractorDetailComponent implements OnInit {
    subcontractorId: number | null = null;
    subcontractor: Subcontractor | null = null;
    contracts: SubcontractorContract[] = [];
    payments: SubcontractorPayment[] = [];
    ratings: SubcontractorRating[] = [];
    isLoading = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private subcontractorService: SubcontractorService
    ) { }

    ngOnInit(): void {
        this.subcontractorId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.subcontractorId) {
            this.loadData();
        }
    }

    loadData(): void {
        this.isLoading = true;
        this.subcontractorService.getSubcontractor(this.subcontractorId!).subscribe({
            next: (data) => {
                this.subcontractor = data;
                this.loadRelatedData();
            },
            error: (error) => {
                console.error('Error loading subcontractor:', error);
                this.isLoading = false;
            }
        });
    }

    loadRelatedData(): void {
        this.subcontractorService.getContracts(this.subcontractorId!).subscribe({
            next: (data) => {
                this.contracts = data;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading contracts:', error);
                this.isLoading = false;
            }
        });

        this.subcontractorService.getPayments(this.subcontractorId!).subscribe({
            next: (data) => {
                this.payments = data;
            },
            error: (error) => {
                console.error('Error loading payments:', error);
            }
        });

        this.subcontractorService.getRatings(this.subcontractorId!).subscribe({
            next: (data) => {
                this.ratings = data;
            },
            error: (error) => {
                console.error('Error loading ratings:', error);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/admin/subcontractor']);
    }

    editSubcontractor(): void {
        console.log('Edit subcontractor:', this.subcontractor);
    }

    approveSubcontractor(): void {
        if (this.subcontractor) {
            this.subcontractorService.approveSubcontractor(this.subcontractor.id, { approvedBy: 1 }).subscribe({
                next: (updated) => {
                    this.subcontractor = updated;
                },
                error: (error) => {
                    console.error('Error approving subcontractor:', error);
                }
            });
        }
    }

    createContract(): void {
        console.log('Create contract for subcontractor:', this.subcontractorId);
    }

    viewContract(contract: SubcontractorContract): void {
        console.log('View contract:', contract);
    }

    createPayment(): void {
        console.log('Create payment for subcontractor:', this.subcontractorId);
    }

    createRating(): void {
        console.log('Create rating for subcontractor:', this.subcontractorId);
    }

    formatDate(date: string | Date | null | undefined): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
}
