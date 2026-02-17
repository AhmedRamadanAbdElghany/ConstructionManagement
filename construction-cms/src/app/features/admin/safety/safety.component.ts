import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafetyService, SafetyIncident, SafetyTraining, SafetyDashboard } from '../../../core/services/safety.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-safety',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{{ 'safety.title' | translate }}</h1>
            <div class="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl w-fit">
              <button (click)="activeTab = 'dashboard'" 
                      [class.bg-white]="activeTab === 'dashboard'" 
                      [class.shadow-sm]="activeTab === 'dashboard'"
                      [class.text-slate-900]="activeTab === 'dashboard'"
                      [class.dark:bg-slate-700]="activeTab === 'dashboard'"
                      [class.dark:text-white]="activeTab === 'dashboard'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                  {{ 'safety.tabs.overview' | translate }}
              </button>
              <button (click)="activeTab = 'incidents'" 
                      [class.bg-white]="activeTab === 'incidents'" 
                      [class.shadow-sm]="activeTab === 'incidents'"
                      [class.text-slate-900]="activeTab === 'incidents'"
                      [class.dark:bg-slate-700]="activeTab === 'incidents'"
                      [class.dark:text-white]="activeTab === 'incidents'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                  {{ 'safety.tabs.incidents' | translate }}
              </button>
              <button (click)="activeTab = 'inspections'" 
                      [class.bg-white]="activeTab === 'inspections'" 
                      [class.shadow-sm]="activeTab === 'inspections'"
                      [class.text-slate-900]="activeTab === 'inspections'"
                      [class.dark:bg-slate-700]="activeTab === 'inspections'"
                      [class.dark:text-white]="activeTab === 'inspections'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                  {{ 'safety.tabs.inspections' | translate }}
              </button>
              <button (click)="activeTab = 'trainings'" 
                      [class.bg-white]="activeTab === 'trainings'" 
                      [class.shadow-sm]="activeTab === 'trainings'"
                      [class.text-slate-900]="activeTab === 'trainings'"
                      [class.dark:bg-slate-700]="activeTab === 'trainings'"
                      [class.dark:text-white]="activeTab === 'trainings'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                  {{ 'safety.tabs.trainings' | translate }}
              </button>
            </div>
          </div>

          <button (click)="openIncidentModal()"
                  class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-rose-500 to-red-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            {{ 'safety.incident.report_new' | translate }}
          </button>
        </div>

        <!-- Dashboard Tab -->
        @if (activeTab === 'dashboard') {
        <div class="space-y-8">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <span class="text-[10px] font-black text-rose-500 uppercase tracking-widest">{{ 'common.this_month' | translate }}</span>
              </div>
              <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ dashboard?.incidentsThisMonth || 0 }}</h3>
              <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{{ 'safety.stats.incidents_this_month' | translate }}</p>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">{{ 'safety.stats.pass_rate' | translate }}</span>
              </div>
              <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ dashboard?.averagePassRate || 0 }}%</h3>
              <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{{ 'safety.safety_inspections' | translate }}</p>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{{ 'common.completed' | translate }}</span>
              </div>
              <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ dashboard?.trainingsCompleted || 0 }}</h3>
              <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{{ 'safety.stats.trainings_completed' | translate }}</p>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <span class="text-[10px] font-black text-violet-500 uppercase tracking-widest">{{ 'common.upcoming' | translate }}</span>
              </div>
              <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ dashboard?.upcomingTrainings || 0 }}</h3>
              <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{{ 'safety.stats.upcoming_trainings' | translate }}</p>
            </div>
          </div>

          <!-- Recent Incidents & Upcoming Trainings -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Recent Incidents -->
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <div class="flex items-center justify-between mb-8">
                <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'safety.recent_incidents' | translate }}</h3>
                <button (click)="activeTab = 'incidents'" class="text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600">{{ 'common.view_all' | translate }} →</button>
              </div>
              <div class="space-y-4">
                @for (incident of dashboard?.recentIncidents; track incident.id) {
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <span class="px-2 py-0.5 rounded-md text-[8px] font-black uppercase" 
                              [class.bg-rose-500/10]="incident.severityName === 'High'"
                              [class.text-rose-500]="incident.severityName === 'High'"
                              [class.bg-amber-500/10]="incident.severityName === 'Medium'"
                              [class.text-amber-500]="incident.severityName === 'Medium'"
                              [class.bg-emerald-500/10]="incident.severityName === 'Low'"
                              [class.text-emerald-500]="incident.severityName === 'Low'">
                          {{ incident.severityName }}
                        </span>
                        <span class="text-[10px] text-slate-400">{{ incident.incidentDate | date:'shortDate' }}</span>
                      </div>
                      <h4 class="font-bold text-slate-900 dark:text-white">{{ incident.title }}</h4>
                      <p class="text-[10px] text-slate-500 mt-1">{{ incident.location || ('safety.incident.location' | translate) }}</p>
                    </div>
                    <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[8px] font-black text-slate-500 uppercase">
                      {{ incident.investigationStatusName }}
                    </span>
                  </div>
                </div>
                }
                @if (!dashboard?.recentIncidents?.length) {
                <p class="text-[10px] text-slate-400 italic text-center py-8">{{ 'safety.no_incidents' | translate }}</p>
                }
              </div>
            </div>

            <!-- Upcoming Trainings -->
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
              <div class="flex items-center justify-between mb-8">
                <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'safety.upcoming_trainings' | translate }}</h3>
                <button (click)="activeTab = 'trainings'" class="text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600">{{ 'common.view_all' | translate }} →</button>
              </div>
              <div class="space-y-4">
                @for (training of dashboard?.upcomingTrainingsList; track training.id) {
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                  <div class="flex items-start justify-between">
                    <div>
                      <h4 class="font-bold text-slate-900 dark:text-white">{{ training.title }}</h4>
                      <p class="text-[10px] text-slate-500 mt-1">{{ training.trainingType }} • {{ training.durationMinutes }} min</p>
                      <p class="text-[10px] text-rose-500 mt-1 font-medium">{{ training.scheduledDate | date:'mediumDate' }}</p>
                    </div>
                    <span class="px-2 py-0.5 rounded-md bg-violet-500/10 text-[8px] font-black text-violet-500 uppercase">
                      {{ training.requiresCertification ? ('common.certification' | translate) : ('common.training' | translate) }}
                    </span>
                  </div>
                </div>
                }
                @if (!dashboard?.upcomingTrainingsList?.length) {
                <p class="text-[10px] text-slate-400 italic text-center py-8">{{ 'safety.no_trainings' | translate }}</p>
                }
              </div>
            </div>
          </div>
        </div>
        }

        <!-- Incidents Tab -->
        @if (activeTab === 'incidents') {
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Incident Reports</h3>
            <button (click)="openIncidentModal()" class="px-6 py-3 rounded-2xl bg-rose-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-105 transition-all">
              + New Incident
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-100 dark:border-white/5">
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Date</th>
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Title</th>
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Severity</th>
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Location</th>
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (incident of incidents; track incident.id) {
                <tr class="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                  <td class="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{{ incident.incidentDate | date:'mediumDate' }}</td>
                  <td class="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{{ incident.title }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-0.5 rounded-md text-[8px] font-black uppercase" 
                          [class.bg-rose-500/10]="incident.severityName === 'High'"
                          [class.text-rose-500]="incident.severityName === 'High'"
                          [class.bg-amber-500/10]="incident.severityName === 'Medium'"
                          [class.text-amber-500]="incident.severityName === 'Medium'"
                          [class.bg-emerald-500/10]="incident.severityName === 'Low'"
                          [class.text-emerald-500]="incident.severityName === 'Low'">
                      {{ incident.severityName }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{{ incident.location || '-' }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[8px] font-black text-slate-500 uppercase">
                      {{ incident.investigationStatusName }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <button (click)="viewIncident(incident)" class="text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600">View</button>
                  </td>
                </tr>
                }
                @if (!incidents.length) {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center">
                    <p class="text-[10px] text-slate-400 italic">No incidents reported yet</p>
                  </td>
                </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        }

        <!-- Trainings Tab -->
        @if (activeTab === 'trainings') {
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Safety Training Records</h3>
            <button class="px-6 py-3 rounded-2xl bg-violet-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:scale-105 transition-all">
              + Schedule Training
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (training of trainings; track training.id) {
            <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 hover:border-violet-500/50 transition-all">
              <div class="flex items-start justify-between mb-4">
                <span class="px-2 py-0.5 rounded-md text-[8px] font-black uppercase" 
                      [class.bg-violet-500/10]="training.statusName === 'Scheduled'"
                      [class.text-violet-500]="training.statusName === 'Scheduled'"
                      [class.bg-emerald-500/10]="training.statusName === 'Completed'"
                      [class.text-emerald-500]="training.statusName === 'Completed'"
                      [class.bg-amber-500/10]="training.statusName === 'InProgress'"
                      [class.text-amber-500]="training.statusName === 'InProgress'">
                  {{ training.statusName }}
                </span>
                <span class="text-[8px] text-slate-400">{{ training.durationMinutes }} min</span>
              </div>
              <h4 class="font-bold text-slate-900 dark:text-white mb-2">{{ training.title }}</h4>
              <p class="text-[10px] text-slate-500 mb-4">{{ training.description || training.trainingType }}</p>
              <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <div class="text-[10px] text-slate-400">
                  <p>{{ training.scheduledDate | date:'mediumDate' }}</p>
                  @if (training.certificationExpiryDate) {
                  <p class="text-amber-500">Expires: {{ training.certificationExpiryDate | date:'mediumDate' }}</p>
                  }
                </div>
                <span class="px-2 py-0.5 rounded-md bg-violet-500/10 text-[8px] font-black text-violet-500 uppercase">
                  {{ training.requiresCertification ? 'Certified' : 'Training' }}
                </span>
              </div>
            </div>
            }
            @if (!trainings.length) {
            <div class="col-span-3 py-12 text-center">
              <p class="text-[10px] text-slate-400 italic">No training records found</p>
            </div>
            }
          </div>
        </div>
        }

        <!-- Inspections Tab -->
        @if (activeTab === 'inspections') {
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Safety Inspections</h3>
            <button class="px-6 py-3 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 transition-all">
              + New Inspection
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Placeholder for inspections -->
            <div class="col-span-3 py-12 text-center">
              <p class="text-[10px] text-slate-400 italic">No inspections recorded yet</p>
            </div>
          </div>
        </div>
        }

        <!-- Incident Modal -->
        @if (showIncidentModal) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden">
            <button (click)="showIncidentModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
            
            <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Report New Incident</h2>
            
            <div class="space-y-6">
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Incident Title</label>
                <input type="text" [(ngModel)]="incidentForm.title" placeholder="Brief description of incident"
                       class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-rose-500/10">
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Severity</label>
                  <select [(ngModel)]="incidentForm.severity" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                    <option [value]="1">Low</option>
                    <option [value]="2">Medium</option>
                    <option [value]="3">High</option>
                    <option [value]="4">Critical</option>
                  </select>
                </div>
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Incident Date</label>
                  <input type="date" [(ngModel)]="incidentForm.incidentDate"
                         class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                </div>
              </div>
              
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Location</label>
                <input type="text" [(ngModel)]="incidentForm.location" placeholder="Where did it happen?"
                       class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
              </div>
              
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                <textarea [(ngModel)]="incidentForm.description" rows="3" placeholder="Provide detailed description..."
                          class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none resize-none"></textarea>
              </div>
              
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="incidentForm.requiredMedicalAttention" class="w-5 h-5 rounded accent-rose-500">
                  <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Required Medical Attention</span>
                </label>
              </div>
            </div>
            
            <div class="flex gap-4 mt-8">
              <button (click)="showIncidentModal = false" class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest">
                Cancel
              </button>
              <button (click)="submitIncident()" class="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20">
                Submit Report
              </button>
            </div>
          </div>
        </div>
        }
      </div>
    </div>
  `
})
export class SafetyComponent implements OnInit {
  activeTab: 'dashboard' | 'incidents' | 'inspections' | 'trainings' = 'dashboard';
  dashboard?: SafetyDashboard;
  incidents: SafetyIncident[] = [];
  trainings: SafetyTraining[] = [];

  showIncidentModal = false;
  incidentForm: any = {
    title: '',
    severity: 1,
    incidentDate: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    requiredMedicalAttention: false,
    involvedPersons: [],
    witnesses: []
  };

  constructor(private safetyService: SafetyService) { }

  ngOnInit() {
    this.loadDashboard();
    this.loadIncidents();
    this.loadTrainings();
  }

  loadDashboard() {
    this.safetyService.getDashboardStats().subscribe(d => this.dashboard = d);
  }

  loadIncidents() {
    this.safetyService.getIncidents().subscribe(i => this.incidents = i);
  }

  loadTrainings() {
    this.safetyService.getTrainings().subscribe(t => this.trainings = t);
  }

  openIncidentModal() {
    this.incidentForm = {
      title: '',
      severity: 1,
      incidentDate: new Date().toISOString().split('T')[0],
      location: '',
      description: '',
      requiredMedicalAttention: false,
      involvedPersons: [],
      witnesses: []
    };
    this.showIncidentModal = true;
  }

  viewIncident(incident: SafetyIncident) {
    console.log('View incident:', incident);
  }

  submitIncident() {
    if (this.incidentForm.title) {
      this.safetyService.createIncident(this.incidentForm).subscribe(newIncident => {
        this.incidents.unshift(newIncident);
        this.showIncidentModal = false;
        this.loadDashboard();
      });
    }
  }
}
