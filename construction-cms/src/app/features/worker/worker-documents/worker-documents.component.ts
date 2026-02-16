import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentService, Document, DocumentSearchRequest } from '../../../core/services/document.service';

@Component({
  selector: 'app-worker-documents',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="mb-10">
          <div class="flex items-center space-x-2 mb-3">
            <span class="px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold flex items-center border border-cyan-500/20">
              <span class="w-2 h-2 rounded-full bg-cyan-500 mr-2 animate-pulse"></span>
              {{ 'sidebar.documents' | translate | uppercase }}
            </span>
          </div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            {{ 'worker_documents.my_documents' | translate }} <span class="text-cyan-500">📄</span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">{{ 'worker.access_documents' | translate }}</p>
        </div>

        <!-- Loading State -->
        @if (loading) {
          <div class="flex justify-center items-center h-64">
            <div class="relative">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 animate-pulse shadow-lg shadow-cyan-500/30"></div>
              <div class="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 animate-ping opacity-20"></div>
            </div>
          </div>
        }

        <!-- Documents Grid -->
        @if (!loading) {
          @if (documents.length === 0) {
            <div class="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-200 dark:border-white/5 shadow-xl text-center">
              <div class="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                <span class="text-4xl">📭</span>
              </div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{{ 'worker.no_documents' | translate }}</h3>
              <p class="text-slate-500 dark:text-slate-400 font-medium">{{ 'worker.no_documents_desc' | translate }}</p>
            </div>
          } @else {
            <!-- Filter Tabs -->
            <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button (click)="filterType = ''"
                      [class.bg-cyan-600]="filterType === ''"
                      [class.text-white]="filterType === ''"
                      [class.bg-white]="filterType !== ''"
                      [class.dark:bg-slate-800]="filterType !== ''"
                      class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap">
                {{ 'locations.all' | translate }}
              </button>
              @for (type of documentTypes; track type) {
                <button (click)="filterType = type"
                        [class.bg-cyan-600]="filterType === type"
                        [class.text-white]="filterType === type"
                        [class.bg-white]="filterType !== type"
                        [class.dark:bg-slate-800]="filterType !== type"
                        class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap">
                  {{ type }}
                </button>
              }
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (doc of filteredDocuments; track doc.id) {
                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 overflow-hidden group">
                  <!-- Document Icon -->
                  <div class="p-6 border-b border-slate-100 dark:border-white/5">
                    <div class="flex items-start justify-between mb-4">
                      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                        <span class="text-white text-2xl">{{ getFileIcon(doc.documentType) }}</span>
                      </div>
                      <span class="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        {{ doc.categoryName || 'General' }}
                      </span>
                    </div>
                    <h3 class="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1 line-clamp-1">{{ doc.title }}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{{ doc.description }}</p>
                  </div>

                  <!-- Document Info -->
                  <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
                    <div class="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'worker.type' | translate }}</p>
                        <p class="text-sm font-bold text-slate-900 dark:text-white">{{ doc.documentType }}</p>
                      </div>
                      <div>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'worker.uploaded' | translate }}</p>
                        <p class="text-sm font-bold text-slate-900 dark:text-white">{{ doc.uploadedDate | date:'MMM d, y' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="p-4 border-t border-slate-100 dark:border-white/5">
                    <button (click)="downloadDocument(doc)"
                            class="w-full py-3 rounded-xl bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all flex items-center justify-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `
})
export class WorkerDocumentsComponent implements OnInit {
  documents: Document[] = [];
  documentTypes: string[] = [];
  filterType = '';
  loading = true;

  constructor(
    private authService: AuthService,
    private documentService: DocumentService
  ) { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    const searchRequest: DocumentSearchRequest = {};
    this.documentService.getDocuments(searchRequest).subscribe({
      next: (documents: Document[]) => {
        this.documents = documents;
        this.documentTypes = [...new Set(documents.map(d => d.documentType).filter((t): t is string => !!t))];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading documents:', error);
        this.loading = false;
      }
    });
  }

  get filteredDocuments(): Document[] {
    if (!this.filterType) {
      return this.documents;
    }
    return this.documents.filter(d => d.documentType === this.filterType);
  }

  getFileIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return '📕';
      case 'doc':
      case 'docx':
        return '📘';
      case 'xls':
      case 'xlsx':
        return '📗';
      case 'ppt':
      case 'pptx':
        return '📙';
      case 'image':
      case 'jpg':
      case 'png':
        return '🖼️';
      case 'video':
        return '🎬';
      default:
        return '📄';
    }
  }

  downloadDocument(doc: Document): void {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Error downloading document:', error);
      }
    });
  }
}
