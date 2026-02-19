import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService, Language } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5">
      <button 
        (click)="switchLanguage('en')" 
        class="px-4 py-1.5 rounded-lg text-[11px] font-black tracking-widest transition-all duration-300"
        [ngClass]="{
          'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30': currentLang === 'en',
          'text-slate-500 dark:text-slate-400 hover:text-cyan-500': currentLang !== 'en'
        }">
        EN
      </button>
      <button 
        (click)="switchLanguage('ar')" 
        class="px-4 py-1.5 rounded-lg text-[11px] font-black tracking-widest transition-all duration-300"
        [ngClass]="{
          'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30': currentLang === 'ar',
          'text-slate-500 dark:text-slate-400 hover:text-cyan-500': currentLang !== 'ar'
        }">
        AR
      </button>
    </div>
  `
})
export class LanguageSwitcherComponent implements OnInit {
  currentLang: Language = 'ar';

  constructor(private i18nService: I18nService) { }

  ngOnInit(): void {
    this.currentLang = this.i18nService.getCurrentLanguage();
    this.i18nService.onLanguageChange().subscribe(lang => {
      this.currentLang = lang;
    });
  }

  switchLanguage(lang: Language): void {
    this.i18nService.setLanguage(lang);
  }
}
