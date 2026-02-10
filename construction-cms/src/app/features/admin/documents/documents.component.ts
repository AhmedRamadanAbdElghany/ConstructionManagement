import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentService, Document, DocumentCategory, DocumentSummary } from '../../../core/services/document.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{{ 'documents.title' | translate }}</h1>
            <p class="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{{ 'documents.subtitle' | translate }}</p>
          </div>

          <button (click)="openUploadModal()" 
                  class="px-8 py-4 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            {{ 'documents.upload' | translate }}
          </button>
        </div>

        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-indigo-500/30 transition-all">
            <div class="flex items-center justify-between mb-2">
              <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{{ 'documents.total' | translate }}</span>
            </div>
            <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{{ summary?.totalDocuments || 0 }}</h3>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-emerald-500/30 transition-all">
            <div class="flex items-center justify-between mb-2">
              <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{{ 'documents.categories_count' | translate }}</span>
            </div>
            <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{{ summary?.totalCategories || 0 }}</h3>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-amber-500/30 transition-all">
            <div class="flex items-center justify-between mb-2">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">{{ 'documents.pending' | translate }}</span>
            </div>
            <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{{ summary?.pendingApprovals || 0 }}</h3>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-orange-500/30 transition-all">
            <div class="flex items-center justify-between mb-2">
              <div class="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <span class="text-[10px] font-black text-orange-500 uppercase tracking-widest">{{ 'documents.expiring_soon' | translate }}</span>
            </div>
            <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{{ summary?.expiringDocuments || 0 }}</h3>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-8 group hover:border-rose-500/30 transition-all">
            <div class="flex items-center justify-between mb-2">
              <div class="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
              </div>
              <span class="text-[10px] font-black text-rose-500 uppercase tracking-widest">{{ 'documents.expired' | translate }}</span>
            </div>
            <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{{ summary?.expiredDocuments || 0 }}</h3>
          </div>
        </div>

        <!-- Main Content Split -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <!-- Side Categories -->
           <div class="lg:col-span-1 space-y-6">
              <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6">
                 <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 px-2">Folders</h3>
                 <div class="space-y-1">
                    <button (click)="selectCategory('')"
                            [class.bg-indigo-500/10]="!selectedCategory"
                            [class.text-indigo-500]="!selectedCategory"
                            class="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-bold text-slate-600 dark:text-slate-400">
                       <div class="flex items-center">
                          <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                          All Documents
                       </div>
                    </button>
                    @for (cat of categories; track cat.id) {
                      <button (click)="selectCategory(cat.id.toString())"
                              [class.bg-indigo-500/10]="selectedCategory === cat.id.toString()"
                              [class.text-indigo-500]="selectedCategory === cat.id.toString()"
                              class="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-bold text-slate-600 dark:text-slate-400">
                         <div class="flex items-center">
                            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                            {{ cat.name }}
                         </div>
                         <span class="text-[10px] font-black opacity-50">{{ cat.documentCount }}</span>
                      </button>
                    }
                 </div>
              </div>
           </div>

           <!-- Content Area -->
           <div class="lg:col-span-3 space-y-6">
              <!-- Search & Quick Filters -->
              <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-4 flex flex-col md:flex-row gap-4">
                 <div class="flex-1 relative">
                    <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()"
                           class="w-full pl-12 pr-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                           placeholder="{{ 'documents.search_placeholder' | translate }}">
                    <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                 </div>
                 <div class="flex gap-4">
                    <select [(ngModel)]="selectedType" (change)="applyFilters()"
                            class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                       <option value="">All Types</option>
                       <option value="Contract">Contract</option>
                       <option value="Permit">Permit</option>
                       <option value="Blueprint">Blueprint</option>
                    </select>
                    <select [(ngModel)]="selectedStatus" (change)="applyFilters()"
                            class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                       <option value="">Status</option>
                       <option value="Approved">Approved</option>
                       <option value="Pending">Pending</option>
                    </select>
                 </div>
              </div>

              <!-- Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 @for (doc of filteredDocuments; track doc.id) {
                    <div (click)="selectDocument(doc)"
                         class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl p-6 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer group">
                       <div class="flex items-start justify-between mb-6">
                          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <svg class="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                          </div>
                          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                                [ngClass]="{
                                  'bg-emerald-500/10 text-emerald-500': doc.status === 'Approved',
                                  'bg-amber-500/10 text-amber-500': doc.status === 'Pending' || doc.status === 'PendingApproval',
                                  'bg-rose-500/10 text-rose-500': doc.status === 'Rejected' || doc.isExpired
                                }">
                             {{ doc.status }}
                          </span>
                       </div>
                       
                       <h4 class="text-lg font-black text-slate-900 dark:text-white mb-1 truncate">{{ doc.title }}</h4>
                       <div class="flex items-center space-x-2 mb-4">
                          <span class="text-[10px] font-black text-slate-400 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-md uppercase tracking-tighter">{{ doc.documentType }}</span>
                          <span class="text-[10px] font-bold text-slate-400">• {{ doc.fileSizeFormatted }}</span>
                       </div>

                       <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                          <div class="flex items-center">
                             <div class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black mr-2">{{ doc.uploadedBy.substring(0,1) }}</div>
                             <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ doc.uploadedBy }}</span>
                          </div>
                          <div class="flex space-x-2">
                             <button class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors">
                               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                             </button>
                             <button class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors">
                               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                             </button>
                          </div>
                       </div>
                    </div>
                 } @empty {
                   <div class="col-span-2 text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10">
                      <p class="text-xs font-black text-slate-400 font-bold uppercase tracking-[0.2em]">{{ 'documents.no_documents' | translate }}</p>
                   </div>
                 }
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    @if (showUploadModal) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl relative border border-slate-200 dark:border-white/5 overflow-hidden">
            <div class="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
               <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ 'documents.upload' | translate }}</h2>
               <button (click)="showUploadModal = false" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white transition-all">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>
            
            <div class="p-8 space-y-6">
               <div class="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] p-10 hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] transition-all cursor-pointer group">
                  <div class="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:text-indigo-500 transition-all mb-4">
                     <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  </div>
                  <p class="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500">Click or drag file to upload</p>
                  <input type="file" (change)="onFileSelected($event)" class="hidden">
               </div>

               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{{ 'documents.category' | translate }}</label>
                    <select [(ngModel)]="newDocument.categoryId" class="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 font-bold outline-none appearance-none">
                       <option [ngValue]="undefined">Select Category</option>
                       @for (cat of categories; track cat.id) {
                         <option [value]="cat.id">{{ cat.name }}</option>
                       }
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{{ 'documents.type' | translate }}</label>
                    <select [(ngModel)]="newDocument.documentType" class="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 font-bold outline-none appearance-none">
                       <option value="Contract">Contract</option>
                       <option value="Permit">Permit</option>
                       <option value="Blueprint">Blueprint</option>
                    </select>
                  </div>
               </div>

               <button (click)="uploadDocument()" 
                       class="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                  {{ 'documents.save' | translate }}
               </button>
            </div>
         </div>
      </div>
    }
  `,
  styles: []
})
export class DocumentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  categories: DocumentCategory[] = [];
  summary: DocumentSummary | null = null;

  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  selectedType = '';

  showUploadModal = false;
  selectedDoc: Document | null = null;
  newDocument: Partial<Document> = {};
  selectedFile: File | null = null;

  constructor(private documentService: DocumentService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    forkJoin({
      docs: this.documentService.getDocuments(),
      categories: this.documentService.getCategories(),
      summary: this.documentService.getSummary()
    }).pipe(takeUntil(this.destroy$)).subscribe(results => {
      this.documents = results.docs;
      this.filteredDocuments = results.docs;
      this.categories = results.categories;
      this.summary = results.summary;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredDocuments = this.documents.filter(doc => {
      const matchesSearch = !this.searchQuery ||
        doc.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (doc.tags && doc.tags.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesCategory = !this.selectedCategory || doc.categoryId?.toString() === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || doc.status === this.selectedStatus;
      const matchesType = !this.selectedType || doc.documentType === this.selectedType;

      return matchesSearch && matchesCategory && matchesStatus && matchesType;
    });
  }

  selectCategory(catId: string): void {
    this.selectedCategory = catId;
    this.applyFilters();
  }

  openUploadModal() {
    this.newDocument = { documentType: 'Contract', categoryId: undefined };
    this.showUploadModal = true;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.newDocument.title = this.selectedFile.name.split('.')[0];
    }
  }

  uploadDocument() {
    if (!this.selectedFile) return;

    this.documentService.createDocument({
      title: this.newDocument.title || 'Untitled',
      documentType: this.newDocument.documentType || 'Other',
      categoryId: this.newDocument.categoryId,
      file: this.selectedFile
    }).subscribe(() => {
      this.showUploadModal = false;
      this.loadData();
    });
  }

  selectDocument(doc: Document) {
    this.selectedDoc = doc;
  }
}
