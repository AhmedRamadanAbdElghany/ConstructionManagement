import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-inventory-overview',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Inventory Overview</h1>
      <p>Welcome to your inventory dashboard.</p>
    </div>
  `
})
export class InventoryOverviewComponent { }
