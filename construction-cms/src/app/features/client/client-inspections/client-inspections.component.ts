import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InspectionService, InspectionRequestList, InspectionRequest, InspectionQuote, InspectionMessage, InspectionPayment } from '../../../core/services/inspection.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';


type DetailTab = 'overview' | 'quotes' | 'session' | 'chat' | 'payment';

const STATUS_MAP: Record<number, { label: string; color: string }> = {
    1: { label: 'inspections.status.pending', color: '#f59e0b' },
    2: { label: 'inspections.status.quoted', color: '#3b82f6' },
    3: { label: 'inspections.status.approved', color: '#10b981' },
    4: { label: 'inspections.status.rejected', color: '#ef4444' },
    5: { label: 'inspections.status.ready', color: '#8b5cf6' },
    6: { label: 'inspections.status.in_progress', color: '#06b6d4' },
    7: { label: 'inspections.status.completed', color: '#22c55e' },
    8: { label: 'inspections.status.cancelled', color: '#6b7280' },
};

const PROPERTY_TYPE_MAP: Record<number, string> = {
    1: 'inspections.property_type.villa',
    2: 'inspections.property_type.apartment',
    3: 'inspections.property_type.house',
    4: 'inspections.property_type.land',
    5: 'inspections.property_type.commercial',
    6: 'inspections.property_type.office',
    7: 'inspections.property_type.warehouse',
    99: 'inspections.property_type.other',
};

@Component({
    selector: 'app-client-inspections',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, LoadingSpinnerComponent],
    template: `
<div class="inspections-shell min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
  
  <!-- Header -->
  <div class="page-header flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
    <div class="flex items-center gap-4">
      <div class="header-icon w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{{ 'inspections.title' | translate }}</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">{{ 'inspections.subtitle' | translate }}</p>
      </div>
    </div>
    
    @if (view() === 'detail') {
      <button (click)="view.set('list')" class="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        {{ 'common.back' | translate }}
      </button>
    }
  </div>

  @if (view() === 'list') {
    <!-- Filters -->
    <div class="filter-bar flex flex-wrap gap-4 mb-8">
      <div class="search-wrap relative flex-1 min-w-[300px]">
        <input type="text" [(ngModel)]="searchText" (ngModelChange)="onSearch()" [placeholder]="'inspections.search_placeholder' | translate"
          class="w-full px-4 py-3 pl-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"/>
        <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
      
      <select [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()" class="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer min-w-[180px]">
        <option value="">{{ 'inspections.all_statuses' | translate }}</option>
        @for (s of statusOptions; track s.value) {
          <option [value]="s.value">{{ s.label | translate }}</option>
        }
      </select>
    </div>

    @if (isLoading()) {
      <div class="flex items-center justify-center py-24">
        <app-loading-spinner [centered]="true"></app-loading-spinner>
      </div>
    } @else if (inspections().length === 0) {
      <div class="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl">
        <div class="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 text-4xl">🔍</div>
        <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ 'inspections.no_results' | translate }}</h3>
        <p class="text-slate-500 dark:text-slate-400 mt-2">{{ 'inspections.no_results_desc' | translate }}</p>
      </div>
    } @else {
      <!-- Inspections Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (insp of inspections(); track insp.id) {
          <div (click)="openDetail(insp.id)" 
            class="group group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden">
            
            <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>

            <div class="flex items-center justify-between mb-6 relative z-10">
               <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" [style.background]="statusBg(insp.status)" [style.color]="statusColor(insp.status)">
                 {{ statusLabel(insp.status) | translate }}
               </span>
               <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ propertyLabel(insp.propertyType) | translate }}</span>
            </div>

            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ insp.title }}</h3>
            
            <div class="space-y-3 mb-8">
              <div class="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                <span class="font-bold text-slate-900 dark:text-slate-200">{{ insp.companyName }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                <span class="truncate">{{ insp.address }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
              <div class="flex flex-col">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee</span>
                <span class="text-sm font-black text-slate-900 dark:text-white">{{ insp.inspectionFee ? (insp.inspectionFee | number:'1.0-0') + ' USD' : 'TBD' }}</span>
              </div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ insp.createdAt | date:'mediumDate' }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex items-center justify-center gap-2 mt-12">
          <button [disabled]="currentPage() === 1" (click)="changePage(currentPage() - 1)" class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center disabled:opacity-30">‹</button>
          @for (p of pageRange(); track p) {
            <button (click)="changePage(p)" [class.bg-indigo-600]="p === currentPage()" [class.text-white]="p === currentPage()" class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center font-black text-xs transition-colors">{{ p }}</button>
          }
          <button [disabled]="currentPage() === totalPages()" (click)="changePage(currentPage() + 1)" class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center disabled:opacity-30">›</button>
        </div>
      }
    }
  }

  @if (view() === 'detail' && selectedInspection()) {
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left sidebar: Info -->
      <div class="flex flex-col gap-6">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 overflow-hidden relative">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl"></div>
          
          <div class="flex items-center gap-3 mb-6">
            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" [style.background]="statusBg(selectedInspection()!.status)" [style.color]="statusColor(selectedInspection()!.status)">
              {{ statusLabel(selectedInspection()!.status) | translate }}
            </span>
          </div>

          <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">{{ selectedInspection()!.title }}</h2>

          <div class="space-y-6 mb-10">
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'inspections.details.address' | translate }}</span>
              <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ selectedInspection()!.address }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'inspections.details.area' | translate }}</span>
              <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ selectedInspection()!.approximateArea }} m²</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'inspections.details.fee' | translate }}</span>
              <span class="text-xl font-black text-indigo-600 dark:text-indigo-400">{{ selectedInspection()!.inspectionFee ? (selectedInspection()!.inspectionFee | number:'1.2-2') + ' ' + selectedInspection()!.currency : '---' }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'inspections.details.scheduled' | translate }}</span>
              <span class="text-sm font-bold text-slate-700 dark:text-slate-300">
                {{ selectedInspection()!.scheduledDate ? (selectedInspection()!.scheduledDate | date:'medium') : ('---') }}
              </span>
            </div>
          </div>

          @if (selectedInspection()!.description) {
            <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 mb-8">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{{ 'inspections.details.description' | translate }}</span>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ selectedInspection()!.description }}</p>
            </div>
          }

          @if (selectedInspection()!.status === 8) {
             <div class="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-600 text-xs font-black uppercase text-center tracking-widest">
               CANCELLED
             </div>
          }
        </div>
      </div>

      <!-- Right Area: Tabs -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl p-4 flex gap-2">
           @for (tab of detailTabs; track tab.id) {
             <button (click)="activeDetailTab = tab.id"
               [class.bg-indigo-600]="activeDetailTab === tab.id"
               [class.text-white]="activeDetailTab === tab.id"
               class="flex-1 px-4 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
               [class.hover:bg-indigo-600]="activeDetailTab === tab.id">
               {{ tab.label | translate }}
               @if (tab.badge) { <span class="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-[9px]">{{ tab.badge }}</span> }
             </button>
           }
        </div>

        <div class="flex-1 min-h-[500px]">
          
          <!-- Overview -->
          @if (activeDetailTab === 'overview') {
            <div class="space-y-8 animate-in fade-in duration-500">
               <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-10 shadow-xl">
                 <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">{{ 'inspections.details.time_slots' | translate }}</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   @for (slot of selectedInspection()!.timeSlots; track slot.id) {
                     <div [class.border-indigo-500]="slot.isSelected" [class.bg-indigo-500/5]="slot.isSelected"
                       class="p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center justify-between group transition-all">
                        <div>
                          <p class="text-sm font-black text-slate-900 dark:text-white mb-1">{{ slot.date | date:'EEEE, MMM d' }}</p>
                          <p class="text-xs text-slate-500 font-bold uppercase tracking-widest">{{ slot.timeStart }} - {{ slot.timeEnd }}</p>
                        </div>
                        @if (slot.isSelected) {
                          <span class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">✓</span>
                        } @else if (selectedInspection()!.status <= 3) {
                          <button (click)="selectSlot(slot.id)" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                            {{ 'inspections.details.select' | translate }}
                          </button>
                        }
                     </div>
                   } @empty {
                     <p class="text-slate-400 text-sm font-medium italic">{{ 'inspections.details.no_slots' | translate }}</p>
                   }
                 </div>
               </div>

               <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-10 shadow-xl">
                 <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">{{ 'inspections.details.team' | translate }}</h3>
                 <div class="flex flex-wrap gap-4">
                   @for (member of selectedInspection()!.teamMembers; track member.id) {
                     <div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 pr-8">
                       <div class="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">
                         {{ member.userName.charAt(0) }}
                       </div>
                       <div>
                         <p class="text-sm font-black text-slate-900 dark:text-white">{{ member.userName }}</p>
                         <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">{{ member.role }}</p>
                       </div>
                     </div>
                   } @empty {
                     <p class="text-slate-400 text-sm font-medium italic">{{ 'inspections.details.no_team' | translate }}</p>
                   }
                 </div>
               </div>
            </div>
          }

          <!-- Quotes -->
          @if (activeDetailTab === 'quotes') {
            <div class="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
              @for (quote of selectedInspection()!.quotes; track quote.id) {
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-10 shadow-xl overflow-hidden relative">
                   <div class="absolute top-0 right-0 p-8">
                     <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" [style.background]="quoteStatusBg(quote.status)">
                       {{ quoteStatusLabel(quote.status) | translate }}
                     </span>
                   </div>
                   
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quote Proposal</p>
                   <h4 class="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-6 tracking-tighter">{{ quote.amount | number:'1.2-2' }} {{ quote.currency }}</h4>
                   
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 border-t border-slate-100 dark:border-white/5 pt-8">
                     <div>
                       <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">{{ 'inspections.details.terms' | translate }}</span>
                       <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ quote.terms || 'No specific terms provided.' }}</p>
                     </div>
                     <div class="flex flex-col gap-6">
                        <div>
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{{ 'inspections.details.valid_until' | translate }}</span>
                          <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ quote.validUntil | date:'mediumDate' }}</span>
                        </div>
                        <div>
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Company Staff</span>
                          <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ quote.companyUserName }}</span>
                        </div>
                     </div>
                   </div>

                   @if (quote.status === 1) {
                     <div class="flex items-center gap-4">
                       <button (click)="acceptQuote(quote.id)" class="flex-1 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                         Accept Proposal
                       </button>
                       <button (click)="rejectQuote(quote.id)" class="px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                         Reject
                       </button>
                     </div>
                   }
                </div>
              } @empty {
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-20 shadow-xl flex flex-col items-center justify-center text-center">
                  <div class="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl mb-4 italic opacity-50">$</div>
                  <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'inspections.details.no_quotes' | translate }}</h3>
                  <p class="text-slate-500 text-sm mt-2">The company team will review your request and send a quote shortly.</p>
                </div>
              }
            </div>
          }

          <!-- Session -->
          @if (activeDetailTab === 'session') {
            <div class="animate-in zoom-in-95 duration-500">
               <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-10 shadow-xl">
                 <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">{{ 'inspections.details.session' | translate }}</h3>
                 
                 @if (selectedInspection()!.session) {
                   <div class="space-y-6">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{{ 'inspections.details.started_at' | translate }}</span>
                          <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ selectedInspection()!.session!.startedAt | date:'medium' }}</span>
                        </div>
                        <div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Inspector</span>
                          <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ selectedInspection()!.session!.companyUserName }}</span>
                        </div>
                      </div>
                      
                      @if (selectedInspection()!.session!.completedAt) {
                        <div class="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                          <span class="text-[10px] font-black uppercase tracking-widest block mb-1">{{ 'inspections.details.completed_at' | translate }}</span>
                          <span class="text-sm font-bold">{{ selectedInspection()!.session!.completedAt | date:'medium' }}</span>
                        </div>
                      }
                   </div>
                 } @else {
                   <div class="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5">
                     <div class="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/10 flex items-center justify-center mb-4 text-indigo-500">
                       <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     </div>
                     <p class="text-sm font-bold text-slate-500 uppercase tracking-widest">{{ 'inspections.details.session_not_started' | translate }}</p>
                   </div>
                 }
               </div>
            </div>
          }

          <!-- Chat -->
          @if (activeDetailTab === 'chat') {
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl h-[600px] flex flex-col overflow-hidden animate-in fade-in duration-500">
               <div class="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-4">
                 <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black">C</div>
                 <div>
                   <h4 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{{ selectedInspection()!.companyName }}</h4>
                   <p class="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Active Chat</p>
                 </div>
               </div>

               <div class="flex-1 overflow-y-auto p-8 space-y-6">
                 @for (msg of chatMessages(); track msg.id) {
                   <div class="flex" [class.justify-end]="!msg.isCompany">
                     <div class="max-w-[80%] flex flex-col" [class.items-end]="!msg.isCompany">
                        <div class="px-6 py-4 rounded-[1.5rem]" 
                          [ngClass]="msg.isCompany ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none' : 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-600/20'">
                          <p class="text-sm leading-relaxed">{{ msg.message }}</p>
                        </div>
                        <span class="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-2 px-2">{{ msg.createdAt | date:'shortTime' }}</span>
                     </div>
                   </div>
                 } @empty {
                   <div class="h-full flex flex-col items-center justify-center opacity-30 italic">
                      <p class="text-xs font-black uppercase tracking-widest">{{ 'inspections.details.no_messages' | translate }}</p>
                   </div>
                 }
               </div>

               <div class="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-white/5">
                 <div class="flex items-center gap-3">
                   <input type="text" [(ngModel)]="chatInput" (keyup.enter)="sendMessage()" [placeholder]="'inspections.details.type_message' | translate"
                     class="flex-1 px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner dark:text-white"/>
                   <button (click)="sendMessage()" class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 5l7 7-7 7M5 12h14"></path></svg>
                   </button>
                 </div>
               </div>
            </div>
          }

          <!-- Payment -->
          @if (activeDetailTab === 'payment') {
            <div class="animate-in slide-in-from-right-5 duration-500">
               <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-12 shadow-xl relative overflow-hidden">
                 <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
                 
                 @if (selectedInspection()!.payment) {
                    <div class="relative z-10 flex flex-col items-center text-center">
                       <div class="w-20 h-20 rounded-[2rem] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6">
                         <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       </div>
                       <h4 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{{ selectedInspection()!.payment!.amount | number:'1.2-2' }} {{ selectedInspection()!.payment!.currency }}</h4>
                       <span class="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-10" [style.background]="paymentStatusBg(selectedInspection()!.payment!.status)">
                         {{ paymentStatusLabel(selectedInspection()!.payment!.status) | translate }}
                       </span>

                       @if (selectedInspection()!.payment!.status === 1) {
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                           <button (click)="payNow('Online')" class="px-8 py-5 rounded-[2rem] bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                             <svg class="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                             Pay Online
                           </button>
                           <button (click)="payNow('Cash')" class="px-8 py-5 rounded-[2rem] bg-indigo-600 text-white font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-indigo-500/30">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                             Pay Cash
                           </button>
                         </div>
                       } @else {
                         <div class="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">
                           {{ 'inspections.details.payment_done' | translate }} - {{ selectedInspection()!.payment!.paidAt | date:'mediumDate' }}
                         </div>
                       }
                    </div>
                 } @else {
                   <div class="flex flex-col items-center justify-center py-20 text-center opacity-40">
                      <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6 italic text-2xl font-black italic">$</div>
                      <p class="text-sm font-black uppercase tracking-widest">{{ 'inspections.details.no_payment' | translate }}</p>
                   </div>
                 }
               </div>
            </div>
          }
        </div>
      </div>
    </div>
  }
</div>
  `
})
export class ClientInspectionsComponent implements OnInit {
    private inspectionService = inject(InspectionService);
    private authService = inject(AuthService);

    view = signal<'list' | 'detail'>('list');
    inspections = signal<InspectionRequestList[]>([]);
    selectedInspection = signal<InspectionRequest | null>(null);
    isLoading = signal(false);

    // Filters
    searchText = '';
    statusFilter = '';
    currentPage = signal(1);
    pageSize = 9;
    totalCount = signal(0);

    // Tabs
    activeDetailTab: DetailTab = 'overview';
    detailTabs: { id: DetailTab; label: string; badge?: number }[] = [
        { id: 'overview', label: 'inspections.tab.overview' },
        { id: 'quotes', label: 'inspections.tab.quotes', badge: 0 },
        { id: 'session', label: 'inspections.tab.session' },
        { id: 'chat', label: 'inspections.tab.chat', badge: 0 },
        { id: 'payment', label: 'inspections.tab.payment' }
    ];

    // Chat
    chatMessages = signal<InspectionMessage[]>([]);
    chatInput = '';

    // computed
    totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize));
    pageRange = computed(() => {
        const range = [];
        for (let i = 1; i <= this.totalPages(); i++) range.push(i);
        return range;
    });

    statusOptions = Object.keys(STATUS_MAP).map(k => ({
        value: k,
        label: STATUS_MAP[+k].label
    }));

    ngOnInit() {
        this.loadList();
    }

    loadList() {
        this.isLoading.set(true);
        this.inspectionService.getInspections({
            search: this.searchText,
            status: this.statusFilter ? +this.statusFilter : undefined,
            page: this.currentPage(),
            pageSize: this.pageSize
        }).subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    this.inspections.set(res.data.items);
                    this.totalCount.set(res.data.totalCount);
                }
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    openDetail(id: number) {
        this.isLoading.set(true);
        this.inspectionService.getInspectionById(id).subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    this.selectedInspection.set(res.data);
                    this.view.set('detail');
                    this.detailTabs[1].badge = res.data.quotes.length;
                    this.loadChat(id);
                }
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    onSearch() {
        this.currentPage.set(1);
        this.loadList();
    }

    onFilterChange() {
        this.currentPage.set(1);
        this.loadList();
    }

    changePage(p: number) {
        this.currentPage.set(p);
        this.loadList();
    }

    selectSlot(slotId: number) {
        const inspection = this.selectedInspection();
        if (!inspection) return;
        this.inspectionService.selectTimeSlot(inspection.id, slotId).subscribe(() => {
            this.openDetail(inspection.id);
        });
    }

    acceptQuote(quoteId: number) {
        const inspection = this.selectedInspection();
        if (!inspection) return;
        this.inspectionService.acceptQuote(inspection.id, quoteId).subscribe(() => {
            this.openDetail(inspection.id);
        });
    }

    rejectQuote(quoteId: number) {
        const inspection = this.selectedInspection();
        if (!inspection) return;
        const reason = prompt('Please enter a reason for rejection:');
        if (reason === null) return;
        this.inspectionService.rejectQuote(inspection.id, quoteId, reason).subscribe(() => {
            this.openDetail(inspection.id);
        });
    }

    payNow(method: string) {
        const inspection = this.selectedInspection();
        if (!inspection) return;
        this.inspectionService.processPayment(inspection.id, {
            amount: inspection.payment!.amount,
            currency: inspection.payment!.currency,
            paymentMethod: method
        }).subscribe(() => {
            this.openDetail(inspection.id);
        });
    }

    loadChat(id: number) {
        this.inspectionService.getChatMessages(id).subscribe(res => {
            if (res.success && res.data) {
                this.chatMessages.set(res.data);
                this.detailTabs[3].badge = res.data.length;
            }
        });
    }

    sendMessage() {
        const insp = this.selectedInspection();
        if (!insp || !this.chatInput.trim()) return;
        this.inspectionService.sendChatMessage(insp.id, this.chatInput.trim()).subscribe(res => {
            if (res.success && res.data) {
                this.chatMessages.update(msgs => [...msgs, res.data!]);
                this.chatInput = '';
            }
        });
    }

    // Helpers
    statusLabel(s: number) { return STATUS_MAP[s]?.label ?? 'Unknown'; }
    statusColor(s: number) { return STATUS_MAP[s]?.color ?? '#6b7280'; }
    statusBg(s: number) { return STATUS_MAP[s]?.color + '15'; }
    propertyLabel(t: number) { return PROPERTY_TYPE_MAP[t] ?? 'Other'; }
    quoteStatusLabel(s: number) { return ['', 'inspections.quote_status.pending', 'inspections.quote_status.accepted', 'inspections.quote_status.rejected', 'inspections.quote_status.expired'][s] ?? 'Unknown'; }
    quoteStatusBg(s: number) { return ['', '#fef3c722', '#d1fae522', '#fee2e222', '#f3f4f622'][s] ?? '#f3f4f622'; }
    paymentStatusLabel(s: number) { return ['', 'inspections.payment_status.pending', 'inspections.payment_status.paid', 'inspections.payment_status.failed', 'inspections.payment_status.refunded'][s] ?? 'Unknown'; }
    paymentStatusBg(s: number) { return ['', '#fef3c7', '#d1fae5', '#fee2e2', '#f3f4f6'][s] ?? '#f3f4f6'; }
}
