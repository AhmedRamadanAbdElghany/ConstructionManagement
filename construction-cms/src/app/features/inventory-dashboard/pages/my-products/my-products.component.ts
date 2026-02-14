import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-my-products',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">My Products</h1>
      <p>Manage your product catalog here.</p>
    </div>
  `
})
export class MyProductsComponent { }
