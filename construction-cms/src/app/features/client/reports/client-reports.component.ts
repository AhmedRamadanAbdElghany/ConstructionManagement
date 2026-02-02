import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface ClientReport {
  id: string;
  type: 'Progress' | 'Financial' | 'Quality' | 'Legal';
  title: string;
  date: string;
  period: string;
  status: 'Draft' | 'Final' | 'Archived';
  description: string;
  metrics: { label: string; value: string; trend?: 'up' | 'down' }[];
}

@Component({
  selector: 'app-client-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase tracking-tight">
              Executive Reporting Hub
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Access detailed analytic snapshots of your real estate portfolio performance</p>
          </div>
          
          <!-- Date Range Filter -->
          <div class="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl">
            <div class="flex flex-col px-3">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Period Selection</span>
              <select [(ngModel)]="selectedPeriod" (change)="generateDummyReports()" class="bg-transparent border-none text-xs font-black text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none cursor-pointer">
                <option value="last30">Last 30 Days</option>
                <option value="lastQ">Last Quarter</option>
                <option value="lastY">Current Fiscal Year</option>
                <option value="all">Project To Date</option>
              </select>
            </div>
            <button class="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Quick Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div class="premium-stat-card">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Reports Generated</p>
            <div class="flex items-end justify-between">
              <span class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{{ reports.length }}</span>
              <span class="text-emerald-500 text-xs font-black bg-emerald-500/10 px-3 py-1 rounded-lg">+2 New</span>
            </div>
          </div>
          <div class="premium-stat-card">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Avg. Completion Rate</p>
            <div class="flex items-end justify-between">
              <span class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">94.2%</span>
              <span class="text-indigo-500 text-xs font-black bg-indigo-500/10 px-3 py-1 rounded-lg">Above Target</span>
            </div>
          </div>
          <div class="premium-stat-card">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Documentation Status</p>
            <div class="flex items-end justify-between">
              <span class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Verified</span>
              <div class="flex -space-x-2">
                <div class="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 flex items-center justify-center text-[10px]">✓</div>
                <div class="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 flex items-center justify-center text-[10px]">⚓</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reports Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          @for (report of reports; track report.id) {
            <div class="group bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/15 transition-colors"></div>
              
              <div class="flex items-start justify-between mb-8 relative">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform"
                       [ngClass]="{
                         'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500': report.type === 'Progress',
                         'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500': report.type === 'Financial',
                         'bg-amber-50 dark:bg-amber-500/10 text-amber-500': report.type === 'Quality',
                         'bg-purple-50 dark:bg-purple-500/10 text-purple-500': report.type === 'Legal'
                       }">
                    {{ report.type === 'Progress' ? '🏗️' : report.type === 'Financial' ? '📊' : report.type === 'Quality' ? '🛡️' : '⚖️' }}
                  </div>
                  <div>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">{{ report.type }} Analytics</span>
                    <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ report.title }}</h3>
                  </div>
                </div>
                <div class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 text-slate-500">
                  {{ report.status }}
                </div>
              </div>

              <p class="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">{{ report.description }}</p>

              <div class="grid grid-cols-2 gap-4 mb-8">
                @for (metric of report.metrics; track metric.label) {
                  <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5">
                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ metric.label }}</p>
                    <div class="flex items-center justify-between">
                      <span class="text-base font-black text-slate-800 dark:text-slate-200 tracking-tight">{{ metric.value }}</span>
                      @if (metric.trend) {
                        <span [class.text-emerald-500]="metric.trend === 'up'" [class.text-rose-500]="metric.trend === 'down'" class="text-[10px] font-black">
                          {{ metric.trend === 'up' ? '↗' : '↘' }}
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>

              <div class="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5 no-print">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ report.date }}</span>
                <div class="flex gap-3">
                  <button (click)="printReport(report)" class="px-6 py-2.5 rounded-xl border-2 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                    Print Report
                  </button>
                  <button class="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-xl hover:translate-y-[-2px] transition-all">
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Hidden Print Version (Native Browser Print Helper) -->
      <div id="print-area" class="hidden-print-content">
        @if (activePrintReport) {
          <div class="p-12 bg-white text-slate-950 font-sans">
            <div class="flex justify-between items-start mb-16 border-b-4 border-slate-900 pb-8">
              <div>
                <h1 class="text-4xl font-black uppercase tracking-tighter mb-2">STRUC Analytics | Report</h1>
                <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">Certified Real Estate Performance Data</p>
              </div>
              <div class="text-right">
                <p class="font-black text-xl">{{ activePrintReport.title }}</p>
                <p class="text-xs font-medium text-slate-500">{{ activePrintReport.date }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-12 mb-16">
              <div class="space-y-4">
                <h3 class="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Analysis Scope</h3>
                <p class="text-lg leading-relaxed font-medium">{{ activePrintReport.description }}</p>
              </div>
              <div class="space-y-4">
                <h3 class="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Verified Metrics</h3>
                <div class="grid grid-cols-2 gap-4">
                  @for (m of activePrintReport.metrics; track m.label) {
                    <div>
                      <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">{{ m.label }}</p>
                      <p class="text-2xl font-black">{{ m.value }}</p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <div class="mt-auto pt-16 border-t border-slate-100 flex justify-between items-center opacity-50">
              <p class="text-[10px] font-black uppercase tracking-widest italic">This report is digitally signed and encrypted via STRUC-CORE.</p>
              <p class="text-[10px] font-black uppercase tracking-widest">Page 1 of 1</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .premium-stat-card {
      @apply bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-xl transition-all;
    }
    :host ::ng-deep select {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
    
    @media print {
      .no-print { display: none !important; }
      body, .min-h-screen { background: white !important; padding: 0 !important; }
      .max-w-7xl { max-width: 100% !important; margin: 0 !important; }
      .hidden-print-content { display: block !important; }
      .reports-grid { display: none !important; }
      .premium-stat-card { display: none !important; }
    }

    .hidden-print-content { display: none; }
  `]
})
export class ClientReportsComponent implements OnInit {
  selectedPeriod = 'last30';
  reports: ClientReport[] = [];
  activePrintReport: ClientReport | null = null;

  ngOnInit() {
    this.generateDummyReports();
  }

  printReport(report: ClientReport) {
    this.activePrintReport = report;
    setTimeout(() => {
      window.print();
    }, 100);
  }

  generateDummyReports() {
    const periodLabel = this.selectedPeriod === 'last30' ? 'Jan 2026' :
      this.selectedPeriod === 'lastQ' ? 'Q4 2025' :
        this.selectedPeriod === 'lastY' ? 'FY2025' : 'Contract Total';

    this.reports = [
      {
        id: '1',
        type: 'Progress',
        title: 'Architectural Shell & Envelope',
        date: 'Feb 02, 2026',
        period: periodLabel,
        status: 'Final',
        description: 'Comprehensive analysis of structural integrity and exterior glazing completion for the central residential tower.',
        metrics: [
          { label: 'Completion', value: '78.4%', trend: 'up' },
          { label: 'Work Hours', value: '1,420h' }
        ]
      },
      {
        id: '2',
        type: 'Financial',
        title: 'Capital Expenditure Audit',
        date: 'Jan 28, 2026',
        period: periodLabel,
        status: 'Final',
        description: 'Itemized verification of material procurement and subcontractor dispersion for the finishing phase.',
        metrics: [
          { label: 'Utilization', value: '92.1%', trend: 'down' },
          { label: 'Dispersion', value: '$84.2K' }
        ]
      },
      {
        id: '3',
        type: 'Quality',
        title: 'MEP Infrastructure Review',
        date: 'Jan 15, 2026',
        period: periodLabel,
        status: 'Archived',
        description: 'Third-party safety verification and stress testing of mechanical, electrical, and plumbing arterial systems.',
        metrics: [
          { label: 'Safety Score', value: '100/100' },
          { label: 'Tests Passed', value: '42' }
        ]
      },
      {
        id: '4',
        type: 'Legal',
        title: 'Title & Ownership Portfolio',
        date: 'Dec 12, 2025',
        period: periodLabel,
        status: 'Final',
        description: 'Verification of municipal permits, registration status, and contractual milestone adherence.',
        metrics: [
          { label: 'Registration', value: 'Verified' },
          { label: 'Permit ID', value: 'STR-2025-AX4' }
        ]
      }
    ];

    // Simulate different data for different periods
    if (this.selectedPeriod === 'all') {
      this.reports.forEach(r => {
        if (r.type === 'Progress') {
          r.metrics[0].value = '42.1%';
          r.metrics[1].value = '12,500h';
        }
      });
    }
  }
}
