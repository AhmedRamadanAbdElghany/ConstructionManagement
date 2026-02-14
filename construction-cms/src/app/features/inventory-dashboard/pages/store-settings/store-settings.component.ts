import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-store-settings',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Store Settings</h1>
      <p>Manage your store profile and location.</p>
    </div>
  `
})
export class StoreSettingsComponent { }
