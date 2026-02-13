import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientPortalService, ClientLoginRequest, ClientLoginResponse } from '../../../core/services/client-portal.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-client-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <img *ngIf="logoUrl" [src]="logoUrl" alt="Company Logo">
            <h1 *ngIf="!logoUrl">{{ 'client_login.title' | translate }}</h1>
          </div>
          <p class="subtitle">{{ 'client_login.subtitle' | translate }}</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">{{ 'client_login.email_label' | translate }}</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              class="form-control"
              [attr.placeholder]="'client_login.email_placeholder' | translate"
              required
              email>
          </div>

          <div class="form-group">
            <label for="password">{{ 'client_login.password_label' | translate }}</label>
            <div class="password-input">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                [(ngModel)]="password"
                name="password"
                class="form-control"
                [attr.placeholder]="'client_login.password_placeholder' | translate"
                required>
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                <svg *ngIf="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg *ngIf="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.413m1.854-1.423A9.92 9.92 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.413m-1.854 1.423a3 3 0 00-4.243-4.243m4.243 4.243L3 3" />
                </svg>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe">
              <span>{{ 'client_login.remember_me' | translate }}</span>
            </label>
            <a routerLink="/client-portal/forgot-password" class="forgot-link">{{ 'client_login.forgot_password' | translate }}</a>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">{{ 'client_login.submit' | translate }}</span>
            <span *ngIf="isLoading">{{ 'client_login.signing_in' | translate }}</span>
          </button>
        </form>

        <div class="login-footer">
          <p>{{ 'client_login.no_account' | translate }} <a routerLink="/client-portal/register">{{ 'client_login.contact_manager' | translate }}</a></p>
        </div>

        <div class="login-help">
          <p>{{ 'client_login.need_help' | translate }} <a href="mailto:support&#64;company.com">{{ 'client_login.contact_support' | translate }}</a></p>
        </div>
      </div>

      <div class="login-features">
        <h2>{{ 'client_login.welcome_title' | translate }}</h2>
        <ul>
          <li>
            <i class="icon-project"></i>
            <div>
              <strong>{{ 'client_login.feature_track' | translate }}</strong>
              <p>{{ 'client_login.feature_track_desc' | translate }}</p>
            </div>
          </li>
          <li>
            <i class="icon-document"></i>
            <div>
              <strong>{{ 'client_login.feature_docs' | translate }}</strong>
              <p>{{ 'client_login.feature_docs_desc' | translate }}</p>
            </div>
          </li>
          <li>
            <i class="icon-payment"></i>
            <div>
              <strong>{{ 'client_login.feature_payments' | translate }}</strong>
              <p>{{ 'client_login.feature_payments_desc' | translate }}</p>
            </div>
          </li>
          <li>
            <i class="icon-message"></i>
            <div>
              <strong>{{ 'client_login.feature_comms' | translate }}</strong>
              <p>{{ 'client_login.feature_comms_desc' | translate }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      flex: 0 0 450px;
      background: white;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo img {
      max-height: 60px;
      margin-bottom: 16px;
    }

    .logo h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #6b7280;
      font-size: 14px;
    }

    .login-form {
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #374151;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .password-input {
      position: relative;
    }

    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
      color: #4b5563;
    }

    .forgot-link {
      font-size: 14px;
      color: #667eea;
      text-decoration: none;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      font-size: 14px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-block {
      width: 100%;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .alert-danger {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .login-footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .login-footer p {
      color: #6b7280;
      font-size: 14px;
    }

    .login-footer a {
      color: #667eea;
      text-decoration: none;
    }

    .login-help {
      text-align: center;
      margin-top: 16px;
    }

    .login-help p {
      color: #9ca3af;
      font-size: 12px;
    }

    .login-help a {
      color: #667eea;
      text-decoration: none;
    }

    .login-features {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 40px 60px;
      color: white;
    }

    .login-features h2 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 32px;
    }

    .login-features ul {
      list-style: none;
      padding: 0;
    }

    .login-features li {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
    }

    .login-features li i {
      font-size: 24px;
      opacity: 0.9;
    }

    .login-features li strong {
      display: block;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .login-features li p {
      margin: 0;
      font-size: 14px;
      opacity: 0.8;
    }

    @media (max-width: 1024px) {
      .login-features {
        display: none;
      }

      .login-card {
        flex: 1;
        max-width: 450px;
        margin: 0 auto;
      }
    }
  `]
})
export class ClientLoginComponent {
  private clientPortalService = inject(ClientPortalService);
  private router = inject(Router);
  private translateService = inject(TranslateService);

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  logoUrl?: string;

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = this.translateService.instant('client_login.error_required');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request: ClientLoginRequest = {
      email: this.email,
      password: this.password
    };

    this.clientPortalService.clientLogin(request).subscribe({
      next: (response: ClientLoginResponse) => {
        localStorage.setItem('clientToken', response.token);
        localStorage.setItem('clientUser', JSON.stringify(response.clientUser));
        this.router.navigate(['/client-portal/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || this.translateService.instant('client_login.error_invalid');
      }
    });
  }
}
