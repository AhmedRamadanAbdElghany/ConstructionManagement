import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CashVoucherDto {
    id: number;
    voucherNumber: string;
    amount: number;
    description?: string;
    status: string;
    statusName: string;
    voucherDate: string;
    approvedDate?: string;
    approvedByUserId?: number;
    approvedByUserName?: string;
    rejectionReason?: string;
    companyId?: number;
    projectId?: number;
    projectName?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CashVoucherSummary {
    totalVouchers: number;
    pendingVouchers: number;
    approvedVouchers: number;
    rejectedVouchers: number;
    totalAmount: number;
    approvedAmount: number;
    pendingAmount: number;
}

export interface CreateCashVoucherRequest {
    amount: number;
    description?: string;
    voucherDate: string;
}

export interface ReviewCashVoucherRequest {
    isApproved: boolean;
    rejectionReason?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CashVouchersService {
    private apiUrl = 'api/cash-vouchers';

    constructor(private http: HttpClient) { }

    // GET: api/cash-vouchers
    getVouchers(): Observable<CashVoucherDto[]> {
        return this.http.get<CashVoucherDto[]>(this.apiUrl);
    }

    // GET: api/cash-vouchers/summary
    getSummary(): Observable<CashVoucherSummary> {
        return this.http.get<CashVoucherSummary>(`${this.apiUrl}/summary`);
    }

    // GET: api/cash-vouchers/{id}
    getVoucherById(id: number): Observable<CashVoucherDto> {
        return this.http.get<CashVoucherDto>(`${this.apiUrl}/${id}`);
    }

    // POST: api/cash-vouchers
    createVoucher(request: CreateCashVoucherRequest): Observable<{ voucherId: number }> {
        return this.http.post<{ voucherId: number }>(this.apiUrl, request);
    }

    // POST: api/cash-vouchers/{id}/review
    reviewVoucher(id: number, request: ReviewCashVoucherRequest): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/review`, request);
    }

    // DELETE: api/cash-vouchers/{id}
    deleteVoucher(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
