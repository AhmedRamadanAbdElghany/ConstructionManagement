import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
    userId: number;
    fullName: string;
    email: string;
    roles: string[];
    createdAt: Date;
    userType: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    userType: number;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    user?: {
        userId: number;
        fullName: string;
        email: string;
    };
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = '/api/auth';
    private http = inject(HttpClient);

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor() {
        this.checkAuthStatus();
    }

    private checkAuthStatus(): void {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        if (token && user) {
            try {
                this.currentUserSubject.next(JSON.parse(user));
                this.isAuthenticatedSubject.next(true);
            } catch {
                this.logout();
            }
        }
    }

    login(request: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
            tap(response => {
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('currentUser', JSON.stringify(response.user));
                this.currentUserSubject.next(response.user);
                this.isAuthenticatedSubject.next(true);
            })
        );
    }

    register(request: RegisterRequest): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, request);
    }

    forgotPassword(request: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
        return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, request);
    }

    resetPassword(request: ResetPasswordRequest): Observable<ResetPasswordResponse> {
        return this.http.post<ResetPasswordResponse>(`${this.apiUrl}/reset-password`, request);
    }

    verifyEmail(token: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/verify-email`, { token });
    }

    resendVerificationEmail(email: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/resend-verification`, { email });
    }

    switchUserType(newType: number, reason?: string): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/change-user-type`, { newUserType: newType, reason }).pipe(
            tap(response => {
                if (response.success) {
                    // Update local storage with new user type
                    const user = this.getCurrentUser();
                    if (user) {
                        user.userType = newType;
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        this.currentUserSubject.next(user);
                    }
                }
            })
        );
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    isLoggedIn(): boolean {
        return this.isAuthenticatedSubject.value;
    }

    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.roles.includes(role) ?? false;
    }

    logout(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
    }
}
