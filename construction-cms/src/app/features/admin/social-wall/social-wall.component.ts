import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import {
    SocialMediaService,
    SocialMediaPost,
    SocialMediaSource,
    SocialMediaPlatform,
    SourceType,
    FetchResult
} from '../../../core/services/social-media.service';

@Component({
    selector: 'app-social-wall',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
        <div class="social-wall-container">
            <!-- Header -->
            <div class="wall-header">
                <h1>{{ 'socialWall.title' | translate }}</h1>
                <p class="subtitle">{{ 'socialWall.subtitle' | translate }}</p>
            </div>

            <!-- Filters -->
            <div class="filters-section">
                <div class="filter-group">
                    <label>{{ 'socialWall.filterByPlatform' | translate }}</label>
                    <select [(ngModel)]="selectedPlatform" (change)="onFilterChange()">
                        <option [ngValue]="null">{{ 'socialWall.allPlatforms' | translate }}</option>
                        <option [ngValue]="platforms.Facebook">Facebook</option>
                        <option [ngValue]="platforms.Twitter">Twitter / X</option>
                        <option [ngValue]="platforms.LinkedIn">LinkedIn</option>
                        <option [ngValue]="platforms.Instagram">Instagram</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>{{ 'socialWall.filterBySource' | translate }}</label>
                    <select [(ngModel)]="selectedSourceId" (change)="onFilterChange()">
                        <option [ngValue]="null">{{ 'socialWall.allSources' | translate }}</option>
                        @for (source of sources(); track source.id) {
                            <option [ngValue]="source.id">{{ source.displayName || source.sourceValue }}</option>
                        }
                    </select>
                </div>

                <div class="filter-group">
                    <label>{{ 'socialWall.language' | translate }}</label>
                    <select [(ngModel)]="showArabic">
                        <option [ngValue]="false">{{ 'socialWall.original' | translate }}</option>
                        <option [ngValue]="true">{{ 'socialWall.arabic' | translate }}</option>
                    </select>
                </div>

                <button class="refresh-btn" (click)="refreshPosts()" [disabled]="loading()">
                    <i class="fas fa-sync-alt" [class.spinning]="loading()"></i>
                    {{ 'socialWall.refresh' | translate }}
                </button>
            </div>

            <!-- Today's Posts Banner -->
            @if (showTodaysBanner()) {
                <div class="todays-banner">
                    <i class="fas fa-fire"></i>
                    <span>{{ 'socialWall.todaysPosts' | translate: {count: todaysCount()} }}</span>
                </div>
            }

            <!-- Loading State -->
            @if (loading()) {
                <div class="loading-container">
                    <div class="spinner"></div>
                    <p>{{ 'socialWall.loading' | translate }}</p>
                </div>
            }

            <!-- Posts Grid -->
            @if (!loading()) {
                <div class="posts-grid">
                    @for (post of paginatedPosts(); track post.id) {
                        <div class="post-card" [class.facebook]="post.platform === 'Facebook'" 
                             [class.twitter]="post.platform === 'Twitter'" 
                             [class.linkedin]="post.platform === 'LinkedIn'"
                             [class.instagram]="post.platform === 'Instagram'">
                            
                            <!-- Platform Badge -->
                            <div class="platform-badge">
                                <i [class]="getPlatformIcon(post.platform)"></i>
                                {{ post.platform }}
                            </div>

                            <!-- Author Info -->
                            <div class="author-info">
                                @if (post.authorAvatarUrl) {
                                    <img [src]="post.authorAvatarUrl" [alt]="post.authorName" class="avatar">
                                } @else {
                                    <div class="avatar-placeholder">
                                        <i class="fas fa-user"></i>
                                    </div>
                                }
                                <div class="author-details">
                                    <span class="author-name">{{ post.authorName }}</span>
                                    @if (post.authorHandle) {
                                        <span class="author-handle">{{ post.authorHandle }}</span>
                                    }
                                </div>
                            </div>

                            <!-- Post Content -->
                            <div class="post-content">
                                <p>{{ showArabic && post.contentArabic ? post.contentArabic : post.content }}</p>
                                @if (showArabic && !post.contentArabic) {
                                    <button class="translate-btn" (click)="translatePost(post)">
                                        <i class="fas fa-language"></i>
                                        {{ 'socialWall.translate' | translate }}
                                    </button>
                                }
                            </div>

                            <!-- Media -->
                            @if (post.mediaUrls && post.mediaUrls.length > 0) {
                                <div class="post-media" [class.multiple]="post.mediaUrls.length > 1">
                                    @for (media of post.mediaUrls.slice(0, 4); track $index) {
                                        <img [src]="media" [alt]="'Image ' + ($index + 1)" 
                                             (click)="openMediaViewer(post.mediaUrls, $index)">
                                    }
                                    @if (post.mediaUrls.length > 4) {
                                        <div class="more-images">+{{ post.mediaUrls.length - 4 }}</div>
                                    }
                                </div>
                            }

                            <!-- Post Stats -->
                            <div class="post-stats">
                                @if (post.likesCount > 0) {
                                    <span><i class="fas fa-heart"></i> {{ formatNumber(post.likesCount) }}</span>
                                }
                                @if (post.commentsCount > 0) {
                                    <span><i class="fas fa-comment"></i> {{ formatNumber(post.commentsCount) }}</span>
                                }
                                @if (post.sharesCount > 0) {
                                    <span><i class="fas fa-share"></i> {{ formatNumber(post.sharesCount) }}</span>
                                }
                            </div>

                            <!-- Post Footer -->
                            <div class="post-footer">
                                <span class="post-date">{{ formatDate(post.postedAt) }}</span>
                                <a [href]="post.postUrl" target="_blank" rel="noopener" class="view-original">
                                    <i class="fas fa-external-link-alt"></i>
                                    {{ 'socialWall.viewOriginal' | translate }}
                                </a>
                            </div>

                            <!-- Construction Keywords -->
                            @if (post.matchedKeywords) {
                                <div class="keywords">
                                    @for (keyword of post.matchedKeywords.split(','); track $index) {
                                        <span class="keyword-tag">{{ keyword.trim() }}</span>
                                    }
                                </div>
                            }
                        </div>
                    }
                </div>

                <!-- Empty State -->
                @if (posts().length === 0) {
                    <div class="empty-state">
                        <i class="fas fa-newspaper"></i>
                        <h3>{{ 'socialWall.noPosts' | translate }}</h3>
                        <p>{{ 'socialWall.noPostsMessage' | translate }}</p>
                    </div>
                }

                <!-- Pagination -->
                @if (totalPages() > 1) {
                    <div class="pagination">
                        <button [disabled]="currentPage() === 1" (click)="previousPage()">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <span class="page-info">
                            {{ 'socialWall.page' | translate: {current: currentPage(), total: totalPages()} }}
                        </span>
                        <button [disabled]="currentPage() === totalPages()" (click)="nextPage()">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                }
            }

            <!-- Admin Section -->
            @if (isAdmin()) {
                <div class="admin-section">
                    <h2>{{ 'socialWall.admin.sources' | translate }}</h2>
                    
                    <div class="sources-list">
                        @for (source of sources(); track source.id) {
                            <div class="source-item" [class.inactive]="!source.isActive">
                                <div class="source-info">
                                    <i [class]="getPlatformIcon(source.platform)"></i>
                                    <div>
                                        <strong>{{ source.displayName || source.sourceValue }}</strong>
                                        <span class="source-type">{{ getSourceTypeLabel(source.sourceType) }}</span>
                                    </div>
                                </div>
                                <div class="source-stats">
                                    <span>{{ 'socialWall.admin.postsCollected' | translate: {count: source.postsCollected} }}</span>
                                    <span>{{ 'socialWall.admin.lastFetch' | translate: {time: source.lastFetchedAt | date:'short'} }}</span>
                                </div>
                                <div class="source-actions">
                                    <button class="fetch-btn" (click)="fetchFromSource(source.id)" 
                                            [disabled]="fetchingSourceId() === source.id">
                                        <i class="fas fa-download" [class.spinning]="fetchingSourceId() === source.id"></i>
                                    </button>
                                    <button class="edit-btn" (click)="editSource(source)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="delete-btn" (click)="deleteSource(source.id)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        }
                    </div>

                    <div class="admin-actions">
                        <button class="add-source-btn" (click)="showAddSourceModal = true">
                            <i class="fas fa-plus"></i>
                            {{ 'socialWall.admin.addSource' | translate }}
                        </button>
                        <button class="fetch-all-btn" (click)="fetchAllPosts()" [disabled]="fetchingAll()">
                            <i class="fas fa-sync-alt" [class.spinning]="fetchingAll()"></i>
                            {{ 'socialWall.admin.fetchAll' | translate }}
                        </button>
                        <button class="translate-all-btn" (click)="translateAllPosts()" [disabled]="translatingAll()">
                            <i class="fas fa-language" [class.spinning]="translatingAll()"></i>
                            {{ 'socialWall.admin.translateAll' | translate }}
                        </button>
                    </div>
                </div>
            }

            <!-- Add Source Modal -->
            @if (showAddSourceModal) {
                <div class="modal-overlay" (click)="showAddSourceModal = false">
                    <div class="modal-content" (click)="$event.stopPropagation()">
                        <h3>{{ 'socialWall.admin.addSource' | translate }}</h3>
                        
                        <div class="form-group">
                            <label>{{ 'socialWall.admin.platform' | translate }}</label>
                            <select [(ngModel)]="newSource.platform">
                                <option [ngValue]="platforms.Facebook">Facebook</option>
                                <option [ngValue]="platforms.Twitter">Twitter / X</option>
                                <option [ngValue]="platforms.LinkedIn">LinkedIn</option>
                                <option [ngValue]="platforms.Instagram">Instagram</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>{{ 'socialWall.admin.sourceType' | translate }}</label>
                            <select [(ngModel)]="newSource.sourceType">
                                <option [ngValue]="sourceTypes.Account">{{ 'socialWall.admin.account' | translate }}</option>
                                <option [ngValue]="sourceTypes.Hashtag">{{ 'socialWall.admin.hashtag' | translate }}</option>
                                <option [ngValue]="sourceTypes.Keyword">{{ 'socialWall.admin.keyword' | translate }}</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>{{ 'socialWall.admin.sourceValue' | translate }}</label>
                            <input type="text" [(ngModel)]="newSource.sourceValue" 
                                   [placeholder]="'socialWall.admin.sourceValuePlaceholder' | translate">
                        </div>

                        <div class="form-group">
                            <label>{{ 'socialWall.admin.displayName' | translate }}</label>
                            <input type="text" [(ngModel)]="newSource.displayName" 
                                   [placeholder]="'socialWall.admin.displayNamePlaceholder' | translate">
                        </div>

                        <div class="modal-actions">
                            <button class="cancel-btn" (click)="showAddSourceModal = false">
                                {{ 'common.cancel' | translate }}
                            </button>
                            <button class="save-btn" (click)="createSource()" [disabled]="!newSource.sourceValue">
                                {{ 'common.save' | translate }}
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        .social-wall-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .wall-header {
            text-align: center;
            margin-bottom: 30px;
            
            h1 {
                font-size: 2rem;
                color: #1a365d;
                margin-bottom: 8px;
            }
            
            .subtitle {
                color: #718096;
                font-size: 1rem;
            }
        }

        .filters-section {
            display: flex;
            gap: 16px;
            align-items: flex-end;
            margin-bottom: 24px;
            flex-wrap: wrap;
            
            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
                
                label {
                    font-size: 0.85rem;
                    color: #4a5568;
                    font-weight: 500;
                }
                
                select, input {
                    padding: 8px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    min-width: 150px;
                }
            }
            
            .refresh-btn {
                padding: 8px 16px;
                background: #3182ce;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                
                &:hover:not(:disabled) {
                    background: #2c5282;
                }
                
                &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            }
        }

        .todays-banner {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
            
            i {
                font-size: 1.2rem;
            }
        }

        .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px;
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #e2e8f0;
                border-top-color: #3182ce;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            p {
                margin-top: 16px;
                color: #718096;
            }
        }

        .posts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
        }

        .post-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
            
            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            }
            
            &.facebook { border-top: 4px solid #1877f2; }
            &.twitter { border-top: 4px solid #1da1f2; }
            &.linkedin { border-top: 4px solid #0077b5; }
            &.instagram { border-top: 4px solid #e4405f; }
        }

        .platform-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            margin: 12px;
            border-radius: 4px;
            background: #f7fafc;
            color: #4a5568;
        }

        .author-info {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 16px 12px;
            
            .avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
            }
            
            .avatar-placeholder {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #e2e8f0;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #a0aec0;
            }
            
            .author-details {
                display: flex;
                flex-direction: column;
                
                .author-name {
                    font-weight: 600;
                    color: #2d3748;
                }
                
                .author-handle {
                    font-size: 0.85rem;
                    color: #718096;
                }
            }
        }

        .post-content {
            padding: 0 16px 12px;
            
            p {
                color: #2d3748;
                line-height: 1.6;
                margin: 0;
                white-space: pre-wrap;
            }
            
            .translate-btn {
                margin-top: 8px;
                padding: 4px 10px;
                background: #edf2f7;
                border: none;
                border-radius: 4px;
                color: #4a5568;
                font-size: 0.8rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                
                &:hover {
                    background: #e2e8f0;
                }
            }
        }

        .post-media {
            padding: 0 16px 12px;
            
            img {
                width: 100%;
                border-radius: 8px;
                cursor: pointer;
                transition: opacity 0.2s;
                
                &:hover {
                    opacity: 0.9;
                }
            }
            
            &.multiple {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 4px;
                
                img {
                    height: 120px;
                    object-fit: cover;
                }
            }
            
            .more-images {
                position: absolute;
                bottom: 8px;
                right: 8px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
            }
        }

        .post-stats {
            display: flex;
            gap: 16px;
            padding: 12px 16px;
            border-top: 1px solid #f0f0f0;
            color: #718096;
            font-size: 0.85rem;
            
            span {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            i {
                color: #a0aec0;
            }
        }

        .post-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-top: 1px solid #f0f0f0;
            
            .post-date {
                font-size: 0.8rem;
                color: #a0aec0;
            }
            
            .view-original {
                font-size: 0.85rem;
                color: #3182ce;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 4px;
                
                &:hover {
                    text-decoration: underline;
                }
            }
        }

        .keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            padding: 8px 16px;
            border-top: 1px solid #f0f0f0;
            
            .keyword-tag {
                padding: 2px 8px;
                background: #edf2f7;
                border-radius: 12px;
                font-size: 0.75rem;
                color: #4a5568;
            }
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #718096;
            
            i {
                font-size: 3rem;
                margin-bottom: 16px;
                color: #cbd5e0;
            }
            
            h3 {
                margin-bottom: 8px;
                color: #4a5568;
            }
        }

        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 16px;
            margin-top: 32px;
            
            button {
                padding: 8px 16px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                cursor: pointer;
                
                &:hover:not(:disabled) {
                    background: #f7fafc;
                }
                
                &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            }
            
            .page-info {
                color: #4a5568;
            }
        }

        .admin-section {
            margin-top: 48px;
            padding-top: 32px;
            border-top: 2px solid #e2e8f0;
            
            h2 {
                color: #2d3748;
                margin-bottom: 20px;
            }
        }

        .sources-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
        }

        .source-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            
            &.inactive {
                opacity: 0.6;
            }
            
            .source-info {
                display: flex;
                align-items: center;
                gap: 12px;
                
                i {
                    font-size: 1.5rem;
                    width: 24px;
                    text-align: center;
                }
                
                .source-type {
                    font-size: 0.8rem;
                    color: #718096;
                    margin-left: 8px;
                }
            }
            
            .source-stats {
                display: flex;
                gap: 20px;
                font-size: 0.85rem;
                color: #718096;
            }
            
            .source-actions {
                display: flex;
                gap: 8px;
                
                button {
                    padding: 6px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    
                    &.fetch-btn { background: #c6f6d5; color: #276749; }
                    &.edit-btn { background: #bee3f8; color: #2b6cb0; }
                    &.delete-btn { background: #fed7d7; color: #c53030; }
                    
                    &:hover { opacity: 0.8; }
                }
            }
        }

        .admin-actions {
            display: flex;
            gap: 12px;
            
            button {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                
                &.add-source-btn { background: #48bb78; color: white; }
                &.fetch-all-btn { background: #4299e1; color: white; }
                &.translate-all-btn { background: #9f7aea; color: white; }
                
                &:hover { opacity: 0.9; }
                &:disabled { opacity: 0.6; cursor: not-allowed; }
            }
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal-content {
            background: white;
            padding: 24px;
            border-radius: 12px;
            width: 100%;
            max-width: 500px;
            
            h3 {
                margin-bottom: 20px;
                color: #2d3748;
            }
            
            .form-group {
                margin-bottom: 16px;
                
                label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: #4a5568;
                }
                
                select, input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                }
            }
            
            .modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                margin-top: 24px;
                
                button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    
                    &.cancel-btn { background: #edf2f7; color: #4a5568; }
                    &.save-btn { background: #3182ce; color: white; }
                    
                    &:disabled { opacity: 0.6; cursor: not-allowed; }
                }
            }
        }

        .spinning {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Platform icon colors */
        .fa-facebook { color: #1877f2; }
        .fa-twitter { color: #1da1f2; }
        .fa-linkedin { color: #0077b5; }
        .fa-instagram { color: #e4405f; }
    `]
})
export class SocialWallComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Signals for state management
    posts = signal<SocialMediaPost[]>([]);
    sources = signal<SocialMediaSource[]>([]);
    loading = signal(false);
    currentPage = signal(1);
    pageSize = signal(12);
    totalCount = signal(0);
    selectedPlatform = signal<SocialMediaPlatform | null>(null);
    selectedSourceId = signal<number | null>(null);
    showArabic = false;
    todaysCount = signal(0);

    // Admin state
    isAdmin = signal(false);
    showAddSourceModal = false;
    fetchingSourceId = signal<number | null>(null);
    fetchingAll = signal(false);
    translatingAll = signal(false);

    newSource = {
        platform: SocialMediaPlatform.Facebook,
        sourceType: SourceType.Account,
        sourceValue: '',
        displayName: ''
    };

    // Enums for template
    platforms = SocialMediaPlatform;
    sourceTypes = SourceType;

    // Computed values
    totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));

    paginatedPosts = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        const end = start + this.pageSize();
        return this.posts().slice(start, end);
    });

    showTodaysBanner = computed(() => this.todaysCount() > 0);

    constructor(
        private socialMediaService: SocialMediaService,
        private translateService: TranslateService
    ) { }

    ngOnInit(): void {
        this.loadPosts();
        this.loadSources();
        this.checkAdminRole();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadPosts(): void {
        this.loading.set(true);
        this.socialMediaService.getPosts(
            this.selectedPlatform() ?? undefined,
            this.selectedSourceId() ?? undefined,
            1,
            100 // Load more for client-side pagination
        ).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.posts.set(response.posts);
                    this.totalCount.set(response.totalCount);
                    this.loading.set(false);
                },
                error: (error) => {
                    console.error('Error loading posts:', error);
                    this.loading.set(false);
                }
            });

        // Load today's count
        this.socialMediaService.getTodaysPosts()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (posts) => this.todaysCount.set(posts.length)
            });
    }

    loadSources(): void {
        this.socialMediaService.getSources(false)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (sources) => this.sources.set(sources)
            });
    }

    checkAdminRole(): void {
        // Check if user has admin role
        const userRole = localStorage.getItem('userRole');
        this.isAdmin.set(userRole === 'Admin' || userRole === 'SuperAdmin');
    }

    onFilterChange(): void {
        this.currentPage.set(1);
        this.loadPosts();
    }

    refreshPosts(): void {
        this.loadPosts();
    }

    previousPage(): void {
        if (this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
        }
    }

    nextPage(): void {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.update(p => p + 1);
        }
    }

    translatePost(post: SocialMediaPost): void {
        this.socialMediaService.translatePost(post.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    // Reload posts to get translated content
                    this.loadPosts();
                }
            });
    }

    getPlatformIcon(platform: string): string {
        const icons: { [key: string]: string } = {
            'Facebook': 'fab fa-facebook',
            'Twitter': 'fab fa-twitter',
            'LinkedIn': 'fab fa-linkedin',
            'Instagram': 'fab fa-instagram'
        };
        return icons[platform] || 'fas fa-globe';
    }

    getSourceTypeLabel(type: string): string {
        const labels: { [key: string]: string } = {
            'Account': this.translateService.instant('socialWall.admin.account'),
            'Hashtag': this.translateService.instant('socialWall.admin.hashtag'),
            'Keyword': this.translateService.instant('socialWall.admin.keyword')
        };
        return labels[type] || type;
    }

    formatDate(date: string): string {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) {
            return this.translateService.instant('socialWall.timeAgo.minutes', { count: minutes });
        } else if (hours < 24) {
            return this.translateService.instant('socialWall.timeAgo.hours', { count: hours });
        } else if (days < 7) {
            return this.translateService.instant('socialWall.timeAgo.days', { count: days });
        } else {
            return d.toLocaleDateString();
        }
    }

    formatNumber(num: number): string {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    openMediaViewer(urls: string[], index: number): void {
        // Implement media viewer modal
        console.log('Open media viewer:', urls, index);
    }

    // Admin functions
    createSource(): void {
        this.socialMediaService.createSource(this.newSource)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showAddSourceModal = false;
                    this.loadSources();
                    this.newSource = {
                        platform: SocialMediaPlatform.Facebook,
                        sourceType: SourceType.Account,
                        sourceValue: '',
                        displayName: ''
                    };
                }
            });
    }

    editSource(source: SocialMediaSource): void {
        // Implement edit modal
        console.log('Edit source:', source);
    }

    deleteSource(id: number): void {
        if (confirm(this.translateService.instant('socialWall.admin.confirmDelete'))) {
            this.socialMediaService.deleteSource(id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => this.loadSources()
                });
        }
    }

    fetchFromSource(sourceId: number): void {
        this.fetchingSourceId.set(sourceId);
        this.socialMediaService.fetchFromSource(sourceId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result) => {
                    this.fetchingSourceId.set(null);
                    this.loadPosts();
                    this.loadSources();
                },
                error: () => this.fetchingSourceId.set(null)
            });
    }

    fetchAllPosts(): void {
        this.fetchingAll.set(true);
        this.socialMediaService.fetchAllPosts()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.fetchingAll.set(false);
                    this.loadPosts();
                    this.loadSources();
                },
                error: () => this.fetchingAll.set(false)
            });
    }

    translateAllPosts(): void {
        this.translatingAll.set(true);
        this.socialMediaService.translateAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.translatingAll.set(false);
                    this.loadPosts();
                },
                error: () => this.translatingAll.set(false)
            });
    }
}