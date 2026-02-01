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

  getCurrentUser(): User {
    return this.currentUser;
  }

  switchUserRole(role: UserRole): void {
    this.currentUser.role = role;
  }
}
