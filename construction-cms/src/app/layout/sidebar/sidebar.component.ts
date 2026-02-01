import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  template: `
    <div class="h-full flex flex-col bg-slate-900 border-r border-slate-800/60 shadow-2xl transition-all duration-300">
      <!-- Logo Section -->
      <div class="h-24 flex items-center px-6 border-b border-slate-800/60">
        <div class="flex items-center space-x-3">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/10">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="overflow-hidden">
            <h1 class="text-white font-black text-lg leading-none tracking-tight">STRUC<span class="text-cyan-400">T</span></h1>
            <p class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1 truncate">{{ currentRole }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <!-- Section Header -->
        <p class="px-4 pt-4 pb-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.25em]">{{ 'sidebar.administration' | translate }}</p>

        <a routerLink="/dashboard" 
           routerLinkActive="nav-active"
           [routerLinkActiveOptions]="{exact: true}"
           class="nav-item group">
          <div class="nav-icon-box">
            <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
          </div>
          <span class="nav-label">{{ 'sidebar.dashboard' | translate }}</span>
        </a>

        @if (isAdmin) {
          <a routerLink="/admin/hr" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <span class="nav-label">{{ 'sidebar.hr_settings' | translate }}</span>
          </a>

          <a routerLink="/admin/projects" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <span class="nav-label">{{ 'sidebar.projects' | translate }}</span>
          </a>

          <a routerLink="/admin/locations" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <span class="nav-label">{{ 'sidebar.locations' | translate }}</span>
          </a>
        }

        <p class="px-4 pt-6 pb-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.25em]">{{ 'sidebar.operations' | translate }}</p>

        @if (isWorker || isAdmin) {
          <a routerLink="/worker/daily-log" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
            </div>
            <span class="nav-label">{{ 'sidebar.daily_log' | translate }}</span>
          </a>

          <a routerLink="/worker/personal-hr" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <span class="nav-label">{{ 'sidebar.personal_hr' | translate }}</span>
          </a>
        }

        @if (isClient) {
          <a routerLink="/client/projects" 
             routerLinkActive="nav-active"
             class="nav-item group">
            <div class="nav-icon-box">
              <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <span class="nav-label">{{ 'sidebar.my_projects' | translate }}</span>
          </a>
        }

        <div class="my-6 px-4">
          <div class="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
        </div>

        <a routerLink="/notifications" 
           routerLinkActive="nav-active"
           class="nav-item group">
          <div class="nav-icon-box relative">
            <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span class="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900"></span>
          </div>
          <span class="nav-label">{{ 'sidebar.notifications' | translate }}</span>
          <div class="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-bold">3</div>
        </a>
      </nav>

      <!-- Role Selector -->
      <div class="p-4 m-4 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/5 backdrop-blur-sm">
        <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">{{ 'sidebar.demo_role_switch' | translate }}</label>
        <div class="relative">
          <select 
            (change)="switchRole($event)"
            [value]="currentRole"
            class="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-300 text-[12px] font-medium focus:ring-1 focus:ring-cyan-500/30 transition-all cursor-pointer appearance-none outline-none">
            <option value="SuperAdmin">Super Admin</option>
            <option value="CompanyAdmin">Company Admin</option>
            <option value="CompanyUser">Worker / Engineer</option>
            <option value="NormalUser">Client</option>
          </select>
          <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- User Profile -->
      <div class="p-6 bg-slate-900/50 border-t border-slate-800/60 mt-auto">
        <div class="flex items-center space-x-3">
          <div class="relative flex-shrink-0">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold ring-2 ring-slate-800 shadow-inner">
              {{ authService.getCurrentUser().fullName.charAt(0) }}
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm"></div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-white truncate leading-tight">{{ authService.getCurrentUser().fullName }}</p>
            <p class="text-[11px] text-slate-500 truncate mt-0.5">{{ authService.getCurrentUser().email }}</p>
          </div>
          <button class="p-2 rounded-xl text-slate-600 hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-95 group">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 280px;
      height: 100vh;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .nav-item {
      @apply flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-400 transition-all duration-300 hover:bg-white/[0.03] hover:text-slate-200 outline-none;
    }

    .nav-icon-box {
      @apply w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/30 border border-white/5 transition-all duration-300;
    }

    .nav-label {
      @apply text-[14px] font-semibold tracking-tight transition-all duration-300;
    }

    .nav-active {
      @apply bg-cyan-500/10 text-cyan-400 border-transparent shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-500/20;
    }

    .nav-active .nav-icon-box {
      @apply bg-cyan-500 text-white border-transparent shadow-lg shadow-cyan-500/40;
    }

    .nav-active .nav-label {
      @apply text-white;
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 10px;
    }
  `]
})
export class SidebarComponent {
  constructor(public authService: AuthService) { }

  get currentRole(): string {
    return this.authService.getCurrentUser()?.role || 'CompanyUser';
  }

  get isAdmin(): boolean {
    const role = this.currentRole;
    return role === 'SuperAdmin' || role === 'CompanyAdmin';
  }

  get isWorker(): boolean {
    return this.currentRole === 'CompanyUser';
  }

  get isClient(): boolean {
    return this.currentRole === 'NormalUser';
  }

  switchRole(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.authService.switchUserRole(select.value as any);
  }
}