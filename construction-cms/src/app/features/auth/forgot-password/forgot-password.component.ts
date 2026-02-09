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
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <h1>Forgot Password</h1>
          </div>
          <p class="subtitle">Enter your email to reset your password</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form" *ngIf="!submitted">
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
            <div *ngIf="emailTouched && !email" class="error-message">Email is required</div>
            <div *ngIf="emailTouched && email && !isEmailValid" class="error-message">Please enter a valid email</div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Send Reset Link</span>
          </button>
        </form>

        <div class="success-state" *ngIf="submitted">
          <div class="success-icon">✓</div>
          <h2>Check Your Email</h2>
          <p>If an account exists with {{ email }}, you will receive a password reset link shortly.</p>
        </div>

        <div class="auth-footer" *ngIf="submitted">
          <p><a routerLink="/auth/login">Back to Login</a></p>
        </div>

        <div class="auth-footer" *ngIf="!submitted">
          <p>Remember your password? <a routerLink="/auth/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
      padding: 20px;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #6b7280;
      font-size: 14px;
    }

    .auth-form {
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
      border-color: #1e3a5f;
      box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
    }

    .error-message {
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
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
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(30, 58, 95, 0.4);
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

    .auth-footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .auth-footer p {
      color: #6b7280;
      font-size: 14px;
    }

    .auth-footer a {
      color: #1e3a5f;
      text-decoration: none;
    }

    .success-state {
      text-align: center;
      padding: 20px 0;
    }

    .success-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #10b981;
      color: white;
      font-size: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .success-state h2 {
      font-size: 20px;
      font-weight: 600;
      color: #1e3a5f;
      margin-bottom: 8px;
    }

    .success-state p {
      color: #6b7280;
      font-size: 14px;
    }
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
