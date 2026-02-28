import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { LanguageSwitcherComponent } from '../../../layout/language-switcher/language-switcher.component';

@Component({
  selector: 'app-register',
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
          <div class="visual-inner relative z-10">
            <div class="brand-header animate-premium-fade" style="animation-delay: 100ms">
              <div class="logo-container bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-4">
                <svg class="w-12 h-12 text-indigo-400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 5L95 27.5V72.5L50 95L5 72.5V27.5L50 5Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
                  <path d="M50 5V95M5 27.5L95 72.5M95 27.5L5 72.5" stroke="currentColor" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="4 4"/>
                  <rect x="35" y="35" width="30" height="30" rx="4" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>
                  <path d="M45 50H55M50 45V55" stroke="white" stroke-width="3" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="logo-text-wrapper ml-4 text-left">
                <h1 class="logo-text text-white text-4xl tracking-tighter font-black flex items-center">
                  STRUCT <span class="text-indigo-500 ml-2">CMS</span>
                </h1>
                <p class="text-[10px] uppercase tracking-[0.3em] font-bold text-indigo-400/80">Enterprise Logic</p>
              </div>
            </div>
            
            <div class="branding-hero animate-premium-fade" style="animation-delay: 300ms text-left">
              <h1 class="hero-title text-white text-5xl font-black leading-tight tracking-tight">
                {{ 'auth.register_hero_title' | translate }} <br>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{{ 'auth.register_hero_highlight' | translate }}</span>
              </h1>
              <p class="hero-subtext text-slate-400 text-lg mt-6 max-w-md font-medium leading-relaxed">{{ 'auth.register_hero_desc' | translate }}</p>
            </div>
 
            <div class="feature-pills animate-premium-fade mt-10" style="animation-delay: 500ms">
              <div class="pill group flex items-center bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl mb-4 hover:translate-x-2 transition-transform">
                <div class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 mr-4">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <span class="font-bold text-white uppercase tracking-wider text-xs">{{ 'auth.feature_security' | translate }}</span>
              </div>
              <div class="pill group flex items-center bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl mb-4 hover:translate-x-2 transition-transform">
                <div class="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 mr-4">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span class="font-bold text-white uppercase tracking-wider text-xs">{{ 'auth.feature_sync' | translate }}</span>
              </div>
              <div class="pill group flex items-center bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl mb-4 hover:translate-x-2 transition-transform">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 mr-4">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <span class="font-bold text-white uppercase tracking-wider text-xs">{{ 'auth.feature_insights' | translate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Side -->
        <div class="form-side">
          <div class="form-content max-w-2xl mx-auto py-12 px-8">
            <header class="form-header animate-premium-fade mb-10">
              <h2 class="form-title text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ 'register.title' | translate }}</h2>
              <p class="form-subtitle text-slate-500 mt-2 font-medium">{{ 'register.subtitle' | translate }}</p>
            </header>
 
            <form (ngSubmit)="onSubmit()" class="register-layout space-y-6">
              <div class="form-row grid grid-cols-1 md:grid-cols-2 gap-6 animate-premium-fade" style="animation-delay: 100ms">
                <div class="form-field">
                  <label class="field-label text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">{{ 'register.full_name' | translate }}</label>
                  <input type="text" [(ngModel)]="fullName" name="fullName" class="modern-input w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 outline-none transition-all font-medium" [attr.placeholder]="'register.full_name_placeholder' | translate" required (blur)="fullNameTouched = true">
                  <div *ngIf="fullNameTouched && !fullName" class="error-tip text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 px-1">{{ 'register.error_required' | translate }}</div>
                </div>
 
                <div class="form-field">
                  <label class="field-label text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">{{ 'register.email_label' | translate }}</label>
                  <input type="email" [(ngModel)]="email" name="email" class="modern-input w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 outline-none transition-all font-medium" [attr.placeholder]="'register.email_placeholder' | translate" required email (blur)="emailTouched = true">
                  <div *ngIf="emailTouched && !isEmailValid" class="error-tip text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 px-1">{{ 'register.error_required' | translate }}</div>
                </div>
              </div>
 
              <div class="form-row grid grid-cols-1 md:grid-cols-2 gap-6 animate-premium-fade" style="animation-delay: 200ms">
                <div class="form-field">
                  <label class="field-label text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">{{ 'register.phone' | translate }}</label>
                  <input type="tel" [(ngModel)]="phone" name="phone" class="modern-input w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 outline-none transition-all font-medium" [attr.placeholder]="'register.phone_placeholder' | translate">
                </div>
 
                <div class="form-field">
                  <label class="field-label text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">{{ 'register.professional_role' | translate }}</label>
                  <div class="select-box relative">
                    <select [(ngModel)]="userType" name="userType" class="modern-input w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 outline-none transition-all font-bold appearance-none cursor-pointer" required>
                      <option [value]="0">{{ 'register.role_stakeholder' | translate }}</option>
                      <option [value]="1">{{ 'register.role_engineer' | translate }}</option>
                      <option [value]="2">{{ 'register.role_owner' | translate }}</option>
                      <option [value]="3">{{ 'register.role_inventory' | translate }}</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>
 
              <div class="form-field animate-premium-fade" style="animation-delay: 300ms">
                <label class="field-label text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">{{ 'register.password_label' | translate }}</label>
                <div class="input-action group relative">
                  <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" class="modern-input w-full pl-4 pr-12 py-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 outline-none transition-all font-medium" [attr.placeholder]="'register.password_hint' | translate" required (input)="checkPasswordStrength()" (blur)="passwordTouched = true">
                  <button type="button" class="action-toggle absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors" (click)="showPassword = !showPassword">
                    <svg *ngIf="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <svg *ngIf="showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.413m1.854-1.423A9.92 9.92 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.413m-1.854 1.423a3 3 0 00-4.243-4.243m4.243 4.243L3 3" /></svg>
                  </button>
                </div>
                
                <div class="strength-indicator mt-4" *ngIf="password">
                  <div class="strength-track h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div class="strength-fill h-full transition-all duration-500" [style.width.%]="passwordStrengthPercent" [class]="passwordStrengthClass"></div>
                  </div>
                  <div class="strength-labels flex flex-wrap gap-x-4 gap-y-2 mt-3">
                    <div class="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors" [class.text-emerald-500]="hasLowerCase">
                      <div class="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></div>
                      {{ 'register.strength_lowercase' | translate }}
                    </div>
                    <div class="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors" [class.text-emerald-500]="hasUpperCase">
                      <div class="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></div>
                      {{ 'register.strength_uppercase' | translate }}
                    </div>
                    <div class="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors" [class.text-emerald-500]="hasNumber">
                      <div class="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></div>
                      {{ 'register.strength_number' | translate }}
                    </div>
                    <div class="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors" [class.text-emerald-500]="hasSpecialChar">
                      <div class="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></div>
                      {{ 'register.strength_symbol' | translate }}
                    </div>
                    <div class="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors" [class.text-emerald-500]="hasMinLength">
                      <div class="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></div>
                      {{ 'register.strength_min_length' | translate }}
                    </div>
                  </div>
                </div>
              </div>
 
              <div class="form-field animate-premium-fade" style="animation-delay: 400ms">
                <label class="field-label text-xs uppercase tracking-widest font-black text-slate-400 mb-2 block">{{ 'register.confirm_password' | translate }}</label>
                <div class="input-action group relative">
                  <input [type]="showConfirmPassword ? 'text' : 'password'" [(ngModel)]="confirmPassword" name="confirmPassword" class="modern-input w-full pl-4 pr-12 py-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 outline-none transition-all font-medium" [attr.placeholder]="'register.password_repeat' | translate" required (blur)="confirmPasswordTouched = true">
                  <button type="button" class="action-toggle absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors" (click)="showConfirmPassword = !showConfirmPassword">
                    <svg *ngIf="!showConfirmPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <svg *ngIf="showConfirmPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.413m1.854-1.423A9.92 9.92 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.413m-1.854 1.423a3 3 0 00-4.243-4.243m4.243 4.243L3 3" /></svg>
                  </button>
                </div>
                <div *ngIf="confirmPasswordTouched && password !== confirmPassword" class="error-tip text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 px-1">{{ 'register.password_mismatch' | translate }}</div>
              </div>
 
              <div class="alert-area animate-premium-fade" style="animation-delay: 450ms">
                <div *ngIf="errorMessage" class="toast flex items-center bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-500/20 p-4 rounded-xl mt-6 animate-premium-fade">
                  <svg class="w-5 h-5 text-rose-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span class="text-rose-600 dark:text-rose-400 font-bold text-sm">{{ errorMessage }}</span>
                </div>
                <div *ngIf="successMessage" class="toast flex items-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl mt-6 animate-premium-fade">
                  <svg class="w-5 h-5 text-emerald-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span class="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{{ successMessage }}</span>
                </div>
              </div>
 
              <button type="submit" class="primary-button w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white rounded-xl shadow-xl shadow-indigo-500/20 flex items-center justify-center group transition-all active:scale-95 animate-premium-fade disabled:opacity-70 disabled:pointer-events-none" [disabled]="isLoading || !isFormValid" style="animation-delay: 500ms">
                <div *ngIf="isLoading" class="btn-loader w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                <span class="font-black uppercase tracking-[0.2em] text-sm">{{ isLoading ? ('register.creating' | translate) : ('register.submit' | translate) }}</span>
                <svg *ngIf="!isLoading" class="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </form>
 
            <footer class="alt-action animate-premium-fade" style="animation-delay: 600ms">
              <span class="font-medium text-slate-400">{{ 'register.have_account' | translate }}</span> <a routerLink="/auth/login" class="login-link text-indigo-600 font-black uppercase tracking-wider hover:text-indigo-700 transition-colors">{{ 'register.login_link' | translate }}</a>
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

    .visual-inner {
      position: relative;
      z-index: 10;
      color: #fff;
      max-width: 520px;
    }

    .brand-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 80px;
    }

    .logo-box {
      width: 56px;
      height: 56px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-name {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.02em;
    }

    .branding-hero {
      margin-bottom: 60px;
    }

    .hero-title {
      font-size: 48px;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 24px;
    }

    .highlight { color: var(--accent); }

    .hero-subtext {
      font-size: 19px;
      color: #94a3b8;
      line-height: 1.6;
    }

    .feature-pills {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .pill {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 12px 20px;
      border-radius: 14px;
      backdrop-filter: blur(10px);
    }

    .pill svg { width: 20px; height: 20px; color: var(--accent); }
    .pill span { font-size: 15px; font-weight: 600; color: #cbd5e1; }

    /* Form Side */
    .form-side {
      flex: 1;
      background: var(--card-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      overflow-y: auto;
    }

    .form-content {
      width: 100%;
      max-width: 540px;
      animation: fadeIn 0.6s ease-out;
    }

    .form-header {
      margin-bottom: 40px;
    }

    .form-title {
      font-size: 32px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 8px;
      letter-spacing: -0.01em;
    }

    .form-subtitle {
      font-size: 16px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .register-layout {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-label {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-left: 4px;
    }

    .modern-input {
      width: 100%;
      height: 54px;
      background: var(--input-bg);
      border: 2px solid var(--glass-border);
      border-radius: 14px;
      padding: 0 16px;
      font-size: 15px;
      font-weight: 600;
      color: var(--app-text);
      transition: all 0.2s;
    }

    .modern-input:focus {
      outline: none;
      background: var(--card-bg);
      border-color: var(--accent-blue);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    }

    .input-action {
      position: relative;
      display: flex;
      align-items: center;
    }

    .action-toggle {
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

    .action-toggle:hover { color: var(--accent-blue); background: rgba(0,0,0,0.05); }
    .action-toggle svg { width: 20px; height: 20px; }

    .strength-indicator {
      margin-top: 10px;
    }

    .strength-track {
      height: 6px;
      background: var(--app-bg);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 8px;
      border: 1px solid var(--glass-border);
    }

    .strength-fill {
      height: 100%;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .strength-fill.weak { background: #ef4444; }
    .strength-fill.fair { background: #f59e0b; }
    .strength-fill.good { background: #3b82f6; }
    .strength-fill.strong { background: #10b981; }

    .strength-labels {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .strength-labels span {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .strength-labels span::before { content: '○'; }
    .strength-labels span.met { color: #10b981; }
    .strength-labels span.met::before { content: '●'; }

    .primary-button {
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

    .primary-button:hover:not(:disabled) {
      background: var(--accent-blue);
      filter: brightness(1.1);
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -6px rgba(59, 130, 246, 0.3);
    }

    .primary-button:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-loader {
      width: 22px;
      height: 22px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .toast {
      padding: 14px 18px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .error-toast { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
    .success-toast { background: #f0fdf4; color: #10b981; border: 1px solid #dcfce7; }

    .error-tip { color: #ef4444; font-size: 11px; font-weight: 600; margin-top: 4px; padding-left: 4px; }

    .alt-action {
      margin-top: 40px;
      text-align: center;
      font-size: 16px;
      font-weight: 500;
      color: var(--text-muted);
    }

    .login-link {
      color: var(--accent-blue);
      font-weight: 700;
      text-decoration: none;
      margin-left: 6px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .login-link:hover { border-bottom-color: var(--accent-blue); }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .slide-in { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
  `],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translateService = inject(TranslateService);

  fullName = '';
  email = '';
  phone = '';
  userType: number | null = null;
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Validation states
  fullNameTouched = false;
  emailTouched = false;
  passwordTouched = false;
  confirmPasswordTouched = false;
  userTypeTouched = false;
  phoneTouched = false;

  // Password strength
  hasLowerCase = false;
  hasUpperCase = false;
  hasNumber = false;
  hasSpecialChar = false;
  hasMinLength = false;

  get isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  get isFormValid(): boolean {
    return !!(
      this.fullName &&
      this.email &&
      this.isEmailValid &&
      this.userType !== null &&
      this.password &&
      this.password === this.confirmPassword &&
      this.hasLowerCase &&
      this.hasUpperCase &&
      this.hasNumber &&
      this.hasSpecialChar &&
      this.hasMinLength
    );
  }

  get passwordStrengthPercent(): number {
    let strength = 0;
    if (this.hasLowerCase) strength += 20;
    if (this.hasUpperCase) strength += 20;
    if (this.hasNumber) strength += 20;
    if (this.hasSpecialChar) strength += 20;
    if (this.hasMinLength) strength += 20;
    return strength;
  }

  get passwordStrengthClass(): string {
    const percent = this.passwordStrengthPercent;
    if (percent <= 40) return 'weak';
    if (percent <= 60) return 'fair';
    if (percent <= 80) return 'good';
    return 'strong';
  }

  get passwordStrengthText(): string {
    const percent = this.passwordStrengthPercent;
    if (percent <= 40) return 'Weak';
    if (percent <= 60) return 'Fair';
    if (percent <= 80) return 'Good';
    return 'Strong';
  }

  checkPasswordStrength(): void {
    this.hasLowerCase = /[a-z]/.test(this.password);
    this.hasUpperCase = /[A-Z]/.test(this.password);
    this.hasNumber = /[0-9]/.test(this.password);
    this.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
    this.hasMinLength = this.password.length >= 8;
  }

  onSubmit(): void {
    if (!this.isFormValid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      phone: this.phone || undefined,
      userType: this.userType!
    }).subscribe({
      next: (response) => {
        if (response.success) {
          const user = response.user;
          this.successMessage = this.translateService.instant('register.success_message');

          setTimeout(() => {
            if (user.userType === 3) { // InventoryOwner
              this.router.navigate(['/inventory-dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }, 1500);
        } else {
          this.isLoading = false;
          this.errorMessage = response.message || 'Registration failed. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || error.message || 'An error occurred during registration.';
      }
    });
  }
}
