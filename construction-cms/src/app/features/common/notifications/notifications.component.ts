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
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">{{ 'notifications.title' | translate }}</h1>
            <p class="text-slate-400">{{ 'notifications.subtitle' | translate }}</p>
          </div>
          <button 
            (click)="markAllRead()"
            class="px-6 py-3 rounded-xl bg-slate-700/50 text-slate-400 font-medium hover:bg-slate-700 hover:text-white transition-colors">
            {{ 'notifications.mark_all_read' | translate }}
          </button>
        </div>

        <!-- Filter Tabs -->
        <div class="flex space-x-2 mb-6">
          <button 
            (click)="filter = 'all'"
            [class.bg-cyan-500]="filter === 'all'"
            [class.text-white]="filter === 'all'"
            [class.bg-slate-700/50]="filter !== 'all'"
            [class.text-slate-400]="filter !== 'all'"
            class="px-6 py-3 rounded-xl text-sm font-medium transition-all">
            {{ 'notifications.all' | translate }}
            <span class="ml-2 px-2 py-0.5 rounded-full bg-slate-600/50 text-xs">{{ notifications.length }}</span>
          </button>
          <button 
            (click)="filter = 'unread'"
            [class.bg-cyan-500]="filter === 'unread'"
            [class.text-white]="filter === 'unread'"
            [class.bg-slate-700/50]="filter !== 'unread'"
            [class.text-slate-400]="filter !== 'unread'"
            class="px-6 py-3 rounded-xl text-sm font-medium transition-all">
            {{ 'notifications.unread' | translate }}
            @if (unreadCount > 0) {
              <span class="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">{{ unreadCount }}</span>
            }
          </button>
        </div>

        <!-- Notifications List -->
        <div class="space-y-3">
          @for (notification of filteredNotifications; track notification.id) {
            <div 
              (click)="navigateToNotification(notification)"
              class="p-5 rounded-2xl cursor-pointer transition-all border"
              [class.bg-cyan-500/5]="!notification.read"
              [class.border-cyan-500/30]="!notification.read"
              [class.bg-slate-800/50]="notification.read"
              [class.border-slate-700/50]="notification.read"
              [class.hover:border-cyan-500/50]="!notification.read"
              [class.hover:bg-slate-700/50]="notification.read">
              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                     [ngClass]="{
                       'bg-amber-500/20 text-amber-400': notification.type === 'warning',
                       'bg-cyan-500/20 text-cyan-400': notification.type === 'info',
                       'bg-emerald-500/20 text-emerald-400': notification.type === 'success',
                       'bg-red-500/20 text-red-400': notification.type === 'error'
                     }">
                  @switch (notification.type) {
                    @case ('warning') {
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                    }
                    @case ('info') {
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    }
                    @case ('success') {
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    }
                    @case ('error') {
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    }
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <p class="text-white" [class.font-medium]="!notification.read">{{ notification.message }}</p>
                    @if (!notification.read) {
                      <span class="w-3 h-3 rounded-full bg-cyan-500 flex-shrink-0 ml-3"></span>
                    }
                  </div>
                  <p class="text-sm text-slate-500 mt-1">{{ getTimeAgo(notification.timestamp) }}</p>
                  @if (notification.route) {
                    <div class="mt-3 flex items-center text-sm text-cyan-400">
                      <span>View Details</span>
                      <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          @if (filteredNotifications.length === 0) {
            <div class="text-center py-20">
              <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-700/50 flex items-center justify-center">
                <svg class="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-2">{{ 'notifications.no_notifications' | translate }}</h3>
              <p class="text-slate-400">{{ 'notifications.no_notifications_desc' | translate }}</p>
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
