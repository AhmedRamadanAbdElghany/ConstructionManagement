import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Phase } from '../../../core/services/phase.service';

@Component({
   selector: 'app-phase-node',
   standalone: true,
   imports: [CommonModule, PhaseNodeComponent],
   template: `
    <div class="ml-4 border-l-2 border-slate-100 dark:border-white/5 pl-8 py-2">
      <div class="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all">
        <!-- Main Phase Row -->
        <div class="p-6 flex items-center justify-between">
          <div class="flex items-center space-x-4 flex-1 min-w-0">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0"
                 [ngClass]="{
                   'bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 text-emerald-500': node.isLeaf,
                   'bg-gradient-to-br from-cyan-400/20 to-indigo-600/20 text-cyan-500': !node.isLeaf
                 }">
               @if (node.isLeaf) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
               } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
               }
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-3 flex-wrap gap-y-1">
                 <h4 class="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{{ node.name }}</h4>
                 @if (node.startDate || node.endDate) {
                    <div class="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                       <svg class="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                       <span class="text-[8px] font-black text-indigo-500 uppercase tracking-tighter">{{ node.startDate | date:'MMM d' }}</span>
                       <span class="text-[8px] font-black text-slate-300">&rarr;</span>
                       <span class="text-[8px] font-black text-indigo-500 uppercase tracking-tighter">{{ node.endDate | date:'MMM d' }}</span>
                    </div>
                 }
                 @if (node.items?.length) {
                    <button (click)="showItems = !showItems" class="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all cursor-pointer">
                       <svg class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                       <span class="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{{ node.items!.length }} items</span>
                       <svg class="w-3 h-3 text-emerald-400 transition-transform" [class.rotate-180]="showItems" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                 } @else {
                    <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest pl-1 italic">No items</span>
                 }
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-1 ml-4 shrink-0">
             <!-- Add Sub-Phase -->
             <button (click)="onAddChild.emit(node)" class="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all flex items-center space-x-1" title="Add Sub-Phase">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                <span>Sub</span>
             </button>
             
             <!-- Add Items -->
             <button (click)="onAddItems.emit(node)" class="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all relative flex items-center space-x-1" title="Manage Items">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                <span>Items</span>
                @if (node.items?.length) {
                   <span class="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] border-2 border-white dark:border-slate-900 ring-2 ring-emerald-500/20">
                      {{ node.items?.length }}
                   </span>
                }
             </button>

             <div class="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1"></div>

               <!-- Reorder Buttons -->
               <button (click)="onMoveUp.emit(node.id)" [disabled]="loadingMap[node.id]" class="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-indigo-500 transition-all flex items-center justify-center" title="Move Up">
                  @if (loadingMap[node.id] === 'moving-up') {
                     <svg class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                  } @else {
                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"></path></svg>
                  }
               </button>
               <button (click)="onMoveDown.emit(node.id)" [disabled]="loadingMap[node.id]" class="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-indigo-500 transition-all flex items-center justify-center" title="Move Down">
                  @if (loadingMap[node.id] === 'moving-down') {
                     <svg class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                  } @else {
                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                  }
               </button>
 
               <div class="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1"></div>
 
              <button (click)="onEdit.emit(node)" [disabled]="loadingMap[node.id]" class="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button (click)="onDelete.emit(node.id)" [disabled]="loadingMap[node.id]" class="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center">
                  @if (loadingMap[node.id] === 'deleting') {
                     <svg class="animate-spin w-4 h-4 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                  } @else {
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  }
              </button>
           </div>
        </div>

        <!-- Expanded Items Section -->
        @if (showItems && node.items?.length) {
           <div class="px-6 pb-5 animate-in slide-in-from-top-2 duration-200">
              <div class="border-t border-slate-100 dark:border-white/5 pt-4">
                 <div class="flex items-center space-x-2 mb-3">
                    <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Attached Items</span>
                 </div>
                 <div class="flex flex-wrap gap-2">
                    @for (item of node.items; track item.id) {
                       <div class="relative group/item">
                          <button (click)="onEditItem.emit({item, phase: node})" class="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-400/40 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all group/item-btn">
                             <div class="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center">
                                <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                             </div>
                             <div class="flex flex-col">
                                <span class="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest leading-tight">{{ item.name || item.description }}</span>
                                @if (item.startDate || item.endDate) {
                                   <span class="text-[7px] font-bold text-emerald-500/60 uppercase">{{ item.startDate | date:'M/d' }} - {{ item.endDate | date:'M/d' }}</span>
                                }
                             </div>
                          </button>
                          <button (click)="onDeleteItem.emit({ phase: node, itemId: item.id })" 
                                  class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all shadow-lg hover:scale-110 z-10"
                                  title="Remove Item">
                             <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                       </div>
                    }
                 </div>
              </div>
           </div>
        }
      </div>
 
       @if (node.children?.length) {
         <div class="mt-2">
           @for (child of node.children; track child.id) {
             <app-phase-node 
               [node]="child" 
               [loadingMap]="loadingMap"
               (onAddChild)="onAddChild.emit($event)"
               (onEdit)="onEdit.emit($event)"
               (onDelete)="onDelete.emit($event)"
               (onAddItems)="onAddItems.emit($event)"
               (onEditItem)="onEditItem.emit($event)"
               (onDeleteItem)="onDeleteItem.emit($event)"
               (onMoveUp)="onMoveUp.emit($event)"
               (onMoveDown)="onMoveDown.emit($event)">
             </app-phase-node>
           }
         </div>
       }
    </div>
  `
})
export class PhaseNodeComponent {
   @Input() node!: Phase;
   @Input() loadingMap: { [key: number]: string } = {};
   @Output() onAddChild = new EventEmitter<Phase>();
   @Output() onEdit = new EventEmitter<Phase>();
   @Output() onDelete = new EventEmitter<number>();
   @Output() onAddItems = new EventEmitter<Phase>();
   @Output() onEditItem = new EventEmitter<{ item: any, phase: Phase }>();
   @Output() onDeleteItem = new EventEmitter<{ phase: Phase, itemId: number }>();
   @Output() onMoveUp = new EventEmitter<number>();
   @Output() onMoveDown = new EventEmitter<number>();

   showItems = false;
}
