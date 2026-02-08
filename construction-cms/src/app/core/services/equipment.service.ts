import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Equipment Interfaces
export interface EquipmentType {
    id: number;
    name: string;
    description?: string;
    code?: string;
    icon?: string;
    defaultHourlyRate?: number;
    defaultDailyRate?: number;
    defaultMonthlyRate?: number;
    isActive: boolean;
    companyId?: number;
    createdAt: string;
    equipmentCount?: number;
}

export interface Equipment {
    id: number;
    name: string;
    description?: string;
    serialNumber: string;
    barcode?: string;
    equipmentTypeId: number;
    equipmentTypeName?: string;
    manufacturer?: string;
    modelNumber?: string;
    yearOfManufacture?: number;
    status: string;
    statusName: string;
    purchaseDate?: string;
    purchasePrice?: number;
    currentValue?: number;
    operatingHours: number;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    insuranceExpiryDate?: string;
    registrationExpiryDate?: string;
    currentLocation?: string;
    storageLocation?: string;
    specifications?: string;
    notes?: string;
    imageUrl?: string;
    isActive: boolean;
    isAvailableForRental: boolean;
    hasGpsTracking?: boolean;
    gpsDeviceId?: string;
    companyId?: number;
    createdAt: string;
    updatedAt?: string;
    assignedProjectId?: number;
    assignedProjectName?: string;
    daysUntilMaintenance?: number;
    isMaintenanceDue?: boolean;
}

export interface EquipmentAssignment {
    id: number;
    equipmentId: number;
    equipmentName?: string;
    equipmentSerialNumber?: string;
    projectId?: number;
    projectName?: string;
    assignedToUserId?: number;
    assignedToUserName?: string;
    assignmentType: string;
    assignmentTypeName: string;
    startDate: string;
    endDate?: string;
    actualReturnDate?: string;
    status: string;
    statusName: string;
    conditionAtAssignment?: string;
    conditionAtReturn?: string;
    fuelLevelAtAssignment?: number;
    fuelLevelAtReturn?: number;
    operatingHoursAtAssignment?: number;
    operatingHoursAtReturn?: number;
    purpose?: string;
    notes?: string;
    assignedByUserId?: number;
    assignedByUserName?: string;
    returnApprovedByUserId?: number;
    returnApprovedByUserName?: string;
    companyId?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface EquipmentMaintenance {
    id: number;
    equipmentId: number;
    equipmentName?: string;
    equipmentSerialNumber?: string;
    maintenanceType: string;
    maintenanceTypeName: string;
    status: string;
    statusName: string;
    scheduledDate: string;
    actualDate?: string;
    serviceProvider?: string;
    serviceProviderContact?: string;
    serviceProviderPhone?: string;
    workOrderNumber?: string;
    invoiceNumber?: string;
    cost?: number;
    laborHours?: number;
    partsUsed?: string;
    description?: string;
    issuesFound?: string;
    recommendations?: string;
    nextMaintenanceDue?: string;
    nextMaintenanceHours?: number;
    operatingHoursAtMaintenance?: number;
    isWarrantyRepair?: boolean;
    performedByUserId?: number;
    performedByUserName?: string;
    attachedDocuments?: string;
    companyId?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface EquipmentUtilization {
    id: number;
    equipmentId: number;
    equipmentName?: string;
    equipmentSerialNumber?: string;
    projectId?: number;
    projectName?: string;
    utilizationDate: string;
    startTime: string;
    endTime: string;
    totalHours: number;
    productiveHours: number;
    idleHours: number;
    downtimeHours: number;
    fuelConsumed?: number;
    utilizationType: string;
    utilizationTypeName: string;
    workPerformed?: string;
    operatorName?: string;
    operatorUserId?: number;
    operatorUserName?: string;
    location?: string;
    weatherConditions?: string;
    notes?: string;
    isBillable: boolean;
    billingRate?: number;
    billingAmount?: number;
    recordedByUserId?: number;
    recordedByUserName?: string;
    companyId?: number;
    createdAt: string;
}

export interface EquipmentStatistics {
    totalCount: number;
    availableCount: number;
    assignedCount: number;
    maintenanceCount: number;
    outOfServiceCount: number;
    totalValue: number;
    totalOperatingHours: number;
    averageUtilization: number;
    totalMaintenanceCost: number;
    maintenanceCountThisMonth: number;
    assignmentsThisMonth: number;
}

export interface EquipmentDashboard {
    totalEquipment: number;
    availableEquipment: number;
    assignedEquipment: number;
    inMaintenanceEquipment: number;
    outOfServiceEquipment: number;
    overdueAssignments: number;
    upcomingMaintenance: number;
    pendingMaintenance: number;
    averageUtilizationRate: number;
    topEquipmentTypes: EquipmentType[];
    upcomingMaintenances: EquipmentMaintenance[];
    activeAssignments: EquipmentAssignment[];
}

export interface CreateEquipmentTypeRequest {
    name: string;
    description?: string;
    code?: string;
    icon?: string;
    defaultHourlyRate?: number;
    defaultDailyRate?: number;
    defaultMonthlyRate?: number;
    isActive?: boolean;
}

export interface UpdateEquipmentTypeRequest {
    name?: string;
    description?: string;
    code?: string;
    icon?: string;
    defaultHourlyRate?: number;
    defaultDailyRate?: number;
    defaultMonthlyRate?: number;
    isActive?: boolean;
}

export interface CreateEquipmentRequest {
    name: string;
    description?: string;
    serialNumber: string;
    barcode?: string;
    equipmentTypeId: number;
    manufacturer?: string;
    modelNumber?: string;
    yearOfManufacture?: number;
    status?: string;
    purchaseDate?: string;
    purchasePrice?: number;
    currentValue?: number;
    operatingHours?: number;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    insuranceExpiryDate?: string;
    registrationExpiryDate?: string;
    currentLocation?: string;
    storageLocation?: string;
    specifications?: string;
    notes?: string;
    imageUrl?: string;
    isActive?: boolean;
    isAvailableForRental?: boolean;
    hasGpsTracking?: boolean;
    gpsDeviceId?: string;
}

export interface UpdateEquipmentRequest {
    name?: string;
    description?: string;
    serialNumber?: string;
    barcode?: string;
    equipmentTypeId?: number;
    manufacturer?: string;
    modelNumber?: string;
    yearOfManufacture?: number;
    status?: string;
    purchaseDate?: string;
    purchasePrice?: number;
    currentValue?: number;
    operatingHours?: number;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    insuranceExpiryDate?: string;
    registrationExpiryDate?: string;
    currentLocation?: string;
    storageLocation?: string;
    specifications?: string;
    notes?: string;
    imageUrl?: string;
    isActive?: boolean;
    isAvailableForRental?: boolean;
    hasGpsTracking?: boolean;
    gpsDeviceId?: string;
}

export interface CreateEquipmentAssignmentRequest {
    equipmentId: number;
    projectId?: number;
    assignedToUserId?: number;
    assignmentType: string;
    startDate: string;
    endDate?: string;
    conditionAtAssignment?: string;
    fuelLevelAtAssignment?: number;
    operatingHoursAtAssignment?: number;
    purpose?: string;
    notes?: string;
}

export interface ReturnEquipmentRequest {
    conditionAtReturn?: string;
    fuelLevelAtReturn?: number;
    operatingHoursAtReturn?: number;
    notes?: string;
}

export interface CreateEquipmentMaintenanceRequest {
    equipmentId: number;
    maintenanceType: string;
    scheduledDate: string;
    serviceProvider?: string;
    serviceProviderContact?: string;
    serviceProviderPhone?: string;
    workOrderNumber?: string;
    invoiceNumber?: string;
    cost?: number;
    laborHours?: number;
    partsUsed?: string;
    description?: string;
    issuesFound?: string;
    recommendations?: string;
    nextMaintenanceDue?: string;
    nextMaintenanceHours?: number;
    operatingHoursAtMaintenance?: number;
    isWarrantyRepair?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class EquipmentService {
    private apiUrl = 'api/equipment';

    constructor(private http: HttpClient) { }

    // Helper function to build HttpParams
    private buildParams(params: { [key: string]: any }): HttpParams {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                httpParams = httpParams.set(key, params[key].toString());
            }
        });
        return httpParams;
    }

    // --- Equipment Types ---

    getEquipmentTypes(companyId?: number): Observable<EquipmentType[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<EquipmentType[]>(`${this.apiUrl}/types`, { params });
    }

    getEquipmentType(id: number): Observable<EquipmentType> {
        return this.http.get<EquipmentType>(`${this.apiUrl}/types/${id}`);
    }

    searchEquipmentTypes(searchTerm: string, companyId?: number): Observable<EquipmentType[]> {
        const params = this.buildParams({ searchTerm, companyId });
        return this.http.get<EquipmentType[]>(`${this.apiUrl}/types/search`, { params });
    }

    createEquipmentType(request: CreateEquipmentTypeRequest): Observable<EquipmentType> {
        return this.http.post<EquipmentType>(`${this.apiUrl}/types`, request);
    }

    updateEquipmentType(id: number, request: UpdateEquipmentTypeRequest): Observable<EquipmentType> {
        return this.http.put<EquipmentType>(`${this.apiUrl}/types/${id}`, request);
    }

    deleteEquipmentType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/types/${id}`);
    }

    // --- Equipment ---

    getEquipment(companyId?: number): Observable<Equipment[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<Equipment[]>(this.apiUrl, { params });
    }

    getEquipmentById(id: number): Observable<Equipment> {
        return this.http.get<Equipment>(`${this.apiUrl}/${id}`);
    }

    getEquipmentBySerialNumber(serialNumber: string): Observable<Equipment> {
        return this.http.get<Equipment>(`${this.apiUrl}/serial/${serialNumber}`);
    }

    searchEquipment(searchTerm: string, companyId?: number): Observable<Equipment[]> {
        const params = this.buildParams({ searchTerm, companyId });
        return this.http.get<Equipment[]>(`${this.apiUrl}/search`, { params });
    }

    getEquipmentByStatus(status: string, companyId?: number): Observable<Equipment[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<Equipment[]>(`${this.apiUrl}/status/${status}`, { params });
    }

    getEquipmentByType(typeId: number, companyId?: number): Observable<Equipment[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<Equipment[]>(`${this.apiUrl}/type/${typeId}`, { params });
    }

    getAvailableEquipment(companyId?: number): Observable<Equipment[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<Equipment[]>(`${this.apiUrl}/available`, { params });
    }

    getEquipmentRequiringMaintenance(companyId?: number): Observable<Equipment[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<Equipment[]>(`${this.apiUrl}/maintenance-due`, { params });
    }

    getEquipmentStatistics(companyId?: number): Observable<EquipmentStatistics> {
        const params = this.buildParams({ companyId });
        return this.http.get<EquipmentStatistics>(`${this.apiUrl}/statistics`, { params });
    }

    getDashboard(companyId?: number): Observable<EquipmentDashboard> {
        const params = this.buildParams({ companyId });
        return this.http.get<EquipmentDashboard>(`${this.apiUrl}/dashboard`, { params });
    }

    createEquipment(request: CreateEquipmentRequest): Observable<Equipment> {
        return this.http.post<Equipment>(this.apiUrl, request);
    }

    updateEquipment(id: number, request: UpdateEquipmentRequest): Observable<Equipment> {
        return this.http.put<Equipment>(`${this.apiUrl}/${id}`, request);
    }

    deleteEquipment(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // --- Equipment Assignments ---

    getAssignments(companyId?: number): Observable<EquipmentAssignment[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<EquipmentAssignment[]>(`${this.apiUrl}/assignments`, { params });
    }

    getActiveAssignments(companyId?: number): Observable<EquipmentAssignment[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<EquipmentAssignment[]>(`${this.apiUrl}/assignments/active`, { params });
    }

    getAssignment(id: number): Observable<EquipmentAssignment> {
        return this.http.get<EquipmentAssignment>(`${this.apiUrl}/assignments/${id}`);
    }

    getAssignmentsByEquipment(equipmentId: number): Observable<EquipmentAssignment[]> {
        return this.http.get<EquipmentAssignment[]>(`${this.apiUrl}/equipment/${equipmentId}/assignments`);
    }

    getAssignmentsByProject(projectId: number): Observable<EquipmentAssignment[]> {
        return this.http.get<EquipmentAssignment[]>(`${this.apiUrl}/projects/${projectId}/assignments`);
    }

    hasOverdueAssignments(companyId?: number): Observable<boolean> {
        const params = this.buildParams({ companyId });
        return this.http.get<boolean>(`${this.apiUrl}/assignments/overdue`, { params });
    }

    createAssignment(request: CreateEquipmentAssignmentRequest): Observable<EquipmentAssignment> {
        return this.http.post<EquipmentAssignment>(`${this.apiUrl}/assignments`, request);
    }

    returnEquipment(id: number, request: ReturnEquipmentRequest): Observable<EquipmentAssignment> {
        return this.http.post<EquipmentAssignment>(`${this.apiUrl}/assignments/${id}/return`, request);
    }

    cancelAssignment(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/assignments/${id}/cancel`, {});
    }

    // --- Equipment Maintenance ---

    getMaintenances(companyId?: number): Observable<EquipmentMaintenance[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<EquipmentMaintenance[]>(`${this.apiUrl}/maintenance`, { params });
    }

    getMaintenance(id: number): Observable<EquipmentMaintenance> {
        return this.http.get<EquipmentMaintenance>(`${this.apiUrl}/maintenance/${id}`);
    }

    getMaintenancesByEquipment(equipmentId: number): Observable<EquipmentMaintenance[]> {
        return this.http.get<EquipmentMaintenance[]>(`${this.apiUrl}/equipment/${equipmentId}/maintenance`);
    }

    getUpcomingMaintenance(beforeDate: Date, companyId?: number): Observable<EquipmentMaintenance[]> {
        const params = this.buildParams({ beforeDate: beforeDate.toISOString(), companyId });
        return this.http.get<EquipmentMaintenance[]>(`${this.apiUrl}/maintenance/upcoming`, { params });
    }

    getPendingMaintenance(companyId?: number): Observable<EquipmentMaintenance[]> {
        const params = this.buildParams({ companyId });
        return this.http.get<EquipmentMaintenance[]>(`${this.apiUrl}/maintenance/pending`, { params });
    }

    createMaintenance(request: CreateEquipmentMaintenanceRequest): Observable<EquipmentMaintenance> {
        return this.http.post<EquipmentMaintenance>(`${this.apiUrl}/maintenance`, request);
    }

    startMaintenance(id: number): Observable<EquipmentMaintenance> {
        return this.http.post<EquipmentMaintenance>(`${this.apiUrl}/maintenance/${id}/start`, {});
    }

    completeMaintenance(id: number): Observable<EquipmentMaintenance> {
        return this.http.post<EquipmentMaintenance>(`${this.apiUrl}/maintenance/${id}/complete`, {});
    }

    deleteMaintenance(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/maintenance/${id}`);
    }
}
