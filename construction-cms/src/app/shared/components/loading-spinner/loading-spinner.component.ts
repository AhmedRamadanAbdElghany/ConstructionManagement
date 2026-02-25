import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="containerClass" [ngClass]="{'flex flex-col items-center justify-center': centered}">
      <div [class]="spinnerClass"
           class="border-4 border-indigo-500 border-t-transparent rounded-full animate-spin">
      </div>
      @if (label) {
        <p [class]="labelClass">{{ label }}</p>
      }
    </div>
  `,
    styles: [`
    :host { display: block; }
  `]
})
export class LoadingSpinnerComponent {
    @Input() label = '';
    @Input() centered = true;
    @Input() size: 'sm' | 'md' | 'lg' = 'md';
    @Input() containerClass = 'py-12';
    @Input() labelClass = 'mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse';

    get spinnerClass(): string {
        switch (this.size) {
            case 'sm': return 'w-6 h-6 border-2';
            case 'lg': return 'w-16 h-16 border-4';
            default: return 'w-12 h-12 border-4';
        }
    }
}
