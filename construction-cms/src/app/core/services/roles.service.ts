import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role, Permission } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class RolesService {
    private rolesUrl = 'api/roles';
    private permissionsUrl = 'api/permissions';

    constructor(private http: HttpClient) { }

    // --- Permissions ---
    getPermissions(): Observable<Permission[]> {
        return this.http.get<Permission[]>(this.permissionsUrl);
    }

    createPermission(permission: Partial<Permission>): Observable<any> {
        return this.http.post<any>(this.permissionsUrl, permission);
    }

    deletePermission(id: number): Observable<void> {
        return this.http.delete<void>(`${this.permissionsUrl}/${id}`);
    }

    // --- Roles ---
    getRoles(companyId?: number): Observable<Role[]> {
        let url = this.rolesUrl;
        if (companyId) {
            url += `?companyId=${companyId}`;
        }
        return this.http.get<Role[]>(url);
    }

    createRole(role: Partial<Role>): Observable<any> {
        return this.http.post<any>(this.rolesUrl, {
            roleName: role.name,
            description: role.description,
            companyId: role.companyId
        });
    }

    updateRole(id: number, role: Partial<Role>): Observable<any> {
        return this.http.put<any>(`${this.rolesUrl}/${id}`, {
            roleName: role.name,
            description: role.description,
            companyId: role.companyId
        });
    }

    deleteRole(id: number): Observable<void> {
        return this.http.delete<void>(`${this.rolesUrl}/${id}`);
    }

    updateRolePermissions(roleId: number, permissionIds: number[]): Observable<void> {
        return this.http.post<void>(`${this.rolesUrl}/permissions`, {
            roleId,
            permissionIds
        });
    }
}
