import { Injectable } from '@angular/core';
import { User, UserRole } from '../../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser: User = {
    id: 1,
    fullName: 'Ahmed Ali',
    email: 'ahmed@company.com',
    role: 'CompanyAdmin',
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
