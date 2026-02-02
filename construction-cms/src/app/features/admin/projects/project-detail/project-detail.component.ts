import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MockDataService } from '../../../../core/mock/mock-data.service';
import { Project, User, DailyLog, BOQItem, CompanySettings, ProjectSettings } from '../../../../shared/interfaces';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../../../core/services/settings.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule, ReactiveFormsModule], // Added FormsModule and ReactiveFormsModule
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      @if (project) {
        <div class="max-w-7xl mx-auto">
          <!-- Header -->
          <div class="flex items-start justify-between mb-10">
            <div>
              <div class="flex items-center space-x-4 mb-3">
                <a routerLink="/admin/projects" class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-sm">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                </a>
                <div class="flex items-center">
                   <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase mr-3">{{ project.name }}</h1>
                   <button (click)="openEditModal()" class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-cyan-500 transition-all shadow-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                   </button>
                </div>
                <span class="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all mt-3 inline-block"
                      [ngClass]="{
                        'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/10': project.status === 'Active',
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10': project.status === 'Completed',
                        'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/10': project.status === 'Delayed'
                      }">
                  {{ project.status }}
                </span>
              </div>
              <p class="text-slate-500 dark:text-slate-400 font-medium flex items-center ml-14">
                <svg class="w-4 h-4 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                </svg>
                {{ project.location?.address }}
              </p>
            </div>
            <div class="flex space-x-3">
              <!-- Edit button removed as requested -->
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
              <p class="text-sm text-slate-400 mb-1">Progress</p>
              <div class="flex items-center justify-between">
                <p class="text-3xl font-bold text-white">{{ project.progress }}%</p>
                <div class="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
              <p class="text-sm text-slate-400 mb-1">Earned</p>
              <p class="text-3xl font-bold text-emerald-400">{{ project.cashFlow.earned | currency:'USD':'symbol':'1.0-0' }}</p>
            </div>
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
              <p class="text-sm text-slate-400 mb-1">Collected</p>
              <p class="text-3xl font-bold text-cyan-400">{{ project.cashFlow.collected | currency:'USD':'symbol':'1.0-0' }}</p>
            </div>
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
              <p class="text-sm text-slate-400 mb-1">Team Size</p>
              <p class="text-3xl font-bold text-white">{{ teamMembers.length }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 mb-8">
            <button 
              (click)="activeTab = 'timeline'"
              [class.bg-slate-900]="activeTab === 'timeline'"
              [class.dark:bg-white]="activeTab === 'timeline'"
              [class.text-white]="activeTab === 'timeline'"
              [class.dark:text-slate-900]="activeTab === 'timeline'"
              [class.bg-white]="activeTab !== 'timeline'"
              [class.dark:bg-slate-900]="activeTab !== 'timeline'"
              [class.text-slate-500]="activeTab !== 'timeline'"
              [class.border-transparent]="activeTab === 'timeline'"
              [class.border-slate-200]="activeTab !== 'timeline'"
              [class.dark:border-white/5]="activeTab !== 'timeline'"
              class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm">
              {{ 'project_detail.timeline_settings' | translate }}
            </button>
            <button 
              (click)="activeTab = 'team'"
              [class.bg-slate-900]="activeTab === 'team'"
              [class.dark:bg-white]="activeTab === 'team'"
              [class.text-white]="activeTab === 'team'"
              [class.dark:text-slate-900]="activeTab === 'team'"
              [class.bg-white]="activeTab !== 'team'"
              [class.dark:bg-slate-900]="activeTab !== 'team'"
              [class.text-slate-500]="activeTab !== 'team'"
              [class.border-transparent]="activeTab === 'team'"
              [class.border-slate-200]="activeTab !== 'team'"
              [class.dark:border-white/5]="activeTab !== 'team'"
              class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm">
              {{ 'project_detail.team_management' | translate }}
            </button>
            <button 
              (click)="activeTab = 'history'"
              [class.bg-slate-900]="activeTab === 'history'"
              [class.dark:bg-white]="activeTab === 'history'"
              [class.text-white]="activeTab === 'history'"
              [class.dark:text-slate-900]="activeTab === 'history'"
              [class.bg-white]="activeTab !== 'history'"
              [class.dark:bg-slate-900]="activeTab !== 'history'"
              [class.text-slate-500]="activeTab !== 'history'"
              [class.border-transparent]="activeTab === 'history'"
              [class.border-slate-200]="activeTab !== 'history'"
              [class.dark:border-white/5]="activeTab !== 'history'"
              class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm">
              {{ 'project_detail.daily_history' | translate }}
            </button>
            <button 
              (click)="activeTab = 'boq'"
              [class.bg-slate-900]="activeTab === 'boq'"
              [class.dark:bg-white]="activeTab === 'boq'"
              [class.text-white]="activeTab === 'boq'"
              [class.dark:text-slate-900]="activeTab === 'boq'"
              [class.bg-white]="activeTab !== 'boq'"
              [class.dark:bg-slate-900]="activeTab !== 'boq'"
              [class.text-slate-500]="activeTab !== 'boq'"
              [class.border-transparent]="activeTab === 'boq'"
              [class.border-slate-200]="activeTab !== 'boq'"
              [class.dark:border-white/5]="activeTab !== 'boq'"
              class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm">
              BOQ Items
            </button>
            <button 
              (click)="switchToFinances()"
              [class.bg-slate-900]="activeTab === 'finances'"
              [class.dark:bg-white]="activeTab === 'finances'"
              [class.text-white]="activeTab === 'finances'"
              [class.dark:text-slate-900]="activeTab === 'finances'"
              [class.bg-white]="activeTab !== 'finances'"
              [class.dark:bg-slate-900]="activeTab !== 'finances'"
              [class.text-slate-500]="activeTab !== 'finances'"
              [class.border-transparent]="activeTab === 'finances'"
              [class.border-slate-200]="activeTab !== 'finances'"
              [class.dark:border-white/5]="activeTab !== 'finances'"
              class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm">
              Financial Config
            </button>
          </div>

          <!-- Timeline Tab -->
          @if (activeTab === 'timeline') {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl transition-all">
                <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">{{ 'project_detail.timeline' | translate }}</h3>
                <div class="space-y-6">
                  <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                    <p class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{{ 'project_detail.start_date' | translate }}</p>
                    <p class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ project.startDate | date:'fullDate' }}</p>
                  </div>
                  <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                    <p class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{{ 'project_detail.end_date' | translate }}</p>
                    <p class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ project.endDate ? (project.endDate | date:'fullDate') : 'Not Set' }}</p>
                  </div>
                  <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                    <p class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Duration</p>
                    <p class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ calculateDuration() }} days</p>
                  </div>
                </div>
              </div>
              <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h3 class="text-lg font-bold text-white mb-6">Project Settings</h3>
                <div class="space-y-4">
                  <!-- Email Settings (Only if allowed by company) -->
                  @if (companySettings?.delayNotificationSendEmail) {
                    <div class="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
                      <div>
                        <p class="text-white font-medium">Email Notifications</p>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {{ projectSettings?.delayNotificationSendEmail === null ? 'Inherited from Company' : 'Local Override' }}
                        </p>
                      </div>
                      <div class="flex items-center space-x-3">
                        @if (projectSettings?.delayNotificationSendEmail !== null) {
                          <button (click)="resetEmailNotify()" class="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">Reset</button>
                        }
                        <button (click)="toggleEmailNotify()" 
                                [class.bg-cyan-500]="projectSettings?.delayNotificationSendEmail ?? companySettings?.delayNotificationSendEmail"
                                [class.bg-slate-600]="!(projectSettings?.delayNotificationSendEmail ?? companySettings?.delayNotificationSendEmail)"
                                class="w-12 h-6 rounded-full relative transition-all">
                          <span [class.right-1]="projectSettings?.delayNotificationSendEmail ?? companySettings?.delayNotificationSendEmail"
                                [class.left-1]="!(projectSettings?.delayNotificationSendEmail ?? companySettings?.delayNotificationSendEmail)"
                                class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"></span>
                        </button>
                      </div>
                    </div>
                  }

                  <!-- Auto Close Settings -->
                  <div class="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
                    <div>
                      <p class="text-white font-medium">Auto-close Daily Logs</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {{ projectSettings?.autoCloseDay === null ? 'Inherited from Company' : 'Local Override' }}
                      </p>
                    </div>
                    <div class="flex items-center space-x-3">
                      @if (projectSettings?.autoCloseDay !== null) {
                        <button (click)="resetAutoClose()" class="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">Reset</button>
                      }
                      <button (click)="toggleAutoClose()" 
                              [class.bg-fuchsia-500]="projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay"
                              [class.bg-slate-600]="!(projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay)"
                              class="w-12 h-6 rounded-full relative transition-all">
                        <span [class.right-1]="projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay"
                              [class.left-1]="!(projectSettings?.autoCloseDay ?? companySettings?.autoCloseDay)"
                              class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Team Tab -->
          @if (activeTab === 'team') {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">
              <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
                <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'project_detail.team_members' | translate }}</h3>
                <button class="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                  {{ 'project_detail.add_member' | translate }}
                </button>
              </div>
              <div class="divide-y divide-slate-100 dark:divide-white/5">
                @for (member of teamMembers; track member.id) {
                  <div class="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <div class="flex items-center space-x-4">
                      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                        {{ member.fullName.charAt(0) }}
                      </div>
                      <div>
                        <p class="text-base font-black text-slate-900 dark:text-white tracking-tight">{{ member.fullName }}</p>
                        <p class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{{ member.email }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-6">
                      <span class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                            [ngClass]="{
                              'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/10': member.role === 'CompanyAdmin',
                              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10': member.role === 'CompanyUser'
                            }">
                        {{ member.role }}
                      </span>
                      <button 
                        (click)="impersonate(member)"
                        class="px-5 py-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
                        {{ 'project_detail.impersonate' | translate }}
                      </button>
                      <button class="p-3 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- History Tab -->
          @if (activeTab === 'history') {
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h3 class="text-lg font-bold text-white mb-6">{{ 'project_detail.daily_logs' | translate }}</h3>
              <div class="space-y-4">
                @for (log of dailyLogs; track log.id) {
                  <div class="p-4 rounded-xl bg-slate-700/30 border-l-4 transition-colors"
                       [class.border-emerald-500]="log.isClosed"
                       [class.border-amber-500]="!log.isClosed">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                             [class.bg-emerald-500/20]="log.isClosed"
                             [class.bg-amber-500/20]="!log.isClosed">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                               [class.text-emerald-400]="log.isClosed"
                               [class.text-amber-400]="!log.isClosed">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <div>
                          <p class="text-white font-medium">{{ log.date | date:'fullDate' }}</p>
                          <p class="text-sm text-slate-400">{{ log.items.length }} items logged</p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-3">
                        <span class="px-3 py-1.5 rounded-lg text-xs font-medium"
                              [class.bg-emerald-500/20]="log.isClosed"
                              [class.text-emerald-400]="log.isClosed"
                              [class.bg-amber-500/20]="!log.isClosed"
                              [class.text-amber-400]="!log.isClosed">
                          {{ log.isClosed ? 'Closed' : 'Open' }}
                        </span>
                        <button class="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                }
                @if (dailyLogs.length === 0) {
                  <div class="text-center py-12 text-slate-400">
                    <p>No daily logs found for this project.</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- BOQ Tab -->
          @if (activeTab === 'boq') {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all animate-in fade-in duration-500">
              <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
                <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Bill of Quantities</h3>
                <button class="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                  Add Item
                </button>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left bg-slate-50/50 dark:bg-slate-950/30 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th class="px-8 py-5">Description</th>
                      <th class="px-8 py-5">Unit</th>
                      <th class="px-8 py-5">Total Qty</th>
                      <th class="px-8 py-5">Executed</th>
                      <th class="px-8 py-5">Progress</th>
                      <th class="px-8 py-5">Rate</th>
                      <th class="px-8 py-5">Total Value</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-white/5 text-slate-900 dark:text-white">
                    @for (item of boqItems; track item.id) {
                      <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td class="px-8 py-6 font-bold text-sm">{{ item.description }}</td>
                        <td class="px-8 py-6 text-xs text-slate-400 font-bold uppercase tracking-widest">{{ item.unit }}</td>
                        <td class="px-8 py-6 text-sm font-black">{{ item.totalQuantity }}</td>
                        <td class="px-8 py-6 text-sm font-black text-cyan-600 dark:text-cyan-400">{{ item.executedQuantity }}</td>
                        <td class="px-8 py-6">
                          <div class="flex items-center space-x-3">
                            <div class="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                              <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                                   [style.width.%]="(item.executedQuantity / item.totalQuantity) * 100">
                              </div>
                            </div>
                            <span class="text-[10px] font-black text-slate-400">{{ ((item.executedQuantity / item.totalQuantity) * 100) | number:'1.0-0' }}%</span>
                          </div>
                        </td>
                        <td class="px-8 py-6 text-sm font-bold text-slate-500">{{ item.rate | currency:'USD' }}</td>
                        <td class="px-8 py-6 font-black text-emerald-600 dark:text-emerald-400">{{ item.totalQuantity * item.rate | currency:'USD' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Financial Config Tab (Read Only) -->
          @if (activeTab === 'finances' && project) {
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Main Info -->
                <div class="lg:col-span-2 space-y-8">
                  <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-xl transition-all">
                    <div class="flex items-center justify-between mb-10">
                       <div>
                          <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Record</h3>
                          <p class="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Locked Configuration Details</p>
                       </div>
                       <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                          <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                       </div>
                    </div>

                    <div class="space-y-12">
                       <!-- Method Info -->
                       <div class="space-y-4">
                          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Active Calculation Method</label>
                          <div class="inline-flex px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest shadow-xl">
                             {{ project.calculationMethod || 'Measured' }}
                          </div>
                       </div>

                       <!-- Measured Fields -->
                       @if ((project.calculationMethod || 'Measured') === 'Measured') {
                          <div class="p-8 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/10">
                             <label class="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2 block">Total Contract Value</label>
                             <div class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                {{ (project.totalContractValue || 0) | currency }}
                             </div>
                             <p class="mt-4 text-[10px] text-slate-400 font-medium leading-relaxed max-w-sm">Authority record for base project cost. Changes to this value must be authorized through a variation order.</p>
                          </div>
                       }

                       <!-- Adjustments Overview -->
                       <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <!-- Extra Cost -->
                          <div class="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                             <div class="flex items-center space-x-3 mb-6">
                                <div class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                   <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                </div>
                                <label class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Extra Fees</label>
                             </div>
                             <div class="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                {{ (project.extraFees || 0) | currency }}
                             </div>
                             <p class="text-[10px] text-slate-500 font-bold uppercase italic">{{ project.extraFeesDescription || 'No description provided' }}</p>
                          </div>

                          <!-- Deductions -->
                          <div class="p-8 rounded-[2rem] bg-rose-500/5 border border-rose-500/10">
                             <div class="flex items-center space-x-3 mb-6">
                                <div class="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                   <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4"></path></svg>
                                </div>
                                <label class="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Deductions</label>
                             </div>
                             <div class="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                {{ (project.deductedAmount || 0) | currency }}
                             </div>
                             <p class="text-[10px] text-slate-500 font-bold uppercase italic">{{ project.deductedAmountDescription || 'No description provided' }}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <!-- Side Info -->
                <div class="space-y-6">
                  <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
                    <h4 class="text-xl font-black uppercase tracking-tight mb-6">Financial Health</h4>
                    
                    <div class="space-y-6">
                       <div class="pb-6 border-b border-white/10">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contract Execution</p>
                          <div class="flex items-center justify-between">
                             <span class="text-2xl font-black">{{ project.progress }}%</span>
                             <span class="text-[10px] font-bold text-cyan-400">ON TRACK</span>
                          </div>
                       </div>
                       
                       <div class="pb-6 border-b border-white/10">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Cash Flow</p>
                          <div class="flex items-center justify-between">
                             <span class="text-2xl font-black">{{ (project.cashFlow.collected - project.cashFlow.earned) | currency }}</span>
                             <span class="text-[10px] font-bold text-rose-400">-$24k</span>
                          </div>
                       </div>
                    </div>

                    <div class="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10">
                       <p class="text-[9px] font-bold text-slate-400 leading-relaxed italic">The financial configuration is read-only in this view to preserve data integrity between accounting systems and site operations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Edit Project Modal (Basic Info) -->
          @if (showEditModal) {
           <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-300">
                 <!-- Modal Header -->
                 <div class="p-8 pb-4 flex items-center justify-between shrink-0 border-b border-slate-50 dark:border-white/5">
                    <div>
                       <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Edit Project Identity</h2>
                       <p class="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Update basic details and location</p>
                    </div>
                    <button (click)="showEditModal = false" class="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                       <svg class="w-6 h-6 text-slate-400 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                 </div>

                 <!-- Modal Body -->
                 <div class="p-8 space-y-8">
                    <div class="space-y-4 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                       <p class="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">Identification</p>
                       <div class="space-y-4">
                          <input type="text" [(ngModel)]="editForm.name" placeholder="Project Name" 
                                 class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm">
                          <input type="text" [(ngModel)]="editForm.address" placeholder="Location Address" 
                                 class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm">
                       </div>
                       
                       <div class="grid grid-cols-2 gap-4 mt-4">
                          <div class="relative">
                             <label class="absolute -top-2 left-4 px-2 bg-slate-50 dark:bg-slate-900 text-[8px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                             <input type="date" [(ngModel)]="editForm.startDate" 
                                    class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold text-xs">
                          </div>
                          <div class="relative">
                             <label class="absolute -top-2 left-4 px-2 bg-slate-50 dark:bg-slate-900 text-[8px] font-black text-slate-400 uppercase tracking-widest">Target End</label>
                             <input type="date" [(ngModel)]="editForm.endDate" 
                                    class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold text-xs">
                          </div>
                       </div>
                    </div>

                    @if (companySettings?.allowLocations) {
                       <div class="space-y-4 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                          <p class="text-[10px] font-black text-purple-500 uppercase mb-4">GPS Coordinates</p>
                          <div class="grid grid-cols-2 gap-4">
                             <div class="relative">
                                <label class="absolute -top-2 left-4 px-2 bg-slate-50 dark:bg-slate-900 text-[8px] font-black text-slate-400 uppercase tracking-widest">Lat</label>
                                <input type="number" [(ngModel)]="editForm.lat" 
                                       class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold text-xs">
                             </div>
                             <div class="relative">
                                <label class="absolute -top-2 left-4 px-2 bg-slate-50 dark:bg-slate-900 text-[8px] font-black text-slate-400 uppercase tracking-widest">Lng</label>
                                <input type="number" [(ngModel)]="editForm.lng" 
                                       class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold text-xs">
                             </div>
                          </div>
                       </div>
                    }
                 </div>

                 <!-- Modal Footer -->
                 <div class="p-8 pt-6 flex space-x-4 border-t border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 shrink-0">
                    <button (click)="showEditModal = false" class="flex-1 py-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase border border-slate-200 dark:border-white/5">Cancel</button>
                    <button (click)="updateProject(); showEditModal = false" [disabled]="!isEditFormValid" class="flex-[2] py-4 rounded-2xl bg-slate-900 dark:bg-cyan-500 text-white font-black text-[10px] uppercase shadow-xl transition-all hover:scale-[1.02]">Update Identity</button>
                 </div>
              </div>
           </div>
          }
        </div>
      }
    </div>
  `
})
export class ProjectDetailComponent implements OnInit {
  project: Project | undefined;
  activeTab: 'timeline' | 'team' | 'history' | 'boq' | 'finances' = 'timeline';
  teamMembers: User[] = [];
  dailyLogs: DailyLog[] = [];
  boqItems: BOQItem[] = [];

  // Edit State
  showEditModal = false;
  companySettings: CompanySettings | undefined;
  projectSettings: ProjectSettings | undefined;
  editForm = {
    name: '',
    address: '',
    startDate: '',
    endDate: '',
    calculationMethod: 'Measured' as 'Measured' | 'Supervision' | 'Packages',
    totalContractValue: 0,
    supervisionPercentage: 0,
    useCompanyPercentage: true,
    packageId: null as number | null,
    extraFees: 0,
    extraFeesDescription: '',
    deductedAmount: 0,
    deductedAmountDescription: '',
    lat: 0 as number | null,
    lng: 0 as number | null
  };

  constructor(
    private route: ActivatedRoute,
    private mockDataService: MockDataService,
    private authService: AuthService,
    private settingsService: SettingsService
  ) { }

  ngOnInit() {
    const projectId = Number(this.route.snapshot.paramMap.get('id'));
    if (projectId) {
      this.mockDataService.getProjects().subscribe(projects => {
        this.project = projects.find(p => p.id === projectId);
      });

      this.mockDataService.getUsers().subscribe(users => {
        this.teamMembers = users.filter(u => u.role === 'CompanyUser' || u.role === 'CompanyAdmin');
      });

      this.mockDataService.getDailyLogs(projectId).subscribe(logs => {
        this.dailyLogs = logs;
      });

      this.mockDataService.getBOQItems(projectId).subscribe(items => {
        this.boqItems = items;
      });

      this.settingsService.getCompanySettings().subscribe(settings => {
        this.companySettings = settings;
      });

      this.settingsService.getProjectSettings(projectId).subscribe(settings => {
        this.projectSettings = settings;
      });
    }
  }

  get isEditFormValid(): boolean {
    const f = this.editForm;
    if (!f.name || !f.address || !f.startDate || !f.endDate) return false;
    if (this.companySettings?.allowLocations && (f.lat === null || f.lng === null)) return false;
    if (f.calculationMethod === 'Measured' && (!f.totalContractValue || f.totalContractValue <= 0)) return false;
    if (f.extraFees > 0 && !f.extraFeesDescription) return false;
    return true;
  }

  get editValidationErrors(): string[] {
    const f = this.editForm;
    const errors: string[] = [];
    if (!f.name) errors.push('Name');
    if (!f.address) errors.push('Address');
    if (!f.startDate) errors.push('Start Date');
    if (!f.endDate) errors.push('End Date');
    if (this.companySettings?.allowLocations && (f.lat === null || f.lng === null)) errors.push('GPS Coordinates');
    if (f.calculationMethod === 'Measured' && (!f.totalContractValue || f.totalContractValue <= 0)) errors.push('Total Value');
    if (f.extraFees > 0 && !f.extraFeesDescription) errors.push('Fee Reason');
    return errors;
  }

  openEditModal() {
    if (!this.project) return;
    this.editForm = {
      name: this.project.name,
      address: this.project.location?.address || '',
      startDate: this.project.startDate,
      endDate: this.project.endDate || '',
      calculationMethod: (this.project as any).calculationMethod || 'Measured',
      totalContractValue: (this.project as any).totalContractValue || 0,
      supervisionPercentage: (this.project as any).supervisionPercentage || 0,
      useCompanyPercentage: (this.project as any).useCompanyPercentage ?? true,
      packageId: this.project.packageId || null,
      extraFees: (this.project as any).extraFees || 0,
      extraFeesDescription: (this.project as any).extraFeesDescription || '',
      deductedAmount: (this.project as any).deductedAmount || 0,
      deductedAmountDescription: (this.project as any).deductedAmountDescription || '',
      lat: this.project.location?.lat ?? null,
      lng: this.project.location?.lng ?? null
    };
    this.showEditModal = true;
  }

  updateProject() {
    if (!this.project || !this.isEditFormValid) return;

    // In a real app, this would call a service
    this.project.name = this.editForm.name;
    this.project.location = {
      ...this.project.location,
      address: this.editForm.address,
      lat: Number(this.editForm.lat) || 0,
      lng: Number(this.editForm.lng) || 0
    };
    this.project.startDate = this.editForm.startDate;
    this.project.endDate = this.editForm.endDate;

    // Update extended properties
    Object.assign(this.project, {
      calculationMethod: this.editForm.calculationMethod,
      totalContractValue: this.editForm.totalContractValue,
      extraFees: this.editForm.extraFees,
      extraFeesDescription: this.editForm.extraFeesDescription,
      deductedAmount: this.editForm.deductedAmount,
      deductedAmountDescription: this.editForm.deductedAmountDescription
    });

    console.log('Project updated:', this.project);
    // Don't close modal, just show success in UI or stay on tab
    alert('Project financial settings updated successfully!');
  }

  switchToFinances() {
    if (!this.project) return;
    this.editForm = {
      name: this.project.name,
      address: this.project.location?.address || '',
      startDate: this.project.startDate,
      endDate: this.project.endDate || '',
      calculationMethod: (this.project as any).calculationMethod || 'Measured',
      totalContractValue: (this.project as any).totalContractValue || 0,
      supervisionPercentage: (this.project as any).supervisionPercentage || 0,
      useCompanyPercentage: (this.project as any).useCompanyPercentage ?? true,
      packageId: this.project.packageId || null,
      extraFees: (this.project as any).extraFees || 0,
      extraFeesDescription: (this.project as any).extraFeesDescription || '',
      deductedAmount: (this.project as any).deductedAmount || 0,
      deductedAmountDescription: (this.project as any).deductedAmountDescription || '',
      lat: this.project.location?.lat ?? null,
      lng: this.project.location?.lng ?? null
    };
    this.activeTab = 'finances';
  }

  calculateDuration(): number {
    if (!this.project) return 0;
    const start = new Date(this.project.startDate);
    const end = this.project.endDate ? new Date(this.project.endDate) : new Date();
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  toggleAutoClose() {
    if (!this.projectSettings || !this.companySettings) return;
    const current = this.projectSettings.autoCloseDay ?? this.companySettings.autoCloseDay;
    this.projectSettings.autoCloseDay = !current;
    this.saveProjectSettings();
  }

  resetAutoClose() {
    if (!this.projectSettings) return;
    this.projectSettings.autoCloseDay = null;
    this.saveProjectSettings();
  }

  toggleEmailNotify() {
    if (!this.projectSettings || !this.companySettings) return;
    const current = this.projectSettings.delayNotificationSendEmail ?? this.companySettings.delayNotificationSendEmail;
    this.projectSettings.delayNotificationSendEmail = !current;
    this.saveProjectSettings();
  }

  resetEmailNotify() {
    if (!this.projectSettings) return;
    this.projectSettings.delayNotificationSendEmail = null;
    this.saveProjectSettings();
  }

  saveProjectSettings() {
    if (!this.projectSettings || !this.project) return;
    this.settingsService.updateProjectSettings(this.project.id, this.projectSettings).subscribe();
  }

  impersonate(user: User) {
    if (confirm(`Impersonate ${user.fullName}? This will change your view to their role.`)) {
      this.authService.switchUserRole(user.role);
      alert(`Now viewing as ${user.role}. The sidebar will update to show ${user.fullName}'s permissions.`);
    }
  }
}
