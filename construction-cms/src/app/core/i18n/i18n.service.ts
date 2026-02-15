import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'en' | 'ar';

@Injectable({
    providedIn: 'root'
})
export class I18nService {
    private currentLanguageSubject = new BehaviorSubject<Language>('ar');
    public currentLanguage$ = this.currentLanguageSubject.asObservable();

    private readonly STORAGE_KEY = 'app-language';

    constructor(private translate: TranslateService) {
        this.loadSavedLanguage();
    }

    /**
     * Initialize language from localStorage or browser preference
     */
    initializeLanguage(): void {
        const savedLanguage = this.getSavedLanguage();
        if (savedLanguage) {
            this.setLanguage(savedLanguage);
        } else {
            // Detect browser language
            const browserLang = this.translate.getBrowserLang();
            if (browserLang === 'en') {
                this.setLanguage('en');
            } else {
                // Default to Arabic for Arabic-first experience
                this.setLanguage('ar');
            }
        }
    }

    /**
     * Set the current language
     */
    setLanguage(lang: Language): void {
        this.translate.use(lang);
        this.currentLanguageSubject.next(lang);
        this.saveLanguage(lang);
        this.updateDocumentDirection(lang);
    }

    /**
     * Get the current language
     */
    getCurrentLanguage(): Language {
        return this.currentLanguageSubject.value;
    }

    /**
     * Check if current language is RTL
     */
    isRTL(): boolean {
        return this.getCurrentLanguage() === 'ar';
    }

    /**
     * Get language change observable
     */
    onLanguageChange(): Observable<Language> {
        return this.currentLanguage$;
    }

    /**
     * Save language to localStorage
     */
    private saveLanguage(lang: Language): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, lang);
        } catch (e) {
            console.warn('Failed to save language preference:', e);
        }
    }

    /**
     * Load saved language from localStorage
     */
    private loadSavedLanguage(): void {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved && (saved === 'en' || saved === 'ar')) {
                this.currentLanguageSubject.next(saved as Language);
            }
        } catch (e) {
            console.warn('Failed to load language preference:', e);
        }
    }

    /**
     * Get saved language from localStorage
     */
    private getSavedLanguage(): Language | null {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved && (saved === 'en' || saved === 'ar')) {
                return saved as Language;
            }
        } catch (e) {
            console.warn('Failed to get saved language:', e);
        }
        return null;
    }

    /**
     * Update document direction and lang attribute
     */
    private updateDocumentDirection(lang: Language): void {
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
    }
}
