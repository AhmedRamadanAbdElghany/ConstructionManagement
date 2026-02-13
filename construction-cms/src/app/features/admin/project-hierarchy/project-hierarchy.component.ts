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
             @if (phases.length > 0) {
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
             }
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
               <div class="p-12 pb-8 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                       {{ showNewItemForm ? 'Add New Item' : 'Allocate Items' }}
                    </h2>
                    <div class="flex items-center space-x-3 mt-2">
                       <p class="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Node: {{ selectedPhase?.name }}</p>
                       @if (!showNewItemForm && selectedPhase?.items?.length) {
                          <span class="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-[9px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-500/20">
                             {{ selectedPhase!.items!.length }} linked
                          </span>
                       }
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                     @if (showNewItemForm) {
                        <button (click)="showNewItemForm = false" class="px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                           Back to List
                        </button>
                     } @else {
                        <button (click)="showNewItemForm = true" class="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/20">
                           + New Item
                        </button>
                     }
                     <button (click)="showItemModal = false; itemSearchQuery = ''" class="p-4 rounded-3xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm group">
                        <svg class="w-6 h-6 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </div>
               </div>

               @if (!showNewItemForm) {
                  <!-- Search Bar -->
                  <div class="px-12 pt-8 pb-4">
                     <div class="relative">
                        <svg class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input type="text" [(ngModel)]="itemSearchQuery" placeholder="Search items by name or description..."
                               class="w-full pl-14 pr-12 py-5 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 outline-none font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400">
                        @if (itemSearchQuery) {
                           <button (click)="itemSearchQuery = ''" class="absolute right-6 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                           </button>
                        }
                     </div>
                     <div class="flex items-center justify-between mt-3 px-2">
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                           Showing {{ filteredCatalogItems.length }} available items
                        </span>
                     </div>
                  </div>
                  <div class="px-12 pb-8 space-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
                     <div class="grid grid-cols-1 gap-3">
                        @for (item of filteredCatalogItems; track item.id) {
                           <div class="p-5 rounded-[2rem] border flex items-center space-x-5 transition-all group/item"
                                [ngClass]="{
                                  'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200/50 dark:border-emerald-500/15 ring-2 ring-emerald-500/20': isItemLinked(item.name),
                                  'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-white/5 hover:border-emerald-500/30': !isItemLinked(item.name)
                                }">
                              <div class="w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center shrink-0"
                                   [ngClass]="{
                                     'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500': isItemLinked(item.name),
                                     'bg-white dark:bg-slate-900 text-slate-400': !isItemLinked(item.name)
                                   }">
                                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                              </div>
                              <div class="flex-1 min-w-0">
                                 <h4 class="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm truncate">{{ item.name }}</h4>
                                 <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{{ item.description || 'No description' }}</p>
                              </div>
                              
                               <div class="shrink-0">
                                  @if (isItemLinked(item.name)) {
                                     <button (click)="unlinkItem(item.id, item.name)" 
                                             class="px-5 py-2.5 rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all group/remove">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        <span>Remove</span>
                                     </button>
                                  } @else {
                                      <button (click)="linkItem(item)" [disabled]="loadingLinkIds[item.id]" 
                                              class="px-5 py-2.5 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 hover:scale-105 active:scale-95">
                                         @if (loadingLinkIds[item.id]) {
                                            <svg class="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                               <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                               <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>...</span>
                                         } @else {
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                                            <span>Add to Phase</span>
                                         }
                                      </button>
                                  }
                               </div>
                           </div>
                        } @empty {
                           <div class="py-16 text-center">
                              <svg class="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">No items match your search</p>
                           </div>
                        }
                     </div>
                  </div>
               } @else {
                  <div class="p-12 space-y-8">
                     <div class="space-y-6">
                        <div>
                           <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">Item Name</label>
                           <input type="text" [(ngModel)]="newItemForm.name" placeholder="Item Name"
                                  class="w-full p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[2.5rem] outline-none font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all">
                        </div>

                        <div>
                           <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">Description</label>
                           <textarea [(ngModel)]="newItemForm.description" rows="3" placeholder="Optional details..."
                                     class="w-full p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[2.5rem] outline-none font-medium text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all"></textarea>
                        </div>

                        <div class="flex items-center justify-between p-6 rounded-[2.5rem] bg-indigo-50/50 dark:bg-white/5 border border-indigo-100 dark:border-white/10">
                           <span class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Add to company global catalog</span>
                           <label class="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" [(ngModel)]="addToGlobal" class="sr-only peer">
                              <div class="w-14 h-7 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                           </label>
                        </div>
                     </div>

                     <button (click)="createNewItem()" [disabled]="!newItemForm.name || isCreatingItem" 
                             class="w-full py-7 rounded-[2.5rem] bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-3">
                        @if (isCreatingItem) {
                           <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           <span>CREATING & LINKING...</span>
                        } @else {
                           <span>Create & Attach to Phase</span>
                        }
                     </button>
                  </div>
               }

               <div class="p-12 pt-0 flex justify-end bg-slate-50/30 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
                   <button (click)="showItemModal = false; itemSearchQuery = ''" 
                           class="px-12 py-5 rounded-[2.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] mt-8 hover:scale-105 active:scale-95 transition-all shadow-xl">
                      Done
                   </button>
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
   private localLinkedItemNames = new Set<string>();
   itemSearchQuery = '';
   newItemForm: Partial<CatalogItem> = {
      name: '',
      description: '',
      unit: 'm2',
      defaultRate: 0,
      category: 'Material'
   } as any;

   constructor(
      private phaseService: PhaseService,
      private catalogService: CatalogService,
      private authService: AuthService
   ) { }

   get filteredCatalogItems(): CatalogItem[] {
      let items = this.catalogItems;

      // Filter by search query
      if (this.itemSearchQuery.trim()) {
         const q = this.itemSearchQuery.trim().toLowerCase();
         items = items.filter(i =>
            i.name.toLowerCase().includes(q) ||
            (i.description && i.description.toLowerCase().includes(q))
         );
      }

      // Sort: linked items first
      return [...items].sort((a, b) => {
         const aLinked = this.isItemLinked(a.name) ? 0 : 1;
         const bLinked = this.isItemLinked(b.name) ? 0 : 1;
         return aLinked - bLinked;
      });
   }

   ngOnInit() {
      this.loadPhases();
      this.loadCatalog();
   }

   loadPhases() {
      const companyId = this.authService.getCurrentUser()?.companyId || 1;
      this.phaseService.getDefaultPhases(companyId).subscribe((p: Phase[]) => {
         this.phases = p;
         if (this.selectedPhase) {
            const freshPhase = this.findPhaseById(this.phases, this.selectedPhase.id);
            if (freshPhase) {
               this.selectedPhase = freshPhase;
               // Sync local set with real items from server
               this.localLinkedItemNames.clear();
               freshPhase.items?.forEach(i => {
                  if (i.name) this.localLinkedItemNames.add(i.name.trim().toLowerCase());
               });
            }
         }
      });
   }

   private findPhaseById(phases: Phase[], id: number): Phase | undefined {
      for (const phase of phases) {
         if (phase.id === id) return phase;
         if (phase.children) {
            const found = this.findPhaseById(phase.children, id);
            if (found) return found;
         }
      }
      return undefined;
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
      this.itemSearchQuery = '';
      this.showItemModal = true;

      // Initialize local link state
      this.localLinkedItemNames.clear();
      phase.items?.forEach(i => {
         if (i.name) this.localLinkedItemNames.add(i.name.trim().toLowerCase());
      });
   }

   isItemLinked(itemName: string): boolean {
      if (!itemName) return false;
      return this.localLinkedItemNames.has(itemName.trim().toLowerCase());
   }

   linkItem(item: CatalogItem) {
      if (!this.selectedPhase || !item.name) return;
      if (!this.selectedPhase.items) this.selectedPhase.items = [];

      const normalizedName = item.name.trim().toLowerCase();
      if (this.isItemLinked(normalizedName)) return;

      this.loadingLinkIds[item.id] = true;

      // Optimistic locally
      this.localLinkedItemNames.add(normalizedName);

      this.phaseService.addItemsToDefaultPhase(this.selectedPhase.id, [item.id]).subscribe({
         next: () => {
            this.loadPhases();
            delete this.loadingLinkIds[item.id];
         },
         error: () => {
            this.localLinkedItemNames.delete(normalizedName);
            delete this.loadingLinkIds[item.id];
         }
      });
   }

   unlinkItem(itemId: number, itemName?: string) {
      if (!this.selectedPhase) return;

      const normalizedName = itemName?.trim().toLowerCase();

      // Optimistic locally
      if (normalizedName) this.localLinkedItemNames.delete(normalizedName);

      this.phaseService.deleteDefaultPhaseItem(this.selectedPhase.id, itemId).subscribe({
         next: () => this.loadPhases(),
         error: () => {
            if (normalizedName) this.localLinkedItemNames.add(normalizedName);
         }
      });
   }

   onDeleteItem(event: { phase: Phase, itemId: number }) {
      if (confirm('Unlink this item?')) {
         this.selectedPhase = event.phase;
         const item = event.phase.items?.find(i => i.id === event.itemId);
         this.unlinkItem(event.itemId, item?.name);
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
         description: '',
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
