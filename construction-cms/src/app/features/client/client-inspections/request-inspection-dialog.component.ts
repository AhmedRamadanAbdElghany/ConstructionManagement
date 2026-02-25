import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InspectionService, CreateInspectionRequest, CreateTimeSlot } from '../../../core/services/inspection.service';

@Component({
  selector: 'app-request-inspection-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            {{ 'inspections.request.title' | translate }}
          </h3>
          <button (click)="close.emit()" class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <p class="text-slate-500 dark:text-slate-400 mb-8 font-medium">
          {{ (companyIds.length > 1 ? 'inspections.request.subtitle_multiple' : 'inspections.request.subtitle') | translate:{companyName: companyName, count: companyIds.length} }}
        </p>

        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">{{ 'inspections.request.prop_title' | translate }}</label>
              <input type="text" [(ngModel)]="request.title" [placeholder]="'inspections.request.prop_title_hint' | translate"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"/>
            </div>
            <div>
              <label class="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">{{ 'inspections.request.property_type' | translate }}</label>
              <select [(ngModel)]="request.propertyType" class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                <option [value]="1">{{ 'inspections.property_type.villa' | translate }}</option>
                <option [value]="2">{{ 'inspections.property_type.apartment' | translate }}</option>
                <option [value]="3">{{ 'inspections.property_type.house' | translate }}</option>
                <option [value]="4">{{ 'inspections.property_type.land' | translate }}</option>
                <option [value]="5">{{ 'inspections.property_type.commercial' | translate }}</option>
                <option [value]="6">{{ 'inspections.property_type.office' | translate }}</option>
                <option [value]="7">{{ 'inspections.property_type.warehouse' | translate }}</option>
                <option [value]="99">{{ 'inspections.property_type.other' | translate }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">{{ 'inspections.request.area' | translate }}</label>
              <input type="number" [(ngModel)]="request.approximateArea"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"/>
            </div>
            <div>
              <label class="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">{{ 'inspections.request.address' | translate }}</label>
              <input type="text" [(ngModel)]="request.address"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"/>
            </div>
          </div>

          <div>
            <label class="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">{{ 'inspections.request.description' | translate }}</label>
            <textarea [(ngModel)]="request.description" rows="3" [placeholder]="'inspections.request.description_placeholder' | translate"
              class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"></textarea>
          </div>

          <!-- Time Slots -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">{{ 'inspections.request.time_slots' | translate }}</label>
              <button (click)="addTimeSlot()" class="text-xs font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                + {{ 'inspections.request.add_slot' | translate }}
              </button>
            </div>
            <div class="space-y-3">
              @for (slot of request.timeSlots; track $index) {
                <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                  <input type="date" [(ngModel)]="slot.date" class="flex-1 bg-transparent border-none outline-none text-sm dark:text-white"/>
                  <input type="time" [(ngModel)]="slot.timeStart" class="w-24 bg-transparent border-none outline-none text-sm dark:text-white"/>
                  <span class="text-slate-400">-</span>
                  <input type="time" [(ngModel)]="slot.timeEnd" class="w-24 bg-transparent border-none outline-none text-sm dark:text-white"/>
                  <button (click)="removeTimeSlot($index)" class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              }
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
            <button (click)="close.emit()" class="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider hover:bg-slate-200 transition-all">
              {{ 'common.cancel' | translate }}
            </button>
            <button (click)="submit()" [disabled]="isSubmitting || !request.title"
              class="px-8 py-3 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2">
              {{ isSubmitting ? ('common.sending' | translate) : ('inspections.request.submit' | translate) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::-webkit-calendar-picker-indicator {
      filter: invert(0.5);
    }
    :host-context(.dark) ::-webkit-calendar-picker-indicator {
      filter: invert(1);
    }
  `]
})
export class RequestInspectionDialogComponent {
  private inspectionService = inject(InspectionService);

  @Input() companyIds: number[] = [];
  @Input() companyName!: string;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  request: CreateInspectionRequest = {
    companyId: 0,
    propertyType: 1,
    title: '',
    address: '',
    approximateArea: 0,
    description: '',
    timeSlots: []
  };

  isSubmitting = false;

  addTimeSlot() {
    this.request.timeSlots!.push({
      date: new Date(),
      timeStart: '09:00',
      timeEnd: '10:00'
    });
  }

  removeTimeSlot(index: number) {
    this.request.timeSlots!.splice(index, 1);
  }

  submit() {
    if (this.companyIds.length === 0) return;
    this.isSubmitting = true;

    const requests = this.companyIds.map(id => {
      const req = { ...this.request, companyId: id };
      return this.inspectionService.createInspection(req);
    });

    // Use forkJoin to wait for all requests if multiple
    import('rxjs').then(({ forkJoin }) => {
      forkJoin(requests).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.success.emit();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error submitting inspection request(s):', err);
          alert('Failed to submit one or more requests. Please try again.');
        }
      });
    });
  }
}
