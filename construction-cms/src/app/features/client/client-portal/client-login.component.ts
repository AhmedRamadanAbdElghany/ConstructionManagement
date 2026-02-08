import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientPortalService, ClientLoginRequest, ClientLoginResponse } from '../../../core/services/client-portal.service';

@Component({
    selector: 'app-client-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <img *ngIf="logoUrl" [src]="logoUrl" alt="Company Logo">
            <h1 *ngIf="!logoUrl">Client Portal</h1>
          </div>
          <p class="subtitle">Sign in to access your project portal</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              class="form-control"
              placeholder="Enter your email"
              required
              email>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                [(ngModel)]="password"
                name="password"
                class="form-control"
                placeholder="Enter your password"
                required>
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                <i [class]="showPassword ? 'icon-eye-off' : 'icon-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe">
              <span>Remember me</span>
            </label>
            <a routerLink="/client-portal/forgot-password" class="forgot-link">Forgot Password?</a>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Sign In</span>
          </button>
        </form>

        <div class="login-footer">
          <p>Don't have an account? <a routerLink="/client-portal/register">Contact your project manager</a></p>
        </div>

        <div class="login-help">
          <p>Need help? <a href="mailto:support&#64;company.com">Contact Support</a></p>
        </div>
      </div>

      <div class="login-features">
        <h2>Welcome to Your Project Portal</h2>
        <ul>
          <li>
            <i class="icon-project"></i>
            <div>
              <strong>Track Project Progress</strong>
              <p>View real-time updates on your project status</p>
            </div>
          </li>
          <li>
            <i class="icon-document"></i>
            <div>
              <strong>Access Documents</strong>
              <p>Download project documents and reports</p>
            </div>
          </li>
          <li>
            <i class="icon-payment"></i>
            <div>
              <strong>View Payment History</strong>
              <p>Track payments and invoices</p>
            </div>
          </li>
          <li>
            <i class="icon-message"></i>
            <div>
              <strong>Communication Hub</strong>
              <p>Send messages to your project team</p>
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

    email = '';
    password = '';
    rememberMe = false;
    showPassword = false;
    isLoading = false;
    errorMessage = '';
    logoUrl?: string;

    onSubmit(): void {
        if (!this.email || !this.password) {
            this.errorMessage = 'Please enter your email and password';
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
                this.errorMessage = error.error?.message || 'Invalid email or password';
            }
        });
    }
}
