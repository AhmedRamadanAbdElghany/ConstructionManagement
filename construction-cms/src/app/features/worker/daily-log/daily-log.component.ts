import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockDataService } from '../../../core/mock/mock-data.service';
import { TranslateModule } from '@ngx-translate/core';
import { BOQItem, DailyLog, SiteMedia } from '../../../shared/interfaces';

@Component({
  selector: 'app-daily-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">{{ 'daily_log.title' | translate }}</h1>
            <p class="text-slate-400">{{ currentDate | date:'fullDate' }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <span class="px-4 py-2 rounded-xl text-sm font-medium"
                  [ngClass]="{
                    'bg-emerald-500/20 text-emerald-400': !isDayClosed,
                    'bg-red-500/20 text-red-400': isDayClosed
                  }">
              {{ isDayClosed ? ('daily_log.day_locked' | translate) : ('daily_log.day_open' | translate) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Form -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Progress Entry Card -->
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h2 class="text-xl font-bold text-white mb-6 flex items-center">
                <svg class="w-6 h-6 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
                {{ 'daily_log.progress_entry' | translate }}
              </h2>

              <form [formGroup]="dailyLogForm" class="space-y-5">
                <!-- BOQ Item Selection -->
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-2">{{ 'daily_log.boq_item' | translate }}</label>
                  <select formControlName="boqItemId" 
                          [disabled]="isDayClosed"
                          class="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50">
                    <option value="">{{ 'daily_log.select_item' | translate }}</option>
                    @for (item of boqItems; track item.id) {
                      <option [value]="item.id">{{ item.description }} ({{ item.unit }})</option>
                    }
                  </select>
                </div>

                <!-- Start Work Button -->
                @if (!workStarted && dailyLogForm.get('boqItemId')?.value && !isDayClosed) {
                  <button 
                    type="button"
                    (click)="startWork()"
                    class="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-400 hover:to-emerald-500 transition-all flex items-center justify-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {{ 'daily_log.start_work' | translate }}
                  </button>
                }

                @if (workStarted) {
                  <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse mr-3"></div>
                        <span class="text-emerald-400 font-medium">{{ 'daily_log.work_in_progress' | translate }}</span>
                      </div>
                      <span class="text-emerald-400">Started: {{ workStartTime | date:'shortTime' }}</span>
                    </div>
                  </div>
                }

                <!-- Quantity Input -->
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-2">{{ 'daily_log.quantity' | translate }}</label>
                  <div class="relative">
                    <input type="number" 
                           formControlName="quantity" 
                           min="0"
                           [disabled]="isDayClosed"
                           class="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
                           placeholder="Enter completed quantity">
                    @if (selectedBoqItem) {
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{{ selectedBoqItem.unit }}</span>
                    }
                  </div>
                  @if (selectedBoqItem) {
                    <div class="mt-2 flex items-center justify-between text-sm">
                      <span class="text-slate-500">{{ 'daily_log.remaining' | translate }}: {{ selectedBoqItem.totalQuantity - selectedBoqItem.executedQuantity }} {{ selectedBoqItem.unit }}</span>
                    </div>
                  }
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm font-medium text-slate-400 mb-2">{{ 'daily_log.notes' | translate }}</label>
                  <textarea formControlName="notes" 
                            rows="3"
                            [disabled]="isDayClosed"
                            class="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none disabled:opacity-50"
                            placeholder="Add notes about the work..."></textarea>
                </div>

                <!-- Submit Button -->
                <button 
                  type="button"
                  (click)="submitDailyLog()"
                  [disabled]="dailyLogForm.invalid || isDayClosed || !workStarted"
                  class="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ 'daily_log.submit' | translate }}
                </button>
              </form>
            </div>

            <!-- Media Upload Card -->
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h2 class="text-xl font-bold text-white mb-6 flex items-center">
                <svg class="w-6 h-6 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {{ 'daily_log.upload_media' | translate }}
              </h2>

              <!-- Drag & Drop Zone -->
              <div 
                class="border-2 border-dashed border-slate-600/50 rounded-xl p-8 text-center transition-colors"
                [class.border-cyan-500/50]="isDragOver"
                [class.bg-cyan-500/5]="isDragOver"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)">
                <svg class="w-12 h-12 mx-auto mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p class="text-slate-400 mb-2">{{ 'daily_log.drag_drop_files' | translate }}</p>
                <p class="text-sm text-slate-500 mb-4">{{ 'daily_log.or' | translate }}</p>
                <label class="inline-block px-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 font-medium cursor-pointer hover:bg-cyan-500/30 transition-colors">
                  {{ 'daily_log.browse_files' | translate }}
                  <input type="file" 
                         multiple 
                         accept="image/*,video/*" 
                         class="hidden"
                         [disabled]="isDayClosed"
                         (change)="onFileSelect($event)">
                </label>
              </div>

              <!-- Upload Progress -->
              @if (uploadProgress > 0 && uploadProgress < 100) {
                <div class="mt-4">
                  <div class="flex items-center justify-between text-sm mb-2">
                    <span class="text-slate-400">{{ 'daily_log.uploading' | translate }}...</span>
                    <span class="text-cyan-400">{{ uploadProgress }}%</span>
                  </div>
                  <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                         [style.width.%]="uploadProgress">
                    </div>
                  </div>
                </div>
              }

              <!-- Uploaded Files -->
              @if (uploadedFiles.length > 0) {
                <div class="mt-6 grid grid-cols-3 gap-3">
                  @for (file of uploadedFiles; track file.name) {
                    <div class="relative aspect-square rounded-xl overflow-hidden group">
                      <img [src]="file.preview" class="w-full h-full object-cover">
                      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button (click)="removeFile(file)" class="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                      <span class="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-slate-900/80 text-white text-xs truncate">
                        {{ file.name }}
                      </span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Today's Summary -->
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h3 class="text-lg font-bold text-white mb-4">{{ 'daily_log.today_summary' | translate }}</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-3 rounded-xl bg-slate-700/30">
                  <span class="text-slate-400">{{ 'daily_log.items_logged' | translate }}</span>
                  <span class="text-white font-bold">{{ todayLogItems.length }}</span>
                </div>
                <div class="flex items-center justify-between p-3 rounded-xl bg-slate-700/30">
                  <span class="text-slate-400">{{ 'daily_log.photos_uploaded' | translate }}</span>
                  <span class="text-white font-bold">{{ uploadedFiles.length }}</span>
                </div>
              </div>
            </div>

            <!-- Close Day Card -->
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h3 class="text-lg font-bold text-white mb-4">{{ 'daily_log.close_day' | translate }}</h3>
              <p class="text-sm text-slate-400 mb-4">{{ 'daily_log.close_day_warning' | translate }}</p>
              
              <!-- Validation Checklist -->
              <div class="space-y-3 mb-6">
                <div class="flex items-center space-x-3">
                  <div class="w-5 h-5 rounded-full flex items-center justify-center"
                       [ngClass]="todayLogItems.length > 0 ? 'bg-emerald-500' : 'bg-slate-600'">
                    @if (todayLogItems.length > 0) {
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    }
                  </div>
                  <span class="text-sm" [class.text-slate-400]="todayLogItems.length === 0" [class.text-white]="todayLogItems.length > 0">
                    {{ 'daily_log.has_log_entries' | translate }}
                  </span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-5 h-5 rounded-full flex items-center justify-center"
                       [ngClass]="uploadedFiles.length > 0 ? 'bg-emerald-500' : 'bg-slate-600'">
                    @if (uploadedFiles.length > 0) {
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    }
                  </div>
                  <span class="text-sm" [class.text-slate-400]="uploadedFiles.length === 0" [class.text-white]="uploadedFiles.length > 0">
                    {{ 'daily_log.has_media_uploads' | translate }}
                  </span>
                </div>
              </div>

              <button 
                (click)="closeDay()"
                [disabled]="isDayClosed || todayLogItems.length === 0"
                class="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium hover:from-red-400 hover:to-rose-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                {{ 'daily_log.close_day' | translate }}
              </button>
            </div>

            <!-- Recent History -->
            <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h3 class="text-lg font-bold text-white mb-4">{{ 'daily_log.recent_entries' | translate }}</h3>
              <div class="space-y-3">
                @for (entry of todayLogItems; track entry.id) {
                  <div class="p-3 rounded-xl bg-slate-700/30 border-l-4 border-cyan-500">
                    <p class="text-white font-medium text-sm">{{ getBoqItemName(entry.boqItemId) }}</p>
                    <p class="text-xs text-slate-400 mt-1">Qty: {{ entry.quantity }} | {{ entry.startTime | date:'shortTime' }}</p>
                  </div>
                }
                @if (todayLogItems.length === 0) {
                  <p class="text-center text-slate-500 py-4">{{ 'daily_log.no_entries_yet' | translate }}</p>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DailyLogComponent implements OnInit {
  dailyLogForm: FormGroup;
  boqItems: BOQItem[] = [];
  todayLogItems: any[] = [];
  uploadedFiles: { name: string; preview: string }[] = [];
  uploadProgress = 0;
  isDayClosed = false;
  workStarted = false;
  workStartTime: Date | null = null;
  currentDate = new Date();
  isDragOver = false;

  get selectedBoqItem(): BOQItem | undefined {
    const selectedId = this.dailyLogForm.get('boqItemId')?.value;
    return this.boqItems.find(item => item.id === Number(selectedId));
  }

  constructor(
    private fb: FormBuilder,
    private mockDataService: MockDataService
  ) {
    this.dailyLogForm = this.fb.group({
      boqItemId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  ngOnInit() {
    // Load BOQ items for a project (using project 1 as default)
    this.mockDataService.getBOQItems(1).subscribe(items => {
      this.boqItems = items;
    });

    // Check if today's log exists and its status
    this.mockDataService.getDailyLogs(1).subscribe(logs => {
      const todayLog = logs.find(log => {
        const logDate = new Date(log.date).toDateString();
        return logDate === new Date().toDateString();
      });
      if (todayLog) {
        this.isDayClosed = todayLog.isClosed;
        this.todayLogItems = todayLog.items;
      }
    });
  }

  startWork() {
    this.workStarted = true;
    this.workStartTime = new Date();
  }

  submitDailyLog() {
    if (this.dailyLogForm.valid && !this.isDayClosed && this.workStarted) {
      const newEntry = {
        id: Date.now(),
        boqItemId: Number(this.dailyLogForm.get('boqItemId')?.value),
        quantity: this.dailyLogForm.get('quantity')?.value,
        notes: this.dailyLogForm.get('notes')?.value,
        startTime: this.workStartTime?.toISOString()
      };

      this.todayLogItems.push(newEntry);
      this.dailyLogForm.reset();
      this.workStarted = false;
      this.workStartTime = null;

      alert('Entry submitted successfully!');
    }
  }

  closeDay() {
    if (this.todayLogItems.length === 0) {
      alert('Please add at least one log entry before closing the day.');
      return;
    }

    if (confirm('Are you sure you want to close the day? This action cannot be undone.')) {
      this.isDayClosed = true;
      alert('Day closed successfully! The log is now read-only.');
    }
  }

  getBoqItemName(boqItemId: number): string {
    const item = this.boqItems.find(i => i.id === boqItemId);
    return item?.description || 'Unknown';
  }

  // File handling
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (this.isDayClosed) return;

    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
    }
  }

  private processFiles(files: FileList) {
    this.uploadProgress = 0;

    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);

        // Add files to gallery
        Array.from(files).forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.uploadedFiles.push({
              name: file.name,
              preview: e.target?.result as string
            });
          };
          reader.readAsDataURL(file);
        });

        setTimeout(() => {
          this.uploadProgress = 0;
        }, 500);
      }
    }, 200);
  }

  removeFile(file: { name: string; preview: string }) {
    this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== file.name);
  }
}