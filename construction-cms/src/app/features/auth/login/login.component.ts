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
          <div class="visual-overlay"></div>
          <div class="visual-content">
            <div class="branding">
              <div class="logo-circle">
                <svg class="w-12 h-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 class="logo-text">Construction<span class="text-amber-500">CMS</span></h1>
            </div>
            
            <div class="hero-quote">
              <h2 class="quote-title">Building Integrity. <br><span class="highlight">Managing Excellence.</span></h2>
              <p class="quote-desc">Streamline your workforce, inventory, and project life cycles with the industry's most advanced management platform.</p>
            </div>

            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-num">500+</span>
                <span class="stat-label">Projects</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">12k</span>
                <span class="stat-label">Users</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">99%</span>
                <span class="stat-label">Uptime</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Side -->
        <div class="form-side">
          <div class="form-container">
            <div class="mobile-logo md:hidden">
              <div class="logo-icon">
                <svg class="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span class="logo-name">ConstructionCMS</span>
            </div>

            <header class="form-header">
              <h2 class="welcome-msg">{{ 'login.title' | translate }}</h2>
              <p class="instruction">{{ 'login.subtitle' | translate }}</p>
            </header>

            <form (ngSubmit)="onSubmit()" class="login-form">
              <div class="input-group">
                <label class="input-label">{{ 'login.email_label' | translate }}</label>
                <div class="input-wrapper">
                  <div class="input-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
                  </div>
                  <input type="email" [(ngModel)]="email" name="email" class="premium-input" placeholder="name@company.com" required (blur)="emailTouched = true">
                </div>
                <div *ngIf="emailTouched && !email" class="field-error">{{ 'login.error_required' | translate }}</div>
              </div>

              <div class="input-group">
                <div class="label-row">
                  <label class="input-label">{{ 'login.password_label' | translate }}</label>
                  <a routerLink="/auth/forgot-password" class="forgot-link">{{ 'login.forgot_password' | translate }}</a>
                </div>
                <div class="input-wrapper">
                  <div class="input-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" class="premium-input" placeholder="••••••••" required (blur)="passwordTouched = true">
                  <button type="button" class="visibility-toggle" (click)="showPassword = !showPassword">
                    <svg *ngIf="!showPassword" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <svg *ngIf="showPassword" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.413m1.854-1.423A9.92 9.92 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.413m-1.854 1.423a3 3 0 00-4.243-4.243m4.243 4.243L3 3" /></svg>
                  </button>
                </div>
                <div *ngIf="passwordTouched && !password" class="field-error">{{ 'login.error_required' | translate }}</div>
              </div>

              <div class="options">
                <label class="remember-me">
                  <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe">
                  <span>{{ 'login.remember_me' | translate }}</span>
                </label>
              </div>

              <div *ngIf="errorMessage" class="error-toast slide-in">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>{{ errorMessage }}</span>
              </div>

              <button type="submit" class="auth-button" [disabled]="isLoading">
                <div *ngIf="isLoading" class="button-loader"></div>
                <span>{{ isLoading ? ('login.signing_in' | translate) : ('login.submit' | translate) }}</span>
                <svg *ngIf="!isLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </form>

            <footer class="form-footer">
              <p>{{ 'login.no_account' | translate }} <a routerLink="/auth/register" class="register-link">{{ 'login.register_link' | translate }}</a></p>
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
      --bg-visual: #0f172a;
    }

    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
    }

    .auth-box {
      width: 100%;
      height: 100vh;
      display: flex;
      background: #fff;
      overflow: hidden;
    }

    /* Visual Side */
    .visual-side {
      flex: 1.2;
      background: var(--bg-visual);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      overflow: hidden;
    }

    @media (max-width: 1024px) { .visual-side { display: none; } }

    .visual-overlay {
      position: absolute;
      inset: 0;
      background: url('https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=2070') center/cover no-repeat;
      opacity: 0.2;
      filter: grayscale(1);
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
      background: #fff;
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
      background: #fdf2f2;
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
      background: #f1f5f9;
      border: 2px solid transparent;
      border-radius: 14px;
      padding: 0 48px;
      font-size: 15px;
      font-weight: 600;
      color: var(--primary);
      transition: all 0.2s;
    }

    .premium-input:focus {
      outline: none;
      background: #fff;
      border-color: var(--accent);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
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

    .visibility-toggle:hover { color: var(--accent); background: rgba(0,0,0,0.05); }
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
      accent-color: var(--accent);
    }

    .auth-button {
      width: 100%;
      height: 60px;
      background: var(--primary);
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
      background: #1e293b;
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.3);
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
      color: var(--accent);
      font-weight: 700;
      text-decoration: none;
      margin-left: 6px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .register-link:hover { border-bottom-color: var(--accent); }

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

        if (user.roles.includes('SuperAdmin') || user.companyId || user.userType === 2 || user.userType === 0 || user.userType === 1 || user.userType === 5) {
          this.router.navigate(['/dashboard']);
        } else if (user.userType === 3) {
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
