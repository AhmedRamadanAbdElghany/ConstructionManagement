import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EquipmentService, Equipment, EquipmentType, EquipmentStatistics, EquipmentDashboard } from '../../../core/services/equipment.service';

@Component({
    selector: 'app-equipment-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
        <div class="equipment-page">
            <div class="page-header">
                <div class="header-content">
                    <h1>Equipment Management</h1>
                    <p>Manage your construction equipment, assignments, and maintenance</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-primary" routerLink="/admin/equipment/new">
                        <i class="icon">add</i> Add Equipment
                    </button>
                </div>
            </div>

            <!-- Dashboard Cards -->
            <div class="dashboard-cards" *ngIf="dashboard">
                <div class="card">
                    <div class="card-icon available">
                        <i class="icon">check_circle</i>
                    </div>
                    <div class="card-content">
                        <span class="card-value">{{ dashboard.availableEquipment }}</span>
                        <span class="card-label">Available</span>
                    </div>
                </div>
                <div class="card">
                    <div class="card-icon assigned">
                        <i class="icon">engineering</i>
                    </div>
                    <div class="card-content">
                        <span class="card-value">{{ dashboard.assignedEquipment }}</span>
                        <span class="card-label">Assigned</span>
                    </div>
                </div>
                <div class="card">
                    <div class="card-icon maintenance">
                        <i class="icon">build</i>
                    </div>
                    <div class="card-content">
                        <span class="card-value">{{ dashboard.inMaintenanceEquipment }}</span>
                        <span class="card-label">In Maintenance</span>
                    </div>
                </div>
                <div class="card">
                    <div class="card-icon total">
                        <i class="icon">precision_manufacturing</i>
                    </div>
                    <div class="card-content">
                        <span class="card-value">{{ dashboard.totalEquipment }}</span>
                        <span class="card-label">Total Equipment</span>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="filters-section">
                <div class="search-box">
                    <i class="icon">search</i>
                    <input type="text" 
                           [(ngModel)]="searchTerm" 
                           (ngModelChange)="filterEquipment()"
                           placeholder="Search equipment by name or serial number...">
                </div>
                <div class="filter-group">
                    <select [(ngModel)]="statusFilter" (ngModelChange)="filterEquipment()">
                        <option value="">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="Assigned">Assigned</option>
                        <option value="InMaintenance">In Maintenance</option>
                        <option value="OutOfService">Out of Service</option>
                    </select>
                    <select [(ngModel)]="typeFilter" (ngModelChange)="filterEquipment()">
                        <option value="">All Types</option>
                        <option *ngFor="let type of equipmentTypes" [value]="type.id">{{ type.name }}</option>
                    </select>
                </div>
            </div>

            <!-- Equipment Table -->
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Serial Number</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Location</th>
                            <th>Operating Hours</th>
                            <th>Assigned To</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let equipment of filteredEquipment" 
                            [class.maintenance-due]="equipment.isMaintenanceDue"
                            [class.overdue]="equipment.status === 'OutOfService'">
                            <td>
                                <div class="equipment-name">
                                    <span class="name">{{ equipment.name }}</span>
                                    <span class="description" *ngIf="equipment.description">{{ equipment.description }}</span>
                                </div>
                            </td>
                            <td>{{ equipment.serialNumber }}</td>
                            <td>{{ equipment.equipmentTypeName }}</td>
                            <td>
                                <span class="status-badge" [class]="getStatusClass(equipment.status)">
                                    {{ equipment.statusName }}
                                </span>
                            </td>
                            <td>{{ equipment.currentLocation || '-' }}</td>
                            <td>{{ equipment.operatingHours | number }} h</td>
                            <td>
                                <span *ngIf="equipment.assignedProjectName">{{ equipment.assignedProjectName }}</span>
                                <span *ngIf="!equipment.assignedProjectName" class="text-muted">-</span>
                            </td>
                            <td class="actions-cell">
                                <button class="action-btn" [routerLink]="['/admin/equipment', equipment.id]" title="View">
                                    <i class="icon">visibility</i>
                                </button>
                                <button class="action-btn" [routerLink]="['/admin/equipment', equipment.id, 'edit']" title="Edit">
                                    <i class="icon">edit</i>
                                </button>
                                <button class="action-btn" (click)="assignEquipment(equipment)" title="Assign">
                                    <i class="icon">swap_horiz</i>
                                </button>
                                <button class="action-btn danger" (click)="deleteEquipment(equipment)" title="Delete">
                                    <i class="icon">delete</i>
                                </button>
                            </td>
                        </tr>
                        <tr *ngIf="filteredEquipment.length === 0">
                            <td colspan="8" class="empty-state">
                                <i class="icon">precision_manufacturing</i>
                                <p>No equipment found</p>
                                <button class="btn btn-secondary" routerLink="/admin/equipment/new">
                                    Add Your First Equipment
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
    styles: [`
        .equipment-page {
            padding: 24px;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
        }

        .header-content h1 {
            font-size: 28px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 4px 0;
        }

        .header-content p {
            color: #666;
            margin: 0;
        }

        .dashboard-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }

        .card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .card-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }

        .card-icon.available {
            background: #e8f5e9;
            color: #2e7d32;
        }

        .card-icon.assigned {
            background: #e3f2fd;
            color: #1976d2;
        }

        .card-icon.maintenance {
            background: #fff3e0;
            color: #f57c00;
        }

        .card-icon.total {
            background: #f3e5f5;
            color: #7b1fa2;
        }

        .card-content {
            display: flex;
            flex-direction: column;
        }

        .card-value {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
        }

        .card-label {
            font-size: 14px;
            color: #666;
        }

        .filters-section {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }

        .search-box {
            flex: 1;
            min-width: 300px;
            position: relative;
        }

        .search-box i {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
        }

        .search-box input {
            width: 100%;
            padding: 12px 12px 12px 40px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
        }

        .filter-group {
            display: flex;
            gap: 12px;
        }

        .filter-group select {
            padding: 12px 16px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            min-width: 150px;
        }

        .table-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            overflow: hidden;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
        }

        .data-table th {
            background: #f8f9fa;
            padding: 14px 16px;
            text-align: left;
            font-weight: 600;
            color: #666;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .data-table td {
            padding: 16px;
            border-top: 1px solid #eee;
        }

        .equipment-name {
            display: flex;
            flex-direction: column;
        }

        .equipment-name .name {
            font-weight: 500;
            color: #1a1a1a;
        }

        .equipment-name .description {
            font-size: 12px;
            color: #999;
        }

        .status-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }

        .status-badge.available {
            background: #e8f5e9;
            color: #2e7d32;
        }

        .status-badge.assigned {
            background: #e3f2fd;
            color: #1976d2;
        }

        .status-badge.in-maintenance {
            background: #fff3e0;
            color: #f57c00;
        }

        .status-badge.out-of-service {
            background: #ffebee;
            color: #c62828;
        }

        .actions-cell {
            display: flex;
            gap: 8px;
        }

        .action-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: #f5f5f5;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .action-btn:hover {
            background: #e0e0e0;
        }

        .action-btn.danger:hover {
            background: #ffebee;
            color: #c62828;
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #999;
        }

        .empty-state i {
            font-size: 48px;
            margin-bottom: 16px;
        }

        .empty-state p {
            margin-bottom: 20px;
        }

        tr.maintenance-due {
            background: #fff8e1;
        }

        tr.overdue {
            background: #ffebee;
        }

        .text-muted {
            color: #999;
        }

        @media (max-width: 768px) {
            .dashboard-cards {
                grid-template-columns: repeat(2, 1fr);
            }

            .page-header {
                flex-direction: column;
                gap: 16px;
            }

            .filters-section {
                flex-direction: column;
            }

            .search-box {
                min-width: 100%;
            }

            .filter-group {
                flex-wrap: wrap;
            }
        }
    `]
})
export class EquipmentListComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    equipment: Equipment[] = [];
    filteredEquipment: Equipment[] = [];
    equipmentTypes: EquipmentType[] = [];
    dashboard: EquipmentDashboard | null = null;
    statistics: EquipmentStatistics | null = null;

    searchTerm = '';
    statusFilter = '';
    typeFilter = '';

    constructor(private equipmentService: EquipmentService) { }

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadData(): void {
        this.equipmentService.getEquipment()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.equipment = data;
                this.filteredEquipment = data;
            });

        this.equipmentService.getEquipmentTypes()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.equipmentTypes = data;
            });

        this.equipmentService.getDashboard()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.dashboard = data;
            });

        this.equipmentService.getEquipmentStatistics()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.statistics = data;
            });
    }

    filterEquipment(): void {
        this.filteredEquipment = this.equipment.filter(eq => {
            const matchesSearch = !this.searchTerm ||
                eq.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                eq.serialNumber.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesStatus = !this.statusFilter || eq.status === this.statusFilter;
            const matchesType = !this.typeFilter || eq.equipmentTypeId === parseInt(this.typeFilter);

            return matchesSearch && matchesStatus && matchesType;
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Available': return 'available';
            case 'Assigned': return 'assigned';
            case 'InMaintenance': return 'in-maintenance';
            case 'OutOfService': return 'out-of-service';
            default: return '';
        }
    }

    assignEquipment(equipment: Equipment): void {
        console.log('Assign equipment:', equipment);
    }

    deleteEquipment(equipment: Equipment): void {
        if (confirm(`Are you sure you want to delete "${equipment.name}"?`)) {
            this.equipmentService.deleteEquipment(equipment.id).subscribe({
                next: () => {
                    this.loadData();
                }
            });
        }
    }
}
