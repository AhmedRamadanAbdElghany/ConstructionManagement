import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    EscalationService,
    ProjectItemEscalation,
    EscalationType,
    EscalationSeverity,
    EscalationStatus,
    CreateEscalationRequest
} from '../../../core/services/escalation.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
    selector: 'app-escalation-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              {{ 'escalations.title' | translate }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
              {{ 'escalations.subtitle' | translate }}
            </p>
          </div>
          <button (click)="openCreateModal()" 
            class="px-6 py-3 rounded-[1.5rem] bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_-5px_rgba(239,68,68,0.4)] hover:scale-[1.05] hover:shadow-[0_20px_40px_-5px_rgba(239,68,68,0.5)] active:scale-95 transition-all flex items-center group">
            <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mr-3 group-hover:rotate-90 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            {{ 'escalations.new_escalation' | translate }}
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{{ 'escalations.total' | translate }}</p>
                <p class="text-3xl font-black text-slate-900 dark:text-white mt-1">{{ stats.total }}</p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{{ 'escalations.open' | translate }}</p>
                <p class="text-3xl font-black text-red-600 mt-1">{{ stats.open }}</p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{{ 'escalations.in_progress' | translate }}</p>
                <p class="text-3xl font-black text-blue-600 mt-1">{{ stats.inProgress }}</p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{{ 'escalations.critical' | translate }}</p>
                <p class="text-3xl font-black text-orange-600 mt-1">{{ stats.critical }}</p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{{ 'escalations.resolved' | translate }}</p>
                <p class="text-3xl font-black text-green-600 mt-1">{{ stats.resolved }}</p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div class="flex items-center space-x-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] p-2 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <button (click)="filterStatus = null" 
              [class.bg-gradient-to-r]="filterStatus === null"
              [class.from-cyan-600]="filterStatus === null"
              [class.to-indigo-700]="filterStatus === null"
              [class.text-white]="filterStatus === null"
              [class.text-slate-400]="filterStatus !== null"
              class="px-5 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all">
              {{ 'escalations.all' | translate }}
            </button>
            <button (click)="filterStatus = EscalationStatus.Open" 
              [class.bg-gradient-to-r]="filterStatus === EscalationStatus.Open"
              [class.from-red-600]="filterStatus === EscalationStatus.Open"
              [class.to-rose-700]="filterStatus === EscalationStatus.Open"
              [class.text-white]="filterStatus === EscalationStatus.Open"
              [class.text-slate-400]="filterStatus !== EscalationStatus.Open"
              class="px-5 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all">
              {{ 'escalations.open' | translate }}
            </button>
            <button (click)="filterStatus = EscalationStatus.InProgress" 
              [class.bg-gradient-to-r]="filterStatus === EscalationStatus.InProgress"
              [class.from-blue-600]="filterStatus === EscalationStatus.InProgress"
              [class.to-indigo-700]="filterStatus === EscalationStatus.InProgress"
              [class.text-white]="filterStatus === EscalationStatus.InProgress"
              [class.text-slate-400]="filterStatus !== EscalationStatus.InProgress"
              class="px-5 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all">
              {{ 'escalations.in_progress' | translate }}
            </button>
            <button (click)="filterStatus = EscalationStatus.Resolved" 
              [class.bg-gradient-to-r]="filterStatus === EscalationStatus.Resolved"
              [class.from-green-600]="filterStatus === EscalationStatus.Resolved"
              [class.to-emerald-700]="filterStatus === EscalationStatus.Resolved"
              [class.text-white]="filterStatus === EscalationStatus.Resolved"
              [class.text-slate-400]="filterStatus !== EscalationStatus.Resolved"
              class="px-5 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all">
              {{ 'escalations.resolved' | translate }}
            </button>
          </div>

          <div class="flex items-center space-x-3">
            <div class="relative">
              <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()"
                [placeholder]="'escalations.search_placeholder' | translate"
                class="w-64 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all">
              <svg class="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Escalations List -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'escalations.escalation_id' | translate }}</th>
                  <th class="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'escalations.title' | translate }}</th>
                  <th class="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'escalations.type' | translate }}</th>
                  <th class="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'escalations.severity' | translate }}</th>
                  <th class="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'escalations.status' | translate }}</th>
                  <th class="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'escalations.assigned_to' | translate }}</th>
                  <th class="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'escalations.created' | translate }}</th>
                  <th class="px-6 py-4 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ 'escalations.actions' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-white/5">
                <tr *ngFor="let escalation of filteredEscalations" 
                  class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td class="px-6 py-4">
                    <span class="text-sm font-bold text-slate-900 dark:text-white">#{{ escalation.id }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <div>
                      <p class="text-sm font-bold text-slate-900 dark:text-white">{{ escalation.title }}</p>
                      <p *ngIf="escalation.description" class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{{ escalation.description }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="getTypeClass(escalation.escalationType)" class="px-3 py-1 rounded-lg text-xs font-bold">
                      {{ getTypeLabel(escalation.escalationType) }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="getSeverityClass(escalation.severity)" class="px-3 py-1 rounded-lg text-xs font-bold">
                      {{ getSeverityLabel(escalation.severity) }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="getStatusClass(escalation.status)" class="px-3 py-1 rounded-lg text-xs font-bold">
                      {{ getStatusLabel(escalation.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div *ngIf="escalation.assignedToUser" class="flex items-center space-x-2">
                      <div class="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {{ getInitials(escalation.assignedToUser) }}
                      </div>
                      <span class="text-sm text-slate-900 dark:text-white">{{ escalation.assignedToUser?.name }}</span>
                    </div>
                    <span *ngIf="!escalation.assignedToUser" class="text-sm text-slate-400 dark:text-slate-500">-</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm text-slate-500 dark:text-slate-400">{{ escalation.createdAt | date:'shortDate' }}</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end space-x-2">
                      <button *ngIf="escalation.status === EscalationStatus.Open" (click)="acknowledgeEscalation(escalation)" 
                        class="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
                        [title]="'escalations.acknowledge' | translate">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </button>
                      <button *ngIf="escalation.status === EscalationStatus.Acknowledged" (click)="startProgress(escalation)" 
                        class="p-2 rounded-lg bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                        [title]="'escalations.start_progress' | translate">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        </svg>
                      </button>
                      <button *ngIf="escalation.status === EscalationStatus.InProgress" (click)="openResolveModal(escalation)" 
                        class="p-2 rounded-lg bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-700 transition-colors"
                        [title]="'escalations.resolve' | translate">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </button>
                      <button (click)="viewEscalation(escalation)" 
                        class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        [title]="'escalations.view_details' | translate">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="filteredEscalations.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <p class="text-slate-400 dark:text-slate-500 text-sm">{{ 'escalations.no_escalations' | translate }}</p>
          </div>
        </div>

        <!-- Resolve Modal -->
        <div *ngIf="showResolveModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md">
            <div class="p-6 border-b border-slate-200 dark:border-white/5">
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ 'escalations.resolve_escalation' | translate }}</h2>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'escalations.resolution' | translate }} *</label>
                <textarea [(ngModel)]="resolutionData.resolution" rows="3"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"></textarea>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'escalations.resolution_notes' | translate }}</label>
                <textarea [(ngModel)]="resolutionData.resolutionNotes" rows="2"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"></textarea>
              </div>
            </div>
            <div class="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end space-x-3">
              <button (click)="closeResolveModal()" class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {{ 'common.cancel' | translate }}
              </button>
              <button (click)="resolveEscalation()" [disabled]="!resolutionData.resolution"
                class="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                {{ 'escalations.resolve' | translate }}
              </button>
            </div>
          </div>
        </div>

        <!-- Create Modal -->
        <div *ngIf="showCreateModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-200 dark:border-white/5">
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ 'escalations.create_escalation' | translate }}</h2>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'escalations.title' | translate }} *</label>
                <input type="text" [(ngModel)]="newEscalation.title" 
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'escalations.description' | translate }}</label>
                <textarea [(ngModel)]="newEscalation.description" rows="3"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'escalations.type' | translate }}</label>
                  <select [(ngModel)]="newEscalation.escalationType" 
                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                    <option [ngValue]="0">Pre-Start Not Confirmed</option>
                    <option [ngValue]="1">Materials Not Ready</option>
                    <option [ngValue]="2">Forced Start Required</option>
                    <option [ngValue]="3">Issue During Execution</option>
                    <option [ngValue]="4">No Start Today</option>
                    <option [ngValue]="5">Delay Predicted</option>
                    <option [ngValue]="6">Quality Issue</option>
                    <option [ngValue]="7">Safety Concern</option>
                    <option [ngValue]="8">Resource Conflict</option>
                    </select>
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{{ 'escalations.severity' | translate }}</label>
                  <select [(ngModel)]="newEscalation.severity" 
                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                    <option [ngValue]="0">Low</option>
                    <option [ngValue]="1">Medium</option>
                    <option [ngValue]="2">High</option>
                    <option [ngValue]="3">Critical</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end space-x-3">
              <button (click)="closeCreateModal()" class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {{ 'common.cancel' | translate }}
              </button>
              <button (click)="createEscalation()" [disabled]="!newEscalation.title"
                class="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                {{ 'escalations.create' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EscalationDashboardComponent implements OnInit {
    private escalationService = inject(EscalationService);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);

    escalations: ProjectItemEscalation[] = [];
    filteredEscalations: ProjectItemEscalation[] = [];
    searchTerm = '';
    filterStatus: EscalationStatus | null = null;

    showResolveModal = false;
    showCreateModal = false;
    selectedEscalation: ProjectItemEscalation | null = null;
    resolutionData = {
        resolution: '',
        resolutionNotes: ''
    };

    newEscalation = {
        title: '',
        description: '',
        escalationType: EscalationType.IssueDuringExecution,
        severity: EscalationSeverity.Medium,
        projectId: 0
    };

    stats = {
        total: 0,
        open: 0,
        inProgress: 0,
        critical: 0,
        resolved: 0
    };

    EscalationStatus = EscalationStatus;
    EscalationType = EscalationType;
    EscalationSeverity = EscalationSeverity;

    ngOnInit(): void {
        this.loadEscalations();
    }

    loadEscalations(): void {
        this.escalationService.getMyEscalations()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (escalations) => {
                    this.escalations = escalations;
                    this.applyFilters();
                    this.calculateStats();
                },
                error: (error) => {
                    console.error('Error loading escalations:', error);
                }
            });
    }

    applyFilters(): void {
        let filtered = [...this.escalations];

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(e =>
                e.title.toLowerCase().includes(term) ||
                (e.description?.toLowerCase().includes(term) ?? false)
            );
        }

        if (this.filterStatus !== null) {
            filtered = filtered.filter(e => e.status === this.filterStatus);
        }

        this.filteredEscalations = filtered;
    }

    calculateStats(): void {
        this.stats.total = this.escalations.length;
        this.stats.open = this.escalations.filter(e => e.status === EscalationStatus.Open || e.status === EscalationStatus.Acknowledged).length;
        this.stats.inProgress = this.escalations.filter(e => e.status === EscalationStatus.InProgress).length;
        this.stats.critical = this.escalations.filter(e => e.severity === EscalationSeverity.Critical && e.status !== EscalationStatus.Resolved && e.status !== EscalationStatus.Closed).length;
        this.stats.resolved = this.escalations.filter(e => e.status === EscalationStatus.Resolved || e.status === EscalationStatus.Closed).length;
    }

    // Actions
    acknowledgeEscalation(escalation: ProjectItemEscalation): void {
        this.escalationService.acknowledge(escalation.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.loadEscalations();
                },
                error: (error) => {
                    console.error('Error acknowledging escalation:', error);
                }
            });
    }

    startProgress(escalation: ProjectItemEscalation): void {
        this.escalationService.startProgress(escalation.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.loadEscalations();
                },
                error: (error) => {
                    console.error('Error starting progress:', error);
                }
            });
    }

    openResolveModal(escalation: ProjectItemEscalation): void {
        this.selectedEscalation = escalation;
        this.resolutionData = {
            resolution: '',
            resolutionNotes: ''
        };
        this.showResolveModal = true;
    }

    closeResolveModal(): void {
        this.showResolveModal = false;
        this.selectedEscalation = null;
    }

    resolveEscalation(): void {
        if (!this.selectedEscalation) return;

        this.escalationService.resolve(this.selectedEscalation.id, this.resolutionData)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.closeResolveModal();
                    this.loadEscalations();
                },
                error: (error) => {
                    console.error('Error resolving escalation:', error);
                }
            });
    }

    viewEscalation(escalation: ProjectItemEscalation): void {
        this.router.navigate(['/escalations', escalation.id]);
    }

    openCreateModal(): void {
        this.showCreateModal = true;
    }

    closeCreateModal(): void {
        this.showCreateModal = false;
        this.newEscalation = {
            title: '',
            description: '',
            escalationType: EscalationType.IssueDuringExecution,
            severity: EscalationSeverity.Medium,
            projectId: 0
        };
    }

    createEscalation(): void {
        // This would need project context - for now just close modal
        this.closeCreateModal();
    }

    // Helper methods
    getTypeLabel(type: EscalationType): string {
        return this.escalationService.getEscalationTypeLabel(type);
    }

    getTypeClass(type: EscalationType): string {
        return this.escalationService.getEscalationTypeColor(type);
    }

    getSeverityLabel(severity: EscalationSeverity): string {
        return this.escalationService.getSeverityLabel(severity);
    }

    getSeverityClass(severity: EscalationSeverity): string {
        return this.escalationService.getSeverityColor(severity);
    }

    getStatusLabel(status: EscalationStatus): string {
        return this.escalationService.getStatusLabel(status);
    }

    getStatusClass(status: EscalationStatus): string {
        return this.escalationService.getStatusColor(status);
    }

    getInitials(user: any): string {
        if (!user) return '?';
        const name = user.name || user.fullName || user.userName || '';
        return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
}
