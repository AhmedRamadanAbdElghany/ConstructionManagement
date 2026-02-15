import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ClientPortalService } from '../../../core/services/client-portal.service';

@Component({
    selector: 'app-client-documents',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">{{ 'client.documents' | translate }}</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">{{ 'client.documents_subtitle' | translate }}</p>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl">
              <div class="flex flex-col px-3">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</span>
                <select [(ngModel)]="selectedType" (change)="loadDocuments()" class="bg-transparent border-none text-xs font-black text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none cursor-pointer">
                  <option value="">All</option>
                  <option value="contract">Contracts</option>
                  <option value="invoice">Invoices</option>
                  <option value="plan">Plans</option>
                  <option value="report">Reports</option>
                </select>
              </div>
              <div class="flex flex-col px-3">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Project</span>
                <select [(ngModel)]="selectedProjectId" (change)="loadDocuments()" class="bg-transparent border-none text-xs font-black text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none cursor-pointer">
                  <option value="">All Projects</option>
                  <option *ngFor="let project of projects" [value]="project.id">{{ project.name }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }

        <!-- Documents List (Placeholder for now as service implementation might be missing) -->
        @if (!isLoading && documents.length > 0) {
           <!-- Grid Implementation -->
        }

        <!-- Empty State -->
        @if (!isLoading && documents.length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
              <svg class="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ 'client.no_documents' | translate }}</h3>
            <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {{ 'client.no_documents_desc' | translate }}
            </p>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    :host ::ng-deep select {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
  `]
})
export class ClientDocumentsComponent implements OnInit {
    private clientPortalService = inject(ClientPortalService);

    documents: any[] = [];
    projects: any[] = [];
    isLoading = false;
    selectedType = '';
    selectedProjectId = '';

    ngOnInit() {
        this.loadDocuments();
        this.loadProjects();
    }

    loadDocuments() {
        this.isLoading = true;
        // Simulate loading with no results for now as we want to show empty state
        // In real implementation, this would call a service method
        setTimeout(() => {
            this.documents = [];
            this.isLoading = false;
        }, 500);
    }

    loadProjects() {
        this.clientPortalService.getClientDashboard().subscribe({
            next: (dashboard) => {
                this.projects = dashboard.projects.map(p => ({ id: p.projectId, name: p.projectName }));
            },
            error: (error) => {
                console.error('Error loading projects:', error);
            }
        });
    }
}
