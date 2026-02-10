import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateReviewRequest {
    ratedUserId: number;
    rating: number;
    comment?: string;
    title?: string;
    projectId?: number;
}

export interface VendorReview {
    id: number;
    reviewerUserId: number;
    reviewerUser?: any;
    ratedUserId: number;
    ratedUser?: any;
    projectId?: number;
    rating: number;
    comment?: string;
    title?: string;
    reply?: string;
    reviewDate: Date;
    isVerified: boolean;
    isPublic: boolean;
    isApproved: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private apiUrl = '/api/reviews';

    constructor(private http: HttpClient) { }

    createReview(request: CreateReviewRequest): Observable<VendorReview> {
        return this.http.post<VendorReview>(this.apiUrl, request);
    }

    getUserReviews(userId: number): Observable<VendorReview[]> {
        return this.http.get<VendorReview[]>(`${this.apiUrl}/user/${userId}`);
    }

    replyToReview(reviewId: number, reply: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.apiUrl}/${reviewId}/reply`, { reply });
    }

    approveReview(reviewId: number): Observable<boolean> {
        return this.http.post<boolean>(`${this.apiUrl}/${reviewId}/approve`, {});
    }
}
