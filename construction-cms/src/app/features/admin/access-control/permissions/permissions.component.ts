import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService } from '../../../../core/services/roles.service';
import { Role, Permission } from '../../../../shared/interfaces';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
    selector: 'app-permissions',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="permissions-container p-6">
      <div class="header mb-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">System Permissions</h1>
          <p class="text-gray-500 text-sm">Create and manage global system permissions</p>
        </div>
        <button (click)="showCreateModal = true" 
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          <span class="text-xl">+</span> Add Permission
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let perm of permissions" 
             class="permission-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group relative">
          <div class="flex justify-between items-start mb-3">
            <div class="name font-bold text-lg text-indigo-900 group-hover:text-indigo-600 transition-colors">{{ perm.name }}</div>
            <button (click)="deletePermission(perm.id)" 
                    class="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
              <span class="text-lg">🗑</span>
            </button>
          </div>
          <p class="text-gray-600 text-sm leading-relaxed">{{ perm.description || 'No description provided.' }}</p>
          <div class="mt-4 flex items-center gap-2">
            <span class="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-semibold uppercase tracking-wider rounded">System Global</span>
          </div>
        </div>
      </div>

      <!-- Create Modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
        <div class="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 transform animate-in zoom-in duration-300">
          <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">New Permission</h2>
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Permission Name</label>
              <input [(ngModel)]="newPerm.name" 
                     placeholder="e.g., Project.Edit" 
                     class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50/50">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea [(ngModel)]="newPerm.description" 
                        placeholder="Detailed explanation of what this allows..." 
                        rows="3"
                        class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50/50"></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button (click)="showCreateModal = false" 
                      class="px-6 py-2.5 text-gray-500 hover:text-gray-700 font-semibold transition-colors">Cancel</button>
              <button (click)="createPermission()" 
                      [disabled]="!newPerm.name"
                      class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95">
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; background: #f8fafc; min-height: 100vh; }
    .permission-card { border-left: 4px solid transparent; }
    .permission-card:hover { border-left-color: #4f46e5; transform: translateY(-4px); }
  `]
})
export class PermissionsComponent implements OnInit {
    permissions: Permission[] = [];
    showCreateModal = false;
    newPerm: Partial<Permission> = {};

    constructor(private rolesService: RolesService) { }

    ngOnInit() {
        this.loadPermissions();
    }

    loadPermissions() {
        this.rolesService.getPermissions().subscribe(data => {
            this.permissions = data;
        });
    }

    createPermission() {
        this.rolesService.createPermission(this.newPerm).subscribe(() => {
            this.loadPermissions();
            this.showCreateModal = false;
            this.newPerm = {};
        });
    }

    deletePermission(id: number) {
        if (confirm('Are you sure you want to delete this permission? This might affects existing roles.')) {
            this.rolesService.deletePermission(id).subscribe(() => {
                this.loadPermissions();
            });
        }
    }
}
