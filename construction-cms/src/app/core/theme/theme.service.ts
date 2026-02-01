import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private theme = signal<'dark' | 'light'>('dark');
    currentTheme = this.theme.asReadonly();

    constructor() {
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Default to dark
            this.setTheme('dark');
        }
    }

    toggleTheme() {
        this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
    }

    setTheme(theme: 'dark' | 'light') {
        this.theme.set(theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        }
    }
}
