import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-incoming-orders',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Incoming Orders</h1>
      <p>View and manage orders from companies.</p>
    </div>
  `
})
export class IncomingOrdersComponent { }
