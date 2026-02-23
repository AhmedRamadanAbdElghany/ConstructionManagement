import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

const API_URL = '/api';

interface StaffMember {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  roleName: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  lastActive: string;
  permissions: string[];
}

interface Role {
  id: number;
  name: string;
  nameAr: string;
  permissions: string[];
  staffCount: number;
}

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.TITLE' | translate }} 👥
              </h1>
              <p class="text-slate-500 dark:text-slate-400 font-medium mt-1">
                {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.SUBTITLE' | translate }}
              </p>
            </div>
            <button 
              (click)="showAddStaffModal = true"
              class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.ADD_STAFF' | translate }}
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.TOTAL_STAFF' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ staffStats().total }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.ACTIVE_STAFF' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ staffStats().active }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.PENDING_STAFF' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ staffStats().pending }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.ROLES' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ roles().length }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1 relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input 
                type="text"
                [(ngModel)]="searchQuery"
                [placeholder]="'WAREHOUSE_HR.STAFF_MANAGEMENT.SEARCH_PLACEHOLDER' | translate"
                class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
            </div>
            
            <div class="flex gap-3">
              <select 
                [(ngModel)]="selectedRoleFilter"
                class="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
                <option value="">{{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.ALL_ROLES' | translate }}</option>
                @for (role of roles(); track role.id) {
                  <option [value]="role.id">{{ role.name }}</option>
                }
              </select>
              
              <select 
                [(ngModel)]="selectedStatusFilter"
                class="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
                <option value="">{{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.ALL_STATUS' | translate }}</option>
                <option value="active">{{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.STATUS_ACTIVE' | translate }}</option>
                <option value="inactive">{{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.STATUS_INACTIVE' | translate }}</option>
                <option value="pending">{{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.STATUS_PENDING' | translate }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Staff Table -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.TABLE_NAME' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.TABLE_ROLE' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.TABLE_CONTACT' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.TABLE_STATUS' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.TABLE_JOINED' | translate }}
                  </th>
                  <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.TABLE_ACTIONS' | translate }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                @for (member of filteredStaff(); track member.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                          {{ member.fullName.charAt(0) }}
                        </div>
                        <div>
                          <p class="font-bold text-slate-900 dark:text-white">{{ member.fullName }}</p>
                          <p class="text-sm text-slate-500 dark:text-slate-400">{{ member.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {{ member.roleName }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span class="text-sm">{{ member.phoneNumber }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (member.status === 'active') {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.STATUS_ACTIVE' | translate }}
                        </span>
                      } @else if (member.status === 'inactive') {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400">
                          <span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.STATUS_INACTIVE' | translate }}
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.STATUS_PENDING' | translate }}
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {{ member.joinedAt | date:'mediumDate' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button 
                          (click)="editStaff(member)"
                          class="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                          [title]="'WAREHOUSE_HR.STAFF_MANAGEMENT.EDIT_STAFF' | translate">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button 
                          (click)="deleteStaff(member)"
                          class="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                          [title]="'WAREHOUSE_HR.STAFF_MANAGEMENT.DELETE_STAFF' | translate">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-6 py-16 text-center">
                      <div class="text-slate-400">
                        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <p class="font-medium">{{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.NO_STAFF' | translate }}</p>
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

    <!-- Add/Edit Staff Modal -->
    @if (showAddStaffModal || editingStaff()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
          <div class="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 class="text-xl font-black text-slate-900 dark:text-white">
              {{ editingStaff() ? ('WAREHOUSE_HR.STAFF_MANAGEMENT.EDIT_STAFF' | translate) : ('WAREHOUSE_HR.STAFF_MANAGEMENT.ADD_STAFF' | translate) }}
            </h2>
          </div>
          
          <form (ngSubmit)="saveStaff()" class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.FORM_FULL_NAME' | translate }}
              </label>
              <input 
                type="text"
                [(ngModel)]="staffForm.fullName"
                name="fullName"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            </div>
            
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.FORM_EMAIL' | translate }}
              </label>
              <input 
                type="email"
                [(ngModel)]="staffForm.email"
                name="email"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            </div>
            
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.FORM_PHONE' | translate }}
              </label>
              <input 
                type="tel"
                [(ngModel)]="staffForm.phoneNumber"
                name="phoneNumber"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            </div>
            
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.FORM_ROLE' | translate }}
              </label>
              <select 
                [(ngModel)]="staffForm.roleId"
                name="roleId"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option value="">{{ 'WAREHOUSE_HR.STAFF_MANAGEMENT.SELECT_ROLE' | translate }}</option>
                @for (role of roles(); track role.id) {
                  <option [value]="role.id">{{ role.name }}</option>
                }
              </select>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button 
                type="button"
                (click)="closeModal()"
                class="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                {{ 'COMMON.CANCEL' | translate }}
              </button>
              <button 
                type="submit"
                class="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                {{ 'COMMON.SAVE' | translate }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class StaffManagementComponent {
  private http = inject(HttpClient);

  // State
  staff = signal<StaffMember[]>([]);
  roles = signal<Role[]>([]);
  searchQuery = '';
  selectedRoleFilter = '';
  selectedStatusFilter = '';
  showAddStaffModal = false;
  editingStaff = signal<StaffMember | null>(null);

  staffForm = {
    fullName: '',
    email: '',
    phoneNumber: '',
    roleId: ''
  };

  // Computed
  staffStats = computed(() => {
    const members = this.staff();
    return {
      total: members.length,
      active: members.filter(m => m.status === 'active').length,
      pending: members.filter(m => m.status === 'pending').length,
      inactive: members.filter(m => m.status === 'inactive').length
    };
  });

  filteredStaff = computed(() => {
    let members = this.staff();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      members = members.filter(m =>
        m.fullName.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.phoneNumber.includes(query)
      );
    }

    if (this.selectedRoleFilter) {
      members = members.filter(m => m.role === this.selectedRoleFilter);
    }

    if (this.selectedStatusFilter) {
      members = members.filter(m => m.status === this.selectedStatusFilter);
    }

    return members;
  });

  constructor() {
    this.loadStaff();
    this.loadRoles();
  }

  loadStaff() {
    this.http.get<StaffMember[]>(`${API_URL}/vendor/staff`).subscribe({
      next: (data) => this.staff.set(data),
      error: (err) => console.error('Failed to load staff:', err)
    });
  }

  loadRoles() {
    this.http.get<Role[]>(`${API_URL}/company/roles`).subscribe({
      next: (data) => this.roles.set(data),
      error: (err) => console.error('Failed to load roles:', err)
    });
  }

  editStaff(member: StaffMember) {
    this.editingStaff.set(member);
    this.staffForm = {
      fullName: member.fullName,
      email: member.email,
      phoneNumber: member.phoneNumber,
      roleId: member.role
    };
  }

  deleteStaff(member: StaffMember) {
    if (confirm(`Are you sure you want to remove ${member.fullName}?`)) {
      this.http.delete(`${API_URL}/vendor/staff/${member.id}`).subscribe({
        next: () => {
          this.staff.update(members => members.filter(m => m.id !== member.id));
        },
        error: (err) => console.error('Failed to delete staff:', err)
      });
    }
  }

  saveStaff() {
    const editing = this.editingStaff();

    if (editing) {
      this.http.put(`${API_URL}/vendor/staff/${editing.id}`, this.staffForm).subscribe({
        next: () => {
          this.loadStaff();
          this.closeModal();
        },
        error: (err) => console.error('Failed to update staff:', err)
      });
    } else {
      this.http.post(`${API_URL}/vendor/staff`, this.staffForm).subscribe({
        next: () => {
          this.loadStaff();
          this.closeModal();
        },
        error: (err) => console.error('Failed to add staff:', err)
      });
    }
  }

  closeModal() {
    this.showAddStaffModal = false;
    this.editingStaff.set(null);
    this.staffForm = {
      fullName: '',
      email: '',
      phoneNumber: '',
      roleId: ''
    };
  }
}
