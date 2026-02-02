import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MockDataService } from '../../../core/mock/mock-data.service';
import { AppNotification } from '../../../shared/interfaces';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">{{ 'notifications.title' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'notifications.subtitle' | translate }}</p>
          </div>
          <button 
            (click)="markAllRead()"
            class="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-sm">
            {{ 'notifications.mark_all_read' | translate }}
          </button>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-1.5 shadow-xl shadow-slate-200/50 dark:shadow-none mb-10 w-fit">
          <button 
            (click)="filter = 'all'"
            [class.bg-slate-900]="filter === 'all'"
            [class.dark:bg-white]="filter === 'all'"
            [class.text-white]="filter === 'all'"
            [class.dark:text-slate-950]="filter === 'all'"
            [class.text-slate-500]="filter !== 'all'"
            class="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center">
            {{ 'notifications.all' | translate }}
            <span class="ml-2 px-2 py-0.5 rounded-lg bg-slate-500/10 text-[9px]">{{ notifications.length }}</span>
          </button>
          <button 
            (click)="filter = 'unread'"
            [class.bg-rose-500/10]="filter === 'unread'"
            [class.text-rose-600]="filter === 'unread'"
            [class.text-slate-500]="filter !== 'unread'"
            class="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center">
            {{ 'notifications.unread' | translate }}
            @if (unreadCount > 0) {
              <span class="ml-2 px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[9px] animate-pulse">{{ unreadCount }}</span>
            }
          </button>
        </div>

        <!-- Notifications List -->
        <div class="space-y-4">
          @for (notification of filteredNotifications; track notification.id) {
            <div 
              (click)="navigateToNotification(notification)"
              class="group p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none cursor-pointer transition-all hover:border-cyan-500/30 relative overflow-hidden"
              [class.bg-slate-50]="notification.read"
              [class.dark:bg-slate-950/30]="notification.read">
              
              <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/15 transition-colors"></div>

              <div class="relative flex items-start space-x-6">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform"
                     [ngClass]="{
                       'bg-amber-500/10 text-amber-600 dark:text-amber-500': notification.type === 'warning',
                       'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400': notification.type === 'info',
                       'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500': notification.type === 'success',
                       'bg-rose-500/10 text-rose-600 dark:text-rose-400': notification.type === 'error'
                     }">
                  @switch (notification.type) {
                    @case ('warning') {
                      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                    }
                    @case ('info') {
                      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    }
                    @case ('success') {
                      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    }
                    @case ('error') {
                      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    }
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-2">
                    <p class="text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" [class.font-black]="!notification.read" [class.font-bold]="notification.read">{{ notification.message }}</p>
                    @if (!notification.read) {
                      <span class="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] flex-shrink-0 ml-4 mt-1.5 animate-pulse"></span>
                    }
                  </div>
                  <p class="text-xs font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">{{ getTimeAgo(notification.timestamp) }}</p>
                  @if (notification.route) {
                    <div class="mt-6 inline-flex items-center text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest hover:translate-x-1 transition-transform">
                      <span>{{ 'notifications.view_details' | translate }}</span>
                      <svg class="w-3.5 h-3.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          @if (filteredNotifications.length === 0) {
            <div class="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="w-24 h-24 mx-auto mb-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shadow-inner">
                <svg class="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight uppercase leading-none">{{ 'notifications.no_notifications' | translate }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ 'notifications.no_notifications_desc' | translate }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  notifications: AppNotification[] = [];
  filter: 'all' | 'unread' = 'all';

  get filteredNotifications(): AppNotification[] {
    if (this.filter === 'unread') {
      return this.notifications.filter(n => !n.read);
    }
    return this.notifications;
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  constructor(private mockDataService: MockDataService) { }

  ngOnInit() {
    this.mockDataService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  markAllRead() {
    this.mockDataService.markAllNotificationsRead().subscribe(() => {
      this.notifications.forEach(n => n.read = true);
    });
  }

  navigateToNotification(notification: AppNotification) {
    // Mark as read
    this.mockDataService.markNotificationRead(notification.id).subscribe(() => {
      notification.read = true;
    });

    // Navigate if route exists
    if (notification.route) {
      window.location.href = notification.route;
    }
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return then.toLocaleDateString();
  }
}
