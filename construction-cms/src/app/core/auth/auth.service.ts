import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, UserRole, UserType } from '../../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth';
  private http = inject(HttpClient);

  private currentUser: User = {
    id: 1,
    fullName: 'Ahmed Ali',
    email: 'ahmed@company.com',
    role: 'CompanyAdmin',
    userType: 2, // CompanyOwner
    status: 'Working',
    salary: 5000
  };

  // Mock permissions - in real app, these would come from the backend
  private permissions: string[] = [
    'Project.Edit', 'Project.Close', 'Financials.View', 'Transaction.Add',
    'Transaction.Review', 'Media.Review', 'DailyLog.Close', 'Settings.Manage',
    'DailyLog.AddEntry', 'DailyLog.Reopen', 'DailyLog.Approve',
    'Design.Add', 'Design.View', 'Category.Add'
  ];

  getCurrentUser(): User {
    return this.currentUser;
  }

  switchUserType(newType: number, reason?: string): Observable<{ success: boolean; message: string }> {
    // For mock service, just update locally
    if (this.currentUser.userType !== undefined) {
      this.currentUser.userType = newType as UserType;
    }
    return of({ success: true, message: 'User type switched successfully' });
  }

  // Alternative: call actual backend (uncomment to use)
  /*
  switchUserType(newType: number, reason?: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/change-user-type`, { newUserType: newType, reason }).pipe(
      tap(response => {
        if (response.success) {
          this.currentUser.userType = newType;
        }
      })
    );
  }
  */

  switchUserRole(role: UserRole): void {
    this.currentUser.role = role;
  }

  hasProjectPermission(permission: string): boolean {
    // Admin roles have all permissions
    if (this.currentUser.role === 'SuperAdmin' || this.currentUser.role === 'CompanyAdmin') {
      return true;
    }
    return this.permissions.includes(permission);
  }

  hasPermission(permission: string): boolean {
    return this.hasProjectPermission(permission);
  }

  hasRole(roles: UserRole | UserRole[]): boolean {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(this.currentUser.role);
  }
}
