import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehouseOrderService, CreateOrderRequest, OrderItemRequest, WarehouseOrderRequest } from '../../../core/services/warehouse-order.service';
import { LocationService } from '../../../core/services/location.service';

interface NearbyWarehouse {
    id: number;
    fullName: string;
    distance: number;
}

@Component({
    selector: 'app-create-order',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="create-order-container">
      <h2>Create Order</h2>
      
      <form (ngSubmit)="submitOrder()">
        <div class="form-group">
          <label>Select Warehouse</label>
          <select [(ngModel)]="orderRequest.warehouseOwnerId" name="warehouse" required>
            <option [value]="0">Choose Warehouse</option>
            <option *ngFor="let warehouse of warehouses" [value]="warehouse.id">
              {{ warehouse.fullName }} ({{ warehouse.distance | number:'1.1-1' }} km away)
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Delivery Address</label>
          <input [(ngModel)]="orderRequest.deliveryAddress" name="deliveryAddress" required>
        </div>
        
        <div class="items-section">
          <h3>Order Items</h3>
          
          <div *ngFor="let item of orderRequest.items; let i = index" class="item-row">
            <input [(ngModel)]="item.itemName" [name]="'itemName' + i" placeholder="Item Name" required>
            <input type="number" [(ngModel)]="item.quantity" [name]="'quantity' + i" placeholder="Quantity" required>
            <input type="number" [(ngModel)]="item.unitPrice" [name]="'unitPrice' + i" placeholder="Unit Price" required>
            <input [(ngModel)]="item.unit" [name]="'unit' + i" placeholder="Unit">
            <button type="button" (click)="removeItem(i)">Remove</button>
          </div>
          
          <button type="button" (click)="addItem()">+ Add Item</button>
        </div>
        
        <div class="total">
          <strong>Total: {{ calculateTotal() | currency }}</strong>
        </div>
        
        <div class="form-group">
          <label>Notes</label>
          <textarea [(ngModel)]="orderRequest.notes" name="notes" rows="3"></textarea>
        </div>
        
        <button type="submit" [disabled]="!isValid()">Submit Order</button>
      </form>
      
      <div class="order-confirmation" *ngIf="submittedOrder">
        <h3>Order Confirmed!</h3>
        <p>Order Number: {{ submittedOrder.orderNumber }}</p>
        <p>Barcode: {{ submittedOrder.barcode }}</p>
      </div>
    </div>
  `,
    styles: [`
    .create-order-container {
      padding: 20px;
      max-width: 800px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .items-section {
      margin-bottom: 20px;
    }
    .item-row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    .item-row input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .total {
      font-size: 1.2em;
      margin-bottom: 15px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    button[type="submit"],
    button[type="button"] {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button[type="submit"]:disabled {
      background: #ccc;
    }
    .order-confirmation {
      margin-top: 20px;
      padding: 20px;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
    }
  `]
})
export class CreateOrderComponent implements OnInit {
    orderRequest: CreateOrderRequest = {
        warehouseOwnerId: 0,
        deliveryAddress: '',
        deliveryLatitude: 0,
        deliveryLongitude: 0,
        items: [],
        notes: ''
    };

    warehouses: NearbyWarehouse[] = [];
    submittedOrder: any = null;

    constructor(
        private orderService: WarehouseOrderService,
        private locationService: LocationService
    ) { }

    ngOnInit() {
        this.loadNearbyWarehouses();
    }

    loadNearbyWarehouses() {
        const request = {
            latitude: 30.0444,
            longitude: 31.2357,
            radiusKm: 50,
            userType: 4,
            page: 1,
            pageSize: 50
        };

        this.locationService.searchNearby(request).subscribe({
            next: (users: any[]) => {
                this.warehouses = users.map((user: any) => ({
                    id: user.id,
                    fullName: user.fullName,
                    distance: this.calculateDistance(30.0444, 31.2357, user.latitude || 0, user.longitude || 0)
                }));
            },
            error: (error: any) => console.error('Error loading warehouses:', error)
        });
    }

    addItem() {
        this.orderRequest.items.push({
            itemName: '',
            quantity: 1,
            unitPrice: 0,
            unit: ''
        });
    }

    removeItem(index: number) {
        this.orderRequest.items.splice(index, 1);
    }

    calculateTotal(): number {
        return this.orderRequest.items.reduce((total: number, item: OrderItemRequest) => {
            return total + (item.quantity * item.unitPrice);
        }, 0);
    }

    isValid(): boolean {
        return this.orderRequest.warehouseOwnerId > 0 &&
            this.orderRequest.deliveryAddress.length > 0 &&
            this.orderRequest.items.length > 0 &&
            this.orderRequest.items.every((item: OrderItemRequest) =>
                item.itemName.length > 0 &&
                item.quantity > 0 &&
                item.unitPrice > 0
            );
    }

    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    submitOrder() {
        if (!this.isValid()) return;

        this.orderService.createOrder(this.orderRequest).subscribe({
            next: (order: WarehouseOrderRequest) => {
                this.submittedOrder = order;
                this.orderRequest = {
                    warehouseOwnerId: 0,
                    deliveryAddress: '',
                    deliveryLatitude: 0,
                    deliveryLongitude: 0,
                    items: [],
                    notes: ''
                };
            },
            error: (error: any) => console.error('Error creating order:', error)
        });
    }
}
