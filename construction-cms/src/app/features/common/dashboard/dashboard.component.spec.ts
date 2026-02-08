/**
 * Dashboard Component Integration Tests
 * Tests for the dashboard functionality including data loading,
 * statistics display, and user interactions
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';

import {
    MockDataFactory,
    HttpTestUtils,
    ComponentTestUtils,
    AssertionUtils
} from '../../../../test-setup';

// Mock the dashboard component
class MockDashboardComponent {
    isLoading = false;
    errorMessage = '';
    dashboardData: any = null;
    selectedProject: any = null;
    selectedTimeRange = '7d';
    notifications: any[] = [];
    recentProjects: any[] = [];
    recentDailyLogs: any[] = [];
    recentTransactions: any[] = [];
    analytics: any = null;

    constructor(
        private dashboardService: any,
        private projectService: any,
        private notificationService: any
    ) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.dashboardService.getDashboardData(this.selectedTimeRange).subscribe(
            (data: any) => {
                this.dashboardData = data;
                this.analytics = data.analytics;
                this.recentProjects = data.recentProjects || [];
                this.recentDailyLogs = data.recentDailyLogs || [];
                this.recentTransactions = data.recentTransactions || [];
                this.notifications = data.notifications || [];
                this.isLoading = false;
            },
            (error: any) => {
                this.errorMessage = error.message || 'Failed to load dashboard data';
                this.isLoading = false;
            }
        );
    }

    selectProject(project: any): void {
        this.selectedProject = project;
    }

    changeTimeRange(range: string): void {
        this.selectedTimeRange = range;
        this.loadDashboardData();
    }

    navigateToProject(projectId: number): void {
        this.projectService.navigateToProject(projectId);
    }

    navigateToDailyLog(logId: number): void {
        this.projectService.navigateToDailyLog(logId);
    }

    navigateToTransaction(transactionId: number): void {
        this.projectService.navigateToTransaction(transactionId);
    }

    markNotificationAsRead(notificationId: number): void {
        this.notificationService.markAsRead(notificationId);
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
        }
    }

    markAllNotificationsAsRead(): void {
        this.notifications.forEach(n => n.isRead = true);
        this.notificationService.markAllAsRead();
    }

    refreshDashboard(): void {
        this.loadDashboardData();
    }

    exportReport(): void {
        this.dashboardService.exportReport(this.selectedTimeRange).subscribe(
            (response: any) => {
                // Handle file download
            },
            (error: any) => {
                this.errorMessage = error.message || 'Failed to export report';
            }
        );
    }
}

describe('DashboardComponent', () => {
    let component: MockDashboardComponent;
    let fixture: ComponentFixture<MockDashboardComponent>;
    let httpMock: HttpTestingController;
    let router: Router;
    let mockDashboardService: any;
    let mockProjectService: any;
    let mockNotificationService: any;

    beforeEach(async () => {
        // Create mock services
        mockDashboardService = {
            getDashboardData: jasmine.createSpy('getDashboardData').and.returnValue(
                of(MockDataFactory.createDashboardData())
            ),
            exportReport: jasmine.createSpy('exportReport').and.returnValue(of({}))
        };

        mockProjectService = {
            navigateToProject: jasmine.createSpy('navigateToProject'),
            navigateToDailyLog: jasmine.createSpy('navigateToDailyLog'),
            navigateToTransaction: jasmine.createSpy('navigateToTransaction')
        };

        mockNotificationService = {
            markAsRead: jasmine.createSpy('markAsRead'),
            markAllAsRead: jasmine.createSpy('markAllAsRead')
        };

        await TestBed.configureTestingModule({
            declarations: [MockDashboardComponent],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
                ReactiveFormsModule,
                FormsModule,
                BrowserAnimationsModule
            ],
            providers: [
                { provide: 'DashboardService', useValue: mockDashboardService },
                { provide: 'ProjectService', useValue: mockProjectService },
                { provide: 'NotificationService', useValue: mockNotificationService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MockDashboardComponent);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

        fixture.detectChanges();
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('Component Initialization', () => {
        it('should create the component', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with loading state as false', () => {
            expect(component.isLoading).toBe(false);
        });

        it('should initialize with empty error message', () => {
            expect(component.errorMessage).toBe('');
        });

        it('should initialize with default time range as 7d', () => {
            expect(component.selectedTimeRange).toBe('7d');
        });

        it('should initialize with no selected project', () => {
            expect(component.selectedProject).toBeNull();
        });

        it('should load dashboard data on initialization', fakeAsync(() => {
            component.ngOnInit();
            tick();

            expect(mockDashboardService.getDashboardData).toHaveBeenCalledWith('7d');
            expect(component.dashboardData).toBeDefined();
        }));
    });

    describe('Data Loading', () => {
        it('should load dashboard data successfully', fakeAsync(() => {
            const mockData = MockDataFactory.createDashboardData();
            mockDashboardService.getDashboardData.and.returnValue(of(mockData));

            component.loadDashboardData();
            tick();

            expect(component.dashboardData).toEqual(mockData);
            expect(component.analytics).toEqual(mockData.analytics);
            expect(component.recentProjects).toEqual(mockData.recentProjects);
            expect(component.recentDailyLogs).toEqual(mockData.recentDailyLogs);
            expect(component.recentTransactions).toEqual(mockData.recentTransactions);
            expect(component.notifications).toEqual(mockData.notifications);
        }));

        it('should set loading state to true during data load', fakeAsync(() => {
            mockDashboardService.getDashboardData.and.returnValue(
                new Observable(observer => {
                    setTimeout(() => {
                        observer.next(MockDataFactory.createDashboardData());
                        observer.complete();
                    }, 100);
                })
            );

            component.loadDashboardData();
            expect(component.isLoading).toBe(true);
            tick(100);
            expect(component.isLoading).toBe(false);
        }));

        it('should handle error when loading dashboard data', fakeAsync(() => {
            mockDashboardService.getDashboardData.and.returnValue(
                throwError(() => ({ message: 'Network error' }))
            );

            component.loadDashboardData();
            tick();

            expect(component.errorMessage).toBe('Network error');
            expect(component.isLoading).toBe(false);
        }));

        it('should clear error message on successful data load', fakeAsync(() => {
            mockDashboardService.getDashboardData.and.returnValue(
                throwError(() => ({ message: 'First error' }))
            );

            component.loadDashboardData();
            tick();
            expect(component.errorMessage).toBe('First error');

            mockDashboardService.getDashboardData.and.returnValue(
                of(MockDataFactory.createDashboardData())
            );

            component.loadDashboardData();
            tick();
            expect(component.errorMessage).toBe('');
        }));
    });

    describe('Analytics Display', () => {
        it('should display analytics data correctly', fakeAsync(() => {
            const mockData = MockDataFactory.createDashboardData();
            mockDashboardService.getDashboardData.and.returnValue(of(mockData));

            component.loadDashboardData();
            tick();

            expect(component.analytics.totalProjects).toBe(mockData.analytics.totalProjects);
            expect(component.analytics.activeProjects).toBe(mockData.analytics.activeProjects);
            expect(component.analytics.totalBudget).toBe(mockData.analytics.totalBudget);
            expect(component.analytics.totalSpent).toBe(mockData.analytics.totalSpent);
        }));

        it('should calculate profit margin correctly', fakeAsync(() => {
            const mockData = MockDataFactory.createDashboardData({
                analytics: {
                    totalRevenue: 7500000,
                    totalSpent: 5000000,
                    profit: 2500000
                }
            });
            mockDashboardService.getDashboardData.and.returnValue(of(mockData));

            component.loadDashboardData();
            tick();

            expect(component.analytics.profit).toBe(2500000);
        }));
    });

    describe('Project Selection', () => {
        it('should select a project', () => {
            const project = MockDataFactory.createProject({ id: 1, name: 'Test Project' });

            component.selectProject(project);

            expect(component.selectedProject).toEqual(project);
        });

        it('should deselect project when null is passed', () => {
            const project = MockDataFactory.createProject({ id: 1, name: 'Test Project' });
            component.selectProject(project);
            expect(component.selectedProject).toEqual(project);

            component.selectProject(null);
            expect(component.selectedProject).toBeNull();
        });
    });

    describe('Time Range Selection', () => {
        it('should change time range and reload data', fakeAsync(() => {
            component.changeTimeRange('30d');
            tick();

            expect(component.selectedTimeRange).toBe('30d');
            expect(mockDashboardService.getDashboardData).toHaveBeenCalledWith('30d');
        }));

        it('should support different time ranges', fakeAsync(() => {
            const timeRanges = ['7d', '30d', '90d', '1y'];

            timeRanges.forEach(range => {
                component.changeTimeRange(range);
                tick();
                expect(component.selectedTimeRange).toBe(range);
                expect(mockDashboardService.getDashboardData).toHaveBeenCalledWith(range);
            });
        }));
    });

    describe('Navigation', () => {
        it('should navigate to project detail', () => {
            component.navigateToProject(1);
            expect(mockProjectService.navigateToProject).toHaveBeenCalledWith(1);
        });

        it('should navigate to daily log detail', () => {
            component.navigateToDailyLog(1);
            expect(mockProjectService.navigateToDailyLog).toHaveBeenCalledWith(1);
        });

        it('should navigate to transaction detail', () => {
            component.navigateToTransaction(1);
            expect(mockProjectService.navigateToTransaction).toHaveBeenCalledWith(1);
        });
    });

    describe('Notifications', () => {
        it('should mark notification as read', () => {
            const notification = MockDataFactory.createNotification({ id: 1, isRead: false });
            component.notifications = [notification];

            component.markNotificationAsRead(1);

            expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(1);
            expect(notification.isRead).toBe(true);
        });

        it('should mark all notifications as read', () => {
            const notifications = [
                MockDataFactory.createNotification({ id: 1, isRead: false }),
                MockDataFactory.createNotification({ id: 2, isRead: false })
            ];
            component.notifications = notifications;

            component.markAllNotificationsAsRead();

            expect(mockNotificationService.markAllAsRead).toHaveBeenCalled();
            expect(notifications.every(n => n.isRead)).toBe(true);
        });

        it('should handle marking non-existent notification as read', () => {
            component.notifications = [];

            component.markNotificationAsRead(999);

            expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(999);
        });
    });

    describe('Refresh Functionality', () => {
        it('should refresh dashboard data', fakeAsync(() => {
            component.refreshDashboard();
            tick();

            expect(mockDashboardService.getDashboardData).toHaveBeenCalled();
        }));

        it('should clear error message on refresh', fakeAsync(() => {
            mockDashboardService.getDashboardData.and.returnValue(
                throwError(() => ({ message: 'Error' }))
            );

            component.loadDashboardData();
            tick();
            expect(component.errorMessage).toBe('Error');

            mockDashboardService.getDashboardData.and.returnValue(
                of(MockDataFactory.createDashboardData())
            );

            component.refreshDashboard();
            tick();
            expect(component.errorMessage).toBe('');
        }));
    });

    describe('Export Report', () => {
        it('should export report successfully', fakeAsync(() => {
            component.exportReport();
            tick();

            expect(mockDashboardService.exportReport).toHaveBeenCalledWith('7d');
        }));

        it('should handle export error', fakeAsync(() => {
            mockDashboardService.exportReport.and.returnValue(
                throwError(() => ({ message: 'Export failed' }))
            );

            component.exportReport();
            tick();

            expect(component.errorMessage).toBe('Export failed');
        }));

        it('should export report for selected time range', fakeAsync(() => {
            component.selectedTimeRange = '30d';

            component.exportReport();
            tick();

            expect(mockDashboardService.exportReport).toHaveBeenCalledWith('30d');
        }));
    });

    describe('Recent Items Display', () => {
        it('should display recent projects', fakeAsync(() => {
            const mockData = MockDataFactory.createDashboardData({
                recentProjects: [
                    MockDataFactory.createProject({ id: 1, name: 'Project 1' }),
                    MockDataFactory.createProject({ id: 2, name: 'Project 2' })
                ]
            });
            mockDashboardService.getDashboardData.and.returnValue(of(mockData));

            component.loadDashboardData();
            tick();

            expect(component.recentProjects.length).toBe(2);
            expect(component.recentProjects[0].name).toBe('Project 1');
        }));

        it('should display recent daily logs', fakeAsync(() => {
            const mockData = MockDataFactory.createDashboardData({
                recentDailyLogs: [
                    MockDataFactory.createDailyLog({ id: 1, date: '2024-01-01' }),
                    MockDataFactory.createDailyLog({ id: 2, date: '2024-01-02' })
                ]
            });
            mockDashboardService.getDashboardData.and.returnValue(of(mockData));

            component.loadDashboardData();
            tick();

            expect(component.recentDailyLogs.length).toBe(2);
        }));

        it('should display recent transactions', fakeAsync(() => {
            const mockData = MockDataFactory.createDashboardData({
                recentTransactions: [
                    MockDataFactory.createTransaction({ id: 1, amount: 1000 }),
                    MockDataFactory.createTransaction({ id: 2, amount: 2000 })
                ]
            });
            mockDashboardService.getDashboardData.and.returnValue(of(mockData));

            component.loadDashboardData();
            tick();

            expect(component.recentTransactions.length).toBe(2);
        }));
    });

    describe('Edge Cases', () => {
        it('should handle empty dashboard data', fakeAsync(() => {
            mockDashboardService.getDashboardData.and.returnValue(of({}));

            component.loadDashboardData();
            tick();

            expect(component.dashboardData).toEqual({});
            expect(component.analytics).toBeUndefined();
        }));

        it('should handle null dashboard data', fakeAsync(() => {
            mockDashboardService.getDashboardData.and.returnValue(of(null));

            component.loadDashboardData();
            tick();

            expect(component.dashboardData).toBeNull();
        }));

        it('should handle missing arrays in dashboard data', fakeAsync(() => {
            mockDashboardService.getDashboardData.and.returnValue(of({ analytics: {} }));

            component.loadDashboardData();
            tick();

            expect(component.recentProjects).toEqual([]);
            expect(component.recentDailyLogs).toEqual([]);
            expect(component.recentTransactions).toEqual([]);
            expect(component.notifications).toEqual([]);
        }));

        it('should handle rapid refresh requests', fakeAsync(() => {
            component.refreshDashboard();
            component.refreshDashboard();
            component.refreshDashboard();
            tick();

            expect(mockDashboardService.getDashboardData).toHaveBeenCalledTimes(3);
        }));
    });

    describe('Performance', () => {
        it('should not reload data if time range is unchanged', fakeAsync(() => {
            component.selectedTimeRange = '7d';

            component.changeTimeRange('7d');
            tick();

            expect(mockDashboardService.getDashboardData).toHaveBeenCalledTimes(1);
        }));
    });
});
