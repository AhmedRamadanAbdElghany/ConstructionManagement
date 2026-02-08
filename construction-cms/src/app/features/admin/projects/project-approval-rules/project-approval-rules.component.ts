import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectApprovalRulesService, ApprovalRuleDto, CreateApprovalRuleRequest } from '../../../../core/services/project-approval-rules.service';

@Component({
    selector: 'app-project-approval-rules',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Approval Rules</h1>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Configure approval workflows for your project</p>
          </div>
          <button (click)="openCreateModal()" 
                  class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
            + Add Rule
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Rules</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ approvalRules.length }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Rules</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ activeRulesCount }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inactive Rules</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ inactiveRulesCount }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-slate-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Approval Rules Table -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
          <div class="p-6 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-black text-slate-900 dark:text-white">Rules List</h2>
              <div class="flex items-center space-x-4">
                <select [(ngModel)]="filterRuleType" 
                        (change)="filterRules()"
                        class="px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                  <option value="">All Types</option>
                  <option value="Financial">Financial</option>
                  <option value="Document">Document</option>
                  <option value="Material">Material</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-white/5">
                  <th class="px-6 py-4 text-left">Rule</th>
                  <th class="px-6 py-4 text-left">Entity Type</th>
                  <th class="px-6 py-4 text-right">Threshold</th>
                  <th class="px-6 py-4 text-left">Approver</th>
                  <th class="px-6 py-4 text-center">Status</th>
                  <th class="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 dark:divide-white/[0.02]">
                @for (rule of filteredRules; track rule.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td class="px-6 py-4">
                      <div class="text-sm font-bold text-slate-900 dark:text-white">{{ rule.ruleTypeName }}</div>
                      <div class="text-[10px] text-slate-400 font-black uppercase mt-1">ID: {{ rule.id }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="'px-3 py-1 rounded-full text-[10px] font-black uppercase ' + getEntityTypeClass(rule.entityType)">
                        {{ rule.entityTypeName }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      @if (rule.thresholdAmount) {
                        <div class="text-sm font-black text-slate-900 dark:text-white">{{ rule.thresholdAmount | currency:'USD' }}</div>
                      } @else {
                        <div class="text-sm text-slate-400">-</div>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-slate-600 dark:text-slate-400">{{ rule.approverRoleName || 'Any' }}</div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span [class]="'px-3 py-1 rounded-full text-[10px] font-black uppercase ' + getStatusClass(rule)">
                        {{ rule.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center space-x-2">
                        <button (click)="toggleRuleStatus(rule)" 
                                [class]="'p-2 rounded-xl ' + (rule.isActive ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20') + ' transition-colors'"
                                [title]="rule.isActive ? 'Deactivate' : 'Activate'">
                          @if (rule.isActive) {
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                            </svg>
                          } @else {
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          }
                        </button>
                        <button (click)="deleteRule(rule.id)" 
                                class="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                title="Delete Rule">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
                @if (filteredRules.length === 0) {
                  <tr>
                    <td colspan="6" class="px-6 py-12 text-center">
                      <div class="flex flex-col items-center">
                        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                          </svg>
                        </div>
                        <div class="text-sm font-bold text-slate-400">No approval rules found</div>
                        <div class="text-xs text-slate-400 mt-1">Create your first rule to get started</div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Rule Modal -->
    @if (showCreateModal) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Create Approval Rule</h3>
          </div>
          <div class="p-8 space-y-6">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rule Type *</label>
              <select [(ngModel)]="createFormData.ruleType" 
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option value="">Select rule type</option>
                <option value="Financial">Financial</option>
                <option value="Document">Document</option>
                <option value="Material">Material</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Entity Type *</label>
              <select [(ngModel)]="createFormData.entityType" 
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                <option value="">Select entity type</option>
                <option value="Invoice">Invoice</option>
                <option value="CashVoucher">Cash Voucher</option>
                <option value="MaterialRequest">Material Request</option>
                <option value="EquipmentAssignment">Equipment Assignment</option>
                <option value="Document">Document</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Threshold Amount</label>
              <input type="number" [(ngModel)]="createFormData.thresholdAmount" 
                     class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                     placeholder="0.00">
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Approver Role</label>
              <input type="number" [(ngModel)]="createFormData.approverRoleId" 
                     class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                     placeholder="Enter role ID">
            </div>
          </div>
          <div class="p-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-4">
            <button (click)="closeCreateModal()" 
                    class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button (click)="createRule()" 
                    class="px-8 py-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all">
              Create Rule
            </button>
          </div>
        </div>
      </div>
    }
  `,
    styles: []
})
export class ProjectApprovalRulesComponent implements OnInit {
    approvalRules: ApprovalRuleDto[] = [];
    filteredRules: ApprovalRuleDto[] = [];
    filterRuleType: string = '';
    projectId: number = 1; // TODO: Get from route or service

    // Create Modal
    showCreateModal: boolean = false;
    createFormData: CreateApprovalRuleRequest = {
        ruleType: '',
        entityType: '',
        thresholdAmount: undefined,
        approverRoleId: undefined
    };

    constructor(private projectApprovalRulesService: ProjectApprovalRulesService) { }

    ngOnInit(): void {
        this.loadApprovalRules();
    }

    loadApprovalRules(): void {
        this.projectApprovalRulesService.getRules(this.projectId).subscribe({
            next: (rules) => {
                this.approvalRules = rules;
                this.filterRules();
            },
            error: (error) => {
                console.error('Error loading approval rules:', error);
            }
        });
    }

    filterRules(): void {
        if (!this.filterRuleType) {
            this.filteredRules = this.approvalRules;
        } else {
            this.filteredRules = this.approvalRules.filter(rule =>
                rule.ruleType === this.filterRuleType
            );
        }
    }

    get activeRulesCount(): number {
        return this.approvalRules.filter(rule => rule.isActive).length;
    }

    get inactiveRulesCount(): number {
        return this.approvalRules.filter(rule => !rule.isActive).length;
    }

    getEntityTypeClass(entityType: string): string {
        const classes: { [key: string]: string } = {
            'Invoice': 'bg-violet-500/10 text-violet-600',
            'CashVoucher': 'bg-emerald-500/10 text-emerald-600',
            'MaterialRequest': 'bg-cyan-500/10 text-cyan-600',
            'EquipmentAssignment': 'bg-amber-500/10 text-amber-600',
            'Document': 'bg-rose-500/10 text-rose-600'
        };
        return classes[entityType] || 'bg-slate-500/10 text-slate-600';
    }

    getStatusClass(rule: ApprovalRuleDto): string {
        if (rule.isActive) {
            return 'bg-emerald-500/10 text-emerald-600';
        }
        return 'bg-slate-500/10 text-slate-600';
    }

    // Create Modal Methods
    openCreateModal(): void {
        this.createFormData = {
            ruleType: '',
            entityType: '',
            thresholdAmount: undefined,
            approverRoleId: undefined
        };
        this.showCreateModal = true;
    }

    closeCreateModal(): void {
        this.showCreateModal = false;
    }

    createRule(): void {
        if (!this.createFormData.ruleType || !this.createFormData.entityType) {
            alert('Please fill in all required fields');
            return;
        }

        this.projectApprovalRulesService.createRule(this.projectId, this.createFormData).subscribe({
            next: () => {
                this.loadApprovalRules();
                this.closeCreateModal();
            },
            error: (error) => {
                console.error('Error creating approval rule:', error);
                alert('Failed to create approval rule');
            }
        });
    }

    toggleRuleStatus(rule: ApprovalRuleDto): void {
        // Note: Update method not implemented in ProjectApprovalRulesService yet
        alert('Toggle status functionality not yet implemented');
    }

    deleteRule(ruleId: number): void {
        if (confirm('Are you sure you want to delete this rule?')) {
            // Note: Delete method not implemented in ProjectApprovalRulesService yet
            alert('Delete functionality not yet implemented');
        }
    }
}
