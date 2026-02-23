import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SocialMediaPost {
    id: number;
    platform: string;
    originalPostId: string;
    authorName: string;
    authorHandle?: string;
    authorProfileUrl?: string;
    authorAvatarUrl?: string;
    content: string;
    contentArabic?: string;
    mediaUrls: string[];
    postUrl: string;
    postedAt: string;
    fetchedAt: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isConstructionRelated: boolean;
    matchedKeywords?: string;
    sourceId?: number;
    sourceName?: string;
}

export interface SocialMediaSource {
    id: number;
    platform: string;
    sourceType: string;
    sourceValue: string;
    displayName?: string;
    isActive: boolean;
    lastFetchedAt?: string;
    fetchCount: number;
    postsCollected: number;
    lastError?: string;
}

export interface CreateSocialMediaSourceRequest {
    platform: SocialMediaPlatform;
    sourceType: SourceType;
    sourceValue: string;
    displayName?: string;
}

export interface UpdateSocialMediaSourceRequest {
    sourceValue: string;
    displayName?: string;
    isActive: boolean;
}

export interface FetchResult {
    sourceId: number;
    sourceName: string;
    success: boolean;
    postsFetched: number;
    postsSaved: number;
    errorMessage?: string;
    fetchedAt: string;
}

export interface SocialMediaPostsResponse {
    posts: SocialMediaPost[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface TestConnectionsResult {
    overallStatus: string;
    platforms: PlatformConnectionStatus[];
}

export interface PlatformConnectionStatus {
    platform: string;
    isConfigured: boolean;
    message: string;
}

export interface TestTranslationResult {
    provider: string;
    isConfigured: boolean;
    message: string;
}

export interface TestTranslateResponse {
    originalText: string;
    translatedText?: string;
    targetLanguage: string;
    success: boolean;
    error?: string;
}

export enum SocialMediaPlatform {
    Facebook = 1,
    Twitter = 2,
    LinkedIn = 3,
    Instagram = 4
}

export enum SourceType {
    Account = 1,
    Hashtag = 2,
    Keyword = 3
}

@Injectable({
    providedIn: 'root'
})
export class SocialMediaService {
    private baseUrl = '/api/social-media';

    constructor(private http: HttpClient) { }

    // Public endpoints
    getPosts(platform?: SocialMediaPlatform, sourceId?: number, page: number = 1, pageSize: number = 20): Observable<SocialMediaPostsResponse> {
        let params: any = { page, pageSize };
        if (platform) params.platform = platform;
        if (sourceId) params.sourceId = sourceId;
        return this.http.get<SocialMediaPostsResponse>(this.baseUrl, { params });
    }

    getTodaysPosts(): Observable<SocialMediaPost[]> {
        return this.http.get<SocialMediaPost[]>(`${this.baseUrl}/today`);
    }

    getPost(id: number): Observable<SocialMediaPost> {
        return this.http.get<SocialMediaPost>(`${this.baseUrl}/${id}`);
    }

    translatePost(id: number): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/${id}/translate`, {});
    }

    // Admin endpoints
    getSources(activeOnly: boolean = true): Observable<SocialMediaSource[]> {
        return this.http.get<SocialMediaSource[]>(`${this.baseUrl}/sources`, { params: { activeOnly } });
    }

    createSource(request: CreateSocialMediaSourceRequest): Observable<SocialMediaSource> {
        return this.http.post<SocialMediaSource>(`${this.baseUrl}/sources`, request);
    }

    updateSource(id: number, request: UpdateSocialMediaSourceRequest): Observable<SocialMediaSource> {
        return this.http.put<SocialMediaSource>(`${this.baseUrl}/sources/${id}`, request);
    }

    deleteSource(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/sources/${id}`);
    }

    fetchAllPosts(): Observable<FetchResult> {
        return this.http.post<FetchResult>(`${this.baseUrl}/fetch`, {});
    }

    fetchFromSource(sourceId: number): Observable<FetchResult> {
        return this.http.post<FetchResult>(`${this.baseUrl}/fetch/${sourceId}`, {});
    }

    translateAll(): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/translate-all`, {});
    }

    // Test endpoints
    testConnections(): Observable<TestConnectionsResult> {
        return this.http.get<TestConnectionsResult>(`${this.baseUrl}/test/connections`);
    }

    testTranslation(): Observable<TestTranslationResult> {
        return this.http.get<TestTranslationResult>(`${this.baseUrl}/test/translation`);
    }

    testTranslateSample(text: string): Observable<TestTranslateResponse> {
        return this.http.post<TestTranslateResponse>(`${this.baseUrl}/test/translate-sample`, { text });
    }

    getKeywords(): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/test/keywords`);
    }
}