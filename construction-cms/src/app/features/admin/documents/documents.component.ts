import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService, Document, DocumentCategory, DocumentSummary } from '../../../core/services/document.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="documents-page">
      <div class="page-header">
        <h1>Document Management</h1>
        <button class="btn btn-primary" (click)="showUploadModal = true">
          <i class="icon-upload"></i> Upload Document
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon blue">
            <i class="icon-document"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ summary?.totalDocuments || 0 }}</span>
            <span class="card-label">Total Documents</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon green">
            <i class="icon-folder"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ summary?.totalCategories || 0 }}</span>
            <span class="card-label">Categories</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon orange">
            <i class="icon-clock"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ summary?.pendingApprovals || 0 }}</span>
            <span class="card-label">Pending Approvals</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon red">
            <i class="icon-warning"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ summary?.expiringDocuments || 0 }}</span>
            <span class="card-label">Expiring Soon</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon red-dark">
            <i class="icon-alert"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ summary?.expiredDocuments || 0 }}</span>
            <span class="card-label">Expired</span>
          </div>
        </div>
      </div>

      <!-- Filter and Search -->
      <div class="filter-section">
        <div class="search-box">
          <i class="icon-search"></i>
          <input type="text" 
                 [(ngModel)]="searchQuery" 
                 (input)="onSearch()"
                 placeholder="Search documents...">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="selectedCategory" (change)="applyFilters()">
            <option value="">All Categories</option>
            <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
          </select>
          <select [(ngModel)]="selectedStatus" (change)="applyFilters()">
            <option value="">All Status</option>
            <option value="Approved">Approved</option>
            <option value="PendingApproval">Pending Approval</option>
            <option value="Draft">Draft</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select [(ngModel)]="selectedType" (change)="applyFilters()">
            <option value="">All Types</option>
            <option value="Contract">Contract</option>
            <option value="Permit">Permit</option>
            <option value="Blueprint">Blueprint</option>
            <option value="Compliance">Compliance</option>
            <option value="Report">Report</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <!-- Categories Sidebar -->
      <div class="main-content">
        <div class="categories-sidebar">
          <h3>Categories</h3>
          <ul>
            <li [class.active]="!selectedCategory" (click)="selectCategory('')">
              <span>All Documents</span>
              <span class="count">{{ documents.length }}</span>
            </li>
            <li *ngFor="let cat of categories" 
                [class.active]="selectedCategory === cat.id.toString()"
                (click)="selectCategory(cat.id.toString())">
              <span>{{ cat.name }}</span>
              <span class="count">{{ cat.documentCount }}</span>
            </li>
          </ul>
        </div>

        <!-- Documents Grid -->
        <div class="documents-grid">
          <div class="document-card" *ngFor="let doc of filteredDocuments" (click)="selectDocument(doc)">
            <div class="doc-icon" [ngClass]="getDocTypeClass(doc.documentType)">
              <i class="icon-document"></i>
            </div>
            <div class="doc-info">
              <h4>{{ doc.title }}</h4>
              <p class="doc-meta">
                <span class="doc-type">{{ doc.documentType }}</span>
                <span class="doc-size">{{ doc.fileSizeFormatted }}</span>
              </p>
              <p class="doc-uploader">
                <i class="icon-user"></i> {{ doc.uploadedBy }}
              </p>
            </div>
            <div class="doc-status" [ngClass]="getStatusClass(doc.status)">
              {{ doc.status }}
            </div>
            <div class="doc-actions">
              <button class="btn-icon" title="Download">
                <i class="icon-download"></i>
              </button>
              <button class="btn-icon" title="View">
                <i class="icon-eye"></i>
              </button>
              <button class="btn-icon" title="More">
                <i class="icon-more"></i>
              </button>
            </div>
            <div class="doc-expiry" *ngIf="doc.daysUntilExpiry !== undefined">
              <span *ngIf="doc.isExpired" class="expired">
                <i class="icon-alert"></i> Expired
              </span>
              <span *ngIf="!doc.isExpired && doc.daysUntilExpiry <= 90" class="expiring">
                <i class="icon-clock"></i> {{ doc.daysUntilExpiry }} days left
              </span>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredDocuments.length === 0">
            <i class="icon-document"></i>
            <h3>No Documents Found</h3>
            <p>Upload your first document to get started</p>
          </div>
        </div>
      </div>

      <!-- Upload Modal -->
      <div class="modal-overlay" *ngIf="showUploadModal" (click)="showUploadModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Upload Document</h2>
            <button class="btn-close" (click)="showUploadModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Title *</label>
              <input type="text" [(ngModel)]="newDocument.title" placeholder="Document title">
            </div>
            <div class="form-group">
              <label>Category *</label>
              <select [(ngModel)]="newDocument.categoryId">
                <option value="">Select Category</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Document Type *</label>
              <select [(ngModel)]="newDocument.documentType">
                <option value="Contract">Contract</option>
                <option value="Permit">Permit</option>
                <option value="Blueprint">Blueprint</option>
                <option value="Compliance">Compliance</option>
                <option value="Report">Report</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="newDocument.description" rows="3" placeholder="Document description"></textarea>
            </div>
            <div class="form-group">
              <label>Tags</label>
              <input type="text" [(ngModel)]="newDocument.tags" placeholder="Tags (comma separated)">
            </div>
            <div class="form-group">
              <label>Expiry Date</label>
              <input type="date" [(ngModel)]="newDocument.expiryDate">
            </div>
            <div class="form-group file-upload">
              <label>File *</label>
              <div class="upload-area">
                <i class="icon-upload"></i>
                <p>Drag & drop or click to browse</p>
                <input type="file">
              </div>
            </div>
            <div class="form-group checkbox">
              <label>
                <input type="checkbox" [(ngModel)]="newDocument.requireApproval">
                Require Approval
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showUploadModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="uploadDocument()">Upload</button>
          </div>
        </div>
      </div>

      <!-- Document Detail Modal -->
      <div class="modal-overlay" *ngIf="selectedDoc" (click)="selectedDoc = null">
        <div class="modal-content modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ selectedDoc.title }}</h2>
            <button class="btn-close" (click)="selectedDoc = null">&times;</button>
          </div>
          <div class="modal-body">
            <div class="doc-detail-grid">
              <div class="doc-preview">
                <div class="preview-placeholder">
                  <i class="icon-document-large"></i>
                  <p>{{ selectedDoc.fileName }}</p>
                  <span>{{ selectedDoc.fileSizeFormatted }}</span>
                </div>
              </div>
              <div class="doc-details">
                <div class="detail-row">
                  <span class="label">Type:</span>
                  <span class="value">{{ selectedDoc.documentType }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Category:</span>
                  <span class="value">{{ selectedDoc.categoryName }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Status:</span>
                  <span class="value status-badge" [ngClass]="getStatusClass(selectedDoc.status)">
                    {{ selectedDoc.status }}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="label">Version:</span>
                  <span class="value">v{{ selectedDoc.currentVersion }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Uploaded By:</span>
                  <span class="value">{{ selectedDoc.uploadedBy }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Upload Date:</span>
                  <span class="value">{{ selectedDoc.uploadedDate | date:'mediumDate' }}</span>
                </div>
                <div class="detail-row" *ngIf="selectedDoc.expiryDate">
                  <span class="label">Expiry Date:</span>
                  <span class="value" [class.expired-text]="selectedDoc.isExpired">
                    {{ selectedDoc.expiryDate | date:'mediumDate' }}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="label">Downloads:</span>
                  <span class="value">{{ selectedDoc.downloadCount }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Views:</span>
                  <span class="value">{{ selectedDoc.viewCount }}</span>
                </div>
              </div>
            </div>
            <div class="doc-version-history" *ngIf="selectedDoc.currentVersion > 1">
              <h4>Version History</h4>
              <ul>
                <li *ngFor="let v of [1,2]" [class.current]="v === selectedDoc.currentVersion">
                  <span class="version">v{{ v }}</span>
                  <span class="version-date">{{ '2024-01-15' | date:'mediumDate' }}</span>
                  <span class="version-user">Ahmed Hassan</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="selectedDoc = null">Close</button>
            <button class="btn btn-outline">
              <i class="icon-download"></i> Download
            </button>
            <button class="btn btn-primary">
              <i class="icon-share"></i> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .documents-page {
      padding: 24px;
      background: #f5f7fa;
      min-height: 100%;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-icon.blue { background: #e3f2fd; color: #1976d2; }
    .card-icon.green { background: #e8f5e9; color: #388e3c; }
    .card-icon.orange { background: #fff3e0; color: #f57c00; }
    .card-icon.red { background: #ffebee; color: #d32f2f; }
    .card-icon.red-dark { background: #fce4ec; color: #c2185b; }

    .card-content {
      display: flex;
      flex-direction: column;
    }

    .card-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .card-label {
      font-size: 13px;
      color: #64748b;
    }

    .filter-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .search-box i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .search-box input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
    }

    .filter-group {
      display: flex;
      gap: 12px;
    }

    .filter-group select {
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      font-size: 14px;
      min-width: 150px;
    }

    .main-content {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
    }

    .categories-sidebar {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .categories-sidebar h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0 0 16px 0;
    }

    .categories-sidebar ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .categories-sidebar li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 4px;
    }

    .categories-sidebar li:hover {
      background: #f5f7fa;
    }

    .categories-sidebar li.active {
      background: #e3f2fd;
      color: #1976d2;
    }

    .categories-sidebar .count {
      background: #f0f0f0;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      color: #64748b;
    }

    .categories-sidebar li.active .count {
      background: #bbdefb;
      color: #1976d2;
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .document-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .document-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }

    .doc-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    .doc-icon.contract { background: #e3f2fd; color: #1976d2; }
    .doc-icon.permit { background: #e8f5e9; color: #388e3c; }
    .doc-icon.blueprint { background: #fff3e0; color: #f57c00; }
    .doc-icon.compliance { background: #f3e5f5; color: #7b1fa2; }
    .doc-icon.report { background: #e0f2f1; color: #00796b; }
    .doc-icon.other { background: #eceff1; color: #546e7a; }

    .doc-info h4 {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0 0 8px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .doc-meta {
      display: flex;
      gap: 12px;
      font-size: 13px;
      color: #64748b;
      margin: 0 0 4px 0;
    }

    .doc-uploader {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }

    .doc-status {
      position: absolute;
      top: 16px;
      right: 16px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .doc-status.approved { background: #e8f5e9; color: #388e3c; }
    .doc-status.pending { background: #fff3e0; color: #f57c00; }
    .doc-status.draft { background: #eceff1; color: #546e7a; }
    .doc-status.rejected { background: #ffebee; color: #d32f2f; }

    .doc-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border: none;
      background: #f5f7fa;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: #e2e8f0;
    }

    .doc-expiry {
      margin-top: 8px;
      font-size: 12px;
    }

    .doc-expiry .expired {
      color: #d32f2f;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .doc-expiry .expiring {
      color: #f57c00;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: #64748b;
    }

    .empty-state i {
      font-size: 48px;
      margin-bottom: 16px;
      color: #cbd5e1;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #475569;
    }

    .empty-state p {
      margin: 0;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-content.modal-lg {
      max-width: 800px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .btn-close {
      width: 32px;
      height: 32px;
      border: none;
      background: #f5f7fa;
      border-radius: 8px;
      font-size: 20px;
      cursor: pointer;
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #374151;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
    }

    .form-group.checkbox label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .form-group.checkbox input {
      width: auto;
    }

    .upload-area {
      border: 2px dashed #e2e8f0;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .upload-area:hover {
      border-color: #3b82f6;
      background: #f8fafc;
    }

    .upload-area i {
      font-size: 32px;
      color: #94a3b8;
      margin-bottom: 12px;
    }

    .upload-area input {
      display: none;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid #e2e8f0;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-secondary {
      background: #f5f7fa;
      color: #475569;
    }

    .btn-outline {
      background: white;
      border: 1px solid #e2e8f0;
      color: #475569;
    }

    .doc-detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .doc-preview {
      background: #f5f7fa;
      border-radius: 12px;
      padding: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preview-placeholder {
      text-align: center;
      color: #64748b;
    }

    .preview-placeholder i {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-row .label {
      color: #64748b;
    }

    .detail-row .value {
      font-weight: 500;
      color: #1a1a2e;
    }

    .status-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
    }

    .expired-text {
      color: #d32f2f !important;
    }

    .doc-version-history {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }

    .doc-version-history h4 {
      margin: 0 0 16px 0;
      font-size: 15px;
    }

    .doc-version-history ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .doc-version-history li {
      display: flex;
      gap: 16px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .doc-version-history li.current {
      background: #e3f2fd;
    }

    .doc-version-history .version {
      font-weight: 600;
      color: #1976d2;
    }

    @media (max-width: 1024px) {
      .main-content {
        grid-template-columns: 1fr;
      }

      .categories-sidebar {
        display: none;
      }

      .doc-detail-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DocumentsComponent implements OnInit {
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

  newDocument = {
    title: '',
    categoryId: '',
    documentType: 'Contract',
    description: '',
    tags: '',
    expiryDate: '',
    requireApproval: false
  };

  constructor(private documentService: DocumentService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.documentService.getDocuments().subscribe(docs => {
      this.documents = docs;
      this.filteredDocuments = docs;
    });

    this.documentService.getCategories().subscribe(cats => {
      this.categories = cats;
    });

    this.documentService.getSummary().subscribe(summary => {
      this.summary = summary;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredDocuments = this.documents.filter(doc => {
      const matchesSearch = !this.searchQuery ||
        doc.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesCategory = !this.selectedCategory || doc.categoryId === Number(this.selectedCategory);
      const matchesStatus = !this.selectedStatus || doc.status === this.selectedStatus;
      const matchesType = !this.selectedType || doc.documentType === this.selectedType;

      return matchesSearch && matchesCategory && matchesStatus && matchesType;
    });
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  selectDocument(doc: Document): void {
    this.selectedDoc = doc;
  }

  getDocTypeClass(type: string): string {
    return type.toLowerCase();
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Approved': 'approved',
      'PendingApproval': 'pending',
      'Draft': 'draft',
      'Rejected': 'rejected'
    };
    return statusMap[status] || 'draft';
  }

  uploadDocument(): void {
    console.log('Uploading document:', this.newDocument);
    this.showUploadModal = false;
    this.resetUploadForm();
  }

  resetUploadForm(): void {
    this.newDocument = {
      title: '',
      categoryId: '',
      documentType: 'Contract',
      description: '',
      tags: '',
      expiryDate: '',
      requireApproval: false
    };
  }
}
