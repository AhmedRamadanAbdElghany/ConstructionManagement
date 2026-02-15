import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SubcontractorService, SubcontractorRating, CreateRatingRequest, RatingSummaryDto } from '../../../../core/services/subcontractor.service';

@Component({
  selector: 'app-subcontractor-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Subcontractor Ratings</h1>
            <div class="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl w-fit">
              <button (click)="activeTab = 'all'"
                      [class.bg-white]="activeTab === 'all'"
                      [class.shadow-sm]="activeTab === 'all'"
                      [class.text-slate-900]="activeTab === 'all'"
                      [class.dark:bg-slate-700]="activeTab === 'all'"
                      [class.dark:text-white]="activeTab === 'all'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                All Ratings
              </button>
              <button (click)="activeTab = 'pending'"
                      [class.bg-white]="activeTab === 'pending'"
                      [class.shadow-sm]="activeTab === 'pending'"
                      [class.text-slate-900]="activeTab === 'pending'"
                      [class.dark:bg-slate-700]="activeTab === 'pending'"
                      [class.dark:text-white]="activeTab === 'pending'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                Pending
              </button>
              <button (click)="activeTab = 'finalized'"
                      [class.bg-white]="activeTab === 'finalized'"
                      [class.shadow-sm]="activeTab === 'finalized'"
                      [class.text-slate-900]="activeTab === 'finalized'"
                      [class.dark:bg-slate-700]="activeTab === 'finalized'"
                      [class.dark:text-white]="activeTab === 'finalized'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                Finalized
              </button>
            </div>
          </div>

          <button (click)="openCreateModal()"
                  class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
            New Rating
          </button>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </div>
              <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">Average</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ summary ? summary.averageRating.toFixed(2) : '0.00' }}</h3>
            <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Overall Rating</p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Total</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ summary?.totalRatings || 0 }}</h3>
            <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Ratings</p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span class="text-[10px] font-black text-violet-500 uppercase tracking-widest">Grade A</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ getGradeCount('A') }}</h3>
            <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Excellent</p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <span class="text-[10px] font-black text-rose-500 uppercase tracking-widest">Grade D</span>
            </div>
            <h3 class="text-4xl font-black text-slate-900 dark:text-white">{{ getGradeCount('D') }}</h3>
            <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Needs Improvement</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Search</label>
              <input type="text" [(ngModel)]="searchTerm" placeholder="Search ratings..."
                     class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-amber-500/10">
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subcontractor</label>
              <select [(ngModel)]="filterSubcontractor" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                <option value="">All Subcontractors</option>
                <option *ngFor="let sub of subcontractors" [value]="sub.id">{{ sub.name }}</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Grade</label>
              <select [(ngModel)]="filterGrade" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                <option value="">All Grades</option>
                <option value="A">A - Excellent</option>
                <option value="B">B - Good</option>
                <option value="C">C - Average</option>
                <option value="D">D - Poor</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status</label>
              <select [(ngModel)]="filterStatus" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                <option value="">All Status</option>
                <option value="true">Finalized</option>
                <option value="false">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Ratings List -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
          <div *ngIf="isLoading" class="flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
          <div *ngIf="!isLoading && filteredRatings.length === 0" class="text-center py-20">
            <svg class="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
            <p class="text-sm text-slate-500 dark:text-slate-400">No ratings found</p>
          </div>
          <div *ngIf="!isLoading && filteredRatings.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let rating of filteredRatings" class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 hover:border-amber-500/50 transition-all">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h4 class="font-bold text-slate-900 dark:text-white text-lg">{{ rating.subcontractorName || 'Unknown' }}</h4>
                  <p class="text-[10px] text-slate-500 mt-1">By {{ rating.evaluatorName }}</p>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <span class="text-3xl font-black" [class.text-emerald-500]="rating.ratingGrade === 'A'" [class.text-blue-500]="rating.ratingGrade === 'B'" [class.text-amber-500]="rating.ratingGrade === 'C'" [class.text-rose-500]="rating.ratingGrade === 'D'">
                    {{ rating.ratingGrade }}
                  </span>
                  <span class="text-[8px] text-slate-400">{{ formatDate(rating.evaluationDate) }}</span>
                </div>
              </div>

              <div class="space-y-3 mb-4">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] text-slate-500">Quality of Work</span>
                  <div class="flex items-center gap-2">
                    <div class="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-amber-500 rounded-full" [style.width.%]="rating.qualityOfWork * 20"></div>
                    </div>
                    <span class="text-xs font-black text-slate-900 dark:text-white">{{ rating.qualityOfWork }}/5</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] text-slate-500">Timeliness</span>
                  <div class="flex items-center gap-2">
                    <div class="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-amber-500 rounded-full" [style.width.%]="rating.timeliness * 20"></div>
                    </div>
                    <span class="text-xs font-black text-slate-900 dark:text-white">{{ rating.timeliness }}/5</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] text-slate-500">Communication</span>
                  <div class="flex items-center gap-2">
                    <div class="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-amber-500 rounded-full" [style.width.%]="rating.communication * 20"></div>
                    </div>
                    <span class="text-xs font-black text-slate-900 dark:text-white">{{ rating.communication }}/5</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] text-slate-500">Professionalism</span>
                  <div class="flex items-center gap-2">
                    <div class="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-amber-500 rounded-full" [style.width.%]="rating.professionalism * 20"></div>
                    </div>
                    <span class="text-xs font-black text-slate-900 dark:text-white">{{ rating.professionalism }}/5</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] text-slate-500">Safety Compliance</span>
                  <div class="flex items-center gap-2">
                    <div class="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-amber-500 rounded-full" [style.width.%]="rating.safetyCompliance * 20"></div>
                    </div>
                    <span class="text-xs font-black text-slate-900 dark:text-white">{{ rating.safetyCompliance }}/5</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] text-slate-500">Budget Adherence</span>
                  <div class="flex items-center gap-2">
                    <div class="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-amber-500 rounded-full" [style.width.%]="rating.budgetAdherence * 20"></div>
                    </div>
                    <span class="text-xs font-black text-slate-900 dark:text-white">{{ rating.budgetAdherence }}/5</span>
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t border-slate-100 dark:border-white/5">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-black text-slate-900 dark:text-white">Overall Rating</span>
                  <span class="text-2xl font-black text-amber-500">{{ rating.overallRating.toFixed(2) }}/5</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md text-[8px] font-black uppercase"
                        [class.bg-emerald-500/10]="rating.isFinalized"
                        [class.text-emerald-500]="rating.isFinalized"
                        [class.bg-amber-500/10]="!rating.isFinalized"
                        [class.text-amber-500]="!rating.isFinalized">
                    {{ rating.isFinalized ? 'Finalized' : 'Pending' }}
                  </span>
                  <div class="flex gap-2">
                    <button (click)="viewRating(rating)" class="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                      View
                    </button>
                    <button *ngIf="!rating.isFinalized" (click)="finalizeRating(rating)" class="px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors">
                      Finalize
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Create Rating Modal -->
        <div *ngIf="showCreateModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button (click)="closeCreateModal()" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-2xl">&times;</button>

            <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">New Rating</h2>

            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subcontractor *</label>
                  <select [(ngModel)]="ratingForm.subcontractorId" class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none">
                    <option value="">Select Subcontractor</option>
                    <option *ngFor="let sub of subcontractors" [value]="sub.id">{{ sub.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Evaluator Name *</label>
                  <input type="text" [(ngModel)]="ratingForm.evaluatorName" placeholder="Your name"
                         class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-amber-500/10">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Quality of Work (1-5) *</label>
                  <input type="number" [(ngModel)]="ratingForm.qualityOfWork" min="1" max="5" step="0.1"
                         class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-amber-500/10">
                </div>
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Timeliness (1-5) *</label>
                  <input type="number" [(ngModel)]="ratingForm.timeliness" min="1" max="5" step="0.1"
                         class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-amber-500/10">
                </div>
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Communication (1-5) *</label>
                  <input type="number" [(ngModel)]="ratingForm.communication" min="1" max="5" step="0.1"
                         class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-amber-500/10">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Professionalism (1-5) *</label>
                  <input type="number" [(ngModel)]="ratingForm.professionalism" min="1" max="5" step="0.1"
                         class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-amber-500/10">
                </div>
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Safety Compliance (1-5) *</label>
                  <input type="number" [(ngModel)]="ratingForm.safetyCompliance" min="1" max="5" step="0.1"
                         class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-amber-500/10">
                </div>
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Budget Adherence (1-5) *</label>
                  <input type="number" [(ngModel)]="ratingForm.budgetAdherence" min="1" max="5" step="0.1"
                         class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-amber-500/10">
                </div>
              </div>

              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Strengths</label>
                <textarea [(ngModel)]="ratingForm.strengths" rows="2" placeholder="What did they do well?"
                          class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none resize-none"></textarea>
              </div>

              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Weaknesses</label>
                <textarea [(ngModel)]="ratingForm.weaknesses" rows="2" placeholder="Areas for improvement?"
                          class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none resize-none"></textarea>
              </div>

              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Recommendations</label>
                <textarea [(ngModel)]="ratingForm.recommendations" rows="2" placeholder="Suggestions for future work?"
                          class="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none resize-none"></textarea>
              </div>

              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="ratingForm.wouldRecommend" class="w-5 h-5 rounded accent-amber-500">
                  <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Would Recommend</span>
                </label>
              </div>
            </div>

            <div class="flex gap-4 mt-8">
              <button (click)="closeCreateModal()" class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest">
                Cancel
              </button>
              <button (click)="createRating()" class="flex-1 py-4 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20">
                Create Rating
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SubcontractorRatingsComponent implements OnInit {
  activeTab: 'all' | 'pending' | 'finalized' = 'all';
  searchTerm = '';
  filterSubcontractor = '';
  filterGrade = '';
  filterStatus = '';

  ratings: SubcontractorRating[] = [];
  subcontractors: any[] = [];
  summary: RatingSummaryDto | null = null;
  isLoading = false;

  showCreateModal = false;
  ratingForm: Partial<CreateRatingRequest> = {};

  constructor(private subcontractorService: SubcontractorService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.subcontractorService.getSubcontractors().subscribe({
      next: (data) => {
        this.subcontractors = data;
      },
      error: (error) => {
        console.error('Error loading subcontractors:', error);
      }
    });

    this.loadRatings();
  }

  loadRatings(): void {
    this.isLoading = true;
    this.subcontractorService.getAllRatings().subscribe({
      next: (data) => {
        this.ratings = data;
        this.calculateSummary();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading ratings:', error);
        this.isLoading = false;
      }
    });
  }

  calculateSummary(): void {
    const totalRatings = this.ratings.length;
    const averageRating = totalRatings > 0
      ? this.ratings.reduce((sum, r) => sum + r.overallRating, 0) / totalRatings
      : 0;

    this.summary = {
      averageRating,
      totalRatings,
      ratingDistribution: [
        { grade: 'A', count: this.ratings.filter(r => r.ratingGrade === 'A').length },
        { grade: 'B', count: this.ratings.filter(r => r.ratingGrade === 'B').length },
        { grade: 'C', count: this.ratings.filter(r => r.ratingGrade === 'C').length },
        { grade: 'D', count: this.ratings.filter(r => r.ratingGrade === 'D').length }
      ],
      averageScores: {
        qualityOfWork: this.calculateAverage('qualityOfWork'),
        timeliness: this.calculateAverage('timeliness'),
        communication: this.calculateAverage('communication'),
        professionalism: this.calculateAverage('professionalism'),
        safetyCompliance: this.calculateAverage('safetyCompliance'),
        budgetAdherence: this.calculateAverage('budgetAdherence')
      }
    };
  }

  calculateAverage(field: keyof SubcontractorRating): number {
    const values = this.ratings.map(r => r[field] as number).filter(v => v !== undefined);
    return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
  }

  getGradeCount(grade: string): number {
    return this.summary?.ratingDistribution?.find(d => d.grade === grade)?.count || 0;
  }

  get filteredRatings(): SubcontractorRating[] {
    return this.ratings.filter(rating => {
      const matchesSearch = !this.searchTerm ||
        rating.subcontractorName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        rating.evaluatorName?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesSubcontractor = !this.filterSubcontractor || rating.subcontractorId === Number(this.filterSubcontractor);
      const matchesGrade = !this.filterGrade || rating.ratingGrade === this.filterGrade;
      const matchesStatus = this.filterStatus === '' || rating.isFinalized === (this.filterStatus === 'true');
      const matchesTab = this.activeTab === 'all' ||
        (this.activeTab === 'pending' && !rating.isFinalized) ||
        (this.activeTab === 'finalized' && rating.isFinalized);
      return matchesSearch && matchesSubcontractor && matchesGrade && matchesStatus && matchesTab;
    });
  }

  openCreateModal(): void {
    this.ratingForm = {
      subcontractorId: undefined,
      evaluatorName: '',
      qualityOfWork: 3,
      timeliness: 3,
      communication: 3,
      professionalism: 3,
      safetyCompliance: 3,
      budgetAdherence: 3,
      strengths: '',
      weaknesses: '',
      recommendations: '',
      wouldRecommend: true
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.ratingForm = {};
  }

  createRating(): void {
    this.subcontractorService.createRating(this.ratingForm as CreateRatingRequest).subscribe({
      next: (created) => {
        this.ratings.unshift(created);
        this.calculateSummary();
        this.closeCreateModal();
      },
      error: (error) => {
        console.error('Error creating rating:', error);
      }
    });
  }

  viewRating(rating: SubcontractorRating): void {
    console.log('View rating:', rating);
  }

  finalizeRating(rating: SubcontractorRating): void {
    this.subcontractorService.finalizeRating(rating.id).subscribe({
      next: (updated) => {
        const index = this.ratings.findIndex(r => r.id === updated.id);
        if (index !== -1) {
          this.ratings[index] = updated;
          this.calculateSummary();
        }
      },
      error: (error) => {
        console.error('Error finalizing rating:', error);
      }
    });
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }
}
