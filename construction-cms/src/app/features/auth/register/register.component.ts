import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <h1>Create Account</h1>
          </div>
          <p class="subtitle">Register to access the Construction CMS</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              [(ngModel)]="fullName"
              name="fullName"
              class="form-control"
              placeholder="Enter your full name"
              required>
            <div *ngIf="fullNameTouched && !fullName" class="error-message">Full name is required</div>
          </div>

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

          <div class="form-group">
            <label for="phone">Phone Number (Optional)</label>
            <input
              type="tel"
              id="phone"
              [(ngModel)]="phone"
              name="phone"
              class="form-control"
              placeholder="Enter your phone number">
          </div>

          <div class="form-group">
            <label for="userType">User Type</label>
            <select
              id="userType"
              [(ngModel)]="userType"
              name="userType"
              class="form-control"
              required>
              <option value="0">Normal User</option>
              <option value="1">Worker</option>
              <option value="2">Company Owner</option>
            </select>
            <div *ngIf="userTypeTouched && userType === null" class="error-message">Please select a user type</div>
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
                placeholder="Create a password"
                required
                (input)="checkPasswordStrength()">
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                <i [class]="showPassword ? 'icon-eye-off' : 'icon-eye'"></i>
              </button>
            </div>
            <div *ngIf="passwordTouched && !password" class="error-message">Password is required</div>
            
            <div class="password-strength" *ngIf="password">
              <div class="strength-bar">
                <div class="strength-fill" [style.width.%]="passwordStrengthPercent" [class]="passwordStrengthClass"></div>
              </div>
              <span class="strength-text" [class]="passwordStrengthClass">{{ passwordStrengthText }}</span>
            </div>
            
            <ul class="password-requirements" *ngIf="password">
              <li [class.valid]="hasLowerCase">Lowercase letter</li>
              <li [class.valid]="hasUpperCase">Uppercase letter</li>
              <li [class.valid]="hasNumber">Number</li>
              <li [class.valid]="hasSpecialChar">Special character</li>
              <li [class.valid]="hasMinLength">At least 8 characters</li>
            </ul>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <div class="password-input">
              <input
                [type]="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                class="form-control"
                placeholder="Confirm your password"
                required>
              <button type="button" class="toggle-password" (click)="showConfirmPassword = !showConfirmPassword">
                <i [class]="showConfirmPassword ? 'icon-eye-off' : 'icon-eye'"></i>
              </button>
            </div>
            <div *ngIf="confirmPasswordTouched && confirmPassword && password !== confirmPassword" class="error-message">Passwords do not match</div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading || !isFormValid">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Create Account</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
        </div>
      </div>

      <div class="auth-features">
        <h2>Join Construction CMS</h2>
        <ul>
          <li>
            <i class="icon-project"></i>
            <div>
              <strong>Project Management</strong>
              <p>Create and manage construction projects efficiently</p>
            </div>
          </li>
          <li>
            <i class="icon-team"></i>
            <div>
              <strong>Team Management</strong>
              <p>Assign roles and manage your team members</p>
            </div>
          </li>
          <li>
            <i class="icon-analytics"></i>
            <div>
              <strong>Real-time Analytics</strong>
              <p>Track progress and performance with detailed reports</p>
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
      flex: 0 0 480px;
      background: white;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-height: 100vh;
      overflow-y: auto;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 24px;
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
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #374151;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 10px 14px;
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

    .success-message {
      color: #059669;
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

    .password-strength {
      margin-top: 8px;
    }

    .strength-bar {
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
    }

    .strength-fill {
      height: 100%;
      transition: width 0.3s, background-color 0.3s;
    }

    .strength-fill.weak { background: #dc2626; }
    .strength-fill.fair { background: #f59e0b; }
    .strength-fill.good { background: #3b82f6; }
    .strength-fill.strong { background: #10b981; }

    .strength-text {
      font-size: 12px;
      margin-top: 4px;
      display: block;
    }

    .strength-text.weak { color: #dc2626; }
    .strength-text.fair { color: #f59e0b; }
    .strength-text.good { color: #3b82f6; }
    .strength-text.strong { color: #10b981; }

    .password-requirements {
      list-style: none;
      padding: 0;
      margin-top: 8px;
      font-size: 12px;
      color: #6b7280;
    }

    .password-requirements li {
      padding: 2px 0;
    }

    .password-requirements li::before {
      content: "✗";
      margin-right: 6px;
      color: #dc2626;
    }

    .password-requirements li.valid::before {
      content: "✓";
      color: #10b981;
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
      margin-bottom: 16px;
      font-size: 14px;
    }

    .alert-danger {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .alert-success {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
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
      padding-top: 16px;
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
        max-width: 480px;
        margin: 0 auto;
      }
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

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
      phone: this.phone || undefined,
      userType: this.userType!
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = response.message || 'Registration successful! Please check your email to verify your account.';
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Registration failed. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'An error occurred during registration.';
      }
    });
  }
}
