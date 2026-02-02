import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService } from '../../../../core/services/roles.service';
import { Role, Permission } from '../../../../shared/interfaces';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
    selector: 'app-roles',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="roles-container p-6">
      <div class="header mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">Company Roles</h1>
          <p class="text-slate-500 mt-1">Define roles and assign granular permissions for your organization</p>
        </div>
        <button (click)="openCreateModal()" 
                class="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-emerald-200 transform hover:-translate-y-1 font-bold">
          <span class="text-2xl leading-none">+</span> New Role
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let role of roles" 
             class="role-card bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 overflow-hidden group">
          <div class="p-8">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-bold text-slate-800">{{ role.name }}</h3>
              <div class="flex gap-1">
                <button (click)="openEditPermissions(role)" 
                        class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Edit Permissions">
                  <span>🔒</span>
                </button>
                <button (click)="deleteRole(role.id)" 
                        class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Role">
                  <span>🗑</span>
                </button>
              </div>
            </div>
            <p class="text-slate-500 text-sm mb-6 line-clamp-2">{{ role.description || 'No description provided for this role.' }}</p>
            
            <div class="permissions-list flex flex-wrap gap-2">
              <span *ngFor="let perm of role.permissions" 
                    class="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full border border-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-100 transition-colors duration-300">
                {{ perm.name }}
              </span>
              <span *ngIf="!role.permissions?.length" class="text-slate-400 text-xs italic">No permissions assigned</span>
            </div>
          </div>
          <div class="px-8 py-4 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Permissions: {{ role.permissions?.length || 0 }}</span>
            <button (click)="openEditPermissions(role)" class="text-emerald-600 text-xs font-bold hover:underline">Manage Access &rarr;</button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Role Modal -->
      <div *ngIf="showRoleModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
          <div class="p-8">
            <h2 class="text-2xl font-black text-slate-800 mb-6">Create New Role</h2>
            <div class="space-y-6">
              <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Role Name</label>
                <input [(ngModel)]="newRole.name" 
                       placeholder="e.g., Senior Engineer" 
                       class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-700">
              </div>
              <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Role Description</label>
                <textarea [(ngModel)]="newRole.description" 
                          placeholder="Describe the responsibilities..." 
                          rows="3"
                          class="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-700"></textarea>
              </div>
              <div class="flex gap-3 pt-4">
                <button (click)="showRoleModal = false" 
                        class="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button (click)="saveRole()" 
                        [disabled]="!newRole.name"
                        class="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-200 transition-all active:scale-95">
                  Confirm & Create
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Permissions Modal -->
      <div *ngIf="showPermissionsModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div class="p-8">
            <div class="flex justify-between items-center mb-8">
              <div>
                <h2 class="text-2xl font-black text-slate-800">Manage Permissions</h2>
                <p class="text-slate-500 text-sm">Role: <span class="font-bold text-emerald-600">{{ selectedRole?.name }}</span></p>
              </div>
              <button (click)="showPermissionsModal = false" class="text-slate-300 hover:text-slate-600 text-3xl">&times;</button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2">
              <div *ngFor="let perm of allPermissions" 
                   (click)="togglePermission(perm.id)"
                   class="p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group"
                   [ngClass]="isPermissionSelected(perm.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-slate-200 bg-white'">
                <div class="flex flex-col">
                  <span class="font-bold text-sm" [ngClass]="isPermissionSelected(perm.id) ? 'text-emerald-900' : 'text-slate-700'">{{ perm.name }}</span>
                  <span class="text-[10px] text-slate-400 line-clamp-1 group-hover:line-clamp-none transition-all">{{ perm.description || 'No description' }}</span>
                </div>
                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                     [ngClass]="isPermissionSelected(perm.id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'">
                  <span *ngIf="isPermissionSelected(perm.id)" class="text-white text-xs">✓</span>
                </div>
              </div>
            </div>

            <div class="flex gap-3 mt-10">
              <button (click)="showPermissionsModal = false" 
                      class="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Discard</button>
              <button (click)="savePermissions()" 
                      class="flex-[2] bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black shadow-2xl shadow-slate-200 transition-all active:scale-95">
                Save Access Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; background: #fdfdfd; min-height: 100vh; }
    .role-card { border-top: 6px solid #10b981; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  `]
})
export class RolesComponent implements OnInit {
    roles: Role[] = [];
    allPermissions: Permission[] = [];

    showRoleModal = false;
    showPermissionsModal = false;

    newRole: Partial<Role> = {};
    selectedRole: Role | null = null;
    selectedPermissionIds: number[] = [];

    constructor(
        private rolesService: RolesService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        const user = this.authService.getCurrentUser();
        this.rolesService.getRoles().subscribe(roles => this.roles = roles);
        this.rolesService.getPermissions().subscribe(perms => this.allPermissions = perms);
    }

    openCreateModal() {
        this.newRole = {};
        this.showRoleModal = true;
    }

    saveRole() {
        const user = this.authService.getCurrentUser();
        this.newRole.companyId = user?.id; // Simplified, usually it's companyId field on user
        this.rolesService.createRole(this.newRole).subscribe(() => {
            this.loadData();
            this.showRoleModal = false;
        });
    }

    deleteRole(id: number) {
        if (confirm('Are you sure you want to delete this role?')) {
            this.rolesService.deleteRole(id).subscribe(() => this.loadData());
        }
    }

    openEditPermissions(role: Role) {
        this.selectedRole = role;
        this.selectedPermissionIds = (role.permissions || []).map(p => p.id);
        this.showPermissionsModal = true;
    }

    togglePermission(id: number) {
        const index = this.selectedPermissionIds.indexOf(id);
        if (index === -1) {
            this.selectedPermissionIds.push(id);
        } else {
            this.selectedPermissionIds.splice(index, 1);
        }
    }

    isPermissionSelected(id: number): boolean {
        return this.selectedPermissionIds.includes(id);
    }

    savePermissions() {
        if (this.selectedRole) {
            this.rolesService.updateRolePermissions(this.selectedRole.id, this.selectedPermissionIds).subscribe(() => {
                this.loadData();
                this.showPermissionsModal = false;
            });
        }
    }
}
