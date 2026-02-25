import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface User {
    id: number; // For compatibility with shared/interfaces
    userId: number;
    fullName: string;
    email: string;
    role: string; // Singular role for UI checks
    roles: string[]; // Role array from backend
    createdAt: Date;
    userType: number;
    companyId?: number;
    salary?: number;
    status?: string;
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
    token?: string;
    user: User;
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
        // Try HTTP request first, fall back to mock if backend is unavailable
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
            tap(response => {
                // Ensure singular role exists for components that expect it
                if (!response.user.role && response.user.roles?.length > 0) {
                    response.user.role = response.user.roles[0];
                }

                // If it's still missing, try to infer from userType if possible
                if (!response.user.role) {
                    if (response.user.userType === 3) {
                        response.user.role = 'InventoryOwner';
                        if (!response.user.roles || response.user.roles.length === 0) response.user.roles = ['InventoryOwner'];
                    }
                    else {
                        response.user.role = response.user.userType === 2 ? 'CompanyAdmin' : 'User';
                        if (!response.user.roles || response.user.roles.length === 0)
                            response.user.roles = [response.user.role];
                    }
                }

                // Ensure id exists for compatibility
                if (response.user.userId && !response.user.id) {
                    response.user.id = response.user.userId;
                }
                if ((response.user as any).userID && !response.user.id) {
                    response.user.id = (response.user as any).userID;
                }
                if (response.user.id && !response.user.userId) {
                    response.user.userId = response.user.id;
                }
                localStorage.setItem('authToken', response.token);

                localStorage.setItem('currentUser', JSON.stringify(response.user));
                this.currentUserSubject.next(response.user);
                this.isAuthenticatedSubject.next(true);
            }),

            catchError((error) => {
                // SECURITY: Mock authentication bypass removed.
                // In production, connection errors should be reported to the user,
                // not bypassed with fake authentication that grants elevated privileges.
                // 
                // If you need mock authentication for development, use environment.isDevMode()
                // and ensure mock users have limited privileges.
                return throwError(() => error);
            })
        );
    }

    register(request: RegisterRequest): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, request).pipe(
            tap(response => {
                if (response.success && response.token) {
                    // Normalize user object for consistency
                    if (!response.user.role && response.user.roles?.length > 0) {
                        response.user.role = response.user.roles[0];
                    }
                    if (response.user.userId && !response.user.id) {
                        response.user.id = response.user.userId;
                    }

                    localStorage.setItem('authToken', response.token);
                    localStorage.setItem('currentUser', JSON.stringify(response.user));
                    this.currentUserSubject.next(response.user);
                    this.isAuthenticatedSubject.next(true);
                }
            })
        );
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

    updateProfile(fullName: string): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.apiUrl}/profile`, { fullName }).pipe(
            tap(() => {
                const user = this.getCurrentUser();
                if (user) {
                    user.fullName = fullName;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next({ ...user });
                }
            })
        );
    }

    changePassword(request: any): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, request);
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

    hasRole(roles: string | string[]): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;

        if (Array.isArray(roles)) {
            return roles.some(role => user.roles.includes(role));
        }
        return user.roles.includes(roles);
    }

    hasPermission(permission: string): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (user.role === 'SuperAdmin') return true;
        // In this implementation, we map roles to permissions roughly
        // This is a placeholder for a more robust permission system
        if (user.role === 'CompanyAdmin') return true;
        return false;
    }

    hasProjectPermission(permissions: string | string[]): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (user.role === 'SuperAdmin') return true;

        // Demo implementation: Admin has all project permissions
        return user.role === 'CompanyAdmin';
    }


    logout(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
    }
}
