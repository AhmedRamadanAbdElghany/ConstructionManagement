import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { SubcontractorService, SubcontractorContract, CreateContractRequest, UpdateContractRequest, ContractStatusUpdateRequest } from '../../../../core/services/subcontractor.service';
import { I18nService } from '../../../../core/i18n/i18n.service';

@Component({
  selector: 'app-subcontractor-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Subcontractor Contracts</h1>
            <div class="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl w-fit">
              <button (click)="activeTab = 'active'"
                      [class.bg-white]="activeTab === 'active'"
                      [class.shadow-sm]="activeTab === 'active'"
                      [class.text-slate-900]="activeTab === 'active'"
                      [class.dark:bg-slate-700]="activeTab === 'active'"
                      [class.dark:text-white]="activeTab === 'active'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                Active
              </button>
              <button (click)="activeTab = 'all'"
                      [class.bg-white]="activeTab === 'all'"
                      [class.shadow-sm]="activeTab === 'all'"
                      [class.text-slate-900]="activeTab === 'all'"
                      [class.dark:bg-slate-700]="activeTab === 'all'"
                      [class.dark:text-white]="activeTab === 'all'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                All
              </button>
            </div>
          </div>

          <button (click)="openCreateModal()"
                  class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            New Contract
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Search</label>
              <input type="text" [(ngModel)]="searchTerm" placeholder="Search contracts..."
                     class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-violet-500/10">
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subcontractor</label>
              <select [(ngModel)]="filterSubcontractor" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                <option value="">All Subcontractors</option>
                @for (sub of subcontractors; track sub.id) {
                  <option [value]="sub.id">{{ sub.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status</label>
              <select [(ngModel)]="filterStatus" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Type</label>
              <select [(ngModel)]="filterType" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                <option value="">All Types</option>
                <option value="Fixed Price">Fixed Price</option>
                <option value="Cost Plus">Cost Plus</option>
                <option value="Unit Price">Unit Price</option>
                <option value="Time and Materials">Time and Materials</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Contracts List -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
          @if (isLoading) {
            <div class="flex items-center justify-center py-20">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
            </div>
          } @else if (filteredContracts.length === 0) {
            <div class="text-center py-20">
              <svg class="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p class="text-sm text-slate-500 dark:text-slate-400">No contracts found</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-slate-100 dark:border-white/5">
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Contract #</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Title</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Subcontractor</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Project</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Type</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Amount</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Completion</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (contract of filteredContracts; track contract.id) {
                    <tr class="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-slate-900 dark:text-white">{{ contract.contractNumber }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-bold text-slate-900 dark:text-white">{{ contract.title }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">{{ contract.subcontractorName || '-' }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">{{ contract.projectName || '-' }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-slate-600 dark:text-slate-400">{{ contract.contractType }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm font-black text-slate-900 dark:text-white">{{ formatCurrency(contract.contractAmount) }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                          <div class="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div class="h-full bg-violet-500 rounded-full transition-all" [style.width.%]="contract.completionPercentage || 0"></div>
                          </div>
                          <span class="text-xs font-black text-slate-600 dark:text-slate-400">{{ contract.completionPercentage || 0 }}%</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider"
                              [class.bg-emerald-500/10]="contract.status === 'Active'"
                              [class.text-emerald-500]="contract.status === 'Active'"
                              [class.bg-amber-500/10]="contract.status === 'Pending'"
                              [class.text-amber-500]="contract.status === 'Pending'"
                              [class.bg-blue-500/10]="contract.status === 'Completed'"
                              [class.text-blue-500]="contract.status === 'Completed'"
                              [class.bg-slate-500/10]="contract.status === 'Cancelled'"
                              [class.text-slate-500]="contract.status === 'Cancelled'">
                          {{ contract.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex gap-2">
                          <button (click)="viewContract(contract)" class="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                            View
                          </button>
                          <button (click)="editContract(contract)" class="px-3 py-2 rounded-lg bg-violet-500 text-white text-xs font-black uppercase tracking-widest hover:bg-violet-600 transition-colors">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- Create/Edit Modal -->
        @if (showModal) {
          <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div class="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
              <button (click)="closeModal()" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-2xl">&times;</button>

              <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">
                {{ editingContract ? 'Edit Contract' : 'New Contract' }}
              </h2>

              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contract Number *</label>
                    <input type="text" [(ngModel)]="contractForm.contractNumber" placeholder="e.g., SC-2024-001"
                           class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-violet-500/10">
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Title *</label>
                    <input type="text" [(ngModel)]="contractForm.title" placeholder="Contract title"
                           class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-violet-500/10">
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subcontractor *</label>
                    <select [(ngModel)]="contractForm.subcontractorId" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                      <option value="">Select Subcontractor</option>
                      @for (sub of subcontractors; track sub.id) {
                        <option [value]="sub.id">{{ sub.name }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contract Type *</label>
                    <select [(ngModel)]="contractForm.contractType" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                      <option value="">Select Type</option>
                      <option value="Fixed Price">Fixed Price</option>
                      <option value="Cost Plus">Cost Plus</option>
                      <option value="Unit Price">Unit Price</option>
                      <option value="Time and Materials">Time and Materials</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                  <textarea [(ngModel)]="contractForm.description" rows="3" placeholder="Contract description..."
                            class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none resize-none"></textarea>
                </div>

                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Scope of Work *</label>
                  <textarea [(ngModel)]="contractForm.scopeOfWork" rows="4" placeholder="Detailed scope of work..."
                            class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none resize-none"></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contract Amount *</label>
                    <input type="number" [(ngModel)]="contractForm.contractAmount" placeholder="0.00" step="0.01"
                           class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-violet-500/10">
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Retention Amount</label>
                    <input type="number" [(ngModel)]="contractForm.retentionAmount" placeholder="0.00" step="0.01"
                           class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-violet-500/10">
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{{ 'subcontractors.start_date_required' | translate }}</label>
                    <input type="date" [(ngModel)]="contractForm.startDate"
                           class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-violet-500/10">
                  </div>
                </div>

                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{{ 'subcontractors.planned_end_date' | translate }}</label>
                  <input type="date" [(ngModel)]="contractForm.plannedEndDate"
                         class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-violet-500/10">
                </div>
              </div>

              <div class="flex gap-4 mt-8">
                <button (click)="closeModal()" class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest">
                  Cancel
                </button>
                <button (click)="saveContract()" class="flex-1 py-4 rounded-2xl bg-violet-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-violet-500/20">
                  {{ editingContract ? 'Update' : 'Create' }} Contract
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SubcontractorContractsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);

  activeTab: 'active' | 'all' = 'active';
  searchTerm = '';
  filterSubcontractor = '';
  filterStatus = '';
  filterType = '';

  contracts: SubcontractorContract[] = [];
  subcontractors: any[] = [];
  isLoading = false;

  showModal = false;
  editingContract: SubcontractorContract | null = null;
  contractForm: Partial<CreateContractRequest> = {};

  constructor(private subcontractorService: SubcontractorService) {
    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
      });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading = true;
    this.subcontractorService.getSubcontractors().subscribe({
      next: (data) => {
        this.subcontractors = data;
      },
      error: (error) => {
        console.error('Error loading subcontractors:', error);
      }
    });

    this.loadContracts();
  }

  loadContracts(): void {
    this.isLoading = true;
    const observable = this.activeTab === 'active'
      ? this.subcontractorService.getActiveContracts()
      : this.subcontractorService.getAllContracts();

    observable.subscribe({
      next: (data) => {
        this.contracts = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contracts:', error);
        this.isLoading = false;
      }
    });
  }

  get filteredContracts(): SubcontractorContract[] {
    return this.contracts.filter(contract => {
      const matchesSearch = !this.searchTerm ||
        contract.contractNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        contract.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesSubcontractor = !this.filterSubcontractor || contract.subcontractorId === Number(this.filterSubcontractor);
      const matchesStatus = !this.filterStatus || contract.status === this.filterStatus;
      const matchesType = !this.filterType || contract.contractType === this.filterType;
      return matchesSearch && matchesSubcontractor && matchesStatus && matchesType;
    });
  }

  openCreateModal(): void {
    this.editingContract = null;
    this.contractForm = {
      contractNumber: '',
      title: '',
      subcontractorId: undefined,
      contractType: '',
      description: '',
      scopeOfWork: '',
      contractAmount: 0,
      retentionAmount: 0,
      startDate: new Date(),
      plannedEndDate: undefined
    };
    this.showModal = true;
  }

  editContract(contract: SubcontractorContract): void {
    this.editingContract = contract;
    this.contractForm = {
      contractNumber: contract.contractNumber,
      title: contract.title,
      subcontractorId: contract.subcontractorId,
      contractType: contract.contractType,
      description: contract.description,
      scopeOfWork: contract.scopeOfWork,
      contractAmount: contract.contractAmount,
      retentionAmount: contract.retentionAmount,
      startDate: contract.startDate,
      plannedEndDate: contract.plannedEndDate
    };
    this.showModal = true;
  }

  viewContract(contract: SubcontractorContract): void {
    console.log('View contract:', contract);
  }

  closeModal(): void {
    this.showModal = false;
    this.editingContract = null;
    this.contractForm = {};
  }

  saveContract(): void {
    if (this.editingContract) {
      const updateRequest: UpdateContractRequest = {
        title: this.contractForm.title,
        description: this.contractForm.description,
        scopeOfWork: this.contractForm.scopeOfWork,
        contractAmount: this.contractForm.contractAmount,
        retentionAmount: this.contractForm.retentionAmount,
        plannedEndDate: this.contractForm.plannedEndDate
      };
      this.subcontractorService.updateContract(this.editingContract.id, updateRequest).subscribe({
        next: (updated) => {
          const index = this.contracts.findIndex(c => c.id === updated.id);
          if (index !== -1) {
            this.contracts[index] = updated;
          }
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating contract:', error);
        }
      });
    } else {
      this.subcontractorService.createContract(this.contractForm as CreateContractRequest).subscribe({
        next: (created) => {
          this.contracts.unshift(created);
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating contract:', error);
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
