import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum AttendanceStatus {
    Present = 'Present',
    Late = 'Late',
    Absent = 'Absent',
    Excused = 'Excused',
    OnLeave = 'OnLeave'
}

export enum LeaveRequestStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Cancelled = 'Cancelled'
}

export interface AttendanceDto {
    id: number;
    userId: number;
    userFullName: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    status: AttendanceStatus;
    note?: string;
}

export interface LeaveTypeDto {
    id: number;
    name: string;
    description?: string;
    defaultDays: number;
    isPaid: boolean;
    requiresApproval: boolean;
}

export interface PayrollDto {
    id: number;
    userId: number;
    userFullName: string;
    month: number;
    year: number;
    baseSalary: number;
    bonuses: number;
    deductions: number;
    netSalary: number;
    isPaid: boolean;
    paymentDate?: string;
    note?: string;
}

export interface LeaveRequestDto {
    id: number;
    userId: number;
    userFullName: string;
    leaveTypeId: number;
    leaveTypeName: string;
    startDate: string;
    endDate: string;
    reason?: string;
    status: LeaveRequestStatus;
    approvedByUserId?: number;
    approvedByFullName?: string;
    actionDate?: string;
    rejectionReason?: string;
    totalDays: number;
}

export interface CertificationDto {
    id: number;
    userId: number;
    userFullName: string;
    name: string;
    issuingAuthority?: string;
    issueDate?: string;
    expiryDate?: string;
    certificateNumber?: string;
    documentUrl?: string;
    isVerified: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class HrService {
    private http = inject(HttpClient);
    private baseUrl = '/api/HR';

    // Attendance
    getAttendances(date?: string, userId?: number): Observable<AttendanceDto[]> {
        let params = new HttpParams();
        if (date) params = params.set('date', date);
        if (userId) params = params.set('userId', userId.toString());
        return this.http.get<AttendanceDto[]>(`${this.baseUrl}/attendance`, { params });
    }

    checkIn(data: any): Observable<AttendanceDto> {
        return this.http.post<AttendanceDto>(`${this.baseUrl}/attendance/check-in`, data);
    }

    checkOut(data: any): Observable<AttendanceDto> {
        return this.http.post<AttendanceDto>(`${this.baseUrl}/attendance/check-out`, data);
    }

    getTodayAttendance(): Observable<AttendanceDto> {
        return this.http.get<AttendanceDto>(`${this.baseUrl}/attendance/today`);
    }

    // Leave Management
    getLeaveTypes(): Observable<LeaveTypeDto[]> {
        return this.http.get<LeaveTypeDto[]>(`${this.baseUrl}/leave-types`);
    }

    getLeaveRequests(userId?: number): Observable<LeaveRequestDto[]> {
        let params = new HttpParams();
        if (userId) params = params.set('userId', userId.toString());
        return this.http.get<LeaveRequestDto[]>(`${this.baseUrl}/leave-requests`, { params });
    }

    createLeaveRequest(data: any): Observable<LeaveRequestDto> {
        return this.http.post<LeaveRequestDto>(`${this.baseUrl}/leave-requests`, data);
    }

    reviewLeaveRequest(id: number, review: any): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/leave-requests/${id}/review`, review);
    }

    // Certifications
    getCertifications(userId?: number): Observable<CertificationDto[]> {
        let params = new HttpParams();
        if (userId) params = params.set('userId', userId.toString());
        return this.http.get<CertificationDto[]>(`${this.baseUrl}/certifications`, { params });
    }

    createCertification(data: any): Observable<CertificationDto> {
        return this.http.post<CertificationDto>(`${this.baseUrl}/certifications`, data);
    }

    updateCertification(id: number, data: any): Observable<CertificationDto> {
        return this.http.put<CertificationDto>(`${this.baseUrl}/certifications/${id}`, data);
    }

    deleteCertification(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/certifications/${id}`);
    }

    // Payroll
    getPayrolls(month: number, year: number): Observable<PayrollDto[]> {
        return this.http.get<PayrollDto[]>(`${this.baseUrl}/payroll`, { params: { month, year } });
    }

    processPayroll(month: number, year: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/payroll/process`, { month, year });
    }

    markAsPaid(id: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/payroll/${id}/pay`, {});
    }
}
