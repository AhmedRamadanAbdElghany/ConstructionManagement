import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
    selector: 'app-pending-requests',
    standalone: true,
    imports: [CommonModule, HttpClientModule],
    template: '<div class="p-4"><h1 class="text-xl font-bold">Pending Requests</h1><p>Manage company and join requests</p></div>'
})
export class PendingRequestsComponent implements OnInit {
    ngOnInit(): void { }
}
