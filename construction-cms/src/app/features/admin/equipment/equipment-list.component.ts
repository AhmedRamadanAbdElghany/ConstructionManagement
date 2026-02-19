import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { EquipmentService, Equipment, EquipmentType, EquipmentDashboard } from '../../../core/services/equipment.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{{ 'equipment.title' | translate }}</h1>
            <div class="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl w-fit">
              <button (click)="activeTab = 'dashboard'" 
                      [class.bg-white]="activeTab === 'dashboard'" 
                      [class.shadow-sm]="activeTab === 'dashboard'"
                      [class.text-slate-900]="activeTab === 'dashboard'"
                      [class.dark:bg-slate-700]="activeTab === 'dashboard'"
                      [class.dark:text-white]="activeTab === 'dashboard'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                  {{ 'equipment.dashboard' | translate }}
              </button>
              <button (click)="activeTab = 'listing'" 
                      [class.bg-white]="activeTab === 'listing'" 
                      [class.shadow-sm]="activeTab === 'listing'"
                      [class.text-slate-900]="activeTab === 'listing'"
                      [class.dark:bg-slate-700]="activeTab === 'listing'"
                      [class.dark:text-white]="activeTab === 'listing'"
                      class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 transition-all">
                  {{ 'equipment.listing' | translate }}
              </button>
            </div>
          </div>

          <button (click)="openAddModal()" 
                  class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            {{ 'equipment.add_equipment' | translate }}
          </button>
        </div>

        <!-- Dashboard Tab -->
        @if (activeTab === 'dashboard') {
          <div class="space-y-8">
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-cyan-500/30 transition-all">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  </div>
                  <span class="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{{ 'equipment.total_units' | translate }}</span>
                </div>
                <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ dashboard?.totalEquipment || 0 }}</h3>
              </div>

              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-emerald-500/30 transition-all">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{{ 'equipment.available' | translate }}</span>
                </div>
                <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ dashboard?.availableEquipment || 0 }}</h3>
              </div>

              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-blue-500/30 transition-all">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <span class="text-[10px] font-black text-blue-500 uppercase tracking-widest">{{ 'equipment.in_use' | translate }}</span>
                </div>
                <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ dashboard?.assignedEquipment || 0 }}</h3>
              </div>

              <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-amber-500/30 transition-all">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">{{ 'equipment.maintenance' | translate }}</span>
                </div>
                <h3 class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ dashboard?.inMaintenanceEquipment || 0 }}</h3>
              </div>
            </div>

            <!-- Charts & Lists Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <!-- Upcoming Maintenance -->
               <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                  <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">{{ 'equipment.next_maintenance' | translate }}</h3>
                  <div class="space-y-4">
                    @for (m of dashboard?.upcomingMaintenances; track m.id) {
                      <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <div>
                          <h4 class="font-bold text-slate-900 dark:text-white">{{ m.equipmentName }}</h4>
                          <p class="text-[10px] text-slate-500 uppercase font-black">{{ m.maintenanceTypeName }}</p>
                        </div>
                        <div class="text-right">
                          <p class="text-[10px] font-black text-amber-500 uppercase tracking-widest">{{ m.scheduledDate | date:'mediumDate' }}</p>
                        </div>
                      </div>
                    } @empty {
                      <div class="text-center py-10">
                        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">No maintenance scheduled</p>
                      </div>
                    }
                  </div>
               </div>

               <!-- Popular Types -->
               <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8">
                  <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Asset Breakdown</h3>
                  <div class="space-y-4">
                    @for (type of dashboard?.topEquipmentTypes; track type.id) {
                      <div class="space-y-2">
                        <div class="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span class="text-slate-500">{{ type.name }}</span>
                          <span class="text-slate-900 dark:text-white">{{ type.equipmentCount }} units</span>
                        </div>
                        <div class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" 
                               [style.width.%]="(type.equipmentCount! / (dashboard?.totalEquipment || 1)) * 100"></div>
                        </div>
                      </div>
                    }
                  </div>
               </div>
            </div>
          </div>
        }

        <!-- Listing Tab -->
        @if (activeTab === 'listing') {
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden transition-all duration-500">
            <!-- Search & Filters -->
            <div class="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4">
              <div class="flex-1 relative">
                <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="filterEquipment()"
                       class="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all"
                       placeholder="Search by name or serial...">
                <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <div class="flex gap-4">
                <select [(ngModel)]="statusFilter" (ngModelChange)="filterEquipment()"
                        class="px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <option value="">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="InMaintenance">Maintenance</option>
                  <option value="OutOfService">Out of Service</option>
                </select>
                <select [(ngModel)]="typeFilter" (ngModelChange)="filterEquipment()"
                        class="px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <option value="">All Types</option>
                  @for (type of equipmentTypes; track type.id) {
                    <option [value]="type.id">{{ type.name }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50 dark:bg-slate-950/50">
                  <tr>
                    <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'equipment.name' | translate }}</th>
                    <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'equipment.type' | translate }}</th>
                    <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'equipment.status' | translate }}</th>
                    <th class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'equipment.assignment' | translate }}</th>
                    <th class="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'equipment.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                  @for (eq of filteredEquipment; track eq.id) {
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td class="px-8 py-5">
                        <div class="flex items-center space-x-4">
                           <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-500 font-bold group-hover:scale-110 transition-transform">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                             </svg>
                           </div>
                           <div>
                             <p class="text-sm font-black text-slate-900 dark:text-white">{{ eq.name }}</p>
                             <p class="text-[10px] font-bold text-slate-400">{{ eq.serialNumber }}</p>
                           </div>
                        </div>
                      </td>
                      <td class="px-8 py-5">
                        <span class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">{{ eq.equipmentTypeName }}</span>
                      </td>
                      <td class="px-8 py-5">
                        <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm"
                              [ngClass]="{
                                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': eq.status === 'Available',
                                'bg-blue-500/10 text-blue-600 dark:text-blue-400': eq.status === 'Assigned',
                                'bg-amber-500/10 text-amber-600 dark:text-amber-400': eq.status === 'InMaintenance',
                                'bg-rose-500/10 text-rose-600 dark:text-rose-400': eq.status === 'OutOfService'
                              }">
                          {{ 'equipment.status_' + eq.status.toLowerCase() | translate }}
                        </span>
                      </td>
                      <td class="px-8 py-5">
                        @if (eq.assignedProjectName) {
                          <div class="flex items-center space-x-2">
                             <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                             <p class="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase truncate max-w-[150px]">{{ eq.assignedProjectName }}</p>
                          </div>
                        } @else {
                          <span class="text-[10px] font-bold text-slate-400 italic">Not Assigned</span>
                        }
                      </td>
                      <td class="px-8 py-5 text-right">
                        <div class="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                           <button [routerLink]="['/admin/equipment', eq.id]" 
                                   class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-all">
                             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                           </button>
                           <button (click)="openEditModal(eq)" 
                                   class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all">
                             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                           </button>
                           <button (click)="deleteEquipment(eq)" 
                                   class="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-400 hover:text-rose-600 hover:bg-rose-500/20 transition-all">
                             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                           </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="px-8 py-20 text-center">
                         <div class="flex flex-col items-center">
                            <div class="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-4 px-1 pb-1">
                               <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            </div>
                            <p class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ 'equipment.no_equipment_found' | translate }}</p>
                         </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if (showModal) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-200 dark:border-white/5">
          <div class="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {{ (isEditing ? 'equipment.edit' : 'equipment.add_equipment') | translate }}
            </h2>
            <button (click)="showModal = false" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form [formGroup]="equipmentForm" (ngSubmit)="saveEquipment()" class="p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div class="space-y-2">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'equipment.name' | translate }}</label>
                 <input type="text" formControlName="name" 
                        class="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all">
               </div>
               <div class="space-y-2">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'equipment.serial_number' | translate }}</label>
                 <input type="text" formControlName="serialNumber" 
                        class="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all">
               </div>
               <div class="space-y-2">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'equipment.type' | translate }}</label>
                 <select formControlName="equipmentTypeId" 
                         class="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none appearance-none cursor-pointer">
                    <option [ngValue]="null">Select Type</option>
                    @for (type of equipmentTypes; track type.id) {
                      <option [ngValue]="type.id">{{ type.name }}</option>
                    }
                 </select>
               </div>
               <div class="space-y-2">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{{ 'equipment.status' | translate }}</label>
                 <select formControlName="status" 
                         class="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none appearance-none cursor-pointer">
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="InMaintenance">Maintenance</option>
                    <option value="OutOfService">Out of Service</option>
                 </select>
               </div>
            </div>

            <div class="flex gap-4 pt-4">
              <button type="button" (click)="showModal = false" 
                      class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                {{ 'common.cancel' | translate }}
              </button>
              <button type="submit" [disabled]="equipmentForm.invalid"
                      class="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale">
                {{ 'common.save' | translate }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: []
})
export class EquipmentListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);

  activeTab: 'dashboard' | 'listing' = 'dashboard';
  equipment: Equipment[] = [];
  filteredEquipment: Equipment[] = [];
  equipmentTypes: EquipmentType[] = [];
  dashboard: EquipmentDashboard | null = null;

  searchTerm = '';
  statusFilter = '';
  typeFilter = '';

  showModal = false;
  isEditing = false;
  selectedEquipmentId: number | null = null;
  equipmentForm: FormGroup;

  constructor(private equipmentService: EquipmentService, private fb: FormBuilder) {
    this.equipmentForm = this.fb.group({
      name: ['', Validators.required],
      serialNumber: ['', Validators.required],
      equipmentTypeId: [null, Validators.required],
      status: ['Available', Validators.required]
    });

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
      });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    forkJoin({
      equipment: this.equipmentService.getEquipment(),
      types: this.equipmentService.getEquipmentTypes(),
      dashboard: this.equipmentService.getDashboard()
    }).pipe(takeUntil(this.destroy$)).subscribe(({ equipment, types, dashboard }) => {
      this.equipment = equipment;
      this.filteredEquipment = equipment;
      this.equipmentTypes = types;
      this.dashboard = dashboard;
    });
  }

  filterEquipment(): void {
    this.filteredEquipment = this.equipment.filter(eq => {
      const matchesSearch = !this.searchTerm ||
        eq.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        eq.serialNumber.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || eq.status === this.statusFilter;
      const matchesType = !this.typeFilter || eq.equipmentTypeId === parseInt(this.typeFilter);

      return matchesSearch && matchesStatus && matchesType;
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.selectedEquipmentId = null;
    this.equipmentForm.reset({ status: 'Available' });
    this.showModal = true;
  }

  openEditModal(eq: Equipment) {
    this.isEditing = true;
    this.selectedEquipmentId = eq.id;
    this.equipmentForm.patchValue({
      name: eq.name,
      serialNumber: eq.serialNumber,
      equipmentTypeId: eq.equipmentTypeId,
      status: eq.status
    });
    this.showModal = true;
  }

  saveEquipment() {
    if (this.equipmentForm.invalid) return;

    const request = this.equipmentForm.value;
    const obs = this.isEditing && this.selectedEquipmentId
      ? this.equipmentService.updateEquipment(this.selectedEquipmentId, request)
      : this.equipmentService.createEquipment(request);

    obs.subscribe(() => {
      this.showModal = false;
      this.loadData();
    });
  }

  deleteEquipment(equipment: Equipment): void {
    if (confirm(`Are you sure you want to delete "${equipment.name}"?`)) {
      this.equipmentService.deleteEquipment(equipment.id).subscribe(() => {
        this.loadData();
      });
    }
  }
}
