import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehouseOrderService, WarehouseOrderRequest } from '../../../core/services/warehouse-order.service';

@Component({
    selector: 'app-barcode-scanner',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="barcode-scanner-container">
      <h2>Barcode Scanner</h2>
      
      <div class="search-box">
        <input 
          type="text" 
          [(ngModel)]="barcode" 
          placeholder="Enter Barcode"
          (keyup.enter)="lookup()">
        <button (click)="lookup()">Search</button>
      </div>
      
      <div class="order-details" *ngIf="order">
        <h3>Order Details</h3>
        
        <div class="detail-row">
          <span class="label">Order Number:</span>
          <span class="value">{{ order.orderNumber }}</span>
        </div>
        
        <div class="detail-row">
          <span class="label">Barcode:</span>
          <span class="value">{{ order.barcode }}</span>
        </div>
        
        <div class="detail-row">
          <span class="label">Status:</span>
          <span class="value status-{{ order.status }}">{{ getStatusText(order.status) }}</span>
        </div>
        
        <div class="detail-row">
          <span class="label">Delivery Address:</span>
          <span class="value">{{ order.deliveryAddress }}</span>
        </div>
        
        <div class="detail-row">
          <span class="label">Total Amount:</span>
          <span class="value">{{ order.totalAmount | currency }}</span>
        </div>
        
        <div class="detail-row">
          <span class="label">Request Date:</span>
          <span class="value">{{ order.requestDate | date:'medium' }}</span>
        </div>
        
        <div class="items-list" *ngIf="order.items && order.items.length > 0">
          <h4>Items</h4>
          <div *ngFor="let item of order.items" class="item">
            <span>{{ item.itemName }} x{{ item.quantity }} {{ item.unit }}</span>
            <span>{{ item.totalPrice | currency }}</span>
          </div>
        </div>
        
        <div class="status-update" *ngIf="order.status < 4">
          <h4>Update Status</h4>
          <select [(ngModel)]="newStatus">
            <option [value]="1">Confirmed</option>
            <option [value]="2">Preparing</option>
            <option [value]="3">Out for Delivery</option>
            <option [value]="4">Delivered</option>
          </select>
          <button (click)="updateStatus()">Update</button>
        </div>
      </div>
      
      <div class="not-found" *ngIf="notFound">
        Order not found
      </div>
    </div>
  `,
    styles: [`
    .barcode-scanner-container {
      padding: 20px;
      max-width: 600px;
    }
    .search-box {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .search-box input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1.1em;
    }
    .search-box button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .order-details {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .detail-row .label {
      font-weight: bold;
      color: #495057;
    }
    .status-0 { color: #ffc107; }
    .status-1 { color: #28a745; }
    .status-2 { color: #17a2b8; }
    .status-3 { color: #6c757d; }
    .status-4 { color: #28a745; }
    .status-5 { color: #dc3545; }
    .items-list {
      margin-top: 20px;
    }
    .item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .status-update {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #dee2e6;
    }
    .status-update select,
    .status-update button {
      padding: 10px;
      margin-right: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .status-update button {
      background: #28a745;
      color: white;
      border: none;
      cursor: pointer;
    }
    .not-found {
      padding: 20px;
      background: #f8d7da;
      color: #721c24;
      border-radius: 4px;
      text-align: center;
    }
  `]
})
export class BarcodeScannerComponent {
    barcode = '';
    order: WarehouseOrderRequest | null = null;
    notFound = false;
    newStatus = 0;

    constructor(private orderService: WarehouseOrderService) { }

    lookup() {
        if (!this.barcode.trim()) return;

        this.notFound = false;
        this.order = null;

        this.orderService.getOrderByBarcode(this.barcode).subscribe({
            next: (order: WarehouseOrderRequest) => {
                this.order = order;
                this.newStatus = order.status;
            },
            error: () => {
                this.notFound = true;
            }
        });
    }

    getStatusText(status: number): string {
        const statusMap: { [key: number]: string } = {
            0: 'Pending',
            1: 'Confirmed',
            2: 'Preparing',
            3: 'Out for Delivery',
            4: 'Delivered',
            5: 'Cancelled'
        };
        return statusMap[status] || 'Unknown';
    }

    updateStatus() {
        if (!this.order || this.newStatus === this.order.status) return;

        this.orderService.updateOrderStatus(this.order.id, { newStatus: this.newStatus }).subscribe({
            next: (updated: WarehouseOrderRequest) => {
                this.order = updated;
            },
            error: (error: any) => console.error('Error updating status:', error)
        });
    }
}
