import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <img *ngIf="logoUrl" [src]="logoUrl" alt="Company Logo">
            <h1 *ngIf="!logoUrl">Construction CMS</h1>
          </div>
          <p class="subtitle">Sign in to access your account</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
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
            <div *ngIf="passwordTouched && !password" class="error-message">Password is required</div>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe">
              <span>Remember me</span>
            </label>
            <a routerLink="/auth/forgot-password" class="forgot-link">Forgot Password?</a>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Sign In</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/auth/register">Register here</a></p>
        </div>

        <div class="auth-help">
          <p>Need help? <a href="mailto:support&#64;company.com">Contact Support</a></p>
        </div>
      </div>

      <div class="auth-features">
        <h2>Welcome Back</h2>
        <ul>
          <li>
            <i class="icon-project"></i>
            <div>
              <strong>Manage Projects</strong>
              <p>Track and manage all your construction projects</p>
            </div>
          </li>
          <li>
            <i class="icon-team"></i>
            <div>
              <strong>Team Collaboration</strong>
              <p>Work together with your team seamlessly</p>
            </div>
          </li>
          <li>
            <i class="icon-analytics"></i>
            <div>
              <strong>Analytics & Reports</strong>
              <p>Get insights into your project performance</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
    }

    .auth-card {
      flex: 0 0 450px;
      background: white;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .auth-header {
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
      color: #1e3a5f;
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

    .auth-help {
      text-align: center;
      margin-top: 16px;
    }

    .auth-help p {
      color: #9ca3af;
      font-size: 12px;
    }

    .auth-help a {
      color: #1e3a5f;
      text-decoration: none;
    }

    .auth-features {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 40px 60px;
      color: white;
    }

    .auth-features h2 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 32px;
    }

    .auth-features ul {
      list-style: none;
      padding: 0;
    }

    .auth-features li {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
    }

    .auth-features li i {
      font-size: 24px;
      opacity: 0.9;
    }

    .auth-features li strong {
      display: block;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .auth-features li p {
      margin: 0;
      font-size: 14px;
      opacity: 0.8;
    }

    @media (max-width: 1024px) {
      .auth-features {
        display: none;
      }

      .auth-card {
        flex: 1;
        max-width: 450px;
        margin: 0 auto;
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
      this.errorMessage = 'Please enter your email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        setTimeout(() => { this.router.navigate(["/dashboard"]); }, 100);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid email or password';
      }
    });
  }
}
