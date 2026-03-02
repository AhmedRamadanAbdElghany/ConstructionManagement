import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ProjectItem, DailyLog, SiteMedia } from '../../../shared/interfaces';
import { AuthService } from '../../../core/services/auth.service';
import { DailyLogsService } from '../../../core/services/daily-logs.service';
import { I18nService } from '../../../core/i18n/i18n.service';

interface WorkTask {
  id: number;
  projectItemId: number;
  projectItemName: string;
  assignedQuantity: number;
  unit: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Approved' | 'Rejected';
  notes?: string;
  photos: string[];
}

@Component({
  selector: 'app-daily-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header with Date Navigation -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 animate-premium-fade">
          <div class="space-y-1">
            <h1 class="text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter uppercase drop-shadow-sm">{{ 'daily_log.title' | translate }}</h1>
            <div class="flex items-center gap-2 opacity-60">
               <div class="w-10 h-1 bg-indigo-500 rounded-full"></div>
               <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">{{ 'daily_log.subtitle' | translate }}</p>
            </div>
          </div>
          
          <!-- Date Navigation -->
          <div class="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none">
            <button (click)="navigateDay(-1)" class="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-indigo-500 hover:text-white transition-all duration-300 hover:scale-110 active:scale-90 group/btn">
              <svg class="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <div class="px-8 py-3 text-center min-w-[220px]">
               <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 shadow-sm">{{ 'daily_log.selected_date' | translate }}</p>
               <div class="relative group">
                 <input type="date" [(ngModel)]="selectedDateString" (change)="onDateChange()" 
                        class="bg-transparent text-sm font-black text-slate-900 dark:text-white border-none outline-none text-center cursor-pointer group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                 <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-500"></div>
               </div>
            </div>
            
            <button (click)="navigateDay(1)" class="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-indigo-500 hover:text-white transition-all duration-300 hover:scale-110 active:scale-90 group/btn">
              <svg class="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            
            <button (click)="goToToday()" class="px-8 py-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
               {{ 'daily_log.today' | translate }}
            </button>
          </div>
        </div>

        <!-- Status Banner -->
        <div class="mb-12 p-8 rounded-[2.5rem] flex items-center justify-between animate-premium-fade shadow-lg"
             [ngClass]="{
               'bg-emerald-500/5 border border-emerald-500/10 shadow-emerald-500/5': !isDayClosed,
               'bg-rose-500/5 border border-rose-500/10 shadow-rose-500/5': isDayClosed
             }">
          <div class="flex items-center gap-6">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner animate-premium-pulse"
                 [ngClass]="isDayClosed ? 'bg-rose-500/20 text-rose-500 shadow-rose-500/20' : 'bg-emerald-500/20 text-emerald-500 shadow-emerald-500/20'">
              {{ isDayClosed ? '🔒' : '🟢' }}
            </div>
            <div class="space-y-1">
              <p class="text-xl font-black uppercase tracking-tighter" [ngClass]="isDayClosed ? 'text-rose-600' : 'text-emerald-600'">
                {{ isDayClosed ? ('daily_log.day_locked' | translate) : ('daily_log.day_open' | translate) }}
              </p>
              <div class="flex items-center gap-2">
                 <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">{{ selectedDate | date:'fullDate' }}</p>
                 <div class="w-1 h-1 rounded-full bg-slate-300"></div>
                 <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">{{ isDayClosed ? 'Finalized' : 'Accepting Entries' }}</p>
              </div>
            </div>
          </div>
          
          @if (isDayClosed && canReopenDay) {
            <button (click)="openReopenModal()" class="px-10 py-5 rounded-2xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-95">
              {{ 'daily_log.reopen_day' | translate }}
            </button>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content - Today's Tasks -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Assigned Tasks Card -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none animate-premium-fade">
              <div class="flex items-center justify-between mb-12">
                <div class="space-y-1">
                  <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                    <span class="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-xl shadow-inner">📋</span>
                    {{ 'daily_log.tasks_for_day' | translate }}
                  </h2>
                  <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-16 opacity-60">Operational Item Tracking</p>
                </div>
                <div class="px-6 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5">
                   <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                     {{ assignedTasks.length }} {{ 'daily_log.items' | translate }}
                   </span>
                </div>
              </div>

              <div class="space-y-10">
                @for (task of assignedTasks; track task.id; let i = $index) {
                  <div class="p-10 rounded-[2.5rem] border-2 transition-all duration-500 group animate-premium-fade relative overflow-hidden"
                       [style.animation-delay]="(i * 100 + 100) + 'ms'"
                       [ngClass]="{
                         'bg-white dark:bg-slate-950/20 border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:border-indigo-500/20': task.status === 'Pending',
                         'bg-amber-500/[0.03] border-amber-500/30 shadow-amber-500/5': task.status === 'InProgress',
                         'bg-emerald-500/[0.03] border-emerald-500/30 shadow-emerald-500/5': task.status === 'Completed' || task.status === 'Approved',
                         'bg-rose-500/[0.03] border-rose-500/30 shadow-rose-500/5': task.status === 'Rejected'
                       }">
                    <div class="flex items-start justify-between mb-8">
                       <div class="space-y-1">
                         <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase leading-none">{{ task.projectItemName }}</h3>
                         <div class="flex items-center gap-2">
                           <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                             {{ 'daily_log.target' | translate }}
                           </span>
                           <span class="px-3 py-1 rounded-lg bg-indigo-500/5 text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-500/10">
                             {{ task.assignedQuantity }} {{ task.unit }}
                           </span>
                         </div>
                      </div>
                      <span class="px-5 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] shadow-lg ring-1 ring-inset ring-current animate-premium-fade"
                            [ngClass]="{
                              'bg-slate-100 text-slate-400 ring-slate-200': task.status === 'Pending',
                              'bg-amber-500/10 text-amber-600 ring-amber-500/20': task.status === 'InProgress',
                              'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20': task.status === 'Completed' || task.status === 'Approved',
                              'bg-rose-500/10 text-rose-600 ring-rose-500/20': task.status === 'Rejected'
                            }">
                        {{ 'common.' + (task.status === 'InProgress' ? 'work_in_progress' : task.status.toLowerCase()) | translate }}
                      </span>
                    </div>

                    <!-- Photo Upload for Task -->
                    <div class="mb-10 p-6 rounded-[2rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 transition-colors group-hover:bg-slate-50 dark:group-hover:bg-white/[0.04]">
                       <div class="flex items-center justify-between mb-4">
                         <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{{ 'daily_log.site_photos' | translate }}</p>
                         <span class="px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/5 text-[9px] font-black text-slate-500">{{ task.photos.length }} Verified</span>
                       </div>
                      <div class="flex gap-4 flex-wrap">
                        @for (photo of task.photos; track photo) {
                          <div class="w-24 h-24 rounded-[1.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl hover:scale-110 hover:rotate-2 transition-all cursor-zoom-in">
                            <img [src]="photo" class="w-full h-full object-cover">
                          </div>
                        }
                        @if (!isDayClosed) {
                          <label class="w-24 h-24 rounded-[1.5rem] border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group/upload relative overflow-hidden">
                            <svg class="w-8 h-8 text-slate-300 group-hover/upload:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span class="text-[8px] font-black text-slate-400 mt-2 uppercase tracking-widest group-hover/upload:text-indigo-600">Add Pic</span>
                            <div class="absolute inset-x-0 bottom-0 h-1 bg-indigo-500 translate-y-full group-hover/upload:translate-y-0 transition-transform"></div>
                            <input type="file" accept="image/*" class="hidden" (change)="uploadTaskPhoto(task, $event)">
                          </label>
                        }
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    @if (!isDayClosed) {
                      <div class="flex gap-4 pt-6 border-t-2 border-slate-100/50 dark:border-white/5">
                        @if (task.status === 'Pending') {
                          <button (click)="startTask(task)" class="group active:scale-95 flex-1 relative px-10 py-5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:brightness-110 transition-all overflow-hidden">
                            <span class="relative z-10">{{ 'daily_log.start_work' | translate }}</span>
                            <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                          </button>
                        }
                        @if (task.status === 'InProgress') {
                          <button (click)="completeTask(task)" class="group active:scale-95 flex-1 relative px-10 py-5 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:brightness-110 transition-all overflow-hidden">
                            <span class="relative z-10">{{ 'daily_log.mark_complete' | translate }}</span>
                            <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                          </button>
                        }
                        @if (canApprove && task.status === 'Completed') {
                          <button (click)="approveTask(task)" class="flex-1 py-5 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all border border-emerald-200 dark:border-emerald-500/20 active:scale-95">
                            {{ 'common.approved' | translate }}
                          </button>
                          <button (click)="rejectTask(task)" class="flex-1 py-5 rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all border border-rose-200 dark:border-rose-500/20 active:scale-95">
                            {{ 'common.rejected' | translate }}
                          </button>
                        }
                      </div>
                    }

                    <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/[0.02] rounded-full blur-3xl group-hover:bg-indigo-500/[0.05] transition-all"></div>
                  </div>
                }

                @if (assignedTasks.length === 0) {
                  <div class="text-center py-24 text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                    <div class="text-6xl mb-6 animate-premium-pulse">EMPTY</div>
                    <p class="text-sm font-black uppercase tracking-[0.3em] opacity-40">{{ 'daily_log.no_entries_yet' | translate }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Add New Entry (if day is open and user has permission) -->
            @if (!isDayClosed && canAddEntry) {
              <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none animate-premium-fade">
                <div class="space-y-1 mb-10">
                  <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                    <span class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xl shadow-inner">➕</span>
                    {{ 'daily_log.progress_entry' | translate }}
                  </h2>
                  <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-16 opacity-60">Log New Operational Activity</p>
                </div>

                <form [formGroup]="dailyLogForm" (ngSubmit)="submitDailyLog()" class="space-y-8">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-3">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ 'daily_log.project_item' | translate }}</label>
                      <div class="relative group">
                        <select formControlName="projectItemId" 
                                class="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/50 rounded-[1.5rem] outline-none font-black text-sm text-slate-950 dark:text-white appearance-none cursor-pointer transition-all">
                          <option value="">{{ 'daily_log.select_item' | translate }}</option>
                          @for (item of projectItems; track item.id) {
                            <option [value]="item.id">{{ item.itemName }} ({{ item.unit }})</option>
                          }
                        </select>
                        <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">⌄</div>
                      </div>
                    </div>
                    <div class="space-y-3">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ 'daily_log.quantity' | translate }}</label>
                      <input type="number" formControlName="quantity" min="0"
                             class="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/50 rounded-[1.5rem] outline-none font-black text-sm text-slate-950 dark:text-white placeholder:text-slate-300 transition-all"
                             placeholder="0">
                    </div>
                  </div>
                  
                  <div class="space-y-3">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{{ 'daily_log.notes' | translate }}</label>
                    <textarea formControlName="notes" rows="4"
                              class="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/50 rounded-[1.5rem] outline-none font-black text-sm text-slate-950 dark:text-white resize-none placeholder:text-slate-300 transition-all"
                              [placeholder]="'daily_log.notes_hint' | translate"></textarea>
                  </div>

                  <button type="submit" [disabled]="dailyLogForm.invalid"
                          class="group relative w-full py-6 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 overflow-hidden">
                    <span class="relative z-10">{{ 'daily_log.submit' | translate }}</span>
                    <div class="absolute inset-x-0 bottom-0 h-1 bg-indigo-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  </button>
                </form>
              </div>
            }
          </div>

          <!-- Sidebar -->
          <div class="space-y-8">
            <!-- Day Summary -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none animate-premium-fade" style="animation-delay: 300ms">
               <div class="flex items-center gap-4 mb-8">
                 <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-lg font-black">Σ</div>
                 <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{{ 'daily_log.today_summary' | translate }}</h3>
               </div>
              <div class="space-y-5">
                <div class="flex items-center justify-between p-6 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 transition-all hover:border-indigo-500/20 group">
                   <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">{{ 'daily_log.total_tasks' | translate }}</span>
                  <span class="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{{ assignedTasks.length }}</span>
                </div>
                <div class="flex items-center justify-between p-6 rounded-[1.5rem] bg-emerald-500/[0.03] border border-emerald-500/20 group">
                   <span class="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">{{ 'projects.completed' | translate }}</span>
                  <span class="text-2xl font-black text-emerald-600 tracking-tighter">{{ getTaskCount('Completed') + getTaskCount('Approved') }}</span>
                </div>
                <div class="flex items-center justify-between p-6 rounded-[1.5rem] bg-amber-500/[0.03] border border-amber-500/20 group">
                   <span class="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em]">{{ 'daily_log.work_in_progress' | translate }}</span>
                  <span class="text-2xl font-black text-amber-600 tracking-tighter">{{ getTaskCount('InProgress') }}</span>
                </div>
              </div>
            </div>

            <!-- Close Day Action -->
            @if (!isDayClosed && isToday) {
              <div class="group relative bg-gradient-to-br from-rose-600 to-pink-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-rose-500/20 overflow-hidden animate-premium-fade" style="animation-delay: 350ms">
                 <div class="relative z-10">
                   <h3 class="text-xl font-black uppercase tracking-tighter mb-4">{{ 'daily_log.close_day_title' | translate }}</h3>
                   <p class="text-sm font-medium text-white/80 mb-8 leading-relaxed">{{ 'daily_log.close_day_desc' | translate }}</p>
                   <button (click)="closeDay()" 
                           [disabled]="assignedTasks.length === 0"
                           class="w-full py-5 rounded-2xl bg-white text-rose-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-50 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                      {{ 'daily_log.close_day' | translate }}
                   </button>
                 </div>
                 <div class="absolute -top-10 -left-10 w-40 h-40 bg-white/[0.05] rounded-full blur-3xl"></div>
                 <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-black/[0.1] rounded-full blur-3xl"></div>
              </div>
            }

            <!-- Recent History -->
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/40 dark:shadow-none animate-premium-fade" style="animation-delay: 400ms">
               <div class="flex items-center gap-4 mb-8">
                 <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 flex items-center justify-center text-lg">🕒</div>
                 <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{{ 'daily_log.recent_days' | translate }}</h3>
               </div>
              <div class="space-y-4">
                @for (day of recentDays; track day.date; let i = $index) {
                  <button (click)="selectDate(day.date)" 
                          class="w-full p-5 rounded-[1.5rem] text-left transition-all duration-300 hover:translate-x-2 active:scale-95 group relative overflow-hidden"
                          [style.animation-delay]="(i * 50 + 500) + 'ms'"
                          [ngClass]="isSameDay(day.date, selectedDate) ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-white/5'">
                    <div class="relative z-10 flex items-center justify-between">
                      <div class="space-y-1">
                        <p class="text-sm font-black uppercase tracking-tight">{{ day.date | date:'EEE, MMM d' }}</p>
                        <p class="text-[9px] font-black uppercase tracking-widest opacity-60"
                           [ngClass]="isSameDay(day.date, selectedDate) ? 'text-indigo-100' : 'text-slate-400'">
                          {{ day.taskCount }} {{ 'daily_log.tasks_label' | translate }} · {{ day.isClosed ? ('daily_log.day_locked' | translate) : ('daily_log.day_open' | translate) }}
                        </p>
                      </div>
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" [ngClass]="isSameDay(day.date, selectedDate) ? 'bg-white/20' : 'bg-slate-200 dark:bg-white/5'">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                    </div>
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reopen Modal -->
      @if (showReopenModal) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">{{ 'daily_log.reopen_closed_day' | translate }}</h2>
            <p class="text-sm text-slate-500 mb-8">{{ 'daily_log.reopen_desc' | translate }}</p>
            
            <div class="space-y-6 mb-8">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'daily_log.reopen_reason' | translate }}</label>
                <textarea [(ngModel)]="reopenReason" rows="3"
                          class="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-950 dark:text-white resize-none"
                          [placeholder]="'daily_log.reopen_hint' | translate"></textarea>
              </div>
              
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'daily_log.notify_roles' | translate }}</label>
                <div class="flex flex-wrap gap-2">
                  @for (role of projectRoles; track role.id) {
                    <button (click)="toggleRoleNotification(role.id)"
                            class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all"
                            [ngClass]="selectedNotifyRoles.includes(role.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500'">
                      {{ role.name }}
                    </button>
                  }
                </div>
              </div>
            </div>

            <div class="flex gap-4">
              <button (click)="closeReopenModal()" class="flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                {{ 'common.cancel' | translate }}
              </button>
              <button (click)="confirmReopenDay()" [disabled]="!reopenReason" class="flex-1 py-4 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all disabled:opacity-50">
                {{ 'daily_log.reopen_day' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DailyLogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);

  dailyLogForm: FormGroup;
  projectItems: ProjectItem[] = [];
  assignedTasks: WorkTask[] = [];
  selectedDate = new Date();
  selectedDateString = '';
  isDayClosed = false;

  // Permission flags
  canApprove = false;
  canReopenDay = false;
  canAddEntry = false;

  // Reopen modal
  showReopenModal = false;
  reopenReason = '';
  selectedNotifyRoles: number[] = [];
  projectRoles = [
    { id: 1, name: 'Project Manager' },
    { id: 2, name: 'Site Engineer' },
    { id: 3, name: 'Supervisor' },
    { id: 4, name: 'Quality Control' }
  ];

  // Recent days history
  recentDays: { date: Date; taskCount: number; isClosed: boolean }[] = [];

  get isToday(): boolean {
    return this.isSameDay(this.selectedDate, new Date());
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dailyLogsService: DailyLogsService
  ) {
    this.dailyLogForm = this.fb.group({
      projectItemId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.selectedDateString = this.formatDateForInput(this.selectedDate);
    this.loadData();
    this.loadRecentDays();
    this.checkPermissions();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
        this.loadRecentDays();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    // TODO: Implement Project Items API
    this.projectItems = [];
    this.loadTasksForDate(this.selectedDate);
  }

  loadTasksForDate(date: Date) {
    // Load daily logs from backend for the selected date
    const dateStr = this.formatDateForInput(date);
    this.dailyLogsService.getDailyLogHistory(1).subscribe(logs => {
      // Map daily logs to work tasks
      this.assignedTasks = logs.map(log => ({
        id: log.id,
        projectItemId: log.itemId || 0,
        projectItemName: log.itemName || 'Unknown Task',
        assignedQuantity: log.completionPercentage || 0,
        unit: 'm³',
        status: log.isClosed ? 'Completed' : 'InProgress',
        photos: []
      }));

      // Check if day is closed
      const closedLog = logs.find(l => l.isClosed);
      this.isDayClosed = !!closedLog && date < new Date(new Date().setHours(0, 0, 0, 0)) && !this.isToday;
    });
  }

  loadRecentDays() {
    const today = new Date();
    this.recentDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      this.recentDays.push({
        date: d,
        taskCount: Math.floor(Math.random() * 5) + 1,
        isClosed: i > 0
      });
    }
  }

  checkPermissions() {
    const role = this.authService.getCurrentUser()?.role;
    // In a real app, these would be fetched from the backend based on the user's project-specific permissions
    this.canApprove = role === 'CompanyAdmin' || role === 'SystemAdmin';
    this.canReopenDay = role === 'CompanyAdmin' || role === 'SystemAdmin';
    // All workers can add entries by default; this can be restricted per project role
    this.canAddEntry = role === 'CompanyUser' || role === 'CompanyAdmin' || role === 'SystemAdmin';
  }

  // Date Navigation
  navigateDay(delta: number) {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + delta);
    this.selectedDate = newDate;
    this.selectedDateString = this.formatDateForInput(newDate);
    this.loadTasksForDate(newDate);
  }

  goToToday() {
    this.selectedDate = new Date();
    this.selectedDateString = this.formatDateForInput(this.selectedDate);
    this.loadTasksForDate(this.selectedDate);
  }

  onDateChange() {
    this.selectedDate = new Date(this.selectedDateString);
    this.loadTasksForDate(this.selectedDate);
  }

  selectDate(date: Date) {
    this.selectedDate = date;
    this.selectedDateString = this.formatDateForInput(date);
    this.loadTasksForDate(date);
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.toDateString() === d2.toDateString();
  }

  // Task Actions
  startTask(task: WorkTask) {
    task.status = 'InProgress';
  }

  completeTask(task: WorkTask) {
    task.status = 'Completed';
  }

  approveTask(task: WorkTask) {
    task.status = 'Approved';
  }

  rejectTask(task: WorkTask) {
    task.status = 'Rejected';
  }

  uploadTaskPhoto(task: WorkTask, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        task.photos.push(e.target?.result as string);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  getTaskCount(status: string): number {
    return this.assignedTasks.filter(t => t.status === status).length;
  }

  submitDailyLog() {
    if (this.dailyLogForm.valid) {
      const newTask: WorkTask = {
        id: Date.now(),
        projectItemId: Number(this.dailyLogForm.value.projectItemId),
        projectItemName: this.projectItems.find(i => i.id === Number(this.dailyLogForm.value.projectItemId))?.itemName || 'Unknown',
        assignedQuantity: this.dailyLogForm.value.quantity,
        unit: this.projectItems.find(i => i.id === Number(this.dailyLogForm.value.projectItemId))?.unit || '',
        status: 'Pending',
        notes: this.dailyLogForm.value.notes,
        photos: []
      };
      this.assignedTasks.push(newTask);
      this.dailyLogForm.reset();
    }
  }

  closeDay() {
    if (confirm('Are you sure you want to close this day? This will lock all entries.')) {
      this.isDayClosed = true;
    }
  }

  // Reopen Modal
  openReopenModal() {
    this.showReopenModal = true;
    this.reopenReason = '';
    this.selectedNotifyRoles = [];
  }

  closeReopenModal() {
    this.showReopenModal = false;
  }

  toggleRoleNotification(roleId: number) {
    const idx = this.selectedNotifyRoles.indexOf(roleId);
    if (idx > -1) {
      this.selectedNotifyRoles.splice(idx, 1);
    } else {
      this.selectedNotifyRoles.push(roleId);
    }
  }

  confirmReopenDay() {
    if (this.reopenReason) {
      // In a real app, this would call the backend API
      console.log('Reopening day with reason:', this.reopenReason, 'Notifying roles:', this.selectedNotifyRoles);
      this.isDayClosed = false;
      this.showReopenModal = false;
      alert('Day reopened successfully! Selected roles have been notified.');
    }
  }
}
