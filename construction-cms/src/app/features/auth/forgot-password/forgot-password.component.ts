import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="site-overlay"></div>
      <div class="auth-box fade-in">
        <div class="box-content">
          <header class="header">
            <div class="brand-top">
              <div class="logo-ring">
                <svg class="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span class="logo-text">Construction<span class="text-amber-500">CMS</span></span>
            </div>
            <h1 class="title">Reset Account Access</h1>
            <p class="subtitle">Enter your registered email and we'll send you a recovery link.</p>
          </header>

          <form (ngSubmit)="onSubmit()" class="auth-form" *ngIf="!submitted">
            <div class="input-group">
              <label class="input-label">Corporate Email</label>
              <div class="input-wrapper">
                <div class="input-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input type="email" [(ngModel)]="email" name="email" class="modern-input" placeholder="e.g. hassan@firm.com" required email (blur)="emailTouched = true">
              </div>
              <div *ngIf="emailTouched && !isEmailValid" class="field-error">Please provide a valid work email</div>
            </div>

            <div *ngIf="errorMessage" class="error-toast slide-in">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>{{ errorMessage }}</span>
            </div>

            <button type="submit" class="submit-btn" [disabled]="isLoading">
              <div *ngIf="isLoading" class="loader"></div>
              <span>{{ isLoading ? 'Processing...' : 'Secure Recovery' }}</span>
              <svg *ngIf="!isLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>

          <div class="success-box slide-in" *ngIf="submitted">
            <div class="status-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 class="status-title">Dispatch Successful</h2>
            <p class="status-msg">If an account matches <strong>{{ email }}</strong>, recovery instructions will arrive shortly. Please check your inbox and safety folders.</p>
          </div>

          <footer class="box-footer">
            <a routerLink="/auth/login" class="back-link">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span>Return to Personnel Login</span>
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
