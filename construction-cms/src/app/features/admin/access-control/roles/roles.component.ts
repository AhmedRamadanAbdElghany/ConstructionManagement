import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService } from '../../../../core/services/roles.service';
import { Role, Permission } from '../../../../shared/interfaces';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="roles-container p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div class="max-w-7xl mx-auto">
        <!-- Dashboard Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div class="space-y-2">
            <div class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500">
              <span class="w-8 h-[1px] bg-indigo-500"></span>
              Security Infrastructure
            </div>
            <h1 class="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">Manage Roles</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium">Configure roles and granular permissions.</p>
          </div>
          <button (click)="openCreateModal()" 
                  class="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
            <span class="text-xl leading-none font-light">+</span> {{ 'addRole' | translate }}
          </button>
        </div>

        <!-- Role Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <div *ngFor="let role of roles" 
               class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden group">
            <div class="p-10">
              <div class="flex justify-between items-start mb-6">
                <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">🎭</div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="openEditModal(role)" class="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center">✎</button>
                  <button (click)="deleteRole(role.id)" class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center">×</button>
                </div>
              </div>
              
              <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3 italic">{{ role.name }}</h3>
              <p class="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed mb-8 line-clamp-2">{{ role.description }}</p>
              
              <div class="flex flex-wrap gap-2 mb-8">
                <span *ngFor="let perm of role.permissions" 
                      class="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-100 dark:border-indigo-800">
                  {{ perm.name }}
                </span>
                <span *ngIf="!role.permissions?.length" class="text-slate-400 text-[10px] italic">No permissions assigned</span>
              </div>
            </div>

            <div class="px-10 py-6 bg-slate-50/50 dark:bg-white/5 border-t border-slate-50 dark:border-white/5 flex justify-between items-center group/btn">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capabilities: {{ role.permissions?.length || 0 }}</span>
              <button (click)="openEditPermissions(role)" class="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover/btn:gap-4 transition-all">
                Config Matrix &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Role Metadata Modal (Create/Edit) -->
      <div *ngIf="showRoleModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
         <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-xl p-10 transform animate-in zoom-in-95 duration-500 relative border border-white/10">
            <button (click)="showRoleModal = false" class="absolute top-8 right-8 text-slate-400 hover:text-slate-600 text-3xl font-light">&times;</button>
            
            <h3 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">{{ editingRole ? 'Update' : 'New' }} Role</h3>
            <p class="text-slate-500 dark:text-slate-400 font-medium text-xs mb-10">Define the role and its application scope.</p>

            <div class="space-y-6">
               <div class="space-y-2">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Name</label>
                 <input [(ngModel)]="roleForm.name" placeholder="e.g., Regional Supervisor" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white transition-all">
               </div>
               <div class="space-y-2">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                 <textarea [(ngModel)]="roleForm.description" placeholder="Explain the responsibilities..." rows="3" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-900 dark:text-white resize-none transition-all"></textarea>
               </div>

               <div class="pt-6 flex gap-4">
                  <button (click)="showRoleModal = false" class="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] border border-slate-200 dark:border-white/5 rounded-2xl hover:bg-slate-50 transition-all">Abort</button>
                  <button (click)="saveRole()" [disabled]="!roleForm.name" class="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40">Save Role</button>
               </div>
            </div>
         </div>
      </div>

      <!-- Permission Matrix Modal -->
      <div *ngIf="showPermissionsModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
        <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-2xl transform animate-in zoom-in-95 duration-300 relative border border-white/10 overflow-hidden">
          <div class="p-10 border-b border-slate-50 dark:border-white/5">
             <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1 italic">Capability Matrix</h3>
                  <p class="text-slate-500 font-medium text-xs">Mapping permissions for: <span class="text-indigo-600 font-black">{{ selectedRole?.name }}</span></p>
                </div>
                <button (click)="showPermissionsModal = false" class="text-slate-400 hover:text-slate-600 text-3xl font-light">&times;</button>
             </div>
          </div>
          
          <div class="p-10 bg-slate-50/30 dark:bg-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div *ngFor="let perm of permissions" 
                    (click)="togglePermission(perm.id)"
                    class="p-5 bg-white dark:bg-slate-900 border rounded-2xl flex items-center justify-between cursor-pointer group transition-all"
                    [class.border-indigo-500]="isPermissionSelected(perm.id)"
                    [class.bg-indigo-50/20]="isPermissionSelected(perm.id)"
                    [class.border-slate-100]="!isPermissionSelected(perm.id)">
                 <div class="flex items-center gap-4">
                   <div class="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">⚙️</div>
                   <div>
                      <p class="text-[11px] font-black text-slate-800 dark:text-slate-200 tracking-tight mb-0.5">{{ perm.name }}</p>
                       <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{{ perm.desc }}</p>
                   </div>
                 </div>
                 <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                      [class.bg-indigo-600]="isPermissionSelected(perm.id)"
                      [class.border-indigo-600]="isPermissionSelected(perm.id)"
                      [class.border-slate-200]="!isPermissionSelected(perm.id)">
                    <span *ngIf="isPermissionSelected(perm.id)" class="text-white text-[10px]">✓</span>
                 </div>
               </div>
            </div>
          </div>

          <div class="p-10 flex gap-4 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-white/5">
            <button (click)="showPermissionsModal = false" class="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] border border-slate-200 dark:border-white/5 rounded-2xl hover:bg-slate-50 transition-all">Abort Changes</button>
            <button (click)="savePermissions()" class="flex-[2] py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl transition-all active:scale-95">Commit Architecture Update</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
  `]
})
export class RolesComponent implements OnInit {
  permissions: Permission[] = [];
  roles: Role[] = [];

  showRoleModal = false;
  showPermissionsModal = false;
  editingRole: Role | null = null;
  selectedRole: Role | null = null;
  tempPermissionIds: number[] = [];

  roleForm = {
    name: '',
    description: ''
  };

  constructor(private rolesService: RolesService) { }

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles() {
    this.rolesService.getRoles().subscribe(roles => {
      this.roles = roles;
    });
  }

  loadPermissions() {
    this.rolesService.getPermissions().subscribe(permissions => {
      this.permissions = permissions;
    });
  }

  openCreateModal() {
    this.editingRole = null;
    this.roleForm = { name: '', description: '' };
    this.showRoleModal = true;
  }

  openEditModal(role: any) {
    this.editingRole = role;
    this.roleForm = { name: role.name, description: role.description };
    this.showRoleModal = true;
  }

  saveRole() {
    if (!this.roleForm.name) return;

    if (this.editingRole) {
      this.rolesService.updateRole(this.editingRole.id, this.roleForm).subscribe(() => {
        this.loadRoles();
        this.showRoleModal = false;
      });
    } else {
      this.rolesService.createRole(this.roleForm).subscribe(() => {
        this.loadRoles();
        this.showRoleModal = false;
      });
    }
  }

  deleteRole(id: number) {
    if (confirm('CRITICAL: Removing this role will revoke access for all associated personnel. Proceed?')) {
      this.rolesService.deleteRole(id).subscribe(() => {
        this.loadRoles();
      });
    }
  }

  openEditPermissions(role: Role) {
    this.selectedRole = role;
    this.tempPermissionIds = role.permissions?.map(p => p.id) || [];
    this.showPermissionsModal = true;
  }

  togglePermission(permId: number) {
    const index = this.tempPermissionIds.indexOf(permId);
    if (index === -1) {
      this.tempPermissionIds.push(permId);
    } else {
      this.tempPermissionIds.splice(index, 1);
    }
  }

  isPermissionSelected(permId: number): boolean {
    return this.tempPermissionIds.includes(permId);
  }

  savePermissions() {
    if (this.selectedRole) {
      this.rolesService.updateRolePermissions(this.selectedRole.id, this.tempPermissionIds).subscribe(() => {
        this.loadRoles();
        this.showPermissionsModal = false;
      });
    }
  }
}
