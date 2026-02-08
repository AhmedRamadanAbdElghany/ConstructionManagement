import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MiscExpenseDto {
    id: number;
    expenseNumber: string;
    categoryId?: number;
    categoryName?: string;
    projectId?: number;
    projectName?: string;
    amount: number;
    description?: string;
    status: string;
    statusName: string;
    expenseDate: string;
    approvedDate?: string;
    approvedByUserId?: number;
    approvedByUserName?: string;
    rejectionReason?: string;
    companyId?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface MiscExpenseSummary {
    totalExpenses: number;
    pendingExpenses: number;
    approvedExpenses: number;
    rejectedExpenses: number;
    totalAmount: number;
    approvedAmount: number;
    pendingAmount: number;
}

export interface CreateMiscExpenseRequest {
    categoryId?: number;
    projectId?: number;
    amount: number;
    description?: string;
    expenseDate: string;
}

export interface ReviewMiscExpenseRequest {
    isApproved: boolean;
    rejectionReason?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MiscExpensesService {
    private apiUrl = 'api/miscexpenses';

    constructor(private http: HttpClient) { }

    // GET: api/miscexpenses
    getExpenses(): Observable<MiscExpenseDto[]> {
        return this.http.get<MiscExpenseDto[]>(this.apiUrl);
    }

    // GET: api/miscexpenses/5
    getExpenseById(id: number): Observable<MiscExpenseDto> {
        return this.http.get<MiscExpenseDto>(this.apiUrl + '/' + id);
    }

    // GET: api/miscexpenses/summary
    getSummary(): Observable<MiscExpenseSummary> {
        return this.http.get<MiscExpenseSummary>(this.apiUrl + '/summary');
    }

    // GET: api/miscexpenses/pending
    getPendingExpenses(): Observable<MiscExpenseDto[]> {
        return this.http.get<MiscExpenseDto[]>(this.apiUrl + '/pending');
    }

    // GET: api/miscexpenses/by-category
    getExpensesByCategory(): Observable<Record<string, number>> {
        return this.http.get<Record<string, number>>(this.apiUrl + '/by-category');
    }

    // POST: api/miscexpenses
    createExpense(request: CreateMiscExpenseRequest): Observable<MiscExpenseDto> {
        return this.http.post<MiscExpenseDto>(this.apiUrl, request);
    }

    // POST: api/miscexpenses/5/review
    reviewExpense(id: number, request: ReviewMiscExpenseRequest): Observable<MiscExpenseDto> {
        return this.http.post<MiscExpenseDto>(this.apiUrl + '/' + id + '/review', request);
    }
}
