import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

const API_URL = '/api';

interface AttendanceRecord {
    id: number;
    userId: number;
    fullName: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    workHours: number;
    status: 'present' | 'absent' | 'late' | 'early_leave';
    notes: string;
}

interface StaffMember {
    id: number;
    fullName: string;
    role: string;
}

interface AttendanceStats {
    totalStaff: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    averageWorkHours: number;
}

@Component({
    selector: 'app-attendance-tracking',
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
                {{ 'WAREHOUSE_HR.ATTENDANCE.TITLE' | translate }} ⏰
              </h1>
              <p class="text-slate-500 dark:text-slate-400 font-medium mt-1">
                {{ 'WAREHOUSE_HR.ATTENDANCE.SUBTITLE' | translate }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <input 
                type="date"
                [(ngModel)]="selectedDate"
                (change)="loadAttendance()"
                class="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
            </div>
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
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_HR.ATTENDANCE.TOTAL_STAFF' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats()?.totalStaff || 0 }}</p>
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
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_HR.ATTENDANCE.PRESENT_TODAY' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats()?.presentToday || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_HR.ATTENDANCE.ABSENT_TODAY' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats()?.absentToday || 0 }}</p>
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
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'WAREHOUSE_HR.ATTENDANCE.LATE_TODAY' | translate }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats()?.lateToday || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm mb-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 class="font-bold text-slate-900 dark:text-white">{{ 'WAREHOUSE_HR.ATTENDANCE.QUICK_ACTIONS' | translate }}</h2>
            <div class="flex gap-3">
              <button 
                (click)="checkInAll()"
                class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                {{ 'WAREHOUSE_HR.ATTENDANCE.CHECK_IN_ALL' | translate }}
              </button>
              <button 
                (click)="exportAttendance()"
                class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {{ 'WAREHOUSE_HR.ATTENDANCE.EXPORT' | translate }}
              </button>
            </div>
          </div>
        </div>

        <!-- Attendance Table -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_HR.ATTENDANCE.TABLE_NAME' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_HR.ATTENDANCE.TABLE_CHECK_IN' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_HR.ATTENDANCE.TABLE_CHECK_OUT' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_HR.ATTENDANCE.TABLE_WORK_HOURS' | translate }}
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_HR.ATTENDANCE.TABLE_STATUS' | translate }}
                  </th>
                  <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ 'WAREHOUSE_HR.ATTENDANCE.TABLE_ACTIONS' | translate }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                @for (record of attendanceRecords(); track record.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                          {{ record.fullName.charAt(0) }}
                        </div>
                        <div>
                          <p class="font-bold text-slate-900 dark:text-white">{{ record.fullName }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (record.checkIn) {
                        <span class="text-slate-900 dark:text-white font-medium">
                          {{ record.checkIn | date:'shortTime' }}
                        </span>
                      } @else {
                        <span class="text-slate-400">--:--</span>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (record.checkOut) {
                        <span class="text-slate-900 dark:text-white font-medium">
                          {{ record.checkOut | date:'shortTime' }}
                        </span>
                      } @else {
                        <span class="text-slate-400">--:--</span>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (record.workHours > 0) {
                        <span class="text-slate-900 dark:text-white font-medium">
                          {{ record.workHours.toFixed(1) }}h
                        </span>
                      } @else {
                        <span class="text-slate-400">-</span>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (record.status === 'present') {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {{ 'WAREHOUSE_HR.ATTENDANCE.STATUS_PRESENT' | translate }}
                        </span>
                      } @else if (record.status === 'absent') {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          {{ 'WAREHOUSE_HR.ATTENDANCE.STATUS_ABSENT' | translate }}
                        </span>
                      } @else if (record.status === 'late') {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {{ 'WAREHOUSE_HR.ATTENDANCE.STATUS_LATE' | translate }}
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {{ 'WAREHOUSE_HR.ATTENDANCE.STATUS_EARLY_LEAVE' | translate }}
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="flex items-center justify-end gap-1">
                        @if (!record.checkIn) {
                          <button 
                            (click)="checkIn(record)"
                            class="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold text-xs hover:bg-emerald-500/20 transition-colors">
                            {{ 'WAREHOUSE_HR.ATTENDANCE.CHECK_IN' | translate }}
                          </button>
                        } @else if (!record.checkOut) {
                          <button 
                            (click)="checkOut(record)"
                            class="px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-xs hover:bg-blue-500/20 transition-colors">
                            {{ 'WAREHOUSE_HR.ATTENDANCE.CHECK_OUT' | translate }}
                          </button>
                        }
                        <button 
                          (click)="editRecord(record)"
                          class="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
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
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="font-medium">{{ 'WAREHOUSE_HR.ATTENDANCE.NO_RECORDS' | translate }}</p>
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

    <!-- Edit Modal -->
    @if (showEditModal && editingRecord()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800">
          <div class="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 class="text-xl font-black text-slate-900 dark:text-white">
              {{ 'WAREHOUSE_HR.ATTENDANCE.EDIT_RECORD' | translate }}
            </h2>
          </div>
          
          <form (ngSubmit)="saveRecord()" class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {{ 'WAREHOUSE_HR.ATTENDANCE.FORM_CHECK_IN' | translate }}
              </label>
              <input 
                type="time"
                [(ngModel)]="editForm.checkIn"
                name="checkIn"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
            </div>
            
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {{ 'WAREHOUSE_HR.ATTENDANCE.FORM_CHECK_OUT' | translate }}
              </label>
              <input 
                type="time"
                [(ngModel)]="editForm.checkOut"
                name="checkOut"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
            </div>
            
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {{ 'WAREHOUSE_HR.ATTENDANCE.FORM_STATUS' | translate }}
              </label>
              <select 
                [(ngModel)]="editForm.status"
                name="status"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
                <option value="present">{{ 'WAREHOUSE_HR.ATTENDANCE.STATUS_PRESENT' | translate }}</option>
                <option value="absent">{{ 'WAREHOUSE_HR.ATTENDANCE.STATUS_ABSENT' | translate }}</option>
                <option value="late">{{ 'WAREHOUSE_HR.ATTENDANCE.STATUS_LATE' | translate }}</option>
                <option value="early_leave">{{ 'WAREHOUSE_HR.ATTENDANCE.STATUS_EARLY_LEAVE' | translate }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {{ 'WAREHOUSE_HR.ATTENDANCE.FORM_NOTES' | translate }}
              </label>
              <textarea 
                [(ngModel)]="editForm.notes"
                name="notes"
                rows="3"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"></textarea>
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
export class AttendanceTrackingComponent {
    private http = inject(HttpClient);

    // State
    attendanceRecords = signal<AttendanceRecord[]>([]);
    stats = signal<AttendanceStats | null>(null);
    selectedDate = new Date().toISOString().split('T')[0];
    showEditModal = false;
    editingRecord = signal<AttendanceRecord | null>(null);

    editForm = {
        checkIn: '',
        checkOut: '',
        status: 'present',
        notes: ''
    };

    constructor() {
        this.loadAttendance();
        this.loadStats();
    }

    loadAttendance() {
        this.http.get<AttendanceRecord[]>(`${API_URL}/vendor/attendance?date=${this.selectedDate}`).subscribe({
            next: (data) => this.attendanceRecords.set(data),
            error: (err) => console.error('Failed to load attendance:', err)
        });
    }

    loadStats() {
        this.http.get<AttendanceStats>(`${API_URL}/vendor/attendance/stats`).subscribe({
            next: (data) => this.stats.set(data),
            error: (err) => console.error('Failed to load attendance stats:', err)
        });
    }

    checkIn(record: AttendanceRecord) {
        this.http.post(`${API_URL}/vendor/attendance/${record.id}/check-in`, {}).subscribe({
            next: () => {
                this.loadAttendance();
                this.loadStats();
            },
            error: (err) => console.error('Failed to check in:', err)
        });
    }

    checkOut(record: AttendanceRecord) {
        this.http.post(`${API_URL}/vendor/attendance/${record.id}/check-out`, {}).subscribe({
            next: () => {
                this.loadAttendance();
                this.loadStats();
            },
            error: (err) => console.error('Failed to check out:', err)
        });
    }

    checkInAll() {
        this.http.post(`${API_URL}/vendor/attendance/check-in-all`, { date: this.selectedDate }).subscribe({
            next: () => {
                this.loadAttendance();
                this.loadStats();
            },
            error: (err) => console.error('Failed to check in all:', err)
        });
    }

    editRecord(record: AttendanceRecord) {
        this.editingRecord.set(record);
        this.editForm = {
            checkIn: record.checkIn ? this.formatTimeForInput(record.checkIn) : '',
            checkOut: record.checkOut ? this.formatTimeForInput(record.checkOut) : '',
            status: record.status,
            notes: record.notes
        };
        this.showEditModal = true;
    }

    saveRecord() {
        const record = this.editingRecord();
        if (!record) return;

        this.http.put(`${API_URL}/vendor/attendance/${record.id}`, this.editForm).subscribe({
            next: () => {
                this.loadAttendance();
                this.closeModal();
            },
            error: (err) => console.error('Failed to save record:', err)
        });
    }

    exportAttendance() {
        window.open(`${API_URL}/vendor/attendance/export?date=${this.selectedDate}`, '_blank');
    }

    closeModal() {
        this.showEditModal = false;
        this.editingRecord.set(null);
        this.editForm = {
            checkIn: '',
            checkOut: '',
            status: 'present',
            notes: ''
        };
    }

    private formatTimeForInput(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toTimeString().slice(0, 5);
    }
}
