# Localization Guide for Construction Management System

This guide explains how to implement bilingual (Arabic/English) localization across all pages and components of the Construction Management System.

## Overview

The application supports two languages:
- **Arabic (ar)** - Primary language, RTL (Right-to-Left) layout
- **English (en)** - Secondary language, LTR (Left-to-Right) layout

## Architecture

### Key Services

1. **I18nService** (`src/app/core/i18n/i18n.service.ts`)
   - Manages current language state
   - Persists language preference in localStorage
   - Updates document direction (RTL/LTR)
   - Provides `onLanguageChange()` observable for reactive updates

2. **TranslateService** (from `@ngx-translate/core`)
   - Handles translation key resolution
   - Loads translation files from `/assets/i18n/{lang}.json`

3. **AuthInterceptor** (`src/app/core/auth/auth.interceptor.ts`)
   - Adds `Accept-Language` and `X-Language` headers to all HTTP requests
   - Reads language from localStorage to ensure correct language is sent

### Translation Files

- **English**: `src/assets/i18n/en.json`
- **Arabic**: `src/assets/i18n/ar.json`

## Implementation Pattern

### 1. Component Setup

Import the required modules and services:

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  // ...
})
export class ExampleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private i18nService: I18nService) {}

  ngOnInit() {
    // Subscribe to language changes for reactive updates
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Reload data from backend if needed
        this.loadData();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 2. Template Translation

Use the translate pipe in templates:

```html
<!-- Simple translation -->
<h1>{{ 'page.title' | translate }}</h1>

<!-- Translation with parameters -->
<p>{{ 'common.minutes_ago' | translate:{ count: 5 } }}</p>

<!-- In attributes -->
<input [placeholder]="'common.search' | translate">
<button [title]="'common.view' | translate">...</button>
```

### 3. Translation Key Structure

Organize keys by module/feature:

```json
{
  "module_name": {
    "title": "Module Title",
    "subtitle": "Module description",
    "tabs": {
      "overview": "Overview",
      "details": "Details"
    },
    "stats": {
      "total": "Total Items",
      "active": "Active Items"
    },
    "actions": {
      "create": "Create New",
      "edit": "Edit",
      "delete": "Delete"
    }
  }
}
```

### 4. Common Keys

Use shared keys from the `common` namespace:

```json
{
  "common": {
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "view": "View",
    "loading": "Loading...",
    "no_data": "No data available",
    "approve": "Approve",
    "reject": "Reject",
    "status": "Status",
    "actions": "Actions"
  }
}
```

## RTL Support

### Automatic Direction

The `I18nService` automatically sets the document direction:

```typescript
private updateDocumentDirection(lang: Language): void {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
}
```

### Tailwind CSS RTL Utilities

Use Tailwind's RTL utilities for directional styling:

```html
<!-- Margin/Margin -->
<div class="ms-4 rtl:ms-0 rtl:me-4">...</div>

<!-- Text alignment -->
<p class="text-left rtl:text-right">...</p>

<!-- Rotations -->
<svg class="rtl:rotate-180">...</svg>

<!-- Positioning -->
<div class="left-4 rtl:left-auto rtl:right-4">...</div>
```

## Backend Integration

### HTTP Headers

All API requests include language headers:

```
Accept-Language: ar|en
X-Language: ar|en
```

### Backend Localization

The backend `LocalizationService` uses .resx files:
- `LocalizationService.ar.resx` - Arabic translations
- `LocalizationService.en.resx` - English translations

Backend returns localized content based on the `Accept-Language` header.

## Race Condition Fix

**Important**: The `I18nService.setLanguage()` method saves to localStorage BEFORE emitting the change. This ensures HTTP interceptors read the correct language:

```typescript
setLanguage(lang: Language): void {
    // IMPORTANT: Save to localStorage FIRST before emitting
    this.saveLanguage(lang);
    this.translate.use(lang);
    this.currentLanguageSubject.next(lang);
    this.updateDocumentDirection(lang);
}
```

## Testing Language Switching

1. Open any page with localized content
2. Use the language switcher in the header
3. Verify:
   - UI text changes immediately
   - Backend data refreshes with correct language
   - Layout direction changes (RTL/LTR)
   - Document lang attribute updates

## Best Practices

1. **Always use translation keys** - Never hardcode text in components
2. **Subscribe to language changes** - Reload backend data when language changes
3. **Use common keys** - Share common translations across components
4. **Organize keys logically** - Group by feature/module
5. **Test both languages** - Verify RTL layout in Arabic
6. **Clean up subscriptions** - Use `takeUntil` pattern to prevent memory leaks

## Example: Complete Component

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../../core/i18n/i18n.service';
import { DataService } from '../../../core/services/data.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-safety',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <h1 class="text-3xl font-black text-slate-900 dark:text-white">
        {{ 'safety.title' | translate }}
      </h1>
      <p class="text-slate-500">{{ 'safety.subtitle' | translate }}</p>
      
      <div class="tabs">
        @for (tab of tabs; track tab.key) {
          <button (click)="activeTab = tab.key">
            {{ 'safety.tabs.' + tab.key | translate }}
          </button>
        }
      </div>
      
      @if (loading) {
        <p>{{ 'common.loading' | translate }}</p>
      } @else {
        <div class="content">
          <!-- Content here -->
        </div>
      }
    </div>
  `
})
export class SafetyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  tabs = [
    { key: 'overview' },
    { key: 'incidents' },
    { key: 'inspections' },
    { key: 'trainings' }
  ];
  activeTab = 'overview';
  loading = false;

  constructor(
    private i18nService: I18nService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loadData();
    
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    this.loading = true;
    this.dataService.getData().subscribe({
      next: (data) => {
        // Handle data
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
```

## Troubleshooting

### Language not updating on API calls
- Verify the `AuthInterceptor` is properly configured
- Check that localStorage contains the correct `app-language` value

### RTL layout issues
- Use Tailwind RTL utilities (`rtl:` prefix)
- Test with Arabic text that's longer than English

### Missing translations
- Add keys to both `en.json` and `ar.json`
- Verify the key path matches the template usage

### Memory leaks
- Always unsubscribe from `onLanguageChange()` in `ngOnDestroy`
- Use the `takeUntil` pattern with a `Subject<void>`
