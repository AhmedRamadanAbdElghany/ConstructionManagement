import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MockDataService } from '../../../../core/mock/mock-data.service';
import { Project, User, DailyLog, BOQItem } from '../../../../shared/interfaces';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
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
                <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{{ project.name }}</h1>
                <span class="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all"
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
              <button class="px-4 py-2 rounded-xl bg-slate-700/50 text-slate-400 font-medium hover:bg-slate-700 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
              <button class="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all">
                Edit Project
              </button>
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

          <!-- Tabs -->
          <div class="flex space-x-2 mb-6">
            <button 
              (click)="activeTab = 'timeline'"
              [class.bg-cyan-500]="activeTab === 'timeline'"
              [class.text-white]="activeTab === 'timeline'"
              [class.bg-slate-700/50]="activeTab !== 'timeline'"
              [class.text-slate-400]="activeTab !== 'timeline'"
              class="px-6 py-3 rounded-xl text-sm font-medium transition-all">
              {{ 'project_detail.timeline_settings' | translate }}
            </button>
            <button 
              (click)="activeTab = 'team'"
              [class.bg-cyan-500]="activeTab === 'team'"
              [class.text-white]="activeTab === 'team'"
              [class.bg-slate-700/50]="activeTab !== 'team'"
              [class.text-slate-400]="activeTab !== 'team'"
              class="px-6 py-3 rounded-xl text-sm font-medium transition-all">
              {{ 'project_detail.team_management' | translate }}
            </button>
            <button 
              (click)="activeTab = 'history'"
              [class.bg-cyan-500]="activeTab === 'history'"
              [class.text-white]="activeTab === 'history'"
              [class.bg-slate-700/50]="activeTab !== 'history'"
              [class.text-slate-400]="activeTab !== 'history'"
              class="px-6 py-3 rounded-xl text-sm font-medium transition-all">
              {{ 'project_detail.daily_history' | translate }}
            </button>
            <button 
              (click)="activeTab = 'boq'"
              [class.bg-cyan-500]="activeTab === 'boq'"
              [class.text-white]="activeTab === 'boq'"
              [class.bg-slate-700/50]="activeTab !== 'boq'"
              [class.text-slate-400]="activeTab !== 'boq'"
              class="px-6 py-3 rounded-xl text-sm font-medium transition-all">
              BOQ Items
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
                  <div class="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
                    <div>
                      <p class="text-white font-medium">Email Notifications</p>
                      <p class="text-sm text-slate-400">Receive daily progress updates</p>
                    </div>
                    <button class="w-12 h-6 rounded-full bg-cyan-500 relative">
                      <span class="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></span>
                    </button>
                  </div>
                  <div class="flex items-center justify-between p-4 rounded-xl bg-slate-700/30">
                    <div>
                      <p class="text-white font-medium">Auto-close Daily Logs</p>
                      <p class="text-sm text-slate-400">Automatically close logs at midnight</p>
                    </div>
                    <button class="w-12 h-6 rounded-full bg-slate-600 relative">
                      <span class="absolute left-1 top-1 w-4 h-4 rounded-full bg-white"></span>
                    </button>
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
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
              <div class="p-6 border-b border-slate-700/50 flex items-center justify-between">
                <h3 class="text-lg font-bold text-white">Bill of Quantities</h3>
                <button class="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 font-medium hover:bg-cyan-500/30 transition-colors">
                  Add Item
                </button>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left text-slate-400 text-sm bg-slate-800/50">
                      <th class="px-6 py-4 font-medium">Description</th>
                      <th class="px-6 py-4 font-medium">Unit</th>
                      <th class="px-6 py-4 font-medium">Total Qty</th>
                      <th class="px-6 py-4 font-medium">Executed</th>
                      <th class="px-6 py-4 font-medium">Progress</th>
                      <th class="px-6 py-4 font-medium">Rate</th>
                      <th class="px-6 py-4 font-medium">Total Value</th>
                    </tr>
                  </thead>
                  <tbody class="text-white">
                    @for (item of boqItems; track item.id) {
                      <tr class="border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                        <td class="px-6 py-4 font-medium">{{ item.description }}</td>
                        <td class="px-6 py-4 text-slate-400">{{ item.unit }}</td>
                        <td class="px-6 py-4">{{ item.totalQuantity }}</td>
                        <td class="px-6 py-4 text-cyan-400">{{ item.executedQuantity }}</td>
                        <td class="px-6 py-4">
                          <div class="flex items-center space-x-2">
                            <div class="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden max-w-[80px]">
                              <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                   [style.width.%]="(item.executedQuantity / item.totalQuantity) * 100">
                              </div>
                            </div>
                            <span class="text-xs text-slate-400">{{ ((item.executedQuantity / item.totalQuantity) * 100) | number:'1.0-0' }}%</span>
                          </div>
                        </td>
                        <td class="px-6 py-4">{{ item.rate | currency:'USD' }}</td>
                        <td class="px-6 py-4 font-medium text-emerald-400">{{ item.totalQuantity * item.rate | currency:'USD' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
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
  activeTab: 'timeline' | 'team' | 'history' | 'boq' = 'timeline';
  teamMembers: User[] = [];
  dailyLogs: DailyLog[] = [];
  boqItems: BOQItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private mockDataService: MockDataService,
    private authService: AuthService
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
    }
  }

  calculateDuration(): number {
    if (!this.project) return 0;
    const start = new Date(this.project.startDate);
    const end = this.project.endDate ? new Date(this.project.endDate) : new Date();
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  impersonate(user: User) {
    if (confirm(`Impersonate ${user.fullName}? This will change your view to their role.`)) {
      this.authService.switchUserRole(user.role);
      alert(`Now viewing as ${user.role}. The sidebar will update to show ${user.fullName}'s permissions.`);
    }
  }
}
