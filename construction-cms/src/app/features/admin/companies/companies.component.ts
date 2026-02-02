import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompaniesService } from '../../../core/services/companies.service';
import { PackagesService } from '../../../core/services/packages.service';
import { Package, Company } from '../../../shared/interfaces';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="companies-container p-8 animate-in fade-in duration-700 h-full overflow-y-auto">
      <!-- Header Area -->
      <div class="header-section mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
        <div>
          <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Enterprise Companies</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage and onboard organizations within the STRUC platform</p>
        </div>
        <button (click)="openCreateModal()" 
                class="group bg-gradient-to-br from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white px-10 py-4 rounded-2xl transition-all duration-300 flex items-center gap-3 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-1 active:scale-95">
          <span class="text-2xl font-light group-hover:rotate-90 transition-transform duration-500">+</span>
          <span class="font-bold tracking-wide">Register Company</span>
        </button>
      </div>

      <!-- Companies Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        <div *ngFor="let company of companies" 
             class="company-card group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
          
          <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r" [ngClass]="company.isActive ? 'from-emerald-400 to-teal-500' : 'from-rose-400 to-orange-500'"></div>
          
          <div class="p-8">
            <div class="flex justify-between items-start mb-6">
              <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl font-black text-indigo-600 dark:text-indigo-400 shadow-inner group-hover:scale-110 transition-transform duration-500">
                {{ company.name.charAt(0) }}
              </div>
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button (click)="openEditModal(company)" class="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button (click)="deleteCompany(company.id)" class="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>

            <h3 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">{{ company.name }}</h3>
            <div class="flex items-center gap-3 mb-6">
              <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                    [ngClass]="company.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                {{ company.isActive ? 'Operational' : 'Suspended' }}
              </span>
              <span class="text-slate-400 text-xs font-bold uppercase tracking-tighter">Package: {{ getPackageName(company.packageId) }}</span>
            </div>

            <div class="space-y-4 pt-6 border-t border-slate-50 dark:border-slate-800">
               <div class="flex justify-between text-sm">
                <span class="text-slate-500 font-medium">Allowed Methods</span>
                <div class="flex gap-1.5">
                  <span *ngIf="company.settings?.allowMeasured" class="w-2 h-2 rounded-full bg-blue-500" title="Measured"></span>
                  <span *ngIf="company.settings?.allowSupervision" class="w-2 h-2 rounded-full bg-purple-500" title="Supervision"></span>
                  <span *ngIf="company.settings?.allowPackages" class="w-2 h-2 rounded-full bg-orange-500" title="Packages"></span>
                </div>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500 font-medium">Delay Notifications</span>
                <span class="font-bold" [ngClass]="company.settings?.enableDelayNotification ? 'text-emerald-500' : 'text-slate-300'">{{ company.settings?.enableDelayNotification ? 'Active' : 'Disabled' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500 font-medium">Photo Review Flow</span>
                <span class="font-bold text-slate-700 dark:text-slate-300">{{ company.settings?.requirePhotoReview ? 'Enabled' : 'Disabled' }}</span>
              </div>
            </div>
          </div>
          
          <div class="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 flex justify-end items-center border-t border-slate-50 dark:border-slate-800">
            <a [routerLink]="['/admin/companies', company.id]" class="text-indigo-600 dark:text-indigo-400 text-xs font-black hover:underline tracking-widest uppercase">View Company Details &rarr;</a>
          </div>
        </div>
      </div>

      <!-- Quick Edit Modal (Basic Identity & Features) -->
      <div *ngIf="showModal" class="modal-backdrop fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-300">
        <div class="modal-content bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform animate-in zoom-in-95 duration-500 border border-white/20">
          
          <!-- Modal Header -->
          <div class="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
            <div>
              <h2 class="text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{{ isEdit ? 'Quick Config' : 'New Onboarding' }}</h2>
              <p class="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage organization identity and core feature-set</p>
            </div>
            <button (click)="closeModal()" class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center shadow-lg border border-slate-100">
              <span class="text-3xl">&times;</span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body flex-1 overflow-y-auto p-10 overscroll-contain custom-scrollbar">
            <form [formGroup]="companyForm" class="space-y-12">
              <!-- Basic Info -->
              <section>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Company Trade Name</label>
                    <input formControlName="name" placeholder="e.g., Al-Massa Construction" 
                           class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white">
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subscription Package</label>
                    <select formControlName="packageId" 
                            class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white appearance-none cursor-pointer">
                      <option *ngFor="let pkg of packages" [value]="pkg.id" class="text-slate-900 dark:text-white dark:bg-slate-900">{{ pkg.name }}</option>
                    </select>
                  </div>
                </div>
              </section>

              <!-- Calculation Methods -->
              <section class="pt-6">
                 <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                   <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                   Allowed Calculation Methods
                 </h3>
                 <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div (click)="toggleFormControl('allowMeasured')" 
                         [ngClass]="companyForm.get('allowMeasured')?.value ? 'border-amber-500 bg-amber-50/40 text-amber-900 dark:text-amber-100' : 'border-slate-100 dark:border-slate-800 text-slate-400'"
                         class="p-8 border-2 rounded-[2.5rem] cursor-pointer transition-all flex flex-col items-center group/card hover:scale-[1.02]">
                        <span class="text-4xl mb-4 grayscale group-hover/card:grayscale-0 transition-all" [class.grayscale-0]="companyForm.get('allowMeasured')?.value">📏</span>
                        <span class="font-black text-xs uppercase tracking-widest">Measured</span>
                        <p class="text-[8px] font-bold uppercase mt-2 opacity-60">Accuracy Based</p>
                    </div>
                    <div (click)="toggleFormControl('allowSupervision')" 
                         [ngClass]="companyForm.get('allowSupervision')?.value ? 'border-purple-500 bg-purple-50/40 text-purple-900 dark:text-purple-100' : 'border-slate-100 dark:border-slate-800 text-slate-400'"
                         class="p-8 border-2 rounded-[2.5rem] cursor-pointer transition-all flex flex-col items-center group/card hover:scale-[1.02]">
                        <span class="text-4xl mb-4 grayscale group-hover/card:grayscale-0 transition-all" [class.grayscale-0]="companyForm.get('allowSupervision')?.value">👁️</span>
                        <span class="font-black text-xs uppercase tracking-widest">Supervision</span>
                        <p class="text-[8px] font-bold uppercase mt-2 opacity-60">Overhead Logic</p>
                    </div>
                    <div (click)="toggleFormControl('allowPackages')" 
                         [ngClass]="companyForm.get('allowPackages')?.value ? 'border-orange-500 bg-orange-50/40 text-orange-900 dark:text-orange-100' : 'border-slate-100 dark:border-slate-800 text-slate-400'"
                         class="p-6 border-2 rounded-[2.5rem] cursor-pointer transition-all flex flex-col items-center group/card hover:scale-[1.02]">
                        <span class="text-4xl mb-4 grayscale group-hover/card:grayscale-0 transition-all" [class.grayscale-0]="companyForm.get('allowPackages')?.value">📦</span>
                        <span class="font-black text-xs uppercase tracking-widest leading-none text-center">Fixed Package</span>
                        <p class="text-[8px] font-bold uppercase mt-2 opacity-60">Lump Sum Flow</p>
                    </div>
                 </div>
              </section>

              <div class="pt-10 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" formControlName="isActive" class="sr-only peer">
                      <div class="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">Organizational Operation Status</span>
                  </div>
                  <div *ngIf="isEdit" class="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    Live Configuration Sync
                  </div>
              </div>
            </form>
          </div>

          <!-- Modal Footer -->
          <div class="px-10 py-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex gap-4 shrink-0">
            <button (click)="closeModal()" class="flex-1 py-4 text-slate-500 font-black hover:bg-white dark:hover:bg-slate-700/50 rounded-2xl transition-all border border-slate-200 dark:border-white/5 uppercase tracking-widest text-[10px]">Abandon Changes</button>
            <button (click)="saveCompany()" [disabled]="companyForm.invalid"
                    class="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-500/20 transition-all uppercase tracking-widest text-[10px] disabled:opacity-40">
              {{ isEdit ? 'Commit Configuration' : 'Authorize & Onboard' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: #f8fafc; height: 100vh; width: 100%; }
    .company-card:hover { transform: translateY(-8px); border-color: #4f46e520; }
    
    /* Scrollbar behavior fixes */
    .modal-body::-webkit-scrollbar {
      width: 8px;
    }
    .modal-body::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.02);
      border-radius: 10px;
    }
    .modal-body::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .modal-body::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
      background-clip: content-box;
    }

    .custom-scrollbar-page::-webkit-scrollbar { width: 8px; }
    .custom-scrollbar-page::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  `]
})
export class CompaniesComponent implements OnInit {
  companies: Company[] = [];
  packages: Package[] = [];
  showModal = false;
  isEdit = false;
  selectedCompanyId: number | null = null;
  selectedCompany: Company | null = null;
  companyForm: FormGroup;

  constructor(
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
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.companiesService.getCompanies().subscribe((data: Company[]) => this.companies = data);
    this.packagesService.getAllPackages().subscribe((data: Package[]) => this.packages = data);
  }

  getPackageName(id?: number): string {
    return this.packages.find(p => p.id === id)?.name || 'Basic';
  }

  openCreateModal() {
    this.isEdit = false;
    this.selectedCompanyId = null;
    this.selectedCompany = null;
    this.companyForm.reset({
      name: '',
      packageId: 1,
      isActive: true,
      enableDelayNotification: true,
      requirePhotoReview: true,
      clientCanSeeFinancials: false,
      allowMeasured: true,
      allowSupervision: true,
      allowPackages: false
    });
    this.showModal = true;
  }

  openEditModal(company: Company) {
    this.isEdit = true;
    this.selectedCompanyId = company.id;
    this.selectedCompany = company;

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

    this.showModal = true;
  }

  saveCompany() {
    if (this.companyForm.valid) {
      const payload = { ...this.companyForm.value };
      payload.packageId = Number(payload.packageId);

      if (this.isEdit && this.selectedCompanyId) {
        this.companiesService.updateCompany(this.selectedCompanyId, payload).subscribe(() => {
          this.loadData();
          this.closeModal();
        });
      } else {
        this.companiesService.createCompany(payload).subscribe(() => {
          this.loadData();
          this.closeModal();
        });
      }
    }
  }

  deleteCompany(id: number) {
    if (confirm('Critical: This will permanently delete the organization and all its data. Continue?')) {
      this.companiesService.deleteCompany(id).subscribe(() => this.loadData());
    }
  }

  closeModal() {
    this.showModal = false;
  }

  toggleFormControl(name: string) {
    const control = this.companyForm.get(name);
    if (control) {
      control.setValue(!control.value);
    }
  }
}
