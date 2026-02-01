import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  template: `
    <div [class.w-72]="!isCollapsed()" [class.w-24]="isCollapsed()" 
         class="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/60 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] relative group/sidebar overflow-hidden">
      
      <!-- Collapse Toggle -->
      <button 
        (click)="toggleCollapse()"
        class="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-cyan-500 transition-all z-[60] shadow-xl hover:scale-110 active:scale-95">
        <svg class="w-4 h-4 transition-transform duration-500" [class.rotate-180]="isCollapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <!-- Logo Section -->
      <div class="h-24 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
        <div class="flex items-center space-x-4 min-w-max">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/10 shrink-0">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="transition-all duration-500 overflow-hidden" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">
            <h1 class="text-slate-900 dark:text-white font-black text-xl leading-none tracking-tight">STRUC<span class="text-cyan-500 dark:text-cyan-400">T</span></h1>
            <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold mt-1.5 truncate">{{ currentRole }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar pt-8">
        <!-- Section Header -->
        <p class="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] min-w-max transition-opacity duration-300"
           [class.opacity-0]="isCollapsed()">{{ 'sidebar.administration' | translate }}</p>

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

        @if (isAdmin) {
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

        <p class="px-4 py-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] min-w-max transition-opacity duration-300"
           [class.opacity-0]="isCollapsed()">{{ 'sidebar.operations' | translate }}</p>

        @if (isWorker || isAdmin) {
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
            <span class="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-white dark:ring-slate-900 shadow-lg"></span>
          </div>
          <span class="nav-label text-slate-900 dark:text-slate-200" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">{{ 'sidebar.notifications' | translate }}</span>
          <div class="ml-auto" [class.hidden]="isCollapsed()">
             <div class="flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-lg shadow-rose-500/20">3</div>
          </div>
        </a>
      </nav>

      <!-- Role Selector -->
      <div class="p-4 m-4 rounded-[2rem] bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 backdrop-blur-3xl transition-all duration-500 shrink-0 shadow-inner"
           [class.mx-2]="isCollapsed()">
        <label class="block text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-3 px-1 truncate" [class.text-center]="isCollapsed()">{{ 'sidebar.demo_role_switch' | translate }}</label>
        <div class="relative group/select">
          <select 
            (change)="switchRole($event)"
            [value]="currentRole"
            class="w-full pl-3 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-300 text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/30 transition-all cursor-pointer appearance-none outline-none shadow-xl">
            <option value="SuperAdmin">Super</option>
            <option value="CompanyAdmin">Admin</option>
            <option value="CompanyUser">Worker</option>
            <option value="NormalUser">Client</option>
          </select>
          <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-600 group-hover/select:text-cyan-500 dark:group-hover/select:text-cyan-400 transition-colors" [class.hidden]="isCollapsed()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- User Profile -->
      <div class="p-6 bg-slate-100/30 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800/60 mt-auto shrink-0 group/profile cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-950/60 transition-colors">
        <div class="flex items-center space-x-4">
          <div class="relative flex-shrink-0">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg ring-2 ring-white dark:ring-slate-800 shadow-2xl transition-transform group-hover/profile:scale-110 group-hover/profile:rotate-3">
              {{ authService.getCurrentUser().fullName.charAt(0) }}
            </div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-white dark:border-slate-900 shadow-lg animate-pulse"></div>
          </div>
          <div class="flex-1 min-w-0 transition-all duration-500 overflow-hidden" [class.opacity-0]="isCollapsed()" [class.w-0]="isCollapsed()">
            <p class="text-[15px] font-black text-slate-900 dark:text-white truncate leading-none mb-1.5">{{ authService.getCurrentUser().fullName }}</p>
            <p class="text-[10px] text-slate-400 dark:text-slate-600 truncate font-black uppercase tracking-widest">{{ authService.getCurrentUser().email }}</p>
          </div>
          <button class="p-3 rounded-2xl text-slate-400 dark:text-slate-600 hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-90 group/logout" [class.hidden]="isCollapsed()">
            <svg class="w-6 h-6 transition-transform group-hover/logout:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      @apply flex items-center space-x-4 px-4 py-3 rounded-2xl text-slate-500 dark:text-slate-400 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:text-slate-900 dark:hover:text-white outline-none;
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
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
    }
  `]
})
export class SidebarComponent {
  isCollapsed = signal(false);

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

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }

  switchRole(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.authService.switchUserRole(select.value as any);
  }
}
