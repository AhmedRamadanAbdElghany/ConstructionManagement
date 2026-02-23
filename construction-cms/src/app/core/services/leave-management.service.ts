import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Leave Type DTOs
export interface LeaveType {
    id: number;
    name: string;
    description?: string;
    defaultDaysPerYear: number;
    allowCarryOver: boolean;
    maxCarryOverDays: number;
    requiresApproval: boolean;
    isPaid: boolean;
    colorCode: string;
    isActive: boolean;
    companyId?: number;
}

export interface CreateLeaveTypeRequest {
    name: string;
    description?: string;
    defaultDaysPerYear: number;
    allowCarryOver: boolean;
    maxCarryOverDays: number;
    requiresApproval: boolean;
    isPaid: boolean;
    colorCode: string;
}

export interface UpdateLeaveTypeRequest {
    name: string;
    description?: string;
    defaultDaysPerYear: number;
    allowCarryOver: boolean;
    maxCarryOverDays: number;
    requiresApproval: boolean;
    isPaid: boolean;
    colorCode: string;
    isActive: boolean;
}

// Leave Balance DTOs
export interface LeaveBalance {
    id: number;
    userId: number;
    userName: string;
    leaveTypeId: number;
    leaveTypeName: string;
    leaveTypeColor: string;
    year: number;
    totalAllocated: number;
    carriedOver: number;
    usedDays: number;
    pendingDays: number;
    availableDays: number;
}

export interface UserLeaveSummary {
    userId: number;
    userName: string;
    balances: LeaveBalance[];
    upcomingLeaves: UpcomingLeave[];
}

export interface UpcomingLeave {
    id: number;
    leaveTypeName: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    status: string;
}

export interface AdjustLeaveBalanceRequest {
    userId: number;
    leaveTypeId: number;
    year: number;
    adjustment: number;
    reason: string;
}

// Leave Request DTOs
export interface LeaveRequest {
    id: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    leaveTypeId: number;
    leaveTypeName: string;
    leaveTypeColor: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason?: string;
    status: string;
    approvedByUserId?: number;
    approvedByName?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    approverComments?: string;
    createdAt: Date;
    attachments: LeaveRequestAttachment[];
}

export interface LeaveRequestAttachment {
    id: number;
    fileName: string;
    filePath: string;
    contentType?: string;
    fileSize: number;
    uploadedAt: Date;
}

export interface CreateLeaveRequestRequest {
    leaveTypeId: number;
    startDate: Date | string;
    endDate: Date | string;
    reason?: string;
    attachmentIds?: number[];
}

export interface UpdateLeaveRequestRequest {
    leaveTypeId: number;
    startDate: Date | string;
    endDate: Date | string;
    reason?: string;
}

export interface ApproveLeaveRequestRequest {
    comments?: string;
}

export interface RejectLeaveRequestRequest {
    reason: string;
}

// Holiday DTOs
export interface Holiday {
    id: number;
    name: string;
    date: Date;
    isRecurring: boolean;
    companyId?: number;
    description?: string;
}

export interface CreateHolidayRequest {
    name: string;
    date: Date | string;
    isRecurring: boolean;
    description?: string;
}

export interface UpdateHolidayRequest {
    name: string;
    date: Date | string;
    isRecurring: boolean;
    description?: string;
}

// Calendar & Reports
export interface LeaveCalendarDay {
    date: Date;
    isHoliday: boolean;
    holidayName?: string;
    isWeekend: boolean;
    leaves: LeaveCalendarEntry[];
}

export interface LeaveCalendarEntry {
    userId: number;
    userName: string;
    leaveTypeName: string;
    leaveTypeColor: string;
    status: string;
}

export interface LeaveReport {
    totalEmployees: number;
    employeesOnLeaveToday: number;
    totalDaysTakenThisMonth: number;
    totalDaysTakenThisYear: number;
    leaveTypeSummaries: LeaveTypeSummary[];
    monthlyTrends: MonthlyLeaveTrend[];
}

export interface LeaveTypeSummary {
    leaveTypeName: string;
    totalRequests: number;
    approvedRequests: number;
    pendingRequests: number;
    rejectedRequests: number;
    totalDays: number;
}

export interface MonthlyLeaveTrend {
    month: number;
    year: number;
    monthName: string;
    totalDays: number;
    requestCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class LeaveManagementService {
    private apiUrl = '/api/leave-management';

    constructor(private http: HttpClient) { }

    // Leave Types
    getLeaveTypes(companyId?: number): Observable<LeaveType[]> {
        let params = new HttpParams();
        if (companyId) {
            params = params.set('companyId', companyId.toString());
        }
        return this.http.get<LeaveType[]>(`${this.apiUrl}/types`, { params });
    }

    getLeaveType(id: number): Observable<LeaveType> {
        return this.http.get<LeaveType>(`${this.apiUrl}/types/${id}`);
    }

    createLeaveType(request: CreateLeaveTypeRequest, companyId?: number): Observable<LeaveType> {
        let params = new HttpParams();
        if (companyId) {
            params = params.set('companyId', companyId.toString());
        }
        return this.http.post<LeaveType>(`${this.apiUrl}/types`, request, { params });
    }

    updateLeaveType(id: number, request: UpdateLeaveTypeRequest): Observable<LeaveType> {
        return this.http.put<LeaveType>(`${this.apiUrl}/types/${id}`, request);
    }

    deleteLeaveType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/types/${id}`);
    }

    // Leave Balances
    getUserLeaveBalances(userId: number, year?: number): Observable<LeaveBalance[]> {
        let params = new HttpParams();
        if (year) {
            params = params.set('year', year.toString());
        }
        return this.http.get<LeaveBalance[]>(`${this.apiUrl}/balances/user/${userId}`, { params });
    }

    getUserLeaveSummary(userId: number, year?: number): Observable<UserLeaveSummary> {
        let params = new HttpParams();
        if (year) {
            params = params.set('year', year.toString());
        }
        return this.http.get<UserLeaveSummary>(`${this.apiUrl}/balances/summary/${userId}`, { params });
    }

    getTeamLeaveBalances(companyId: number, year?: number): Observable<LeaveBalance[]> {
        let params = new HttpParams().set('companyId', companyId.toString());
        if (year) {
            params = params.set('year', year.toString());
        }
        return this.http.get<LeaveBalance[]>(`${this.apiUrl}/balances/team`, { params });
    }

    adjustLeaveBalance(request: AdjustLeaveBalanceRequest): Observable<LeaveBalance> {
        return this.http.post<LeaveBalance>(`${this.apiUrl}/balances/adjust`, request);
    }

    initializeYearBalances(companyId: number, year: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/balances/initialize`, null, {
            params: { companyId: companyId.toString(), year: year.toString() }
        });
    }

    // Leave Requests
    getLeaveRequests(filter: {
        userId?: number;
        leaveTypeId?: number;
        status?: string;
        fromDate?: Date;
        toDate?: Date;
        companyId?: number;
    }): Observable<LeaveRequest[]> {
        let params = new HttpParams();
        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params = params.set(key, value.toString());
            }
        });
        return this.http.get<LeaveRequest[]>(`${this.apiUrl}/requests`, { params });
    }

    getLeaveRequest(id: number): Observable<LeaveRequest> {
        return this.http.get<LeaveRequest>(`${this.apiUrl}/requests/${id}`);
    }

    getUserLeaveRequests(userId: number, year?: number): Observable<LeaveRequest[]> {
        let params = new HttpParams();
        if (year) {
            params = params.set('year', year.toString());
        }
        return this.http.get<LeaveRequest[]>(`${this.apiUrl}/requests/user/${userId}`, { params });
    }

    getPendingLeaveRequests(companyId: number): Observable<LeaveRequest[]> {
        return this.http.get<LeaveRequest[]>(`${this.apiUrl}/requests/pending`, {
            params: { companyId: companyId.toString() }
        });
    }

    createLeaveRequest(request: CreateLeaveRequestRequest): Observable<LeaveRequest> {
        return this.http.post<LeaveRequest>(`${this.apiUrl}/requests`, request);
    }

    updateLeaveRequest(id: number, request: UpdateLeaveRequestRequest): Observable<LeaveRequest> {
        return this.http.put<LeaveRequest>(`${this.apiUrl}/requests/${id}`, request);
    }

    deleteLeaveRequest(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/requests/${id}`);
    }

    cancelLeaveRequest(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/requests/${id}/cancel`, {});
    }

    approveLeaveRequest(id: number, request: ApproveLeaveRequestRequest): Observable<LeaveRequest> {
        return this.http.post<LeaveRequest>(`${this.apiUrl}/requests/${id}/approve`, request);
    }

    rejectLeaveRequest(id: number, request: RejectLeaveRequestRequest): Observable<LeaveRequest> {
        return this.http.post<LeaveRequest>(`${this.apiUrl}/requests/${id}/reject`, request);
    }

    // Holidays
    getHolidays(companyId?: number, year?: number): Observable<Holiday[]> {
        let params = new HttpParams();
        if (companyId) {
            params = params.set('companyId', companyId.toString());
        }
        if (year) {
            params = params.set('year', year.toString());
        }
        return this.http.get<Holiday[]>(`${this.apiUrl}/holidays`, { params });
    }

    createHoliday(request: CreateHolidayRequest, companyId?: number): Observable<Holiday> {
        let params = new HttpParams();
        if (companyId) {
            params = params.set('companyId', companyId.toString());
        }
        return this.http.post<Holiday>(`${this.apiUrl}/holidays`, request, { params });
    }

    updateHoliday(id: number, request: UpdateHolidayRequest): Observable<Holiday> {
        return this.http.put<Holiday>(`${this.apiUrl}/holidays/${id}`, request);
    }

    deleteHoliday(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/holidays/${id}`);
    }

    // Calendar & Reports
    getLeaveCalendar(companyId: number, startDate: Date, endDate: Date): Observable<LeaveCalendarDay[]> {
        return this.http.get<LeaveCalendarDay[]>(`${this.apiUrl}/calendar`, {
            params: {
                companyId: companyId.toString(),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }
        });
    }

    getLeaveReport(companyId: number, year?: number, month?: number): Observable<LeaveReport> {
        let params = new HttpParams().set('companyId', companyId.toString());
        if (year) {
            params = params.set('year', year.toString());
        }
        if (month) {
            params = params.set('month', month.toString());
        }
        return this.http.get<LeaveReport>(`${this.apiUrl}/report`, { params });
    }

    getTeamOnLeave(companyId: number, date: Date): Observable<LeaveRequest[]> {
        return this.http.get<LeaveRequest[]>(`${this.apiUrl}/team-on-leave`, {
            params: {
                companyId: companyId.toString(),
                date: date.toISOString()
            }
        });
    }

    // Calculations
    calculateLeaveDays(startDate: Date, endDate: Date, companyId?: number): Observable<{ days: number }> {
        let params = new HttpParams()
            .set('startDate', startDate.toISOString())
            .set('endDate', endDate.toISOString());
        if (companyId) {
            params = params.set('companyId', companyId.toString());
        }
        return this.http.get<{ days: number }>(`${this.apiUrl}/calculate-days`, { params });
    }

    checkLeaveBalance(userId: number, leaveTypeId: number, days: number, year?: number): Observable<{ hasBalance: boolean }> {
        let params = new HttpParams()
            .set('userId', userId.toString())
            .set('leaveTypeId', leaveTypeId.toString())
            .set('days', days.toString());
        if (year) {
            params = params.set('year', year.toString());
        }
        return this.http.get<{ hasBalance: boolean }>(`${this.apiUrl}/check-balance`, { params });
    }
}
