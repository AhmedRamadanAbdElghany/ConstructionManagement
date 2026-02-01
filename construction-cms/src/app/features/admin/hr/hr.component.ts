import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MockDataService } from '../../../core/mock/mock-data.service';
import { User, UserRole } from '../../../shared/interfaces';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hr',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ 'hr.title' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium">Manage your team and configure role permissions</p>
          </div>
          <button 
            (click)="openAddUserModal()" 
            class="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center group">
            <svg class="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            {{ 'hr.add_user' | translate }}
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
            <div class="flex items-center space-x-4">
              <div class="w-14 h-14 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{{ users.length }}</p>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-nowrap">Total Users</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
            <div class="flex items-center space-x-4">
              <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{{ workingCount }}</p>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-nowrap">Working</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
            <div class="flex items-center space-x-4">
              <div class="w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{{ absentCount }}</p>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-nowrap">Absent</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
            <div class="flex items-center space-x-4">
              <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{{ totalSalary | currency:'USD':'symbol':'1.0-0' }}</p>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-nowrap">Total Payroll</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden mb-8 transition-all">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Team Members</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-950/50">
                  <th class="px-8 py-5 font-black">{{ 'hr.name' | translate }}</th>
                  <th class="px-8 py-5 font-black">{{ 'hr.role' | translate }}</th>
                  <th class="px-8 py-5 font-black">{{ 'hr.status' | translate }}</th>
                  <th class="px-8 py-5 font-black">{{ 'hr.salary' | translate }}</th>
                  <th class="px-8 py-5 font-black">{{ 'hr.actions' | translate }}</th>
                </tr>
              </thead>
              <tbody class="text-slate-600 dark:text-slate-300">
                @for (user of users; track user.id) {
                  <tr class="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td class="px-8 py-5">
                      <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                          {{ user.fullName.charAt(0) }}
                        </div>
                        <div>
                          <p class="font-black text-slate-900 dark:text-white tracking-tight">{{ user.fullName }}</p>
                          <p class="text-xs text-slate-400 font-bold">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-8 py-5">
                      <span class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                            [ngClass]="{
                              'bg-purple-500/10 text-purple-600 dark:text-purple-400': user.role === 'SuperAdmin',
                              'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400': user.role === 'CompanyAdmin',
                              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': user.role === 'CompanyUser',
                              'bg-slate-500/10 text-slate-600 dark:text-slate-400': user.role === 'NormalUser'
                            }">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-8 py-5">
                      <div class="flex items-center space-x-3">
                        <span class="w-2.5 h-2.5 rounded-full"
                              [ngClass]="{
                                'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]': user.status === 'Working',
                                'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]': user.status === 'Absent',
                                'bg-slate-400': user.status === 'Client'
                              }">
                        </span>
                        <span class="text-xs font-black uppercase tracking-widest"
                              [ngClass]="{
                                'text-emerald-600 dark:text-emerald-400': user.status === 'Working',
                                'text-rose-600 dark:text-rose-400': user.status === 'Absent',
                                'text-slate-500': user.status === 'Client'
                              }">
                          {{ user.status }}
                        </span>
                      </div>
                    </td>
                    <td class="px-8 py-5">
                      @if (user.salary > 0) {
                        <span class="font-black text-slate-900 dark:text-white">{{ user.salary | currency:'USD' }}</span>
                      } @else {
                        <span class="text-slate-400 font-black text-[10px] uppercase tracking-widest leading-none">N/A</span>
                      }
                    </td>
                    <td class="px-8 py-5">
                      <div class="flex items-center space-x-2">
                        <button 
                          (click)="openNotes(user)" 
                          class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-cyan-500 transition-all active:scale-90"
                          title="View Notes">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button 
                          class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90"
                          title="Edit User">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Role Permission Matrix -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
          <h2 class="text-xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">{{ 'hr.role_matrix' | translate }}</h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th class="text-left px-6 py-4">{{ 'hr.permission' | translate }}</th>
                  <th class="text-center px-6 py-4">Super Admin</th>
                  <th class="text-center px-6 py-4">Company Admin</th>
                  <th class="text-center px-6 py-4">Company User</th>
                  <th class="text-center px-6 py-4">Normal User</th>
                </tr>
              </thead>
              <tbody class="text-slate-700 dark:text-slate-200">
                @for (permission of permissions; track permission.name) {
                  <tr class="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                    <td class="px-6 py-4 text-sm font-bold tracking-tight">{{ permission.name }}</td>
                    <td class="px-4 py-3 text-center">
                      @if (permission.superAdmin) {
                        <span class="inline-flex w-6 h-6 rounded-full bg-emerald-500/20 items-center justify-center">
                          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </span>
                      } @else {
                        <span class="inline-flex w-6 h-6 rounded-full bg-red-500/20 items-center justify-center">
                          <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </span>
                      }
                    </td>
                    <td class="px-4 py-3 text-center">
                      @if (permission.companyAdmin) {
                        <span class="inline-flex w-6 h-6 rounded-full bg-emerald-500/20 items-center justify-center">
                          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </span>
                      } @else {
                        <span class="inline-flex w-6 h-6 rounded-full bg-red-500/20 items-center justify-center">
                          <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </span>
                      }
                    </td>
                    <td class="px-4 py-3 text-center">
                      @if (permission.companyUser) {
                        <span class="inline-flex w-6 h-6 rounded-full bg-emerald-500/20 items-center justify-center">
                          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </span>
                      } @else {
                        <span class="inline-flex w-6 h-6 rounded-full bg-red-500/20 items-center justify-center">
                          <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </span>
                      }
                    </td>
                    <td class="px-4 py-3 text-center">
                      @if (permission.normalUser) {
                        <span class="inline-flex w-6 h-6 rounded-full bg-emerald-500/20 items-center justify-center">
                          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </span>
                      } @else {
                        <span class="inline-flex w-6 h-6 rounded-full bg-red-500/20 items-center justify-center">
                          <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    @if (showAddUserModal) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50 overflow-hidden">
          <div class="p-6 border-b border-slate-700/50">
            <h2 class="text-xl font-bold text-white">{{ 'hr.add_user' | translate }}</h2>
          </div>
          <form [formGroup]="addUserForm" (ngSubmit)="submitAddUser()" class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-2">{{ 'hr.full_name' | translate }}</label>
              <input formControlName="fullName" type="text" 
                     class="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                     placeholder="Enter full name">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-2">{{ 'hr.email' | translate }}</label>
              <input formControlName="email" type="email" 
                     class="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                     placeholder="Enter email address">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-2">{{ 'hr.role' | translate }}</label>
              <select formControlName="role" 
                      class="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors">
                <option value="CompanyAdmin">Company Admin</option>
                <option value="CompanyUser">Company User (Worker)</option>
                <option value="NormalUser">Normal User (Client)</option>
              </select>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" (click)="showAddUserModal = false" 
                      class="px-6 py-3 rounded-xl bg-slate-700/50 text-slate-400 font-medium hover:bg-slate-700 hover:text-white transition-colors">
                {{ 'common.cancel' | translate }}
              </button>
              <button type="submit" 
                      class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all">
                {{ 'common.save' | translate }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Notes Drawer -->
    @if (selectedUserForNotes) {
      <div class="fixed inset-0 bg-black/40 z-40" (click)="selectedUserForNotes = null"></div>
      <div class="fixed inset-y-0 right-0 w-96 bg-slate-800 shadow-2xl z-50 border-l border-slate-700/50 transform transition-transform duration-300">
        <div class="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <h3 class="text-lg font-bold text-white">{{ 'hr.notes_for' | translate }} {{ selectedUserForNotes.fullName }}</h3>
          <button (click)="selectedUserForNotes = null" 
                  class="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          <textarea 
            class="w-full h-64 px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none"
            [value]="selectedUserForNotes.notes || 'No notes available.'"
            readonly>
          </textarea>
          <p class="text-xs text-slate-500 mt-4">{{ 'hr.notes_readonly_hint' | translate }}</p>
        </div>
      </div>
    }
  `
})
export class HrComponent implements OnInit {
  users: User[] = [];
  showAddUserModal = false;
  addUserForm: FormGroup;
  selectedUserForNotes: User | null = null;

  permissions = [
    { name: 'Manage Users', superAdmin: true, companyAdmin: true, companyUser: false, normalUser: false },
    { name: 'View All Projects', superAdmin: true, companyAdmin: true, companyUser: true, normalUser: false },
    { name: 'View Financials', superAdmin: true, companyAdmin: true, companyUser: false, normalUser: false },
    { name: 'Edit Daily Log', superAdmin: true, companyAdmin: true, companyUser: true, normalUser: false },
    { name: 'Upload Media', superAdmin: true, companyAdmin: true, companyUser: true, normalUser: false },
    { name: 'Approve Requests', superAdmin: true, companyAdmin: true, companyUser: false, normalUser: false },
    { name: 'View Progress', superAdmin: true, companyAdmin: true, companyUser: true, normalUser: true },
    { name: 'Manage Locations', superAdmin: true, companyAdmin: true, companyUser: false, normalUser: false },
  ];

  get workingCount(): number {
    return this.users.filter(u => u.status === 'Working').length;
  }

  get absentCount(): number {
    return this.users.filter(u => u.status === 'Absent').length;
  }

  get totalSalary(): number {
    return this.users.reduce((sum, u) => sum + u.salary, 0);
  }

  constructor(private mockDataService: MockDataService, private fb: FormBuilder) {
    this.addUserForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['CompanyUser', Validators.required]
    });
  }

  ngOnInit() {
    this.mockDataService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  openAddUserModal() {
    this.showAddUserModal = true;
  }

  submitAddUser() {
    if (this.addUserForm.valid) {
      const newUser: User = {
        id: Date.now(),
        fullName: this.addUserForm.value.fullName,
        email: this.addUserForm.value.email,
        role: this.addUserForm.value.role,
        status: 'Working',
        salary: 3000
      };
      this.users.push(newUser);
      this.showAddUserModal = false;
      this.addUserForm.reset({ role: 'CompanyUser' });
    }
  }

  openNotes(user: User) {
    this.selectedUserForNotes = user;
  }
}
