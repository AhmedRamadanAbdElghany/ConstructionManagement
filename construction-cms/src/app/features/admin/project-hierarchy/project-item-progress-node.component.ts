import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Phase } from '../../../core/services/phase.service';

@Component({
    selector: 'app-project-item-progress-node',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="ml-4 border-l-2 border-slate-100 dark:border-white/5 pl-8 py-2">
      <!-- Node Header -->
      <div class="group bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
               @if (node.isLeaf) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
               } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
               }
            </div>
            <div>
              <h4 class="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{{ node.name }}</h4>
              <div class="flex items-center space-x-2 mt-1">
                @if (node.startDate || node.endDate) {
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {{ node.startDate | date:'MMM d, y' }} &mdash; {{ node.endDate | date:'MMM d, y' }}
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="text-right">
             <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value</div>
             <div class="text-lg font-black text-slate-900 dark:text-white">{{ (node.totalMoney || 0) | currency:'USD' }}</div>
          </div>
        </div>

        <!-- Progress Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
           <div>
              <div class="flex items-center justify-between mb-2">
                 <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution Progress</span>
                 <span class="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {{ (node.executedMoney || 0) | currency:'USD' }} / {{ (node.totalMoney || 0) | currency:'USD' }}
                 </span>
              </div>
              <div class="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                 <div class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000"
                      [style.width.%]="node.totalMoney ? (node.executedMoney! / node.totalMoney!) * 100 : 0">
                 </div>
              </div>
           </div>
           <div class="flex items-center justify-end space-x-4">
              <div class="px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                 <div class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Project Weight</div>
                 <div class="text-xs font-black text-slate-700 dark:text-slate-300">
                    {{ node.totalMoney ? (node.totalMoney / parentTotalMoney * 100 | number:'1.0-1') : 0 }}%
                 </div>
              </div>
              <div [class]="'px-4 py-2 rounded-xl border ' + getStatusClass()">
                 <div class="text-[8px] font-black uppercase tracking-widest mb-0.5 opacity-60">Status</div>
                 <div class="text-xs font-black uppercase tracking-widest">{{ getStatus() }}</div>
              </div>
           </div>
        </div>

        <!-- Items Detail Table (if leaf) -->
        @if (node.isLeaf && (node.items?.length)) {
          <div class="mt-8 border-t border-slate-100 dark:border-white/5 pt-6">
            <h5 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Phase Breakdown Items</h5>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-white/5">
                    <th class="pb-3">Work Item</th>
                    <th class="pb-3 text-center">Dates</th>
                    <th class="pb-3 text-right">Value</th>
                    <th class="pb-3 text-right">Progress</th>
                    <th class="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 dark:divide-white/[0.02]">
                  @for (item of node.items; track item.id) {
                    <tr>
                      <td class="py-4">
                        <div class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ item.name }}</div>
                        <div class="text-[8px] text-slate-400 font-black uppercase mt-1">{{ item.unit }} - Qty: {{ item.totalQuantity }}</div>
                      </td>
                      <td class="py-4 text-center">
                        <div class="text-[9px] font-bold text-slate-500 whitespace-nowrap">
                           {{ item.startDate | date:'M/d' }} - {{ item.endDate | date:'M/d' }}
                        </div>
                      </td>
                      <td class="py-4 text-right">
                        <div class="text-xs font-black text-slate-900 dark:text-white">{{ (item.totalQuantity * item.rate) | currency:'USD' }}</div>
                        <div class="text-[8px] text-slate-400 font-bold tracking-widest mt-1">{{ item.rate | currency:'USD' }}/{{ item.unit }}</div>
                      </td>
                      <td class="py-4 text-right">
                         <div class="flex items-center justify-end space-x-2">
                           <div class="w-16 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <div class="h-full bg-emerald-500" [style.width.%]="(item.executedQuantity / item.totalQuantity) * 100"></div>
                           </div>
                           <span class="text-[9px] font-black text-slate-400">{{ (item.executedQuantity / item.totalQuantity) * 100 | number:'1.0-0' }}%</span>
                         </div>
                      </td>
                      <td class="py-4 text-right">
                         <span [class]="'px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ' + getItemStatusClass(item)">
                            {{ item.executedQuantity >= item.totalQuantity ? 'Completed' : 'Processing' }}
                         </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>

      <!-- Recursive Children -->
      @if (node.children?.length) {
        <div class="mt-4 space-y-4">
          @for (child of node.children; track child.id) {
            <app-project-item-progress-node 
              [node]="child" 
              [parentTotalMoney]="parentTotalMoney">
            </app-project-item-progress-node>
          }
        </div>
      }
    </div>
  `,
    styles: []
})
export class ProjectItemProgressNodeComponent {
    @Input() node!: Phase;
    @Input() parentTotalMoney: number = 0;

    getStatus(): string {
        const progress = this.node.totalMoney ? (this.node.executedMoney! / this.node.totalMoney!) : 0;
        if (progress >= 1) return 'Completed';
        if (progress > 0) return 'Processing';
        return 'Pending';
    }

    getStatusClass(): string {
        const status = this.getStatus();
        if (status === 'Completed') return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        if (status === 'Processing') return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }

    getItemStatusClass(item: any): string {
        return item.executedQuantity >= item.totalQuantity
            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
            : 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20';
    }
}
