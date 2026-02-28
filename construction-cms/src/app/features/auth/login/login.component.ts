import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


import { LanguageSwitcherComponent } from '../../../layout/language-switcher/language-switcher.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, LanguageSwitcherComponent],
  template: `
    <div class="auth-wrapper">
      <!-- Language Switcher -->
      <div class="absolute top-8 right-8 z-50">
        <app-language-switcher></app-language-switcher>
      </div>

      <div class="auth-box">
        <!-- Visual Side -->
        <div class="visual-side">
          <div class="site-overlay bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" [style.backgroundImage]="'url(' + ('auth.bg_image' | translate) + ')'"></div>
          <div class="visual-content relative z-10">
            <div class="branding animate-premium-fade" style="animation-delay: 100ms">
              <div class="logo-container bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-4">
                <svg class="w-12 h-12 text-indigo-400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 5L95 27.5V72.5L50 95L5 72.5V27.5L50 5Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
                  <path d="M50 5V95M5 27.5L95 72.5M95 27.5L5 72.5" stroke="currentColor" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="4 4"/>
                  <rect x="35" y="35" width="30" height="30" rx="4" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>
                  <path d="M45 50H55M50 45V55" stroke="white" stroke-width="3" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="logo-text-wrapper ml-4">
                <h1 class="logo-text text-white text-4xl tracking-tighter font-black flex items-center">
                  STRUCT <span class="text-indigo-500 ml-2">CMS</span>
                </h1>
                <p class="text-[10px] uppercase tracking-[0.3em] font-bold text-indigo-400/80">Enterprise Logic</p>
              </div>
            </div>
            
            <div class="hero-quote animate-premium-fade" style="animation-delay: 300ms">
              <h2 class="quote-title text-white text-5xl font-black leading-tight tracking-tight">
                {{ 'auth.hero_title' | translate }} <br>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{{ 'auth.hero_highlight' | translate }}</span>
              </h2>
              <p class="quote-desc text-slate-400 text-lg mt-6 max-w-md font-medium leading-relaxed">{{ 'auth.hero_description' | translate }}</p>
            </div>
 
            <div class="stats-grid animate-premium-fade" style="animation-delay: 500ms">
              <div class="stat-item group bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all">
                <span class="stat-num text-3xl font-black text-white block mb-1">500+</span>
                <span class="stat-label text-slate-400 text-xs uppercase tracking-widest font-bold">{{ 'auth.stat_projects' | translate }}</span>
              </div>
              <div class="stat-item group bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all">
                <span class="stat-num text-3xl font-black text-white block mb-1">12k</span>
                <span class="stat-label text-slate-400 text-xs uppercase tracking-widest font-bold">{{ 'auth.stat_users' | translate }}</span>
              </div>
              <div class="stat-item group bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all">
                <span class="stat-num text-3xl font-black text-white block mb-1">99.9%</span>
                <span class="stat-label text-slate-400 text-xs uppercase tracking-widest font-bold">{{ 'auth.stat_uptime' | translate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Side -->
        <div class="form-side">
          <div class="form-container">
            <div class="mobile-logo md:hidden animate-premium-fade mb-8">
              <div class="logo-icon bg-indigo-600 rounded-lg p-2 mr-3">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span class="logo-name uppercase tracking-[0.2em] font-black text-xl">STRUCT CMS</span>
            </div>
 
            <header class="form-header animate-premium-fade" style="animation-delay: 100ms">
              <h2 class="welcome-msg text-3xl font-black tracking-tight text-slate-900 dark:text-white">{{ 'login.title' | translate }}</h2>
              <p class="instruction text-slate-500 mt-2 font-medium">{{ 'login.subtitle' | translate }}</p>
            </header>
 
            <form (ngSubmit)="onSubmit()" class="login-form mt-10">
              <div class="input-group animate-premium-fade" style="animation-delay: 200ms">
                <label class="input-label text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">{{ 'login.email_label' | translate }}</label>
                <div class="input-wrapper group relative">
                  <div class="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
                  </div>
                  <input type="email" [(ngModel)]="email" name="email" class="premium-input w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 outline-none transition-all" [placeholder]="'login.email_placeholder' | translate" required (blur)="emailTouched = true">
                </div>
                <div *ngIf="emailTouched && !email" class="field-error text-rose-500 text-xs mt-2 font-bold">{{ 'login.error_required' | translate }}</div>
              </div>
 
              <div class="input-group animate-premium-fade mt-6" style="animation-delay: 300ms">
                <div class="flex justify-between items-center mb-2">
                  <label class="input-label text-xs uppercase tracking-widest font-black text-slate-400">{{ 'login.password_label' | translate }}</label>
                  <a routerLink="/auth/forgot-password" class="forgot-link text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wider transition-colors">
                    {{ 'login.forgot_password' | translate }}
                  </a>
                </div>
                <div class="input-wrapper group relative">
                  <div class="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" class="premium-input w-full pl-12 pr-12 py-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 outline-none transition-all" [placeholder]="'login.password_placeholder' | translate" required (blur)="passwordTouched = true">
                  <button type="button" class="visibility-toggle absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" (click)="showPassword = !showPassword">
                    <svg *ngIf="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <svg *ngIf="showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.413m1.854-1.423A9.92 9.92 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.413m-1.854 1.423a3 3 0 00-4.243-4.243m4.243 4.243L3 3" /></svg>
                  </button>
                </div>
                <div *ngIf="passwordTouched && !password" class="field-error text-rose-500 text-xs mt-2 font-bold">{{ 'login.error_required' | translate }}</div>
              </div>
 
              <div class="options animate-premium-fade mt-6" style="animation-delay: 400ms">
                <label class="remember-me flex items-center group cursor-pointer">
                  <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all">
                  <span class="ml-3 font-bold text-slate-500 group-hover:text-slate-700 transition-colors">{{ 'login.remember_me' | translate }}</span>
                </label>
              </div>
 
              <div *ngIf="errorMessage" class="error-toast flex items-center bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-500/20 p-4 rounded-xl mt-6 animate-premium-fade" style="animation-delay: 50ms">
                <svg class="w-5 h-5 text-rose-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span class="text-rose-600 dark:text-rose-400 font-bold text-sm">{{ errorMessage }}</span>
              </div>
 
              <button type="submit" class="auth-button w-full mt-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white rounded-xl shadow-xl shadow-indigo-500/20 flex items-center justify-center group transition-all active:scale-95 animate-premium-fade disabled:opacity-70 disabled:pointer-events-none" [disabled]="isLoading" style="animation-delay: 500ms">
                <div *ngIf="isLoading" class="button-loader w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                <span class="font-black uppercase tracking-[0.2em] text-sm">{{ isLoading ? ('login.signing_in' | translate) : ('login.submit' | translate) }}</span>
                <svg *ngIf="!isLoading" class="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </form>
 
            <footer class="form-footer mt-10 text-center animate-premium-fade" style="animation-delay: 600ms">
              <p class="font-medium text-slate-500">{{ 'login.no_account' | translate }} 
                <a routerLink="/auth/register" class="register-link text-indigo-600 font-black uppercase tracking-wider hover:text-indigo-700 ml-2 transition-colors">
                  {{ 'login.register_link' | translate }}
                </a>
              </p>
            </footer>
          </div>
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
      --border: #e2e8f0;
    }

    :host-context(.dark) {
      --primary: #f8fafc;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --border: rgba(255, 255, 255, 0.1);
    }

    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--app-bg);
      transition: background 0.5s ease;
    }

    .auth-box {
      width: 100%;
      height: 100vh;
      display: flex;
      background: var(--card-bg);
      overflow: hidden;
    }

    /* Visual Side */
    .visual-side {
      flex: 1.2;
      background: #0f172a;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      overflow: hidden;
    }

    @media (max-width: 1024px) { .visual-side { display: none; } }

    .site-overlay {
      position: absolute;
      inset: 0;
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      opacity: 0.25;
      filter: grayscale(0.5) contrast(1.2);
    }

    .visual-content {
      position: relative;
      z-index: 10;
      color: #fff;
      max-width: 500px;
    }

    .branding {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 80px;
      animation: fadeInDown 0.8s ease-out;
    }

    .logo-circle {
      width: 56px;
      height: 56px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-text {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.02em;
    }

    .hero-quote {
      margin-bottom: 60px;
      animation: fadeIn 1s ease-out 0.2s both;
    }

    .quote-title {
      font-size: 48px;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 24px;
    }

    .highlight { color: var(--accent); }

    .quote-desc {
      font-size: 19px;
      color: #94a3b8;
      line-height: 1.6;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      animation: fadeInUp 1s ease-out 0.4s both;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-num {
      font-size: 24px;
      font-weight: 800;
      color: var(--accent);
    }

    .stat-label {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }

    /* Form Side */
    .form-side {
      flex: 1;
      background: var(--card-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      z-index: 20;
    }

    .form-container {
      width: 100%;
      max-width: 440px;
      animation: fadeIn 0.6s ease-out;
    }

    .mobile-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 40px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-name {
      font-size: 20px;
      font-weight: 800;
      color: var(--primary);
    }

    .form-header {
      margin-bottom: 40px;
    }

    .welcome-msg {
      font-size: 32px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 8px;
      letter-spacing: -0.01em;
    }

    .instruction {
      font-size: 16px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .input-label {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-left: 4px;
    }

    .forgot-link {
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
      text-decoration: none;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .premium-input {
      width: 100%;
      height: 56px;
      background: var(--input-bg);
      border: 2px solid var(--glass-border);
      border-radius: 14px;
      padding: 0 48px;
      font-size: 15px;
      font-weight: 600;
      color: var(--app-text);
      transition: all 0.2s;
    }

    .premium-input:focus {
      outline: none;
      background: var(--card-bg);
      border-color: var(--accent-blue);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    }

    .input-icon {
      position: absolute;
      left: 16px;
      color: var(--text-muted);
      width: 20px;
      height: 20px;
      pointer-events: none;
    }

    .visibility-toggle {
      position: absolute;
      right: 14px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
    }

    .visibility-toggle:hover { color: var(--accent-blue); background: rgba(0,0,0,0.05); }
    .visibility-toggle svg { width: 20px; height: 20px; }

    .options {
      margin-top: -8px;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .remember-me input {
      width: 18px;
      height: 18px;
      border: 2px solid var(--border);
      border-radius: 6px;
      accent-color: var(--accent-blue);
    }

    .auth-button {
      width: 100%;
      height: 60px;
      background: var(--accent-blue);
      color: #fff;
      border: none;
      border-radius: 16px;
      font-size: 17px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-top: 10px;
    }

    .auth-button:hover:not(:disabled) {
      background: var(--accent-blue);
      filter: brightness(1.1);
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -6px rgba(59, 130, 246, 0.3);
    }

    .auth-button:disabled { opacity: 0.6; cursor: not-allowed; }

    .button-loader {
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

    .field-error { color: #ef4444; font-size: 11px; font-weight: 600; margin-top: 4px; padding-left: 4px; }

    .form-footer {
      margin-top: 40px;
      text-align: center;
      font-size: 16px;
      font-weight: 500;
      color: var(--text-muted);
    }

    .register-link {
      color: var(--accent-blue);
      font-weight: 700;
      text-decoration: none;
      margin-left: 6px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .register-link:hover { border-bottom-color: var(--accent-blue); }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .slide-in { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
  `],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  emailTouched = false;
  passwordTouched = false;
  logoUrl?: string;

  onSubmit(): void {
    this.emailTouched = true;
    this.passwordTouched = true;

    if (!this.email || !this.password) {
      this.errorMessage = this.translate.instant('login.error_required');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        const user = response.user;

        // All users go to their appropriate dashboard — multi-company data is shown automatically
        if (user.userType === 3) {
          this.router.navigate(['/inventory-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;

        if (error.error?.errors) {
          // Handle ASP.NET Core Validation Errors (RFC 7807)
          const validationErrors = error.error.errors;
          const messages = Object.keys(validationErrors)
            .map(key => validationErrors[key].join(', '));
          this.errorMessage = messages.join(' | ');
        } else {
          this.errorMessage = error.error?.message || this.translate.instant('login.error_invalid');
        }
      }
    });
  }
}
