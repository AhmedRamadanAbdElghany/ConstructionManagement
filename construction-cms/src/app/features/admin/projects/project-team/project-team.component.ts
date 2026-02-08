import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectTeamService, TeamMemberDto, ProjectRoleDto, AddTeamMemberRequest, CreateProjectRoleRequest, AssignProjectRoleRequest } from '../../../../core/services/project-team.service';

@Component({
    selector: 'app-project-team',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Project Team</h1>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Manage team members and roles for your project</p>
          </div>
          <div class="flex items-center space-x-4">
            <button (click)="openAddMemberModal()" 
                    class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
              + Add Member
            </button>
            <button (click)="openCreateRoleModal()" 
                    class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
              + Create Role
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Team Members</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ teamMembers.length }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Project Roles</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ projectRoles.length }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Roles</div>
                <div class="text-3xl font-black text-slate-900 dark:text-white">{{ assignedRolesCount }}</div>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <svg class="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Team Members Section -->
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
            <div class="p-6 border-b border-slate-100 dark:border-white/5">
              <h2 class="text-lg font-black text-slate-900 dark:text-white">Team Members</h2>
            </div>
            <div class="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              @for (member of teamMembers; track member.id) {
                <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-violet-500/30 transition-colors">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">
                      {{ (member.userName || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-sm font-bold text-slate-900 dark:text-white">{{ member.userName || 'Unknown User' }}</div>
                      <div class="text-[10px] text-slate-400 font-black uppercase mt-1">
                        @if (member.roleName) {
                          {{ member.roleName }}
                        } @else {
                          No Role
                        }
                      </div>
                      @if (member.reportsToUserName) {
                        <div class="text-[9px] text-slate-400 mt-1">Reports to: {{ member.reportsToUserName }}</div>
                      }
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button (click)="openAssignRoleModal(member)" 
                            class="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-colors"
                            title="Assign Role">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                      </svg>
                    </button>
                    <button (click)="removeMember(member.id)" 
                            class="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            title="Remove Member">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              }
              @if (teamMembers.length === 0) {
                <div class="text-center py-12">
                  <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                  </div>
                  <div class="text-sm font-bold text-slate-400">No team members yet</div>
                  <div class="text-xs text-slate-400 mt-1">Add your first team member to get started</div>
                </div>
              }
            </div>
          </div>

          <!-- Project Roles Section -->
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
            <div class="p-6 border-b border-slate-100 dark:border-white/5">
              <h2 class="text-lg font-black text-slate-900 dark:text-white">Project Roles</h2>
            </div>
            <div class="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              @for (role of projectRoles; track role.id) {
                <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-cyan-500/30 transition-colors">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg">
                      {{ role.roleName.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-sm font-bold text-slate-900 dark:text-white">{{ role.roleName }}</div>
                      @if (role.description) {
                        <div class="text-[10px] text-slate-400 mt-1">{{ role.description }}</div>
                      }
                      <div class="text-[9px] text-slate-400 mt-1">Created: {{ role.createdAt | date:'shortDate' }}</div>
                    </div>
                  </div>
                  <button (click)="deleteRole(role.id)" 
                          class="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          title="Delete Role">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              }
              @if (projectRoles.length === 0) {
                <div class="text-center py-12">
                  <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                    </svg>
                  </div>
                  <div class="text-sm font-bold text-slate-400">No project roles yet</div>
                  <div class="text-xs text-slate-400 mt-1">Create your first role to get started</div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    @if (showAddMemberModal) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Add Team Member</h3>
          </div>
          <div class="p-8 space-y-6">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">User ID *</label>
              <input type="number" 
                     [(ngModel)]="addMemberFormData.userId" 
                     class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                     placeholder="Enter user ID">
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reports To (Optional)</label>
              <input type="number" 
                     [(ngModel)]="addMemberFormData.reportsToUserId" 
                     class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                     placeholder="Enter manager's user ID">
            </div>
          </div>
          <div class="p-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-4">
            <button (click)="closeAddMemberModal()" 
                    class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button (click)="addTeamMember()" 
                    class="px-8 py-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all">
              Add Member
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Create Role Modal -->
    @if (showCreateRoleModal) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Create Project Role</h3>
          </div>
          <div class="p-8 space-y-6">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role Name *</label>
              <input type="text" 
                     [(ngModel)]="createRoleFormData.roleName" 
                     class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                     placeholder="e.g., Project Manager, Site Engineer">
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
              <textarea [(ngModel)]="createRoleFormData.description" 
                        rows="3"
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                        placeholder="Describe the role responsibilities..."></textarea>
            </div>
          </div>
          <div class="p-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-4">
            <button (click)="closeCreateRoleModal()" 
                    class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button (click)="createRole()" 
                    class="px-8 py-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all">
              Create Role
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Assign Role Modal -->
    @if (showAssignRoleModal) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md">
          <div class="p-8 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Assign Role</h3>
          </div>
          <div class="p-8 space-y-6">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Role *</label>
              <select [(ngModel)]="assignRoleFormData.projectRoleId" 
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                <option value="">Select a role</option>
                @for (role of projectRoles; track role.id) {
                  <option [value]="role.id">{{ role.roleName }}</option>
                }
              </select>
            </div>
          </div>
          <div class="p-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-4">
            <button (click)="closeAssignRoleModal()" 
                    class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button (click)="assignRole()" 
                    class="px-8 py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
              Assign Role
            </button>
          </div>
        </div>
      </div>
    }
  `,
    styles: []
})
export class ProjectTeamComponent implements OnInit {
    teamMembers: TeamMemberDto[] = [];
    projectRoles: ProjectRoleDto[] = [];
    projectId: number = 1; // TODO: Get from route or service

    // Add Member Modal
    showAddMemberModal: boolean = false;
    addMemberFormData: AddTeamMemberRequest = {
        userId: 0,
        reportsToUserId: undefined
    };

    // Create Role Modal
    showCreateRoleModal: boolean = false;
    createRoleFormData: CreateProjectRoleRequest = {
        roleName: '',
        description: ''
    };

    // Assign Role Modal
    showAssignRoleModal: boolean = false;
    assigningMember: TeamMemberDto | null = null;
    assignRoleFormData: AssignProjectRoleRequest = {
        projectRoleId: 0
    };

    constructor(private projectTeamService: ProjectTeamService) { }

    ngOnInit(): void {
        this.loadTeamMembers();
        this.loadProjectRoles();
    }

    loadTeamMembers(): void {
        this.projectTeamService.getTeam(this.projectId).subscribe({
            next: (members) => {
                this.teamMembers = members;
            },
            error: (error) => {
                console.error('Error loading team members:', error);
            }
        });
    }

    loadProjectRoles(): void {
        this.projectTeamService.getRoles(this.projectId).subscribe({
            next: (roles) => {
                this.projectRoles = roles;
            },
            error: (error) => {
                console.error('Error loading project roles:', error);
            }
        });
    }

    get assignedRolesCount(): number {
        return this.teamMembers.filter(member => member.roleId).length;
    }

    // Add Member Modal Methods
    openAddMemberModal(): void {
        this.addMemberFormData = {
            userId: 0,
            reportsToUserId: undefined
        };
        this.showAddMemberModal = true;
    }

    closeAddMemberModal(): void {
        this.showAddMemberModal = false;
    }

    addTeamMember(): void {
        if (!this.addMemberFormData.userId) {
            alert('Please enter a user ID');
            return;
        }

        this.projectTeamService.addTeamMember(this.projectId, this.addMemberFormData).subscribe({
            next: () => {
                this.loadTeamMembers();
                this.closeAddMemberModal();
            },
            error: (error) => {
                console.error('Error adding team member:', error);
                alert('Failed to add team member');
            }
        });
    }

    removeMember(teamId: number): void {
        if (confirm('Are you sure you want to remove this team member?')) {
            // Note: Delete method not implemented in ProjectTeamService yet
            alert('Remove functionality not yet implemented');
        }
    }

    // Create Role Modal Methods
    openCreateRoleModal(): void {
        this.createRoleFormData = {
            roleName: '',
            description: ''
        };
        this.showCreateRoleModal = true;
    }

    closeCreateRoleModal(): void {
        this.showCreateRoleModal = false;
    }

    createRole(): void {
        if (!this.createRoleFormData.roleName) {
            alert('Please enter a role name');
            return;
        }

        this.projectTeamService.createRole(this.projectId, this.createRoleFormData).subscribe({
            next: () => {
                this.loadProjectRoles();
                this.closeCreateRoleModal();
            },
            error: (error) => {
                console.error('Error creating role:', error);
                alert('Failed to create role');
            }
        });
    }

    deleteRole(roleId: number): void {
        if (confirm('Are you sure you want to delete this role?')) {
            // Note: Delete method not implemented in ProjectTeamService yet
            alert('Delete functionality not yet implemented');
        }
    }

    // Assign Role Modal Methods
    openAssignRoleModal(member: TeamMemberDto): void {
        this.assigningMember = member;
        this.assignRoleFormData = {
            projectRoleId: member.roleId || 0
        };
        this.showAssignRoleModal = true;
    }

    closeAssignRoleModal(): void {
        this.showAssignRoleModal = false;
        this.assigningMember = null;
    }

    assignRole(): void {
        if (!this.assigningMember || !this.assignRoleFormData.projectRoleId) {
            alert('Please select a role');
            return;
        }

        this.projectTeamService.assignRole(this.assigningMember.teamId, this.assignRoleFormData).subscribe({
            next: () => {
                this.loadTeamMembers();
                this.closeAssignRoleModal();
            },
            error: (error) => {
                console.error('Error assigning role:', error);
                alert('Failed to assign role');
            }
        });
    }
}
