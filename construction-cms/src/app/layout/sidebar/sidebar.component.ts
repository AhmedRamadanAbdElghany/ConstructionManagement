import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';
import { PendingRequestsService } from '../../core/services/pending-requests.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { CompanySettings } from '../../shared/interfaces';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Router } from '@angular/router';
import { ClientPortalService } from '../../core/services/client-portal.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  template: `
    <div [class.w-72]="!isCollapsed()" [class.w-24]="isCollapsed()" 
         class="h-full flex flex-col bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800/60 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] relative group/sidebar">
      
      <!-- Collapse Toggle -->
      <button 
        (click)="toggleCollapse()"
        class="absolute top-24 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-cyan-500 transition-all z-[60] shadow-xl hover:scale-110 active:scale-95 ltr:-right-3 rtl:-left-3">
        <svg class="w-4 h-4 transition-transform duration-500" [class.rotate-180]="isCollapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <!-- Logo Section -->
      <div class="h-24 flex items-center border-b border-slate-200 dark:border-slate-800/60 shrink-0" 
           [class.justify-center]="isCollapsed()" 
           [class.px-6]="!isCollapsed()" 
           [class.px-0]="isCollapsed()">
        <div class="flex items-center transition-all duration-300 min-w-max" [class.gap-4]="!isCollapsed()" [class.gap-0]="isCollapsed()">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/10 shrink-0">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="transition-all duration-500 overflow-hidden" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">
            <h1 class="text-slate-900 dark:text-white font-black text-xl leading-none tracking-tight">STRUC<span class="text-cyan-500 dark:text-cyan-400">T</span></h1>
            <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold mt-1.5 truncate">
              {{ (isPending ? 'sidebar.role_owner' : isInventoryOwner ? 'sidebar.role_inventory_owner' : 'sidebar.role_' + (currentRole === 'SuperAdmin' ? 'super' : (currentRole === 'CompanyAdmin' && currentUserType === 2) ? 'owner' : currentRole === 'CompanyAdmin' ? 'admin' : currentRole === 'CompanyUser' ? 'worker' : 'client')) | translate }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar pt-8">
        @if (!isInventoryOwner) {
        <a routerLink="/dashboard" 
           routerLinkActive="nav-active"
           [routerLinkActiveOptions]="{exact: true}"
           class="nav-item group">
          <div class="nav-icon-box">
            <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
          </div>
          <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.dashboard' | translate }}</span>
        </a>
        }

          @if (isClient || isWorker) {
          <a routerLink="/companies"
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.companies' | translate }}</span>
          </a>
          }

          @if (isPending || isClient || isWorker || isAdmin) {
          <a routerLink="/messages"
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.messages' | translate }}</span>
          </a>
          }

          @if (isPending || isClient || isWorker || isAdmin) {
          <a routerLink="/admin/vendors/discovery" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.building_material_stores' | translate }}</span>
          </a>

          <a routerLink="/admin/social-wall" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
              </svg>
            </div>
            <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.social_wall' | translate }}</span>
          </a>
          }

        @if (!isPending && !isInventoryOwner && !isWorker) {
        <p class="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] min-w-max transition-opacity duration-300"
           [class.opacity-0]="isCollapsed()">{{ (isClient ? 'sidebar.client_portal' : 'sidebar.administration') | translate }}</p>

        @if (isAdmin) {

          <!-- Pending Requests (SuperAdmin & CompanyAdmin) -->
          <a routerLink="/admin/pending-requests" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box relative">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
              @if (pendingRequestsService.pendingRequests() > 0) {
                <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900">{{ pendingRequestsService.pendingRequests() > 99 ? '99+' : pendingRequestsService.pendingRequests() }}</span>
              }
            </div>
            <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.pending_requests' | translate }}</span>
          </a>
        }

        @if (isAdmin) {
          @if (currentRole === 'SuperAdmin') {
            <a routerLink="/admin/companies" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.companies' | translate }}</span>
            </a>
          }

          @if (currentRole !== 'SuperAdmin') {
            @if (settings?.allowHR) {
            <a routerLink="/admin/hr" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.hr_settings' | translate }}</span>
            </a>
            }

            <a routerLink="/admin/projects" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.projects' | translate }}</span>
            </a>


          }

          @if (currentRole !== 'SuperAdmin') {
            @if (settings?.allowLocations) {
            <a routerLink="/admin/locations" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.locations' | translate }}</span>
            </a>
            }
          }

          @if (settings?.enableInventoryManagement) {
            <a routerLink="/admin/inventory" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.inventory' | translate }}</span>
            </a>
          }

          @if (settings?.enableEquipmentManagement) {
            <a routerLink="/admin/equipment" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.equipment' | translate }}</span>
            </a>
          }

          @if (settings?.enableSafetyManagement) {
            <a routerLink="/admin/safety" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.safety' | translate }}</span>
            </a>
          }

          @if (settings?.enableSubcontractorManagement) {
            <a routerLink="/admin/subcontractors" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.subcontractors' | translate }}</span>
            </a>
          }

          @if (settings?.enableDocumentManagement) {
            <a routerLink="/admin/documents" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.documents' | translate }}</span>
            </a>
          }

          @if (settings?.enableQualityControl) {
            <a routerLink="/admin/quality" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.quality' | translate }}</span>
            </a>
          }

          @if (settings?.enableAnalyticsReporting) {
            <a routerLink="/admin/analytics" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.analytics' | translate }}</span>
            </a>
          }

          @if (currentRole !== 'SuperAdmin') {
            <a routerLink="/admin/company-settings" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.configurations' | translate }}</span>
            </a>

            <a routerLink="/admin/finance" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.finance' | translate }}</span>
            </a>

            <a routerLink="/admin/inspections"
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.inspections' | translate }}</span>
            </a>

            @if (settings?.enableLeaveManagement) {
            <a routerLink="/admin/leave" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.leave_management' | translate }}</span>
            </a>
            }

            @if (settings?.enablePerformanceEvaluation) {
            <a routerLink="/admin/performance" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.performance' | translate }}</span>
            </a>
            }

            @if (settings?.enableTrainingTracking) {
            <a routerLink="/admin/training" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.training' | translate }}</span>
            </a>
            }

            @if (settings?.enableMultiCurrency) {
            <a routerLink="/admin/currencies" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.currencies' | translate }}</span>
            </a>
            }

            @if (settings?.enablePaymentGateway) {
            <a routerLink="/admin/payments" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.payments' | translate }}</span>
            </a>
            }
          }
        }
      }

        @if (!isClient && !isInventoryOwner && !isPending && (!isWorker || hasApprovedCompany())) {
        <p class="px-4 py-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] min-w-max transition-opacity duration-300"
           [class.opacity-0]="isCollapsed()">{{ 'sidebar.operations' | translate }}</p>

            <a routerLink="/admin/tasks" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.tasks' | translate }}</span>
            </a>

            @if (isAdmin) {
            <a routerLink="/admin/escalations" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box text-rose-500">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.escalations' | translate }}</span>
            </a>
            }
        }


        @if (currentRole !== 'SuperAdmin' && !isInventoryOwner && !isPending) {
          @if ((isWorker && hasApprovedCompany()) || isAdmin) {
            <a routerLink="/worker/daily-log" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.daily_log' | translate }}</span>
            </a>
          }

            @if (settings?.allowHR && (!isWorker || hasApprovedCompany())) {
            <a routerLink="/worker/personal-hr" 
               routerLinkActive="nav-active"
               class="nav-item group">
              <div class="nav-icon-box">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.personal_hr' | translate }}</span>
            </a>
            }

            <!-- Worker-specific navigation: My Projects and Documents -->
            @if (isWorker && hasApprovedCompany()) {
              <a routerLink="/worker/projects" 
                 routerLinkActive="nav-active"
                 class="nav-item group">
                <div class="nav-icon-box">
                  <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.my_projects' | translate }}</span>
              </a>

              <a routerLink="/worker/documents" 
                 routerLinkActive="nav-active"
                 class="nav-item group">
                <div class="nav-icon-box">
                  <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.documents' | translate }}</span>
              </a>
            }
          }

        @if (isClient && hasApprovedCompany()) {
          <a routerLink="/client-portal/projects" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.my_projects' | translate }}</span>
          </a>

          <a routerLink="/client-portal/payments" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="flex items-center justify-between w-full pr-4">
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.payments' | translate }}</span>
              @if (isClient) {
                <span class="text-[8px] font-black text-amber-500 uppercase tracking-tighter bg-amber-500/10 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap" [class.hidden]="isCollapsed()">{{ 'profile.coming_soon' | translate }}</span>
              }
            </div>
          </a>

          <a routerLink="/client-portal/messages" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
            </div>
            <div class="flex items-center justify-between w-full pr-4">
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.messages' | translate }}</span>
              @if (isClient) {
                <span class="text-[8px] font-black text-amber-500 uppercase tracking-tighter bg-amber-500/10 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap" [class.hidden]="isCollapsed()">{{ 'profile.coming_soon' | translate }}</span>
              }
            </div>
          </a>

          <a routerLink="/client-portal/change-orders" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <div class="flex items-center justify-between w-full pr-4">
              <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.change_orders' | translate }}</span>
              @if (isClient) {
                <span class="text-[8px] font-black text-amber-500 uppercase tracking-tighter bg-amber-500/10 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap" [class.hidden]="isCollapsed()">{{ 'profile.coming_soon' | translate }}</span>
              }
            </div>
          </a>

          <a routerLink="/client-portal/reports" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.daily_reports' | translate }}</span>
          </a>
        }
        
        @if (isVendor) {
          <a routerLink="/vendor/storefront" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.products' | translate }}</span>
          </a>
        }

        @if (isInventoryOwner) {
          <a routerLink="/inventory-dashboard" 
             routerLinkActive="nav-active"
             [routerLinkActiveOptions]="{exact: true}"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
            <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.dashboard' | translate }}</span>
          </a>

          <a routerLink="/inventory-dashboard/products" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.products' | translate }}</span>
          </a>

          <a routerLink="/inventory-dashboard/orders" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
            </div>
            <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.orders' | translate }}</span>
          </a>

          <a routerLink="/inventory-dashboard/sales" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.sales' | translate }}</span>
          </a>

          <a routerLink="/inventory-dashboard/settings" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <span class="nav-label" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.store_settings' | translate }}</span>
          </a>
        }

        <div class="my-6 px-4">
          <div class="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
        </div>

        <a routerLink="/notifications" 
           routerLinkActive="nav-active"
           class="nav-item group">
          <div class="nav-icon-box relative text-slate-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400">
            <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            @if (notificationsService.unreadCount() > 0) {
              <span class="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-white dark:ring-slate-900 shadow-lg"></span>
            }
          </div>
          <span class="nav-label text-slate-900 dark:text-slate-200" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.notifications' | translate }}</span>
          <div class="ml-auto" [class.hidden]="isCollapsed()">
              @if (notificationsService.unreadCount() > 0) {
                <div class="flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-lg shadow-rose-500/20">{{ notificationsService.unreadCount() > 99 ? '99+' : notificationsService.unreadCount() }}</div>
              }
          </div>
        </a>
      </nav>



      <!-- User Profile -->
      <div (click)="isCollapsed() ? logout() : null" 
           class="bg-slate-100/30 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800/60 mt-auto shrink-0 group/profile cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-950/60 transition-colors"
           [class.p-6]="!isCollapsed()" 
           [class.p-0]="isCollapsed()"
           [class.flex]="isCollapsed()" 
           [class.items-center]="isCollapsed()" 
           [class.justify-center]="isCollapsed()"
           [class.h-24]="isCollapsed()"
           [title]="isCollapsed() ? ('sidebar.logout' | translate) : ''">
        <div class="flex items-center transition-all duration-300" [class.gap-4]="!isCollapsed()" [class.justify-center]="isCollapsed()">
          <div class="relative flex-shrink-0">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg ring-2 ring-white dark:ring-slate-800 shadow-2xl transition-transform group-hover/profile:scale-110 group-hover/profile:rotate-3">
              {{ authService.getCurrentUser()?.fullName?.charAt(0) || '' }}
            </div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-white dark:border-slate-900 shadow-lg animate-pulse"></div>
          </div>
          <div class="flex-1 min-w-0 transition-all duration-500 overflow-hidden" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">
            <p class="text-[15px] font-black text-slate-900 dark:text-white truncate leading-none mb-1.5">{{ authService.getCurrentUser()?.fullName || '' }}</p>
            <p class="text-[10px] text-slate-400 dark:text-slate-600 truncate font-black uppercase tracking-widest">{{ authService.getCurrentUser()?.email || '' }}</p>
          </div>
          <button (click)="$event.stopPropagation(); logout()" class="p-3 rounded-2xl text-slate-400 dark:text-slate-600 hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-90 group/logout" [class.hidden]="isCollapsed()">
            <svg class="w-6 h-6 transition-transform group-hover/logout:-translate-x-1 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .nav-item {
      @apply flex items-center px-4 py-3 rounded-2xl text-slate-500 dark:text-slate-400 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:text-slate-900 dark:hover:text-white outline-none;
      gap: 1rem;
    }

    .w-24 .nav-item {
       justify-content: center;
       gap: 0;
       padding-inline: 0;
    }

    .nav-icon-box {
      @apply w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800/20 border border-slate-200 dark:border-white/[0.03] transition-all duration-300 shrink-0;
    }

    .nav-label {
      @apply text-[15px] font-black tracking-tight transition-all duration-500 whitespace-nowrap overflow-hidden;
    }

    .nav-active {
      @apply bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-transparent shadow-2xl shadow-cyan-500/5 ring-1 ring-cyan-500/10;
    }

    .nav-active .nav-icon-box {
      @apply bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-transparent shadow-lg shadow-cyan-500/30;
    }

    .nav-active .nav-label {
      @apply text-slate-900 dark:text-white;
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      @apply bg-slate-300 dark:bg-slate-700;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      @apply bg-cyan-500;
    }
  `]
})
export class SidebarComponent {
  isCollapsed = signal(false);
  settings?: CompanySettings;
  pendingRequestsCount = signal(0);
  hasApprovedCompany = signal(false);
  private router = inject(Router);

  constructor(
    public authService: AuthService,
    private settingsService: SettingsService,
    public pendingRequestsService: PendingRequestsService,
    public notificationsService: NotificationsService,
    private clientPortalService: ClientPortalService
  ) {
    const user = this.authService.getCurrentUser();
    const isSuperAdmin = user?.roles?.includes('SuperAdmin');

    if (!isSuperAdmin && user?.companyId) {
      this.settingsService.getCompanySettings().subscribe(s => this.settings = s);
    }

    // Check if user has approved companies
    if (this.isClient || this.isWorker) {
      this.clientPortalService.getMyCompanies().subscribe((companies: any[]) => {
        this.hasApprovedCompany.set(companies && companies.some((c: any) => c.status === 'Approved'));
      });
    }

    this.loadPendingRequestsCount();
    this.notificationsService.refreshUnreadCount();
  }

  loadPendingRequestsCount() {
    if (this.isAdmin) {
      this.pendingRequestsService.refreshPendingCount();
    }
  }

  get currentUserType(): number {
    const user = this.authService.getCurrentUser();
    return user?.userType ?? 0;
  }

  get currentRole(): string {
    const user = this.authService.getCurrentUser();
    if (user && user.roles && user.roles.length > 0) {
      // Return the first role for display
      return user.roles[0];
    }
    return 'NormalUser';
  }

  get isAdmin(): boolean {
    const role = this.currentRole;
    return role === 'SuperAdmin' || role === 'CompanyAdmin';
  }

  get isWorker(): boolean {
    return this.currentRole === 'CompanyUser';
  }

  get isClient(): boolean {
    const role = this.currentRole;
    return role === 'User' || role === 'NormalUser' || role === 'Client';
  }

  get isInventoryOwner(): boolean {
    return this.currentUserType === 3; // InventoryOwner = 3
  }

  get isVendor(): boolean {
    return this.currentUserType === 4; // WarehouseOwner = 4
  }

  get isPending(): boolean {
    const user = this.authService.getCurrentUser();
    // User type 2 (CompanyOwner) who has no companyId yet is considered pending approval
    return user?.userType === 2 && !user?.companyId;
  }

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

