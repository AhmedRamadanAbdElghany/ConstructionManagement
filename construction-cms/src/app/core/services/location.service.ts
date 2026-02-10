import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NearbySearchRequest {
    latitude: number;
    longitude: number;
    radiusKm: number;
    userType?: number;
    specialization?: string;
    minRating?: number;
    page?: number;
    pageSize?: number;
}

export interface UpdateLocationRequest {
    userId: number;
    latitude: number;
    longitude: number;
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone?: string;
    userType: number;
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    district?: string;
    specialization?: string;
    description?: string;
    profileImageUrl?: string;
    averageRating?: number;
    totalReviews?: number;
    isProfileComplete: boolean;
    hasLocation: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    private apiUrl = '/api/locations';

    constructor(private http: HttpClient) { }

    searchNearby(request: NearbySearchRequest): Observable<User[]> {
        return this.http.post<User[]>(`${this.apiUrl}/search`, request);
    }

    updateLocation(request: UpdateLocationRequest): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/update-location`, request);
    }
}
