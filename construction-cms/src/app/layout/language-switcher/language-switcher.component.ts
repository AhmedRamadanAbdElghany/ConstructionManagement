import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <button 
        (click)="switchLanguage('en')" 
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
        [ngClass]="{
          'bg-cyan-500 text-white': currentLang === 'en',
          'text-slate-400 hover:text-white hover:bg-slate-700/50': currentLang !== 'en'
        }">
        EN
      </button>
      <button 
        (click)="switchLanguage('ar')" 
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
        [ngClass]="{
          'bg-cyan-500 text-white': currentLang === 'ar',
          'text-slate-400 hover:text-white hover:bg-slate-700/50': currentLang !== 'ar'
        }">
        عربي
      </button>
    </div>
  `
})
export class LanguageSwitcherComponent {
  currentLang = 'en';

  constructor(private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'en';
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
}
