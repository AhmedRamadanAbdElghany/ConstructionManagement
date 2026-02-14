import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-sales-log',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Sales Log</h1>
      <p>Record manual sales and view transaction history.</p>
    </div>
  `
})
export class SalesLogComponent { }
