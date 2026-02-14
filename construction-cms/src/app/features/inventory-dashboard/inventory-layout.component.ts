import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../layout/topbar/topbar.component';

@Component({
    selector: 'app-inventory-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent],
    template: `
    <div class="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Topbar -->
        <app-topbar></app-topbar>

        <!-- Main Content -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar relative">
           <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
              <router-outlet></router-outlet>
           </div>
        </main>
      </div>
    </div>
  `,
    styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      @apply bg-slate-300 dark:bg-slate-700;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      @apply bg-cyan-500;
    }
    .animate-fade-in {
        animation: fadeIn 0.5s ease-out;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class InventoryLayoutComponent { }
