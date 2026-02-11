import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PhaseService, Phase } from '../../../core/services/phase.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { AuthService } from '../../../core/services/auth.service';
import { CatalogItem } from '../../../shared/interfaces';
import { PhaseNodeComponent } from './phase-node.component';

@Component({
   selector: 'app-project-hierarchy',
   standalone: true,
   imports: [CommonModule, FormsModule, TranslateModule, PhaseNodeComponent],
   template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 transition-colors duration-500">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-16">
          <div>
            <h1 class="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
               {{ 'phaseHierarchy' | translate }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center">
               <span class="w-8 h-px bg-cyan-500 mr-3"></span>
               {{ 'determineStructure' | translate }}
            </p>
          </div>
          <div class="flex items-center space-x-4">
             <button (click)="clearAll()" [disabled]="isCleaning" class="px-8 py-4 rounded-3xl bg-rose-500/10 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center space-x-2">
                @if (isCleaning) {
                   <svg class="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   <span>{{ 'common.processing' | translate }}</span>
                } @else {
                   {{ 'clearAll' | translate }}
                }
             </button>
             <button (click)="openModal()" class="px-8 py-4 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
               + {{ 'addPhase' | translate }}
             </button>
          </div>
        </div>

        <!-- Hierarchy Tree -->
        <div class="space-y-4">
          @for (phase of phases; track phase.id) {
            <app-phase-node 
              [node]="phase"
              [loadingMap]="loadingPhases"
              (onAddChild)="openModal(undefined, $event)"
              (onEdit)="openModal($event)"
              (onDelete)="deletePhase($event)"
              (onAddItems)="openItemModal($event)"
              (onDeleteItem)="onDeleteItem($event)"
              (onMoveUp)="movePhase($event, -1)"
              (onMoveDown)="movePhase($event, 1)">
            </app-phase-node>
          }
        </div>
      </div>

      <!-- Phase Modal -->
      @if (showModal) {
         <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
            <div class="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[4rem] shadow-2xl overflow-hidden animate-in scale-in-95 duration-500 border border-white/10">
               <div class="p-12 pb-8 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                       {{ (selectedPhase ? 'editPhase' : 'addPhase') | translate }}
                    </h2>
                    @if (parentPhase) {
                       <p class="text-[10px] text-cyan-500 font-black uppercase tracking-widest mt-2">Inside: {{ parentPhase.name }}</p>
                    }
                  </div>
                  <button (click)="showModal = false" class="p-4 rounded-3xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                     <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
               </div>

               <div class="p-12 space-y-8">
                  <div class="space-y-4">
                     <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">Phase Profile Name</label>
                        <input type="text" [(ngModel)]="form.name" placeholder="e.g. Interior Fine Finishing"
                               class="w-full p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 outline-none font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-cyan-500/10 transition-all">
                     </div>
                  </div>

                  <div class="flex space-x-4 pt-10">
                     <button (click)="showModal = false" class="flex-1 py-6 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                        {{ 'common.cancel' | translate }}
                     </button>
                      <button (click)="save()" [disabled]="!form.name || isSaving" class="flex-[2] py-6 rounded-[2.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest shadow-2xl disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-3">
                         @if (isSaving) {
                            <svg class="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                               <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{{ 'common.processing' | translate }}</span>
                         } @else {
                            <span>{{ 'common.save' | translate }}</span>
                         }
                      </button>
                  </div>
               </div>
            </div>
         </div>
      }

      <!-- Item Allocation Modal -->
      @if (showItemModal) {
         <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
            <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in scale-in-95 duration-500 border border-white/10">
               <div class="p-12 pb-8 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                       {{ showNewItemForm ? 'Create New Item' : 'Allocate Catalog Items' }}
                    </h2>
                    <p class="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-2">Node: {{ selectedPhase?.name }}</p>
                  </div>
                  <div class="flex space-x-2">
                     <button (click)="showNewItemForm = !showNewItemForm" class="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                        {{ showNewItemForm ? 'Back to List' : '+ New Item' }}
                     </button>
                     <button (click)="showItemModal = false" class="p-4 rounded-3xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                        <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>
               </div>

               @if (!showNewItemForm) {
                  <div class="p-12 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                     <div class="grid grid-cols-1 gap-4">
                        @for (item of catalogItems; track item.id) {
                           <div class="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 flex items-center space-x-6 hover:border-emerald-500/30 transition-all group">
                              <div class="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-emerald-500 font-black text-lg">
                                 {{ item.unit }}
                              </div>
                              <div class="flex-1">
                                 <h4 class="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{{ item.name }}</h4>
                                 <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rate: {{ item.defaultRate | currency }} • {{ item.category }}</p>
                              </div>
                              
                              @if (isItemLinked(item.id)) {
                                 <button (click)="unlinkItem(item.id)" class="px-6 py-3 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20 transition-all font-black text-[10px] uppercase tracking-widest">
                                    Remove
                                 </button>
                              } @else {
                                  <button (click)="linkItem(item)" [disabled]="loadingLinkIds[item.id]" class="px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-500 hover:shadow-lg transition-all font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-white/5 flex items-center space-x-2">
                                     @if (loadingLinkIds[item.id]) {
                                        <svg class="animate-spin h-3 w-3 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                           <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                           <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Adding...</span>
                                     } @else {
                                        <span>Add to Phase</span>
                                     }
                                  </button>
                              }
                           </div>
                        }
                     </div>
                  </div>
               } @else {
                  <div class="p-12 space-y-6">
                     <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                           <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Item Name</label>
                           <input type="text" [(ngModel)]="newItemForm.name" class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 outline-none font-bold text-slate-900 dark:text-white">
                        </div>
                        <div>
                           <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Unit</label>
                           <input type="text" [(ngModel)]="newItemForm.unit" class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 outline-none font-bold text-slate-900 dark:text-white">
                        </div>
                        <div>
                           <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Default Rate</label>
                           <input type="number" [(ngModel)]="newItemForm.defaultRate" class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 outline-none font-bold text-slate-900 dark:text-white">
                        </div>
                        <div class="col-span-2 relative">
                           <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Category</label>
                           <select [(ngModel)]="newItemForm.category" class="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 outline-none font-bold text-slate-900 dark:text-white appearance-none cursor-pointer">
                              <option value="Labor" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Labor</option>
                              <option value="Material" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Material</option>
                              <option value="Equipment" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Equipment</option>
                              <option value="Preliminaries" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Preliminaries</option>
                              <option value="Other" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Other</option>
                           </select>
                           <div class="absolute right-4 bottom-4 pointer-events-none text-slate-400">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                           </div>
                        </div>

                        <div class="col-span-2 flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                           <label class="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" [(ngModel)]="addToGlobal" class="sr-only peer">
                              <div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                           </label>
                           <span class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Add to company global catalog</span>
                        </div>
                     </div>
                     <button (click)="createNewItem()" [disabled]="!newItemForm.name || isCreatingItem" class="w-full py-6 rounded-[2.5rem] bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-3">
                        @if (isCreatingItem) {
                           <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           <span>Creating & Linking...</span>
                        } @else {
                           <span>Create & Attach to Phase</span>
                        }
                     </button>
                  </div>
               }

               <div class="p-12 pt-0 flex justify-end bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
                  <button (click)="showItemModal = false" class="px-12 py-5 rounded-[2.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest mt-8">Done</button>
               </div>
            </div>
         </div>
      }
    </div>
  `
})
export class ProjectHierarchyComponent implements OnInit {
   phases: Phase[] = [];
   catalogItems: CatalogItem[] = [];
   showModal = false;
   showItemModal = false;
   showNewItemForm = false;
   addToGlobal = true;
   selectedPhase?: Phase;
   parentPhase?: Phase;
   form = { name: '' };
   isSaving = false;
   isCleaning = false;
   isCreatingItem = false;
   loadingLinkIds: { [key: number]: boolean } = {};
   loadingPhases: { [key: number]: string } = {};
   newItemForm: Partial<CatalogItem> = {
      name: '',
      unit: 'm2',
      defaultRate: 0,
      category: 'Material'
   } as any;

   constructor(
      private phaseService: PhaseService,
      private catalogService: CatalogService,
      private authService: AuthService
   ) { }

   ngOnInit() {
      this.loadPhases();
      this.loadCatalog();
   }

   loadPhases() {
      const companyId = this.authService.getCurrentUser()?.companyId || 1;
      this.phaseService.getDefaultPhases(companyId).subscribe((p: Phase[]) => this.phases = p);
   }

   loadCatalog() {
      this.catalogService.getCatalogItems().subscribe(items => this.catalogItems = items);
   }

   useGlobalTemplate() {
      // Simulate loading a global template with predefined phases
      const globalTemplate = [
         { name: 'التجهيزات والموقع العام', order: 0, parentPhaseId: undefined },
         { name: 'مكاتب الموقع والسور', order: 0, parentPhaseId: undefined, isChild: 1 },
         { name: 'توصيلات المياه والكهرباء', order: 1, parentPhaseId: undefined, isChild: 1 },
         { name: 'أعمال الحفر والردم', order: 1, parentPhaseId: undefined },
         { name: 'أعمال الخرسانة', order: 2, parentPhaseId: undefined },
         { name: 'خرسانة عادية', order: 0, parentPhaseId: undefined, isChild: 3 },
         { name: 'خرسانة مسلحة', order: 1, parentPhaseId: undefined, isChild: 3 },
         { name: 'أعمال البناء', order: 3, parentPhaseId: undefined },
         { name: 'أعمال التشطيبات', order: 4, parentPhaseId: undefined },
         { name: 'تشطيب داخلي', order: 0, parentPhaseId: undefined, isChild: 5 },
         { name: 'تشطيب خارجي', order: 1, parentPhaseId: undefined, isChild: 5 }
      ];

      const companyId = this.authService.getCurrentUser()?.companyId || 1;
      const parentMap: { [key: number]: number } = {};
      let rootIndex = 0;

      // Create root phases first, then children
      const createPhases = async () => {
         // Create roots first
         const roots = globalTemplate.filter(t => !t.isChild);
         for (const t of roots) {
            this.phaseService.createDefaultPhase(companyId, { name: t.name, order: t.order }).subscribe(result => {
               parentMap[rootIndex] = result.id;
               rootIndex++;
            });
         }

         // Wait a bit for roots to be created, then create children
         setTimeout(() => {
            const children = globalTemplate.filter(t => t.isChild !== undefined);
            for (const t of children) {
               const parentId = parentMap[t.isChild as number];
               if (parentId) {
                  this.phaseService.createDefaultPhase(companyId, { name: t.name, order: t.order, parentPhaseId: parentId }).subscribe();
               }
            }
            setTimeout(() => this.loadPhases(), 500);
         }, 500);
      };

      createPhases();
   }

   openModal(phase?: Phase, parent?: Phase) {
      this.selectedPhase = phase;
      this.parentPhase = parent;
      this.form = phase ? { name: phase.name } : { name: '' };
      this.showModal = true;
   }

   openItemModal(phase: Phase) {
      this.selectedPhase = phase;
      this.showNewItemForm = false;
      this.showItemModal = true;
   }

   isItemLinked(itemId: number): boolean {
      return this.selectedPhase?.items?.some(i => i.id === itemId) || false;
   }

   linkItem(item: CatalogItem) {
      if (!this.selectedPhase) return;
      if (!this.selectedPhase.items) this.selectedPhase.items = [];

      // Check if already linked
      if (this.isItemLinked(item.id)) return;

      this.loadingLinkIds[item.id] = true;
      this.phaseService.addItemsToDefaultPhase(this.selectedPhase.id, [item.id]).subscribe({
         next: () => {
            this.loadPhases();
            delete this.loadingLinkIds[item.id];
         },
         error: () => delete this.loadingLinkIds[item.id]
      });
   }

   unlinkItem(itemId: number) {
      if (!this.selectedPhase) return;
      this.phaseService.deleteDefaultPhaseItem(this.selectedPhase.id, itemId).subscribe(() => {
         this.loadPhases();
      });
   }

   onDeleteItem(event: { phase: Phase, itemId: number }) {
      if (confirm('Unlink this item?')) {
         this.selectedPhase = event.phase;
         this.unlinkItem(event.itemId);
      }
   }

   createNewItem() {
      if (!this.selectedPhase || !this.newItemForm.name) return;
      this.isCreatingItem = true;

      if (this.addToGlobal) {
         this.catalogService.addCatalogItem(this.newItemForm).subscribe({
            next: (createdItem) => {
               this.linkItem(createdItem);
               this.loadCatalog();
               this.closeNewItemForm();
               this.isCreatingItem = false;
            },
            error: () => this.isCreatingItem = false
         });
      } else {
         // Create local-only item for this phase (not added to global service)
         const localItem: CatalogItem = {
            ...this.newItemForm as CatalogItem,
            id: Math.floor(Math.random() * -10000) // Negative ID to indicate local
         };
         this.linkItem(localItem);
         this.closeNewItemForm();
         this.isCreatingItem = false;
      }
   }

   private closeNewItemForm() {
      this.showNewItemForm = false;
      this.newItemForm = {
         name: '',
         unit: 'm2',
         defaultRate: 0,
         category: 'Material'
      } as any;
   }

   save() {
      const companyId = this.authService.getCurrentUser()?.companyId || 1;
      this.isSaving = true;
      if (!this.selectedPhase) {
         this.phaseService.createDefaultPhase(companyId, {
            name: this.form.name,
            parentPhaseId: this.parentPhase?.id,
            order: 0
         }).subscribe({
            next: () => {
               this.loadPhases();
               this.showModal = false;
               this.isSaving = false;
            },
            error: () => this.isSaving = false
         });
      } else {
         this.phaseService.updateDefaultPhase(this.selectedPhase.id, {
            name: this.form.name
         }).subscribe({
            next: () => {
               this.loadPhases();
               this.showModal = false;
               this.isSaving = false;
            },
            error: () => this.isSaving = false
         });
      }
   }

   deletePhase(id: number) {
      if (confirm('Delete this phase? All descendants will also be removed.')) {
         this.loadingPhases[id] = 'deleting';
         this.phaseService.deleteDefaultPhase(id).subscribe({
            next: () => {
               this.loadPhases();
               delete this.loadingPhases[id];
            },
            error: () => delete this.loadingPhases[id]
         });
      }
   }

   clearAll() {
      if (confirm('Are you sure you want to clear the entire phase hierarchy? This cannot be undone.')) {
         this.isCleaning = true;
         const companyId = this.authService.getCurrentUser()?.companyId || 1;
         this.phaseService.clearDefaultPhases(companyId).subscribe({
            next: () => {
               this.loadPhases();
               this.isCleaning = false;
            },
            error: () => this.isCleaning = false
         });
      }
   }

   movePhase(id: number, direction: number) {
      this.loadingPhases[id] = direction > 0 ? 'moving-down' : 'moving-up';
      this.phaseService.reorderDefaultPhase(id, direction).subscribe({
         next: () => {
            this.loadPhases();
            delete this.loadingPhases[id];
         },
         error: () => delete this.loadingPhases[id]
      });
   }
}
