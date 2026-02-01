import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslateModule } from '@ngx-translate/core';

import { AppNotification } from '../../shared/interfaces';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent, TranslateModule],
  template: `
    <div class="h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-6">
      <!-- Search -->
      <div class="flex-1 max-w-xl">
        <div class="relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            [placeholder]="'topbar.search_placeholder' | translate"
            class="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all">
        </div>
      </div>

      <!-- Right Side -->
      <div class="flex items-center space-x-4">
        <!-- Language Switcher -->
        <app-language-switcher></app-language-switcher>

        <!-- Notifications -->
        <div class="relative">
          <button 
            (click)="toggleNotifications()"
            class="relative p-2.5 rounded-xl hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            @if (unreadCount > 0) {
              <span class="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                {{ unreadCount }}
              </span>
            }
          </button>

          <!-- Notifications Dropdown -->
          @if (showNotifications) {
            <div class="absolute right-0 top-full mt-2 w-96 bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden z-50">
              <div class="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <h3 class="text-white font-semibold">{{ 'topbar.notifications' | translate }}</h3>
                <button (click)="markAllRead()" class="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  {{ 'topbar.mark_all_read' | translate }}
                </button>
              </div>
              <div class="max-h-80 overflow-y-auto">
                @for (notification of notifications; track notification.id) {
                  <div 
                    class="p-4 border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors cursor-pointer"
                    [class.bg-cyan-500/5]="!notification.read">
                    <div class="flex items-start space-x-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                           [ngClass]="{
                             'bg-amber-500/20 text-amber-400': notification.type === 'warning',
                             'bg-cyan-500/20 text-cyan-400': notification.type === 'info',
                             'bg-emerald-500/20 text-emerald-400': notification.type === 'success'
                           }">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          @if (notification.type === 'warning') {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                          }
                          @if (notification.type === 'info') {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          }
                          @if (notification.type === 'success') {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          }
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm text-white" [class.font-medium]="!notification.read">{{ notification.message }}</p>
                        <p class="text-xs text-slate-500 mt-1">{{ notification.timestamp }}</p>
                      </div>
                      @if (!notification.read) {
                        <div class="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0"></div>
                      }
                    </div>
                  </div>
                }
              </div>
              <div class="p-3 border-t border-slate-700/50">
                <a routerLink="/notifications" 
                   (click)="showNotifications = false"
                   class="block w-full py-2 text-center text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  {{ 'topbar.view_all_notifications' | translate }}
                </a>
              </div>
            </div>
          }
        </div>

        <!-- Divider -->
        <div class="w-px h-8 bg-slate-700/50"></div>

        <!-- User Profile -->
        <div class="relative">
          <button 
            (click)="toggleProfile()"
            class="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-700/50 transition-colors">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {{ authService.getCurrentUser().fullName.charAt(0) }}
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-white">{{ authService.getCurrentUser().fullName }}</p>
              <p class="text-xs text-slate-400">{{ authService.getCurrentUser().role }}</p>
            </div>
            <svg class="w-4 h-4 text-slate-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <!-- Profile Dropdown -->
          @if (showProfile) {
            <div class="absolute right-0 top-full mt-2 w-56 bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden z-50">
              <div class="p-4 border-b border-slate-700/50">
                <p class="text-white font-medium">{{ authService.getCurrentUser().fullName }}</p>
                <p class="text-sm text-slate-400">{{ authService.getCurrentUser().email }}</p>
              </div>
              <div class="p-2">
                <a href="#" class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>{{ 'topbar.profile' | translate }}</span>
                </a>
                <a href="#" class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>{{ 'topbar.settings' | translate }}</span>
                </a>
              </div>
              <div class="p-2 border-t border-slate-700/50">
                <button class="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span>{{ 'topbar.logout' | translate }}</span>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Overlay to close dropdowns -->
    @if (showNotifications || showProfile) {
      <div 
        class="fixed inset-0 z-40"
        (click)="closeDropdowns()">
      </div>
    }
  `
})
export class TopbarComponent implements OnInit {
  showNotifications = false;
  showProfile = false;
  notifications: AppNotification[] = [];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  constructor(public authService: AuthService) { }

  ngOnInit() {
    this.notifications = [
      { id: 1, type: 'warning', message: 'Daily log pending submission', timestamp: '5 min ago', read: false },
      { id: 2, type: 'info', message: 'New team member added to your project', timestamp: '1 hour ago', read: false },
      { id: 3, type: 'success', message: 'Payment received for Tower Project', timestamp: '2 hours ago', read: true },
    ];
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showProfile = false;
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
    this.showNotifications = false;
  }

  closeDropdowns() {
    this.showNotifications = false;
    this.showProfile = false;
  }

  markAllRead() {
    this.notifications.forEach(n => n.read = true);
  }
}
