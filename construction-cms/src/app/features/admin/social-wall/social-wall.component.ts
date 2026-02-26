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
                            
                            <div class="platform-accent"></div>
                            
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
                        <div class="empty-image-container">
                            <img src="assets/images/social-wall-empty.png" alt="No posts" class="empty-premium-image">
                            <div class="empty-glow"></div>
                        </div>
                        <h3>{{ 'socialWall.noPosts' | translate }}</h3>
                        <p>{{ 'socialWall.noPostsMessage' | translate }}</p>
                    </div>
                }

                <!-- Pagination -->
                @if (totalPages() > 1) {
                    <div class="pagination">
                        <button [disabled]="currentPage() === 1" (click)="previousPage()" class="page-action">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <div class="page-numbers">
                            <span class="page-info">
                                {{ 'socialWall.page' | translate: {current: currentPage(), total: totalPages()} }}
                            </span>
                        </div>
                        <button [disabled]="currentPage() === totalPages()" (click)="nextPage()" class="page-action">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                }
            }

            <!-- Admin Section -->
            @if (isAdmin()) {
                <div class="admin-section">
                    <div class="admin-header">
                        <h2>{{ 'socialWall.admin.sources' | translate }}</h2>
                    </div>
                    
                    <div class="sources-list">
                        @for (source of sources(); track source.id) {
                            <div class="source-item card-glass" [class.inactive]="!source.isActive">
                                <div class="source-info">
                                    <div class="source-icon-wrapper" [class]="source.platform.toLowerCase()">
                                        <i [class]="getPlatformIcon(source.platform)"></i>
                                    </div>
                                    <div class="source-text">
                                        <strong>{{ source.displayName || source.sourceValue }}</strong>
                                        <div class="source-meta">
                                            <span class="source-type-tag">{{ getSourceTypeLabel(source.sourceType) }}</span>
                                            <span class="last-fetch">
                                                <i class="far fa-clock"></i>
                                                {{ source.lastFetchedAt | date:'short' }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="stat-pill">
                                    <span class="stat-value">{{ source.postsCollected }}</span>
                                    <span class="stat-label">Posts</span>
                                </div>
                                <div class="source-actions">
                                    <button class="fetch-btn" (click)="fetchFromSource(source.id)" 
                                            [disabled]="fetchingSourceId() === source.id" title="Fetch Now">
                                        <i class="fas fa-download" [class.spinning]="fetchingSourceId() === source.id"></i>
                                    </button>
                                    <button class="edit-btn" (click)="editSource(source)" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="delete-btn" (click)="deleteSource(source.id)" title="Delete">
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
                        
                        <div class="form-grid">
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

                            <div class="form-group full-width">
                                <label>{{ 'socialWall.admin.sourceValue' | translate }}</label>
                                <input type="text" [(ngModel)]="newSource.sourceValue" 
                                       [placeholder]="'socialWall.admin.sourceValuePlaceholder' | translate">
                            </div>

                            <div class="form-group full-width">
                                <label>{{ 'socialWall.admin.displayName' | translate }}</label>
                                <input type="text" [(ngModel)]="newSource.displayName" 
                                       [placeholder]="'socialWall.admin.displayNamePlaceholder' | translate">
                            </div>
                        </div>

                        <div class="modal-actions">
                            <button class="cancel-btn" (click)="showAddSourceModal = false">
                                {{ 'common.cancel' | translate }}
                            </button>
                            <button class="save-btn" (click)="createSource()" 
                                    [disabled]="!newSource.sourceValue || !newSource.displayName">
                                <i class="fas fa-plus"></i>
                                {{ 'socialWall.admin.addSource' | translate }}
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        .social-wall-container {
            padding: 40px 20px;
            max-width: 1400px;
            margin: 0 auto;
            min-height: 100vh;
        }

        .wall-header {
            text-align: center;
            margin-bottom: 40px;
            
            h1 {
                font-size: 2.5rem;
                font-weight: 800;
                background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 12px;
                letter-spacing: -0.02em;
            }
            
            .subtitle {
                color: #94a3b8;
                font-size: 1.1rem;
                font-weight: 400;
            }
        }

        .filters-section {
            display: flex;
            gap: 20px;
            align-items: flex-end;
            margin-bottom: 40px;
            flex-wrap: wrap;
            padding: 24px;
            background: rgba(30, 41, 59, 0.5);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            
            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
                flex: 1;
                min-width: 200px;
                
                label {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                select, input {
                    padding: 12px 16px;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    font-size: 0.95rem;
                    color: white;
                    width: 100%;
                    outline: none;
                    transition: all 0.2s;
                    
                    &:focus {
                        border-color: #38bdf8;
                        background: rgba(15, 23, 42, 0.8);
                        box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1);
                    }
                    
                    option {
                        background: #1e293b;
                        color: white;
                    }
                }
            }
            
            .refresh-btn {
                padding: 12px 24px;
                background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
                color: white;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: all 0.2s;
                height: 48px;
                
                &:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }
                
                &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            }
        }

        .todays-banner {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 16px;
            margin-bottom: 32px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2);
            animation: pulse-glow 2s infinite ease-in-out;
            
            i {
                font-size: 1.4rem;
            }
            
            span {
                font-weight: 600;
                letter-spacing: 0.01em;
            }
        }

        @keyframes pulse-glow {
            0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
            100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }

        .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 100px 0;
            
            .spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(255, 255, 255, 0.1);
                border-top-color: #38bdf8;
                border-radius: 50%;
                animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            }
            
            p {
                margin-top: 24px;
                color: #94a3b8;
                font-size: 1.1rem;
                font-weight: 500;
            }
        }

        .posts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
            gap: 24px;
        }

        .post-card {
            background: rgba(30, 41, 59, 0.4);
            backdrop-filter: blur(8px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            
            &:hover {
                transform: translateY(-8px);
                border-color: rgba(255, 255, 255, 0.15);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                background: rgba(30, 41, 59, 0.6);
            }
            
            &.facebook { .platform-accent { background: #1877f2; } }
            &.twitter { .platform-accent { background: #1da1f2; } }
            &.linkedin { .platform-accent { background: #0077b5; } }
            &.instagram { .platform-accent { background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); } }
        }

        .platform-accent {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
        }

        .platform-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 14px;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            margin: 20px 20px 12px;
            border-radius: 30px;
            background: rgba(255, 255, 255, 0.05);
            color: #cbd5e1;
            letter-spacing: 0.05em;
            width: fit-content;
        }

        .author-info {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 0 20px 20px;
            
            .avatar {
                width: 48px;
                height: 48px;
                border-radius: 14px;
                object-fit: cover;
                border: 2px solid rgba(255, 255, 255, 0.1);
            }
            
            .avatar-placeholder {
                width: 48px;
                height: 48px;
                border-radius: 14px;
                background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
                display: flex; align-items: center; justify-content: center;
                color: #64748b; border: 2px solid rgba(255, 255, 255, 0.1);
            }
            
            .author-details {
                display: flex;
                flex-direction: column;
                
                .author-name {
                    font-weight: 700;
                    color: #f1f5f9;
                    font-size: 1rem;
                }
                
                .author-handle {
                    font-size: 0.85rem;
                    color: #94a3b8;
                    margin-top: 1px;
                }
            }
        }

        .post-content {
            padding: 0 20px 20px;
            flex-grow: 1;
            
            p {
                color: #cbd5e1;
                line-height: 1.7;
                margin: 0;
                white-space: pre-wrap;
                font-size: 1rem;
            }
            
            .translate-btn {
                margin-top: 16px;
                padding: 8px 16px;
                background: rgba(56, 189, 248, 0.1);
                border: 1px solid rgba(56, 189, 248, 0.2);
                border-radius: 10px;
                color: #38bdf8;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
                
                &:hover {
                    background: rgba(56, 189, 248, 0.2);
                    transform: scale(1.02);
                }
            }
        }

        .post-media {
            padding: 0 20px 20px;
            position: relative;
            
            img {
                width: 100%;
                border-radius: 16px;
                cursor: pointer;
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                
                &:hover {
                    transform: scale(1.02);
                }
            }
            
            &.multiple {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
                
                img {
                    height: 160px;
                    object-fit: cover;
                }
            }
            
            .more-images {
                position: absolute;
                bottom: 28px;
                right: 28px;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(4px);
                color: white;
                padding: 6px 12px;
                border-radius: 10px;
                font-size: 0.9rem;
                font-weight: 700;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        }

        .post-stats {
            display: flex;
            gap: 24px;
            padding: 16px 20px;
            background: rgba(255, 255, 255, 0.02);
            color: #94a3b8;
            font-size: 0.9rem;
            font-weight: 600;
            
            span {
                display: flex;
                align-items: center;
                gap: 6px;
                transition: color 0.2s;
                
                &:hover {
                    color: #f1f5f9;
                }
            }
            
            i {
                font-size: 0.9rem;
                opacity: 0.7;
            }
            
            .fa-heart { color: #f43f5e; }
            .fa-comment { color: #38bdf8; }
            .fa-share { color: #10b981; }
        }

        .post-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            
            .post-date {
                font-size: 0.85rem;
                color: #64748b;
                font-weight: 500;
            }
            
            .view-original {
                font-size: 0.85rem;
                color: #38bdf8;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 6px;
                font-weight: 600;
                
                &:hover {
                    color: #7dd3fc;
                    text-decoration: underline;
                }
            }
        }

        .keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 0 20px 20px;
            
            .keyword-tag {
                padding: 4px 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                font-size: 0.75rem;
                color: #94a3b8;
                font-weight: 600;
            }
        }

        .empty-state {
            text-align: center;
            padding: 80px 20px;
            color: #94a3b8;
            background: rgba(30, 41, 59, 0.3);
            border-radius: 30px;
            border: 2px dashed rgba(255, 255, 255, 0.05);
            
            .empty-image-container {
                position: relative;
                width: 300px;
                margin: 0 auto 32px;
                
                .empty-premium-image {
                    width: 100%;
                    height: auto;
                    border-radius: 20px;
                    position: relative;
                    z-index: 2;
                }
                
                .empty-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 120%;
                    height: 120%;
                    background: radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0) 70%);
                    z-index: 1;
                }
            }
            
            h3 {
                font-size: 1.8rem;
                font-weight: 700;
                color: #f1f5f9;
                margin-bottom: 12px;
            }
            
            p {
                font-size: 1.1rem;
                max-width: 500px;
                margin: 0 auto;
                line-height: 1.6;
            }
        }

        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 32px;
            margin-top: 60px;
            
            .page-action {
                width: 50px;
                height: 50px;
                border-radius: 14px;
                background: rgba(30, 41, 59, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
                
                &:hover:not(:disabled) {
                    background: #38bdf8;
                    border-color: #38bdf8;
                    transform: scale(1.05);
                }
                
                &:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                
                i { font-size: 1rem; }
            }
            
            .page-numbers {
                .page-info {
                    font-size: 1.1rem;
                    color: #94a3b8;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                }
            }
        }

        .admin-section {
            margin-top: 80px;
            padding: 40px;
            background: rgba(30, 41, 59, 0.3);
            backdrop-filter: blur(12px);
            border-radius: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            
            .admin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                
                h2 {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: #f1f5f9;
                }
            }
        }

        .sources-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }

        .source-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px;
            background: rgba(15, 23, 42, 0.4);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.2s;
            
            &:hover {
                background: rgba(15, 23, 42, 0.6);
                border-color: rgba(255, 255, 255, 0.1);
                transform: translateX(4px);
            }
            
            &.inactive { opacity: 0.5; grayscale: 1; }
            
            .source-info {
                display: flex;
                align-items: center;
                gap: 16px;
                
                .source-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    
                    &.facebook { color: #1877f2; background: rgba(24, 119, 242, 0.1); }
                    &.twitter { color: #1da1f2; background: rgba(29, 161, 242, 0.1); }
                    &.linkedin { color: #0077b5; background: rgba(0, 119, 181, 0.1); }
                    &.instagram { color: #e4405f; background: rgba(228, 64, 95, 0.1); }
                }
                
                .source-text {
                    strong {
                        display: block;
                        font-size: 1.05rem;
                        color: #f1f5f9;
                        margin-bottom: 4px;
                    }
                    
                    .source-meta {
                        display: flex;
                        gap: 12px;
                        align-items: center;
                        
                        .source-type-tag {
                            font-size: 0.7rem;
                            font-weight: 700;
                            text-transform: uppercase;
                            color: #64748b;
                            background: rgba(0,0,0,0.2);
                            padding: 2px 8px;
                            border-radius: 4px;
                        }
                        
                        .last-fetch {
                            font-size: 0.75rem;
                            color: #475569;
                        }
                    }
                }
            }
            
            .stat-pill {
                text-align: right;
                .stat-value {
                    display: block;
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #38bdf8;
                }
                .stat-label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #64748b;
                }
            }
            
            .source-actions {
                display: flex;
                gap: 8px;
                margin-left: 20px;
                
                button {
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                    
                    &.fetch-btn { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                    &.edit-btn { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
                    &.delete-btn { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
                    
                    &:hover { transform: scale(1.1); filter: brightness(1.2); }
                }
            }
        }

        .admin-actions {
            display: flex;
            gap: 16px;
            
            button {
                padding: 14px 28px;
                border: none;
                border-radius: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 700;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                
                &.add-source-btn { background: #10b981; color: white; }
                &.fetch-all-btn { background: #38bdf8; color: white; }
                &.translate-all-btn { background: #8b5cf6; color: white; }
                
                &:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                    filter: brightness(1.1);
                }
                &:disabled { opacity: 0.5; transform: none; cursor: not-allowed; }
            }
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }

        .modal-content {
            background: #1e293b;
            padding: 40px;
            border-radius: 30px;
            width: 100%;
            max-width: 600px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 30px 60px rgba(0,0,0,0.5);
            
            h3 {
                font-size: 2rem;
                font-weight: 800;
                color: white;
                margin-bottom: 32px;
                text-align: center;
            }
            
            .form-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 24px;
                
                .form-group {
                    &.full-width { grid-column: span 2; }
                    
                    label {
                        display: block;
                        margin-bottom: 10px;
                        font-weight: 600;
                        color: #94a3b8;
                        font-size: 0.85rem;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }
                    
                    select, input {
                        width: 100%;
                        padding: 14px 18px;
                        background: rgba(15, 23, 42, 0.6);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        color: white;
                        font-size: 1rem;
                        outline: none;
                        transition: all 0.2s;
                        
                        &:focus {
                            border-color: #38bdf8;
                            background: rgba(15, 23, 42, 0.8);
                        }
                    }
                }
            }
            
            .modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 16px;
                margin-top: 40px;
                
                button {
                    padding: 14px 28px;
                    border-radius: 14px;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 1rem;
                    transition: all 0.2s;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    
                    &.cancel-btn { 
                        background: rgba(255, 255, 255, 0.05); 
                        color: #94a3b8;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        &:hover { background: rgba(255, 255, 255, 0.1); color: white; }
                    }
                    
                    &.save-btn { 
                        background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
                        color: white;
                        box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
                        &:hover { transform: translateY(-2px); filter: brightness(1.1); }
                    }
                    
                    &:disabled { opacity: 0.5; transform: none !important; cursor: not-allowed; }
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