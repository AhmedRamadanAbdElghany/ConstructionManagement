import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ClientPortalService, ClientUser } from '../../../core/services/client-portal.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-client-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-10">
          <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">{{ 'client.settings' | translate }}</h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'client.settings_subtitle' | translate }}</p>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <app-loading-spinner [centered]="true"></app-loading-spinner>
          </div>
        }

        <!-- Settings Content -->
        @if (!isLoading && clientUser) {
          <div class="space-y-6">
            <!-- Profile Information -->
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
              <div class="p-8 border-b border-slate-100 dark:border-white/5">
                <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">{{ 'client.profile_information' | translate }}</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'client.profile_info_desc' | translate }}</p>
              </div>
              <div class="p-8">
                <form (ngSubmit)="updateProfile()" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'client.first_name' | translate }}</label>
                      <input type="text" [(ngModel)]="profileForm.firstName" required
                             class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                    </div>
                    <div>
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'client.last_name' | translate }}</label>
                      <input type="text" [(ngModel)]="profileForm.lastName" required
                             class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                    </div>
                  </div>
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'client.email' | translate }}</label>
                    <input type="email" [(ngModel)]="profileForm.email" required
                           class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 text-sm cursor-not-allowed">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ 'client.email_readonly' | translate }}</p>
                  </div>
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'client.phone' | translate }}</label>
                    <input type="tel" [(ngModel)]="profileForm.phone"
                           class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                  </div>
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'client.job_title' | translate }}</label>
                    <input type="text" [(ngModel)]="profileForm.jobTitle"
                           class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                  </div>
                  <div class="flex justify-end">
                    <button type="submit" [disabled]="isSaving" 
                            class="px-8 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      @if (isSaving) {
                        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      }
                      @if (!isSaving) {
                        {{ 'client.save_profile' | translate }}
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Change Password -->
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
              <div class="p-8 border-b border-slate-100 dark:border-white/5">
                <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">{{ 'client.change_password' | translate }}</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'client.change_password_desc' | translate }}</p>
              </div>
              <div class="p-8">
                <form (ngSubmit)="changePassword()" class="space-y-6">
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'client.current_password' | translate }}</label>
                    <input type="password" [(ngModel)]="passwordForm.currentPassword" required
                           class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                  </div>
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'client.new_password' | translate }}</label>
                    <input type="password" [(ngModel)]="passwordForm.newPassword" required minlength="8"
                           class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ 'client.password_min_length' | translate }}</p>
                  </div>
                  <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'client.confirm_password' | translate }}</label>
                    <input type="password" [(ngModel)]="passwordForm.confirmPassword" required
                           class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                  </div>
                  <div class="flex justify-end">
                    <button type="submit" [disabled]="isChangingPassword" 
                            class="px-8 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      @if (isChangingPassword) {
                        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      }
                      @if (!isChangingPassword) {
                        {{ 'client.change_password_btn' | translate }}
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Notification Preferences -->
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
              <div class="p-8 border-b border-slate-100 dark:border-white/5">
                <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">{{ 'client.notification_preferences' | translate }}</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'client.notification_desc' | translate }}</p>
              </div>
              <div class="p-8 space-y-4">
                <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                  <div>
                    <p class="text-sm font-black text-slate-900 dark:text-white">{{ 'client.email_notifications' | translate }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ 'client.email_notifications_desc' | translate }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" [(ngModel)]="notificationSettings.emailNotifications" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                  <div>
                    <p class="text-sm font-black text-slate-900 dark:text-white">{{ 'client.payment_reminders' | translate }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ 'client.payment_reminders_desc' | translate }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" [(ngModel)]="notificationSettings.paymentReminders" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                  <div>
                    <p class="text-sm font-black text-slate-900 dark:text-white">{{ 'client.project_updates' | translate }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ 'client.project_updates_desc' | translate }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" [(ngModel)]="notificationSettings.projectUpdates" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div class="flex justify-end">
                  <button (click)="saveNotificationSettings()" [disabled]="isSavingNotifications"
                          class="px-8 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    @if (isSavingNotifications) {
                      <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    }
                    @if (!isSavingNotifications) {
                      {{ 'client.save_notifications' | translate }}
                    }
                  </button>
                </div>
              </div>
            </div>

            <!-- Account Info -->
            <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
              <div class="p-8 border-b border-slate-100 dark:border-white/5">
                <h2 class="text-xl font-black text-slate-900 dark:text-white mb-1">{{ 'client.account_info' | translate }}</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'client.account_info_desc' | translate }}</p>
              </div>
              <div class="p-8 space-y-4">
                <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                  <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'client.company_name' | translate }}</p>
                    <p class="text-sm font-black text-slate-900 dark:text-white">{{ clientUser.companyName }}</p>
                  </div>
                </div>
                <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                  <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'client.member_since' | translate }}</p>
                    <p class="text-sm font-black text-slate-900 dark:text-white">{{ formatDate(clientUser.createdAt) }}</p>
                  </div>
                </div>
                <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                  <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'client.last_login' | translate }}</p>
                    <p class="text-sm font-black text-slate-900 dark:text-white">{{ clientUser.lastLoginAt ? formatDateTime(clientUser.lastLoginAt) : 'Never' }}</p>
                  </div>
                </div>
                <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                  <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'client.account_status' | translate }}</p>
                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                          [ngClass]="{
                            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': clientUser.isActive,
                            'bg-rose-500/10 text-rose-600 dark:text-rose-400': !clientUser.isActive
                          }">
                      {{ clientUser.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep input[type="checkbox"] {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
  `]
})
export class ClientSettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private clientPortalService = inject(ClientPortalService);
  private i18nService = inject(I18nService);

  clientUser: ClientUser | null = null;
  isLoading = false;
  isSaving = false;
  isChangingPassword = false;
  isSavingNotifications = false;

  profileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  notificationSettings = {
    emailNotifications: true,
    paymentReminders: true,
    projectUpdates: true
  };

  ngOnInit() {
    this.loadClientUser();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadClientUser();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClientUser() {
    this.isLoading = true;
    // Get current user info from dashboard
    this.clientPortalService.getClientDashboard().subscribe({
      next: (dashboard) => {
        // For now, we'll use a mock user object
        // In real implementation, this would come from auth service
        this.clientUser = {
          id: 1,
          companyId: 1,
          email: 'client@example.com',
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          phone: '+1 234 567 8900',
          companyName: 'Construction Co.',
          jobTitle: 'Project Manager',
          isActive: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: '2024-01-15T00:00:00Z'
        };
        this.profileForm = {
          firstName: this.clientUser.firstName,
          lastName: this.clientUser.lastName,
          email: this.clientUser.email,
          phone: this.clientUser.phone || '',
          jobTitle: this.clientUser.jobTitle || ''
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading client user:', error);
        this.isLoading = false;
      }
    });
  }

  updateProfile() {
    this.isSaving = true;
    this.clientPortalService.updateClientUser(this.clientUser!.id, this.profileForm).subscribe({
      next: (updatedUser) => {
        this.clientUser = updatedUser;
        this.isSaving = false;
        alert('Profile updated successfully!');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isSaving = false;
        alert('Error updating profile. Please try again.');
      }
    });
  }

  changePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    this.isChangingPassword = true;
    this.clientPortalService.changeClientPassword(
      this.passwordForm.currentPassword,
      this.passwordForm.newPassword
    ).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        alert('Password changed successfully!');
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.isChangingPassword = false;
        alert('Error changing password. Please check your current password and try again.');
      }
    });
  }

  saveNotificationSettings() {
    this.isSavingNotifications = true;
    // TODO: Implement notification settings API call
    setTimeout(() => {
      this.isSavingNotifications = false;
      alert('Notification preferences saved!');
    }, 1000);
  }

  formatDate(dateString: string): string {
    return this.clientPortalService.formatDate(dateString);
  }

  formatDateTime(dateString: string): string {
    return this.clientPortalService.formatDateTime(dateString);
  }
}
