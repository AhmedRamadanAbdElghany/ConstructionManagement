import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../../layout/language-switcher/language-switcher.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, LanguageSwitcherComponent],
  template: `
    <div class="auth-wrapper flex items-center justify-center min-h-screen bg-slate-950 px-4 py-12 relative overflow-hidden">
      <!-- Language Switcher -->
      <div class="absolute top-8 right-8 z-50">
        <app-language-switcher></app-language-switcher>
      </div>

      <div class="site-overlay absolute inset-0 bg-cover bg-center opacity-10 grayscale" style="background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070')"></div>
      
      <div class="auth-box w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-100 dark:border-white/5 animate-premium-fade">
        <div class="box-content p-12 md:p-16">
          <header class="header text-center mb-12">
            <div class="brand-top flex flex-col items-center justify-center mb-10">
              <div class="logo-container bg-indigo-600 rounded-2xl p-4 shadow-xl shadow-indigo-500/20 mb-6">
                <svg class="w-10 h-10 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 5L95 27.5V72.5L50 95L5 72.5V27.5L50 5Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
                  <rect x="35" y="35" width="30" height="30" rx="4" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <h1 class="logo-text text-3xl tracking-tighter font-black text-slate-900 dark:text-white uppercase">
                STRUCT <span class="text-indigo-600">CMS</span>
              </h1>
              <p class="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400 mt-2">Security Protocol</p>
            </div>
            <h1 class="title text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ 'forgot_password.title' | translate }}</h1>
            <p class="subtitle text-slate-500 mt-3 font-medium leading-relaxed">{{ 'forgot_password.subtitle' | translate }}</p>
          </header>

          <form (ngSubmit)="onSubmit()" class="auth-form space-y-8" *ngIf="!submitted">
            <div class="input-group">
              <label class="input-label text-xs uppercase tracking-widest font-black text-slate-400 mb-3 block pl-1">{{ 'forgot_password.email_label' | translate }}</label>
              <div class="input-wrapper group relative">
                <div class="input-icon absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input type="email" [(ngModel)]="email" name="email" class="modern-input w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 outline-none transition-all font-medium" [attr.placeholder]="'forgot_password.email_placeholder' | translate" required email (blur)="emailTouched = true">
              </div>
              <div *ngIf="emailTouched && !isEmailValid" class="field-error text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 px-1">{{ 'forgot_password.error_invalid_email' | translate }}</div>
            </div>

            <div *ngIf="errorMessage" class="error-toast flex items-center bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-500/20 p-5 rounded-2xl animate-premium-fade">
              <svg class="w-5 h-5 text-rose-500 mr-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span class="text-rose-600 dark:text-rose-400 font-bold text-sm leading-tight">{{ errorMessage }}</span>
            </div>

            <button type="submit" class="submit-btn w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white rounded-2xl shadow-2xl shadow-indigo-500/30 flex items-center justify-center group transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none" [disabled]="isLoading">
              <div *ngIf="isLoading" class="loader w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
              <span class="font-black uppercase tracking-[0.2em] text-sm">{{ isLoading ? ('forgot_password.processing' | translate) : ('forgot_password.submit' | translate) }}</span>
              <svg *ngIf="!isLoading" class="ml-4 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>

          <div class="success-box text-center p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-500/20 animate-premium-fade" *ngIf="submitted">
            <div class="status-icon w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20 mx-auto mb-6">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 class="status-title text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-3">{{ 'forgot_password.success_title' | translate }}</h2>
            <p class="status-msg text-emerald-700/70 dark:text-emerald-300/70 font-medium leading-relaxed">{{ 'forgot_password.success_message' | translate }}</p>
          </div>

          <footer class="box-footer mt-12 text-center">
            <a routerLink="/auth/login" class="back-link inline-flex items-center text-indigo-600 hover:text-indigo-800 font-black uppercase tracking-[0.15em] text-xs transition-all hover:-translate-x-1">
              <svg class="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span>{{ 'forgot_password.back_to_login' | translate }}</span>
            </a>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #0f172a;
      --accent: #f59e0b;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --bg-surface: #ffffff;
      --ring-color: rgba(245, 158, 11, 0.15);
    }

    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #0f172a;
      position: relative;
      overflow: hidden;
      padding: 24px;
    }

    .site-overlay {
      position: absolute;
      inset: 0;
      background: url('https://images.unsplash.com/photo-1541975017476-14381ff9ad9c?auto=format&fit=crop&q=80&w=2070') center/cover no-repeat;
      opacity: 0.15;
      filter: grayscale(1);
    }

    .auth-box {
      width: 100%;
      max-width: 480px;
      background: var(--bg-surface);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
      z-index: 10;
      overflow: hidden;
    }

    .box-content {
      padding: 48px;
    }

    @media (max-width: 480px) { .box-content { padding: 32px 24px; } }

    .header {
      margin-bottom: 40px;
      text-align: center;
    }

    .brand-top {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 40px;
    }

    .logo-ring {
      width: 44px;
      height: 44px;
      background: #fdf2f2;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 900;
      color: var(--primary);
      letter-spacing: -0.01em;
    }

    .title {
      font-size: 28px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 15px;
      line-height: 1.5;
      font-weight: 500;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .input-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-left: 4px;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .modern-input {
      width: 100%;
      height: 56px;
      background: #f1f5f9;
      border: 2px solid transparent;
      border-radius: 14px;
      padding: 0 16px 0 48px;
      font-size: 15px;
      font-weight: 600;
      color: var(--primary);
      transition: all 0.2s;
    }

    .modern-input:focus {
      outline: none;
      background: #fff;
      border-color: var(--accent);
      box-shadow: 0 0 0 4px var(--ring-color);
    }

    .input-icon {
      position: absolute;
      left: 16px;
      color: var(--text-muted);
      display: flex;
    }
    .input-icon svg { width: 20px; height: 20px; }

    .field-error { color: #ef4444; font-size: 11px; font-weight: 600; margin-top: 4px; padding-left: 4px; }

    .submit-btn {
      width: 100%;
      height: 60px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .submit-btn:hover:not(:disabled) {
      background: #1e293b;
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.3);
    }

    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .loader {
      width: 22px;
      height: 22px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .error-toast {
      background: #fef2f2;
      color: #ef4444;
      padding: 14px 18px;
      border-radius: 14px;
      border: 1px solid #fee2e2;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Success State */
    .success-box {
      text-align: center;
      padding: 16px 0;
    }

    .status-icon {
      width: 64px;
      height: 64px;
      background: #f0fdf4;
      color: #10b981;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .status-icon svg { width: 32px; height: 32px; }

    .status-title {
      font-size: 22px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 12px;
    }

    .status-msg {
      color: var(--text-muted);
      font-size: 15px;
      line-height: 1.6;
    }

    .box-footer {
      margin-top: 40px;
      padding-top: 32px;
      border-top: 1px solid #f1f5f9;
      text-align: center;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      transition: all 0.2s;
    }

    .back-link:hover { color: var(--accent); }

    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 0.8s ease-out; }
    .slide-in { animation: slideIn 0.4s ease-out; }

    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]

})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  isLoading = false;
  errorMessage = '';
  emailTouched = false;
  submitted = false;

  get isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  onSubmit(): void {
    this.emailTouched = true;

    if (!this.email || !this.isEmailValid) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.submitted = true;
      },
      error: (error) => {
        this.isLoading = false;
        this.submitted = true;
      }
    });
  }
}
