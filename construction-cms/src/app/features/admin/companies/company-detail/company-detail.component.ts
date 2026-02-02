import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompaniesService } from '../../../../core/services/companies.service';
import { Company, Package } from '../../../../shared/interfaces';
import { PackagesService } from '../../../../core/services/packages.service';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10">
      <div class="max-w-7xl mx-auto">
        <!-- Breadcrumbs & Actions -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <a routerLink="/admin/companies" class="hover:text-indigo-600 transition-colors">Organizations</a>
              <span>/</span>
              <span class="text-indigo-600">{{ company?.name }}</span>
            </div>
            <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
              <span class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">{{ company?.name?.charAt(0) }}</span>
              {{ company?.name }}
            </h1>
          </div>
          <div class="flex items-center gap-3">
             <button routerLink="/admin/companies" class="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
               Back to Grid
             </button>
             <button class="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
               Primary Action
             </button>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="flex bg-white dark:bg-slate-900 rounded-[2rem] p-2 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8 overflow-x-auto custom-scrollbar">
          <button *ngFor="let tab of tabs" 
                  (click)="activeTab = tab.id"
                  [class.bg-slate-900]="activeTab === tab.id"
                  [class.text-white]="activeTab === tab.id"
                  [class.dark:bg-white]="activeTab === tab.id"
                  [class.dark:text-slate-900]="activeTab === tab.id"
                  class="flex-1 px-8 py-4 rounded-[1.5rem] text-[11px] font-[900] uppercase tracking-[0.2em] transition-all whitespace-nowrap"
                  [ngClass]="activeTab === tab.id ? '' : 'text-slate-500 hover:text-indigo-600'">
            {{ tab.label }}
          </button>
        </div>

        <!-- Main Content Area -->
        <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none min-h-[600px]">
          
          <!-- TAB 1: IDENTITY & CONFIG -->
          <div *ngIf="activeTab === 'identity'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form [formGroup]="companyForm" class="space-y-12">
                <section>
                  <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    Identity & Association
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div class="space-y-3">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Trade Name</label>
                      <input formControlName="name" placeholder="e.g., Al-Massa Construction" 
                             class="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none transition-all font-bold text-lg text-slate-900 dark:text-white">
                    </div>
                    <div class="space-y-3">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subscription Package</label>
                      <select formControlName="packageId" 
                              class="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none transition-all font-bold text-lg appearance-none text-slate-900 dark:text-white">
                        <option *ngFor="let pkg of packages" [value]="pkg.id" class="text-slate-900 dark:text-white dark:bg-slate-900">{{ pkg.name }}</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section class="pt-8">
                  <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8">Allowed Calculation Methods</h3>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div (click)="toggleFormControl('allowMeasured')" [class.border-amber-500]="companyForm.get('allowMeasured')?.value" [class.bg-amber-50/30]="companyForm.get('allowMeasured')?.value" class="p-8 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] cursor-pointer transition-all flex flex-col items-center">
                      <span class="text-4xl mb-4">📏</span><span class="font-black text-sm uppercase tracking-tighter">Measured Method</span>
                      <p class="text-[10px] text-slate-400 mt-2 font-black uppercase">Quantity Based</p>
                    </div>
                    <div (click)="toggleFormControl('allowSupervision')" [class.border-purple-500]="companyForm.get('allowSupervision')?.value" [class.bg-purple-50/30]="companyForm.get('allowSupervision')?.value" class="p-8 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] cursor-pointer transition-all flex flex-col items-center">
                      <span class="text-4xl mb-4">👁️</span><span class="font-black text-sm uppercase tracking-tighter">Supervision</span>
                      <p class="text-[10px] text-slate-400 mt-2 font-black uppercase">Percentage Based</p>
                    </div>
                    <div (click)="toggleFormControl('allowPackages')" [class.border-orange-500]="companyForm.get('allowPackages')?.value" [class.bg-orange-50/30]="companyForm.get('allowPackages')?.value" class="p-8 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] cursor-pointer transition-all flex flex-col items-center">
                      <span class="text-4xl mb-4">📦</span><span class="font-black text-sm uppercase tracking-tighter">Fixed Package</span>
                      <p class="text-[10px] text-slate-400 mt-2 font-black uppercase">Lump Sum Contract</p>
                    </div>
                  </div>
                </section>

                <section class="pt-8">
                  <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8">Feature Entitlements</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div *ngFor="let feat of featureToggles" (click)="toggleFormControl(feat.ctrl)" class="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 transition-all">
                      <div class="flex items-center gap-5">
                        <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-md text-2xl border border-slate-100">{{ feat.icon }}</div>
                        <div>
                          <h4 class="font-black text-slate-800 dark:text-slate-200 text-sm italic">{{ feat.label }}</h4>
                          <p class="text-[10px] text-slate-500 font-medium tracking-tight">{{ feat.desc }}</p>
                        </div>
                      </div>
                      <div class="w-14 h-7 rounded-full transition-all relative" [ngClass]="companyForm.get(feat.ctrl)?.value ? 'bg-indigo-600' : 'bg-slate-300'">
                        <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm" [class.translate-x-7]="companyForm.get(feat.ctrl)?.value"></div>
                      </div>
                    </div>
                  </div>
                </section>

                <div class="pt-10 border-t border-slate-50 flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" formControlName="isActive" class="sr-only peer">
                      <div class="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span class="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">Company Active Status</span>
                  </div>
                  <button (click)="saveChanges()" class="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Sync Configurations</button>
                </div>
              </form>
          </div>

          <!-- TAB 2: BILLING & SUBS -->
          <div *ngIf="activeTab === 'billing'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
               <div class="lg:col-span-2 bg-gradient-to-br from-indigo-700 to-blue-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30">
                 <div class="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <p class="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-200 mb-2">Platform Subscription MRR</p>
                      <h3 class="text-6xl font-black tracking-tighter mb-8">$5,240<span class="text-lg font-medium text-indigo-300">.00</span></h3>
                    </div>
                    <div class="flex flex-wrap gap-4 mt-auto">
                      <div class="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                        <p class="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">Billing Interval</p>
                        <p class="font-bold">Monthly Recurring</p>
                      </div>
                      <div class="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                        <p class="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">Next Renewal</p>
                        <p class="font-bold">March 15, 2024</p>
                      </div>
                      <div class="px-6 py-4 bg-emerald-500 rounded-2xl shadow-lg">
                        <p class="text-[9px] font-black text-white/80 uppercase tracking-widest mb-1">Payment Status</p>
                        <p class="font-black">✓ Good Standing</p>
                      </div>
                    </div>
                 </div>
                 <div class="absolute -right-20 -top-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                 <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
               </div>

               <div class="bg-slate-50 dark:bg-white/5 rounded-[3rem] p-10 border border-slate-100 flex flex-col justify-center items-center text-center">
                 <div class="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-3xl mb-6">💳</div>
                 <h4 class="font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Payout Method</h4>
                 <p class="text-xs text-slate-500 mb-6 font-medium">VISA ending in •••• 4422</p>
                 <button class="w-full py-4 rounded-2xl border border-indigo-200 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">Update Card Details</button>
               </div>
             </div>

             <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 px-4 flex items-center gap-3">
               <span class="w-2 h-2 rounded-full bg-slate-300"></span>
               Invoicing History
             </h3>
             <div class="rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-hidden">
                <table class="w-full text-left">
                  <tr class="bg-slate-50/50 dark:bg-white/5">
                    <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Billing Date</th>
                    <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Ref</th>
                    <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount Paid</th>
                    <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Collection Status</th>
                    <th class="px-8 py-6"></th>
                  </tr>
                  <tr *ngFor="let bill of mockBills" class="border-t border-slate-50 dark:border-white/5 hover:bg-slate-50/30 transition-all group">
                    <td class="px-8 py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{{ bill.date }}</td>
                    <td class="px-8 py-6 text-sm font-black text-slate-800 dark:text-slate-200">{{ bill.desc }}</td>
                    <td class="px-8 py-6 text-sm font-black text-indigo-600">{{ bill.amount | currency }}</td>
                    <td class="px-8 py-6">
                      <span class="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">Settled</span>
                    </td>
                    <td class="px-8 py-6 text-right">
                      <button class="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 justify-end">
                        View Invoice <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </button>
                    </td>
                  </tr>
                </table>
             </div>
          </div>

          <!-- TAB 3: USERS & ACCESS -->
          <div *ngIf="activeTab === 'users'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex justify-between items-center mb-10 px-4">
                <div>
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Accountability Directory
                  </h3>
                  <p class="text-xs text-slate-500 mt-1 font-medium">{{ mockUsers.length }} active user identities across this organization</p>
                </div>
                <button (click)="showOnboardModal = true" class="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all">Onboard Personnel</button>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div *ngFor="let user of mockUsers" class="p-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] relative group hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl transition-all h-fit">
                  <div class="flex items-center gap-5 mb-8">
                    <div class="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/20 group-hover:bg-slate-900 group-hover:dark:bg-white group-hover:dark:text-indigo-600 transition-colors">{{ user.name.charAt(0) }}</div>
                    <div>
                      <h4 class="text-xl font-black text-slate-900 dark:text-white leading-tight italic">{{ user.name }}</h4>
                      <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{{ user.email }}</p>
                    </div>
                  </div>
                  
                  <div class="space-y-6">
                    <div>
                      <label class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Organizational Scope</label>
                      <div class="relative">
                        <select [(ngModel)]="user.role" class="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest outline-none shadow-sm appearance-none cursor-pointer focus:border-indigo-500 text-slate-900 dark:text-white">
                          <option *ngFor="let r of mockRoles" [value]="r.name">{{ r.name }}</option>
                        </select>
                        <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">⌄</div>
                      </div>
                      <div *ngIf="user.reportsToId" class="mt-3 flex items-center gap-2 px-1">
                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-tighter italic">Reports to:</span>
                        <span class="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{{ getUserName(user.reportsToId) }}</span>
                      </div>
                    </div>
                    
                     <div class="flex items-center justify-between pt-4 border-t border-slate-100/50">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Login: {{ user.lastLogin }}</span>
                        <div class="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <button (click)="impersonateUser(user)" class="text-indigo-600 font-black text-[9px] uppercase tracking-widest border-b-2 border-transparent hover:border-indigo-600 transition-all flex items-center gap-1">
                             <span class="text-xs">👤</span> Impersonate
                           </button>
                           <button (click)="terminateSession(user)" class="text-rose-500 font-black text-[9px] uppercase tracking-widest border-b-2 border-transparent hover:border-rose-500 transition-all">
                             Terminate
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
             </div>

             <!-- Onboard Personnel Modal -->
             <div *ngIf="showOnboardModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-xl p-10 transform animate-in zoom-in-95 duration-500 relative border border-white/10">
                   <button (click)="showOnboardModal = false" class="absolute top-8 right-8 text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
                   
                   <h3 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">Onboard Personnel</h3>
                   <p class="text-slate-500 font-medium text-xs mb-10">Assign a new digital identity to this organization's workforce.</p>

                   <form [formGroup]="onboardForm" (ngSubmit)="onboardPersonnel()" class="space-y-6">
                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input formControlName="name" placeholder="John Doe" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white">
                      </div>
                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email</label>
                        <input formControlName="email" type="email" placeholder="john@company.com" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white">
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Duty Role</label>
                          <select formControlName="role" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold appearance-none text-slate-900 dark:text-white">
                             <option *ngFor="let r of mockRoles" [value]="r.name">{{ r.name }}</option>
                          </select>
                        </div>
                        <div class="space-y-2">
                          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Directly Reports To</label>
                          <select formControlName="reportsToId" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold appearance-none text-slate-900 dark:text-white">
                             <option [ngValue]="null">Top Level / None</option>
                             <option *ngFor="let u of mockUsers" [value]="u.id">{{ u.name }}</option>
                          </select>
                        </div>
                      </div>

                      <div class="pt-6 flex gap-4">
                         <button type="button" (click)="showOnboardModal = false" class="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">Abort</button>
                         <button type="submit" [disabled]="onboardForm.invalid" class="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40">Finalize Onboarding</button>
                      </div>
                   </form>
                </div>
             </div>
          </div>

          <!-- TAB 4: PRIVILEGE STRUCTURE -->
          <div *ngIf="activeTab === 'roles'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex flex-col lg:flex-row gap-10">
                <!-- Sidebar: Roles -->
                <div class="w-full lg:w-1/3">
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-4">Available Archetypes</h3>
                  <div class="space-y-3">
                    <div *ngFor="let role of mockRoles" 
                         (click)="selectedRole = role"
                         [class.bg-indigo-600]="selectedRole?.id === role.id"
                         [class.border-indigo-600]="selectedRole?.id === role.id"
                         [class.text-white]="selectedRole?.id === role.id"
                         [class.shadow-2xl]="selectedRole?.id === role.id"
                         [class.shadow-indigo-500/30]="selectedRole?.id === role.id"
                         class="p-6 border border-slate-100 rounded-[2rem] cursor-pointer transition-all hover:scale-[1.02] flex justify-between items-center group">
                      <div>
                        <p class="font-black text-sm uppercase mb-1" [class.text-indigo-600]="selectedRole?.id !== role.id">{{ role.name }}</p>
                        <p class="text-[10px] font-medium opacity-60 italic">{{ role.desc }}</p>
                      </div>
                       <div class="flex items-center gap-3">
                         <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                           <button (click)="$event.stopPropagation(); openEditRole(role)" class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all">✎</button>
                           <button (click)="$event.stopPropagation(); deleteRole(role.id)" class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">×</button>
                         </div>
                         <span *ngIf="selectedRole?.id === role.id" class="text-xl">&rarr;</span>
                       </div>
                    </div>
                    <button (click)="showRoleModal = true" class="w-full py-6 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all">+ Define Custom Archetype</button>
                  </div>
                </div>

                <!-- Add Role Modal -->
                <div *ngIf="showRoleModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
                   <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-xl p-10 transform animate-in zoom-in-95 duration-500 relative border border-white/10">
                      <button (click)="showRoleModal = false" class="absolute top-8 right-8 text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
                      
                      <h3 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">New Archetype</h3>
                      <p class="text-slate-500 dark:text-slate-400 font-medium text-xs mb-10">Define a new identity model with specific platform duties.</p>

                      <form [formGroup]="roleAddForm" (ngSubmit)="addRole()" class="space-y-6">
                         <div class="space-y-2">
                           <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Archetype Name</label>
                           <input formControlName="name" placeholder="e.g., Regional Manager" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white">
                         </div>
                         <div class="space-y-2">
                           <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Description</label>
                           <textarea formControlName="desc" placeholder="Briefly describe the responsibilities..." rows="3" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white resize-none"></textarea>
                         </div>

                         <div class="pt-6 flex gap-4">
                            <button type="button" (click)="showRoleModal = false" class="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] border border-slate-200 dark:border-white/5 rounded-2xl hover:bg-slate-50 transition-all">Abort</button>
                            <button type="submit" [disabled]="roleAddForm.invalid" class="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all disabled:opacity-40">Initialize Archetype</button>
                         </div>
                      </form>
                   </div>
                </div>

                <!-- Main Content: Privilege Matrix -->
                <div class="flex-1 bg-slate-50 dark:bg-white/5 rounded-[3.5rem] p-10 border border-slate-100">
                  <div *ngIf="selectedRole" class="animate-in fade-in slide-in-from-right-4 duration-500">
                     <div class="flex justify-between items-center mb-10">
                        <div>
                          <h4 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{{ selectedRole.name }} Scope</h4>
                          <p class="text-xs text-slate-500 mt-2 font-medium">Fine-tune the security boundaries for this identity archetypes</p>
                        </div>
                        <div class="flex gap-4">
                          <button class="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-rose-500 hover:scale-110 transition-all border border-slate-100 italic font-black">DEL</button>
                        </div>
                     </div>

                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div *ngFor="let perm of mockPermissions" 
                             (click)="toggleRolePermission(perm.name)"
                             class="p-5 bg-white dark:bg-slate-900 border rounded-2xl flex items-center justify-between cursor-pointer group hover:border-indigo-300 transition-all"
                             [class.border-indigo-200]="selectedRole.perms.includes(perm.name)"
                             [class.bg-indigo-50/20]="selectedRole.perms.includes(perm.name)">
                          <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl shadow-inner">{{ getPermIcon(perm.name) }}</div>
                            <div>
                              <p class="text-[11px] font-black text-slate-800 dark:text-slate-200 tracking-tight mb-0.5">{{ perm.name }}</p>
                              <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{{ perm.desc }}</p>
                            </div>
                          </div>
                          <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                               [class.bg-indigo-600]="selectedRole.perms.includes(perm.name)"
                               [class.border-indigo-600]="selectedRole.perms.includes(perm.name)"
                               [class.border-slate-200]="!selectedRole.perms.includes(perm.name)">
                             <span *ngIf="selectedRole.perms.includes(perm.name)" class="text-white text-[10px]">✓</span>
                          </div>
                        </div>
                     </div>
                  </div>
                  <div *ngIf="!selectedRole" class="h-full flex flex-col items-center justify-center text-center opacity-40 italic">
                     <span class="text-8xl mb-6">🛡️</span>
                     <p class="font-black text-slate-400 uppercase tracking-widest">Select an archetype to modify its matrix</p>
                  </div>
                </div>
             </div>
          </div>

          <!-- TAB 5: PLATFORM CAPABILITIES -->
          <div *ngIf="activeTab === 'perms'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex justify-between items-center mb-10 px-4">
                <div>
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                    Permission Architecture
                  </h3>
                  <p class="text-xs text-slate-500 mt-1 font-medium">Global capability definitions for the platform engine</p>
                </div>
                <button (click)="showPermModal = true" class="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Define Capability</button>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <div *ngFor="let perm of mockPermissions" class="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:scale-105 transition-all relative overflow-hidden group border-b-8 border-b-indigo-500">
                  <button (click)="deletePerm(perm.name)" class="absolute top-6 right-6 w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                    <span class="text-xl">&times;</span>
                  </button>
                  
                  <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl mb-6 shadow-inner">{{ getPermIcon(perm.name) }}</div>
                  <h4 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3 italic">{{ perm.name }}</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{{ perm.desc }}</p>
                  
                  <div class="mt-8 pt-8 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                     <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Platform Core</span>
                     <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div class="absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-10 transition-opacity text-6xl">🛡️</div>
               </div>
             </div>

             <!-- Add Permission Modal -->
             <div *ngIf="showPermModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
                <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-xl p-10 transform animate-in zoom-in-95 duration-500 relative border border-white/10">
                   <button (click)="showPermModal = false" class="absolute top-8 right-8 text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
                   
                   <h3 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">New Capability</h3>
                   <p class="text-slate-500 dark:text-slate-400 font-medium text-xs mb-10">Define a new functional boundary for the system architecture.</p>

                   <form [formGroup]="permForm" (ngSubmit)="addPermission()" class="space-y-6">
                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Key (e.g., Asset.Audit)</label>
                        <input formControlName="name" placeholder="Entity.Action" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white">
                      </div>
                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Functional Description</label>
                        <textarea formControlName="desc" placeholder="Explain what this capability allows..." rows="3" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white resize-none"></textarea>
                      </div>

                      <div class="pt-6 flex gap-4">
                         <button type="button" (click)="showPermModal = false" class="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] border border-slate-200 dark:border-white/5 rounded-2xl hover:bg-slate-50 transition-all">Abort</button>
                         <button type="submit" [disabled]="permForm.invalid" class="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all disabled:opacity-40">Register Engine Capability</button>
                      </div>
                   </form>
                </div>
             </div>
          </div>

          <!-- TAB 6: OPERATIONAL PROJECTS -->
          <div *ngIf="activeTab === 'projects'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex justify-between items-center mb-10 px-4">
                <div>
                  <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                    Portfolio Breakdown
                  </h3>
                  <p class="text-xs text-slate-500 mt-1 font-medium">{{ mockProjects.length }} active ventures under this organization</p>
                </div>
                <button (click)="showProjectModal = true" class="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all">Launch New Project</button>
             </div>

             <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div *ngFor="let proj of mockProjects" class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3rem] p-8 hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div class="flex justify-between items-start mb-8">
                    <div class="flex items-center gap-5">
                      <div class="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">🏙️</div>
                      <div>
                        <h4 class="text-2xl font-black text-slate-900 dark:text-white leading-tight italic">{{ proj.name }}</h4>
                        <span class="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-800">In Progress</span>
                      </div>
                    </div>
                    <div class="text-right">
                       <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contract Value</p>
                       <p class="text-2xl font-black text-indigo-600 tracking-tighter">{{ proj.money | currency:'USD':'symbol':'1.0-0' }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-4 pt-8 border-t border-slate-50 dark:border-white/5">
                    <div class="p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl text-center hover:bg-indigo-50 transition-colors">
                       <p class="text-2xl mb-1">📸</p>
                       <p class="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight">{{ proj.photos }}</p>
                       <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Media Assets</p>
                    </div>
                    <div class="p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl text-center hover:bg-amber-50 transition-colors">
                       <p class="text-2xl mb-1">👷</p>
                       <p class="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight">{{ proj.workers }}</p>
                       <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Force</p>
                    </div>
                    <div class="p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl text-center hover:bg-emerald-50 transition-colors">
                       <p class="text-2xl mb-1">📊</p>
                       <p class="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight">{{ proj.status }}%</p>
                       <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Progression</p>
                    </div>
                  </div>

                  <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>
               </div>
             </div>

             <!-- Launch Project Modal -->
             <div *ngIf="showProjectModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
                <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-xl p-10 transform animate-in zoom-in-95 duration-500 relative border border-white/10">
                   <button (click)="showProjectModal = false" class="absolute top-8 right-8 text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
                   
                   <h3 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">Launch Venture</h3>
                   <p class="text-slate-500 dark:text-slate-400 font-medium text-xs mb-10">Initialize a new project portfolio entry for this organization.</p>

                   <form [formGroup]="projectForm" (ngSubmit)="launchProject()" class="space-y-6">
                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Name</label>
                        <input formControlName="name" placeholder="e.g., Al-Massa Tower" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white">
                      </div>
                      
                      <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contract Value (USD)</label>
                        <div class="relative">
                          <span class="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                          <input type="number" formControlName="money" placeholder="0.00" class="w-full p-5 pl-10 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-indigo-600">
                        </div>
                      </div>

                      <div class="pt-6 flex gap-4">
                         <button type="button" (click)="showProjectModal = false" class="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] border border-slate-200 dark:border-white/5 rounded-2xl hover:bg-slate-50 transition-all">Abort</button>
                         <button type="submit" [disabled]="projectForm.invalid" class="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all disabled:opacity-40">Initialize Portfolio Asset</button>
                      </div>
                   </form>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class CompanyDetailComponent implements OnInit {
  company: Company | null = null;
  packages: Package[] = [];
  companyForm: FormGroup;
  activeTab = 'identity';
  selectedRole: any = null;
  showOnboardModal = false;
  onboardForm: FormGroup;
  showPermModal = false;
  permForm: FormGroup;
  showRoleModal = false;
  roleAddForm: FormGroup;
  editingRole: any = null;
  showProjectModal = false;
  projectForm: FormGroup;

  tabs = [
    { id: 'identity', label: 'Identity & Config' },
    { id: 'billing', label: 'Billing & Subs' },
    { id: 'projects', label: 'Projects' },
    { id: 'users', label: 'Users & Access' },
    { id: 'roles', label: 'Privilege Structure' },
    { id: 'perms', label: 'Platform Capabilities' }
  ];

  featureToggles = [
    { ctrl: 'enableDelayNotification', icon: '🔔', label: 'Delay Notifications', desc: 'Auto-alerts for project and task deadlines' },
    { ctrl: 'requirePhotoReview', icon: '📸', label: 'Mandatory Photo Review', desc: 'Professional approval flow for all site media' },
    { ctrl: 'clientCanSeeFinancials', icon: '💰', label: 'Client Financial Portal', desc: 'Allow clients transparency over project budgets' }
  ];

  mockBills = [
    { date: 'Feb 01, 2024', desc: 'Enterprise Subscription Monthly', amount: 5240, status: 'Paid' },
    { date: 'Jan 01, 2024', desc: 'Enterprise Subscription Monthly', amount: 5240, status: 'Paid' },
    { date: 'Dec 01, 2023', desc: 'Setup & Onboarding Fee', amount: 12000, status: 'Paid' }
  ];

  mockUsers = [
    { id: 1, name: 'Ahmed Ali', email: 'ahmed@company.com', role: 'CompanyAdmin', lastLogin: '2 hours ago', reportsToId: null as number | null },
    { id: 2, name: 'Maria Hassan', email: 'maria@company.com', role: 'CompanyUser', lastLogin: 'Yesterday', reportsToId: 1 },
    { id: 3, name: 'Omar Khalil', email: 'omar@company.com', role: 'SiteManager', lastLogin: '3 days ago', reportsToId: 1 }
  ];

  mockRoles = [
    { id: 1, name: 'CompanyAdmin', desc: 'Full access to all company projects and settings', perms: ['Project.View', 'Project.Edit', 'User.Manage', 'Finance.Measured', 'Finance.Supervision'] },
    { id: 2, name: 'CompanyUser', desc: 'Access to assigned projects and daily logs', perms: ['Project.View', 'DailyLog.Create'] },
    { id: 3, name: 'SiteManager', desc: 'Management of site operations and worker logs', perms: ['Project.View', 'DailyLog.Manage', 'User.View'] }
  ];

  mockPermissions = [
    { name: 'Project.View', desc: 'Access to view project dashboard' },
    { name: 'Project.Edit', desc: 'Ability to edit project basic information' },
    { name: 'User.Manage', desc: 'Ability to create and manage company roles and users' },
    { name: 'Finance.Measured', desc: 'Access to measured BOQ items' },
    { name: 'Finance.Supervision', desc: 'Access to supervision BOQ items' },
    { name: 'DailyLog.Create', desc: 'Ability to submit daily field logs' },
    { name: 'DailyLog.Manage', desc: 'Ability to close and approve daily logs' }
  ];

  mockProjects = [
    { id: 101, name: 'Crystal Tower Residencies', money: 24500000, photos: 1240, workers: 86, status: 65 },
    { id: 102, name: 'East Side Industrial Park', money: 12800000, photos: 856, workers: 42, status: 30 },
    { id: 103, name: 'Metro Plaza Renovation', money: 4200000, photos: 320, workers: 18, status: 90 }
  ];

  constructor(
    private route: ActivatedRoute,
    private companiesService: CompaniesService,
    private packagesService: PackagesService,
    private fb: FormBuilder
  ) {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      packageId: [1, Validators.required],
      isActive: [true],
      enableDelayNotification: [true],
      requirePhotoReview: [true],
      clientCanSeeFinancials: [false],
      allowMeasured: [true],
      allowSupervision: [true],
      allowPackages: [false]
    });

    this.onboardForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['CompanyUser', Validators.required],
      reportsToId: [null]
    });

    this.permForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]*\.[A-Z][a-zA-Z]*$/)]],
      desc: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.roleAddForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      desc: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      money: [0, [Validators.required, Validators.min(1000)]]
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.companiesService.getCompanies().subscribe(companies => {
        this.company = companies.find(c => c.id === id) || null;
        if (this.company) {
          this.initForm(this.company);
        }
      });
    }

    this.packagesService.getAllPackages().subscribe(pkgs => this.packages = pkgs);
    if (this.mockRoles.length > 0) {
      this.selectedRole = this.mockRoles[0];
    }
  }

  initForm(company: Company) {
    this.companyForm.patchValue({
      name: company.name,
      packageId: company.packageId,
      isActive: company.isActive
    });

    if (company.settings) {
      this.companyForm.patchValue({
        enableDelayNotification: company.settings.enableDelayNotification,
        requirePhotoReview: company.settings.requirePhotoReview,
        clientCanSeeFinancials: company.settings.clientCanSeeFinancials,
        allowMeasured: company.settings.allowMeasured,
        allowSupervision: company.settings.allowSupervision,
        allowPackages: company.settings.allowPackages
      });
    }
  }

  toggleFormControl(name: string) {
    const control = this.companyForm.get(name);
    if (control) {
      control.setValue(!control.value);
    }
  }

  saveChanges() {
    if (this.companyForm.valid && this.company) {
      this.companiesService.updateCompany(this.company.id, this.companyForm.value).subscribe(() => {
        alert('Configurations synced successfully!');
      });
    }
  }

  getPermIcon(name: string): string {
    if (name.includes('Project')) return '🏗️';
    if (name.includes('User')) return '👥';
    if (name.includes('Finance')) return '💰';
    if (name.includes('Daily')) return '📝';
    return '🛡️';
  }

  toggleRolePermission(permName: string) {
    if (!this.selectedRole) return;
    const index = this.selectedRole.perms.indexOf(permName);
    if (index > -1) {
      this.selectedRole.perms.splice(index, 1);
    } else {
      this.selectedRole.perms.push(permName);
    }
  }

  addPermission() {
    if (this.permForm.valid) {
      if (this.mockPermissions.some(p => p.name === this.permForm.value.name)) {
        alert('This capability key already exists in the engine architecture.');
        return;
      }
      this.mockPermissions.push({ ...this.permForm.value });
      this.permForm.reset();
      this.showPermModal = false;
    }
  }

  deletePerm(permName: string) {
    if (confirm(`CRITICAL: Removing '${permName}' will revoke this capability from ALL roles and companies. This cannot be undone. Proceed?`)) {
      this.mockPermissions = this.mockPermissions.filter(p => p.name !== permName);
      // Clean up roles that had this permission
      this.mockRoles.forEach(role => {
        role.perms = role.perms.filter(p => p !== permName);
      });
    }
  }

  openEditRole(role: any) {
    this.editingRole = role;
    this.roleAddForm.patchValue({
      name: role.name,
      desc: role.desc
    });
    this.showRoleModal = true;
  }

  deleteRole(id: number) {
    if (confirm('CRITICAL: Removing this role will revoke access for all associated personnel in this organization. Proceed?')) {
      this.mockRoles = this.mockRoles.filter(r => r.id !== id);
      if (this.selectedRole?.id === id) {
        this.selectedRole = this.mockRoles.length > 0 ? this.mockRoles[0] : null;
      }
    }
  }

  addRole() {
    if (this.roleAddForm.valid) {
      if (this.editingRole) {
        this.editingRole.name = this.roleAddForm.value.name;
        this.editingRole.desc = this.roleAddForm.value.desc;
        this.editingRole = null;
      } else {
        const newRole = {
          id: Math.max(...this.mockRoles.map(r => r.id)) + 1,
          ...this.roleAddForm.value,
          perms: [] as string[]
        };
        this.mockRoles.push(newRole);
        this.selectedRole = newRole; // Automatically select the new role for permission mapping
      }
      this.roleAddForm.reset();
      this.showRoleModal = false;
    }
  }

  launchProject() {
    if (this.projectForm.valid) {
      const newProj = {
        id: Math.max(...this.mockProjects.map(p => p.id)) + 1,
        ...this.projectForm.value,
        photos: 0,
        workers: 0,
        status: 0
      };
      this.mockProjects.unshift(newProj);
      this.projectForm.reset({ money: 0 });
      this.showProjectModal = false;
      alert(`Venture '${newProj.name}' has been successfully launched in the operational portfolio.`);
    }
  }

  onboardPersonnel() {
    if (this.onboardForm.valid) {
      const newUser = {
        id: Math.max(...this.mockUsers.map(u => u.id)) + 1,
        ...this.onboardForm.value,
        lastLogin: 'Never'
      };
      this.mockUsers.push(newUser);
      this.onboardForm.reset({ role: 'CompanyUser', reportsToId: null });
      this.showOnboardModal = false;
    }
  }

  terminateSession(user: any) {
    if (confirm(`Are you sure you want to terminate the active session for ${user.name} ? They will be forced to log in again.`)) {
      user.lastLogin = 'Terminated';
      alert(`Session for ${user.name} has been revoked.`);
    }
  }

  impersonateUser(user: any) {
    const confirmMsg = `CRITICAL ACTION: You are about to impersonate ${user.name} (${user.role}).\n\nYou will view the platform exactly as they do including their data permissions and project access.Proceed ? `;
    if (confirm(confirmMsg)) {
      // In a real app, this would trigger a state change in AuthService or a cookie switch
      alert(`Switching session to ${user.name}... Redirecting to Dashboard.`);
      // Mock redirection
      window.location.href = '/dashboard?impersonating=' + user.id;
    }
  }

  getUserName(id: number): string {
    return this.mockUsers.find(u => u.id === id)?.name || 'Unknown Manager';
  }
}
