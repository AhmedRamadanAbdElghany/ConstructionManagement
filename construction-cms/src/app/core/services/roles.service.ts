import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Role, Permission } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class RolesService {
    private mockPermissions: Permission[] = [
        { id: 1, name: 'SeeFinancials', description: 'Can view financial data and reports' },
        { id: 2, name: 'UploadMedia', description: 'Can upload site photos and videos' },
        { id: 3, name: 'ReviewMedia', description: 'Can approve or reject site media' },
        { id: 4, name: 'ManageBOQ', description: 'Can add or edit BOQ items' },
        { id: 5, name: 'ReviewInvoices', description: 'Can review and aggregate invoices' },
        { id: 6, name: 'ManageTeam', description: 'Can add or remove team members' }
    ];

    private mockRoles: Role[] = [
        {
            id: 1,
            name: 'Project Manager',
            description: 'Oversees the entire project operations',
            permissions: [this.mockPermissions[0], this.mockPermissions[1], this.mockPermissions[3], this.mockPermissions[5]]
        },
        {
            id: 2,
            name: 'Accountant',
            description: 'Handles financials and invoices',
            permissions: [this.mockPermissions[0], this.mockPermissions[4]]
        },
        {
            id: 3,
            name: 'Site Engineer',
            description: 'Manages daily field activities and media',
            permissions: [this.mockPermissions[1], this.mockPermissions[2]]
        }
    ];

    getPermissions(): Observable<Permission[]> {
        return of(this.mockPermissions);
    }

    getRoles(): Observable<Role[]> {
        return of(this.mockRoles);
    }

    createRole(role: Partial<Role>): Observable<Role> {
        const newRole = {
            ...role,
            id: this.mockRoles.length + 1,
            permissions: role.permissions || []
        } as Role;
        this.mockRoles.push(newRole);
        return of(newRole);
    }

    updateRole(id: number, role: Partial<Role>): Observable<Role> {
        const index = this.mockRoles.findIndex(r => r.id === id);
        if (index !== -1) {
            this.mockRoles[index] = { ...this.mockRoles[index], ...role };
            return of(this.mockRoles[index]);
        }
        throw new Error('Role not found');
    }

    deleteRole(id: number): Observable<void> {
        this.mockRoles = this.mockRoles.filter(r => r.id !== id);
        return of(void 0);
    }

    createPermission(permission: Partial<Permission>): Observable<Permission> {
        const newPermission = {
            ...permission,
            id: this.mockPermissions.length + 1
        } as Permission;
        this.mockPermissions.push(newPermission);
        return of(newPermission);
    }

    deletePermission(id: number): Observable<void> {
        this.mockPermissions = this.mockPermissions.filter(p => p.id !== id);
        // Also remove this permission from any roles that have it
        this.mockRoles.forEach(role => {
            if (role.permissions) {
                role.permissions = role.permissions.filter(p => p.id !== id);
            }
        });
        return of(void 0);
    }
}
