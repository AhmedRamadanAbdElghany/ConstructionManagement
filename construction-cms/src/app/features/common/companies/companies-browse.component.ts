import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MessagingService, PublicCompanyDto } from '../../../core/services/messaging.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
    selector: 'app-companies-browse',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">
              {{ 'companies.browse' | translate }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
              {{ 'companies.browse_subtitle' | translate }}
            </p>
          </div>
          
          <!-- Search -->
          <div class="flex items-center gap-4">
            <div class="relative">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange()"
                [placeholder]="'companies.search_placeholder' | translate"
                class="w-64 px-4 py-3 pl-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
              <svg class="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }

        <!-- Companies Grid -->
        @if (!isLoading && companies.length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (company of companies; track company.id) {
              <div 
                class="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                [routerLink]="['/companies', company.id]">
                
                <!-- Company Logo/Header -->
                <div class="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                  @if (company.logoUrl) {
                    <img [src]="company.logoUrl" [alt]="company.name" class="w-full h-full object-cover opacity-50">
                  }
                  <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  <!-- Follow Badge -->
                  @if (company.isFollowedByCurrentUser) {
                    <div class="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-black uppercase tracking-widest">
                      {{ 'companies.following' | translate }}
                    </div>
                  }
                </div>
                
                <!-- Company Info -->
                <div class="p-6 -mt-8 relative">
                  <div class="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center mb-4">
                    @if (company.logoUrl) {
                      <img [src]="company.logoUrl" [alt]="company.name" class="w-10 h-10 object-contain">
                    } @else {
                      <span class="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {{ company.name.charAt(0) }}
                      </span>
                    }
                  </div>
                  
                  <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">{{ company.name }}</h3>
                  
                  @if (company.address) {
                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      {{ company.address }}
                    </p>
                  }
                  
                  <!-- Stats -->
                  <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      {{ company.followerCount }} {{ 'companies.followers' | translate }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                      </svg>
                      {{ company.portfolioItemCount }} {{ 'companies.projects' | translate }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (!isLoading && companies.length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
              <svg class="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              {{ 'companies.no_companies' | translate }}
            </h3>
            <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {{ 'companies.no_companies_desc' | translate }}
            </p>
          </div>
        }
      </div>
    </div>
  `
})
export class CompaniesBrowseComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private messagingService = inject(MessagingService);
    private i18nService = inject(I18nService);
    private router = inject(Router);

    companies: PublicCompanyDto[] = [];
    isLoading = false;
    searchQuery = '';
    private searchTimeout: any;

    ngOnInit() {
        this.loadCompanies();

        this.i18nService.onLanguageChange()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.loadCompanies();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
    }

    loadCompanies() {
        this.isLoading = true;
        this.messagingService.getCompanies(this.searchQuery).subscribe({
            next: (companies) => {
                this.companies = companies;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading companies:', error);
                this.isLoading = false;
            }
        });
    }

    onSearchChange() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.loadCompanies();
        }, 300);
    }
}
