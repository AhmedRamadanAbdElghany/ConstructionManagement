import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SubcontractorService, Subcontractor, SubcontractorContract, SubcontractorPayment, SubcontractorRating } from '../../../../core/services/subcontractor.service';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-subcontractor-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500 text-slate-900 dark:text-slate-100">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div class="flex items-center gap-6">
            <button (click)="goBack()" 
                    class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500/30 transition-all shadow-xl active:scale-90">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <div>
              <div class="flex items-center gap-3 mb-1">
                <h1 class="text-4xl font-black tracking-tight">{{ subcontractor?.name || 'Loading...' }}</h1>
                @if (subcontractor?.isApproved) {
                  <span class="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  </span>
                }
              </div>
              <p class="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">{{ subcontractor?.tradeSpecialty || 'Subcontractor' }}</p>
            </div>
          </div>
          <div class="flex gap-4">
            <button (click)="editSubcontractor()" 
                    class="px-8 py-4 rounded-[2rem] bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              {{ 'admin.edit' | translate }}
            </button>
            @if (subcontractor && !subcontractor.isApproved) {
              <button (click)="approveSubcontractor()" 
                      class="px-8 py-4 rounded-[2rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
                {{ 'admin.approve' | translate }}
              </button>
            }
          </div>
        </div>

        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <app-loading-spinner [centered]="true"></app-loading-spinner>
          </div>
        } @else if (subcontractor) {
          <!-- Stats Dashboard -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div class="premium-stat-card bg-white dark:bg-slate-900">
               <div class="flex items-center justify-between mb-6">
                  <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ 'subcontractors.status' | translate }}</span>
               </div>
               <p class="text-2xl font-black uppercase tracking-tight" [class.text-emerald-500]="subcontractor.isApproved" [class.text-amber-500]="!subcontractor.isApproved">
                 {{ (subcontractor.isApproved ? 'subcontractors.active' : 'subcontractors.pending') | translate }}
               </p>
            </div>

            <div class="premium-stat-card bg-white dark:bg-slate-900">
               <div class="flex items-center justify-between mb-6">
                  <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                  </div>
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ 'subcontractors.details.average_rating' | translate }}</span>
               </div>
               <div class="flex items-end gap-2">
                 <p class="text-4xl font-black tracking-tighter">{{ (subcontractor.averageRating ?? 0).toFixed(1) }}</p>
                 <p class="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1.5">{{ subcontractor.ratingGrade || '' }}</p>
               </div>
            </div>

            <div class="premium-stat-card bg-white dark:bg-slate-900">
               <div class="flex items-center justify-between mb-6">
                  <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </div>
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ 'subcontractors.details.completed_projects' | translate }}</span>
               </div>
               <p class="text-4xl font-black tracking-tighter">{{ subcontractor.totalProjectsCompleted || 0 }}</p>
            </div>

            <div class="premium-stat-card bg-white dark:bg-slate-900">
               <div class="flex items-center justify-between mb-6">
                  <div class="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ 'subcontractors.details.lifetime_paid' | translate }}</span>
               </div>
               <p class="text-3xl font-black tracking-tighter">{{ formatCurrency(subcontractor.totalPaid || 0) }}</p>
            </div>
          </div>

          <!-- Content Split -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <!-- Left Side -->
            <div class="lg:col-span-2 space-y-10">
              
              <!-- Information Hub -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-900 dark:text-slate-100">
                 <!-- Contact Info -->
                 <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-white/5 shadow-2xl">
                    <h3 class="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                       <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                       {{ 'subcontractors.details.contact_info' | translate }}
                    </h3>
                    <div class="space-y-6">
                       <div>
                          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'subcontractors.details.phone' | translate }}</p>
                          <p class="text-sm font-bold">{{ subcontractor.phone || 'N/A' }}</p>
                       </div>
                       <div>
                          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'subcontractors.details.email' | translate }}</p>
                          <p class="text-sm font-bold">{{ subcontractor.email || 'N/A' }}</p>
                       </div>
                       <div>
                          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'subcontractors.details.address' | translate }}</p>
                          <p class="text-sm font-bold opacity-80">{{ subcontractor.address || 'N/A' }}</p>
                       </div>
                    </div>
                 </div>

                 <!-- Business Info -->
                 <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-white/5 shadow-2xl text-slate-900 dark:text-slate-100">
                    <h3 class="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                       <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                       {{ 'subcontractors.details.business_info' | translate }}
                    </h3>
                    <div class="space-y-6">
                       <div class="grid grid-cols-2 gap-4">
                          <div>
                             <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'subcontractors.details.license' | translate }}</p>
                             <p class="text-sm font-bold">{{ subcontractor.licenseNumber || 'N/A' }}</p>
                          </div>
                          <div>
                             <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'subcontractors.details.tax_no' | translate }}</p>
                             <p class="text-sm font-bold">{{ subcontractor.taxNumber || 'N/A' }}</p>
                          </div>
                       </div>
                       <div>
                          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'subcontractors.details.insurance' | translate }}</p>
                          <p class="text-sm font-bold">{{ subcontractor.insurancePolicyNumber || 'N/A' }}</p>
                       </div>
                       <div>
                          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'subcontractors.details.expiry' | translate }}</p>
                          <p class="text-sm font-bold" [class.text-rose-500]="isExpiring(subcontractor.insuranceExpiryDate)">
                            {{ formatDate(subcontractor.insuranceExpiryDate) }}
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              <!-- Contracts Section -->
              <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden">
                 <div class="px-10 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                    <h2 class="text-xl font-black uppercase tracking-tight">{{ 'subcontractors.details.contracts' | translate }}</h2>
                    <button (click)="createContract()" class="px-5 py-2 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                       + {{ 'subcontractors.details.new_contract' | translate }}
                    </button>
                 </div>
                 
                 <div class="p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                       @for (contract of contracts; track contract.id) {
                          <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group">
                             <div class="flex items-start justify-between mb-6">
                                <div>
                                   <h4 class="text-base font-black group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{{ contract.title }}</h4>
                                   <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{{ contract.projectName }}</p>
                                </div>
                                <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                                      [ngClass]="{
                                        'bg-emerald-500/10 text-emerald-500': contract.status === 'Active',
                                        'bg-amber-500/10 text-amber-500': contract.status === 'Pending',
                                        'bg-slate-500/10 text-slate-500': contract.status === 'Completed'
                                      }">
                                  {{ contract.status }}
                                </span>
                             </div>
                             
                             <div class="space-y-4">
                               <div class="flex items-center justify-between">
                                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.amount' | translate }}</span>
                                  <span class="text-sm font-black text-indigo-600 dark:text-indigo-400">{{ formatCurrency(contract.contractAmount) }}</span>
                               </div>
                               <div>
                                  <div class="flex items-center justify-between mb-2">
                                     <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.completion' | translate }}</span>
                                     <span class="text-[10px] font-black text-slate-900 dark:text-white">{{ contract.completionPercentage }}%</span>
                                  </div>
                                  <div class="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                     <div class="h-full bg-indigo-500 rounded-full" [style.width.%]="contract.completionPercentage"></div>
                                  </div>
                               </div>
                             </div>
                          </div>
                       } @empty {
                         <div class="col-span-2 text-center py-20 opacity-30 italic font-medium uppercase tracking-widest text-[10px]">No active contracts found</div>
                       }
                    </div>
                 </div>
              </div>

              <!-- Payments Flow -->
              <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden">
                 <div class="px-10 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                    <h2 class="text-xl font-black uppercase tracking-tight">{{ 'subcontractors.details.payments' | translate }}</h2>
                    <button (click)="createPayment()" class="px-5 py-2 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                       + {{ 'subcontractors.details.new_payment' | translate }}
                    </button>
                 </div>
                 
                 <div class="overflow-x-auto">
                    <table class="w-full">
                       <thead>
                          <tr class="text-left bg-slate-50/30 dark:bg-slate-950/40">
                             <th class="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{{ 'subcontractors.payment_no' | translate }}</th>
                             <th class="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.details.phone' | translate }} Type</th>
                             <th class="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.amount' | translate }}</th>
                             <th class="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'subcontractors.status' | translate }}</th>
                             <th class="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                          </tr>
                       </thead>
                       <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                          @for (payment of payments; track payment.id) {
                             <tr class="group hover:bg-slate-50/80 dark:hover:bg-white/[0.01] transition-all">
                                <td class="px-10 py-8 text-sm font-black tracking-tighter">{{ payment.paymentNumber }}</td>
                                <td class="px-10 py-8 text-xs font-bold text-slate-500 uppercase">{{ payment.paymentType }}</td>
                                <td class="px-10 py-8 text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{{ formatCurrency(payment.amount) }}</td>
                                <td class="px-10 py-8">
                                   <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all"
                                         [ngClass]="{
                                           'bg-emerald-500/10 text-emerald-500 border-emerald-500/10': payment.status === 'Paid',
                                           'bg-amber-500/10 text-amber-500 border-amber-500/10': payment.status === 'Pending' || payment.status === 'Approved',
                                           'bg-rose-500/10 text-rose-500 border-rose-500/10': payment.status === 'Rejected'
                                         }">
                                     {{ payment.status }}
                                   </span>
                                </td>
                                <td class="px-10 py-8 text-xs font-bold text-slate-400">{{ formatDate(payment.paymentDate) }}</td>
                             </tr>
                          }
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>

            <!-- Right Side -->
            <div class="space-y-10 text-slate-900 dark:text-slate-100">
               <!-- Performance Ratings -->
               <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl p-10">
                  <div class="flex items-center justify-between mb-8">
                     <h3 class="text-sm font-black uppercase tracking-widest">{{ 'subcontractors.details.ratings' | translate }}</h3>
                     <button (click)="createRating()" class="p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                     </button>
                  </div>
                  
                  <div class="space-y-8">
                    @for (rating of ratings; track rating.id) {
                       <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                          <div class="absolute -top-4 -right-4 w-20 h-20 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                          
                          <div class="flex items-center justify-between mb-6">
                             <div class="flex items-center gap-1">
                               @for (star of [1,2,3,4,5]; track star) {
                                 <svg class="w-3.5 h-3.5" [class.text-amber-500]="star <= (rating.overallRating || 0)" [class.text-slate-200]="star > (rating.overallRating || 0)" fill="currentColor" viewBox="0 0 20 20">
                                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                 </svg>
                               }
                             </div>
                             <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ formatDate(rating.evaluationDate) }}</span>
                          </div>
                          
                          <div class="grid grid-cols-2 gap-4 mb-4">
                             <div>
                                <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'subcontractors.details.quality' | translate }}</p>
                                <div class="flex items-center gap-2">
                                   <div class="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                      <div class="h-full bg-amber-500" [style.width.%]="rating.qualityOfWork * 20"></div>
                                   </div>
                                   <span class="text-[10px] font-black">{{ rating.qualityOfWork }}</span>
                                </div>
                             </div>
                             <div>
                                <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'subcontractors.details.timeliness' | translate }}</p>
                                <div class="flex items-center gap-2">
                                   <div class="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                      <div class="h-full bg-indigo-500" [style.width.%]="rating.timeliness * 20"></div>
                                   </div>
                                   <span class="text-[10px] font-black">{{ rating.timeliness }}</span>
                                </div>
                             </div>
                          </div>
                          
                          <div class="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                             <div class="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">{{ rating.evaluatorName.substring(0,1) }}</div>
                             <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">By {{ rating.evaluatorName }}</p>
                          </div>
                       </div>
                    }
                  </div>
               </div>

               <!-- Internal Notes -->
               <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl p-10">
                  <h3 class="text-sm font-black uppercase tracking-widest mb-6">{{ 'subcontractors.details.notes' | translate }}</h3>
                  <div class="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                     <p class="text-sm font-medium leading-relaxed italic opacity-80">
                        "{{ subcontractor.notes || 'No internal records found for this partner.' }}"
                     </p>
                  </div>
               </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .premium-stat-card {
      padding: 2rem;
      border-radius: 2.5rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1);
      transition: all 500ms;
    }
    .premium-stat-card:hover {
      box-shadow: 0 25px 50px -12px rgba(0,0,0,.25);
    }
  `]
})
export class SubcontractorDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);

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
  ) {
    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.subcontractorId) {
          this.loadData();
        }
      });
  }

  ngOnInit(): void {
    this.subcontractorId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.subcontractorId) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.router.navigate(['/admin/subcontractors']);
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

  isExpiring(date: string | Date | undefined): boolean {
    if (!date) return false;
    const expiry = new Date(date);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 30;
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
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
