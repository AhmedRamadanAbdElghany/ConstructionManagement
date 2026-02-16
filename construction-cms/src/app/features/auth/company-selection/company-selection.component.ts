import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PendingRequestsService, PublicCompany } from '../../../core/services/pending-requests.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-company-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="auth-wrapper">
      <div class="site-overlay"></div>
      
      <div class="selection-box fade-in">
        <header class="box-header">
          <div class="brand-line">
            <div class="logo-orb">
              <svg class="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span class="brand-text">Construction<span class="text-amber-500">CMS</span></span>
          </div>
          <h1 class="box-title">{{ 'company_selection.select_firm' | translate }}</h1>
          <p class="box-subtitle">{{ 'company_selection.select_firm_desc' | translate }}</p>
        </header>

        <div class="finder-area">
          <div class="search-input-wrapper">
            <div class="search-icon">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              [placeholder]="'company_selection.search_placeholder' | translate"
              class="pro-search"
              (input)="filterCompanies()">
          </div>
        </div>

        <div class="scroll-canvas" *ngIf="filteredCompanies().length > 0; else noCompanies">
          <div class="company-grid">
            <div *ngFor="let company of filteredCompanies()" class="firm-card slide-in">
              <div class="firm-visual">
                <div class="firm-avatar">
                  <img *ngIf="company.logoUrl" [src]="company.logoUrl" [alt]="company.name">
                  <svg *ngIf="!company.logoUrl" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
              </div>
              <div class="firm-data">
                <h3 class="firm-name">{{ company.name }}</h3>
                <p class="firm-loc">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {{ company.address || ('company_selection.remote_location' | translate) }}
                </p>
              </div>
              <button 
                class="join-action" 
                (click)="selectCompany(company)"
                [disabled]="loadingCompanyId === company.id">
                <span *ngIf="loadingCompanyId !== company.id">{{ 'company_selection.join_firm' | translate }}</span>
                <div *ngIf="loadingCompanyId === company.id" class="mini-loader"></div>
              </button>
            </div>
          </div>
        </div>

        <ng-template #noCompanies>
          <div class="empty-state">
            <div class="empty-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p>{{ 'company_selection.no_companies' | translate }}</p>
          </div>
        </ng-template>

        <footer class="box-footer">
          <p class="help-text">{{ 'company_selection.owner_question' | translate }} <a routerLink="/auth/register" class="owner-link">{{ 'company_selection.register_new' | translate }}</a></p>
          <div class="footer-actions">
            <button class="logout-btn" (click)="logout()">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {{ 'auth.logout' | translate }}
            </button>
          </div>
        </footer>
      </div>

      <!-- Join Request Modal -->
      <div class="modal-overlay" *ngIf="selectedCompany">
        <div class="modal-content scale-up">
          <div class="modal-header">
            <h3>{{ 'company_selection.request_membership' | translate }}</h3>
            <p>{{ 'company_selection.submit_credentials' | translate }} <strong>{{ selectedCompany.name }}</strong></p>
          </div>
          <div class="modal-body">
            <label class="modal-label">{{ 'company_selection.professional_notes' | translate }}</label>
            <textarea 
              [(ngModel)]="joinMessage" 
              class="pro-textarea"
              [placeholder]="'company_selection.notes_placeholder' | translate"
              rows="4"></textarea>
          </div>
          <div class="modal-footer">
            <button class="modal-btn secondary" (click)="selectedCompany = null">{{ 'company_selection.withdraw' | translate }}</button>
            <button class="modal-btn primary" (click)="confirmJoin()" [disabled]="isSubmitting">
              <span *ngIf="!isSubmitting">{{ 'company_selection.request_entry' | translate }}</span>
              <div *ngIf="isSubmitting" class="mini-loader"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #0f172a;
      --accent: #f59e0b;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --bg-surface: #ffffff;
      --border: #e2e8f0;
    }

    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #0f172a;
      position: relative;
      overflow: hidden;
      padding: 24px;
    }

    .site-overlay {
      position: absolute;
      inset: 0;
      background: url('https://images.unsplash.com/photo-1590486803833-ffc450f4860a?auto=format&fit=crop&q=80&w=2070') center/cover no-repeat;
      opacity: 0.15;
      filter: grayscale(1) contrast(1.1);
    }

    .selection-box {
      width: 100%;
      max-width: 640px;
      background: var(--bg-surface);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
      z-index: 10;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }

    .box-header {
      padding: 40px 48px 32px;
      text-align: center;
    }

    .brand-line {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 32px;
    }

    .logo-orb {
      width: 44px;
      height: 44px;
      background: #fdf2f2;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-text {
      font-size: 20px;
      font-weight: 900;
      color: var(--primary);
    }

    .box-title {
      font-size: 32px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }

    .box-subtitle {
      font-size: 16px;
      color: var(--text-muted);
      font-weight: 500;
      line-height: 1.5;
    }

    .finder-area {
      padding: 0 48px 24px;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .pro-search {
      width: 100%;
      height: 56px;
      background: #f1f5f9;
      border: 2px solid transparent;
      border-radius: 16px;
      padding: 0 16px 0 48px;
      font-size: 15px;
      font-weight: 600;
      color: var(--primary);
      transition: all 0.2s;
    }

    .pro-search:focus {
      outline: none;
      background: #fff;
      border-color: var(--accent);
      box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
    }

    .search-icon {
      position: absolute;
      left: 18px;
      color: var(--text-muted);
      display: flex;
    }

    .scroll-canvas {
      flex: 1;
      overflow-y: auto;
      padding: 0 48px 24px;
      margin-bottom: 24px;
    }

    .company-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .firm-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 18px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .firm-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    }

    .firm-visual {
      flex-shrink: 0;
    }

    .firm-avatar {
      width: 52px;
      height: 52px;
      background: #f1f5f9;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      color: var(--text-muted);
    }
    .firm-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .firm-avatar svg { width: 24px; height: 24px; }

    .firm-data {
      flex: 1;
    }

    .firm-name {
      font-size: 16px;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 4px;
    }

    .firm-loc {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .join-action {
      padding: 10px 20px;
      background: #f1f5f9;
      color: var(--primary);
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .join-action:hover {
      background: var(--primary);
      color: #fff;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--text-muted);
    }

    .empty-icon {
      margin-bottom: 16px;
      color: #cbd5e1;
    }
    .empty-icon svg { width: 48px; height: 48px; margin: 0 auto; }

    .box-footer {
      padding: 24px 48px 40px;
      background: #f8fafc;
      border-top: 1px solid var(--border);
      text-align: center;
    }

    .help-text {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .owner-link {
      color: var(--accent);
      font-weight: 700;
      text-decoration: none;
    }

    .logout-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: #fef2f2;
      color: #ef4444;
      border-color: #fee2e2;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 24px;
    }

    .modal-content {
      width: 100%;
      max-width: 440px;
      background: #fff;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.25);
    }

    .modal-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .modal-header h3 { font-size: 24px; font-weight: 800; color: var(--primary); margin-bottom: 8px; }
    .modal-header p { font-size: 14px; color: var(--text-muted); }

    .modal-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
      display: block;
    }

    .pro-textarea {
      width: 100%;
      background: #f1f5f9;
      border: 2px solid transparent;
      border-radius: 16px;
      padding: 16px;
      font-size: 15px;
      font-weight: 600;
      color: var(--primary);
      transition: all 0.2s;
      resize: none;
    }

    .pro-textarea:focus {
      outline: none;
      background: #fff;
      border-color: var(--accent);
    }

    .modal-footer {
      margin-top: 32px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .modal-btn {
      height: 52px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .modal-btn.primary { background: var(--primary); color: #fff; }
    .modal-btn.primary:hover { background: #1e293b; transform: translateY(-1px); }
    .modal-btn.secondary { background: #f1f5f9; color: var(--text-main); }
    .modal-btn.secondary:hover { background: #e2e8f0; }

    .mini-loader {
      width: 18px;
      height: 18px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 0.6s ease-out; }
    .slide-in { animation: slideIn 0.4s ease-out both; }
    .scale-up { animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }

    @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  `],
})
export class CompanySelectionComponent implements OnInit {
  private service = inject(PendingRequestsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  companies = signal<PublicCompany[]>([]);
  filteredCompanies = signal<PublicCompany[]>([]);
  searchQuery = '';
  loadingCompanyId: number | null = null;

  selectedCompany: PublicCompany | null = null;
  joinMessage = '';
  isSubmitting = false;

  ngOnInit() {
    this.service.getPublicCompanies().subscribe({
      next: (res) => {
        this.companies.set(res);
        this.filteredCompanies.set(res);
      },
      error: (err) => console.error('Failed to load companies', err)
    });
  }

  filterCompanies() {
    const query = this.searchQuery.toLowerCase();
    this.filteredCompanies.set(
      this.companies().filter(c =>
        c.name.toLowerCase().includes(query) ||
        (c.address && c.address.toLowerCase().includes(query))
      )
    );
  }

  selectCompany(company: PublicCompany) {
    this.selectedCompany = company;
  }

  confirmJoin() {
    if (!this.selectedCompany) return;

    this.isSubmitting = true;
    this.service.submitJoinRequest(this.selectedCompany.id, this.joinMessage).subscribe({
      next: () => {
        const name = this.selectedCompany?.name;
        this.isSubmitting = false;
        this.selectedCompany = null;
        alert('Your request to join ' + name + ' has been sent successfully.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(err.error?.message || 'Failed to send join request. Please try again.');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
