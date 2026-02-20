/**
 * Test Setup and Utilities for Angular Integration Tests
 * This file provides common test utilities, mock data factories, and helpers
 */

import { TestBed, ComponentFixture, ComponentFixtureAutoDetect, tick, fakeAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Type } from '@angular/core';

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

export class MockDataFactory {
    /**
     * Generate a mock user
     */
    static createUser(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            email: 'test@example.com',
            fullName: 'Test User',
            companyId: 1,
            role: 'ProjectManager',
            isActive: true,
            createdAt: new Date().toISOString(),
            ...overrides
        };
    }

    /**
     * Generate a mock company
     */
    static createCompany(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            name: 'Test Construction Company',
            address: '123 Test Street',
            phone: '+1234567890',
            email: 'info@testcompany.com',
            isActive: true,
            createdAt: new Date().toISOString(),
            ...overrides
        };
    }

    /**
     * Generate a mock project
     */
    static createProject(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            name: 'Test Project',
            code: 'PRJ-001',
            description: 'Test project description',
            companyId: 1,
            clientId: 1,
            projectManagerId: 1,
            status: 'Active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            budget: 1000000,
            actualCost: 500000,
            progress: 50,
            createdAt: new Date().toISOString(),
            ...overrides
        };
    }

    /**
     * Generate a mock daily log
     */
    static createDailyLog(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            projectId: 1,
            date: new Date().toISOString(),
            weather: 'Sunny',
            temperature: 25,
            notes: 'Daily work completed',
            status: 'Open',
            createdBy: 1,
            createdAt: new Date().toISOString(),
            ...overrides
        };
    }

    /**
     * Generate a mock ProjectItem
     */
    static createProjectItem(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            projectId: 1,
            itemCode: 'PRJ-001',
            itemName: 'Test Project Item',
            unit: 'm2',
            agreedQuantity: 100,
            unitPrice: 50,
            status: 'Active',
            ...overrides
        };
    }

    /**
     * Generate a mock transaction
     */
    static createTransaction(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            projectId: 1,
            projectItemId: 1,
            type: 'Expense',
            amount: 1000,
            description: 'Test transaction',
            date: new Date().toISOString(),
            status: 'Pending',
            createdBy: 1,
            createdAt: new Date().toISOString(),
            ...overrides
        };
    }

    /**
     * Generate a mock equipment
     */
    static createEquipment(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            name: 'Excavator',
            code: 'EQ-001',
            type: 'Heavy Machinery',
            status: 'Available',
            purchaseDate: new Date().toISOString(),
            purchasePrice: 50000,
            currentValue: 40000,
            ...overrides
        };
    }

    /**
     * Generate a mock inventory item
     */
    static createInventoryItem(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            name: 'Cement',
            code: 'INV-001',
            category: 'Materials',
            unit: 'bag',
            quantity: 100,
            minQuantity: 20,
            unitPrice: 10,
            ...overrides
        };
    }

    /**
     * Generate a mock safety training
     */
    static createSafetyTraining(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            title: 'Safety Training',
            description: 'Safety training description',
            date: new Date().toISOString(),
            duration: 2,
            location: 'Site Office',
            instructor: 'John Doe',
            attendees: [],
            projectId: 1,
            ...overrides
        };
    }

    /**
     * Generate a mock document
     */
    static createDocument(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            name: 'Test Document.pdf',
            type: 'PDF',
            size: 1024,
            url: '/documents/test.pdf',
            uploadedBy: 1,
            uploadedAt: new Date().toISOString(),
            projectId: 1,
            category: 'General',
            ...overrides
        };
    }

    /**
     * Generate a mock notification
     */
    static createNotification(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            userId: 1,
            title: 'Test Notification',
            message: 'Test notification message',
            type: 'Info',
            isRead: false,
            createdAt: new Date().toISOString(),
            ...overrides
        };
    }

    /**
     * Generate a mock role
     */
    static createRole(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            name: 'ProjectManager',
            description: 'Project Manager role',
            permissions: ['projects.view', 'projects.create', 'projects.update', 'projects.delete'],
            ...overrides
        };
    }

    /**
     * Generate a mock vendor
     */
    static createVendor(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            name: 'Test Vendor',
            contactPerson: 'John Doe',
            email: 'vendor@test.com',
            phone: '+1234567890',
            address: '123 Vendor Street',
            companyId: 1,
            ...overrides
        };
    }

    /**
     * Generate a mock subcontractor
     */
    static createSubcontractor(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            name: 'Test Subcontractor',
            contactPerson: 'Jane Doe',
            email: 'sub@test.com',
            phone: '+0987654321',
            address: '456 Subcontractor Street',
            companyId: 1,
            ...overrides
        };
    }

    /**
     * Generate a mock invoice
     */
    static createInvoice(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            invoiceNumber: 'INV-001',
            projectId: 1,
            vendorId: 1,
            amount: 10000,
            status: 'Pending',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            issueDate: new Date().toISOString(),
            description: 'Test invoice',
            ...overrides
        };
    }

    /**
     * Generate a mock cash voucher
     */
    static createCashVoucher(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            voucherNumber: 'CV-001',
            projectId: 1,
            amount: 5000,
            status: 'Approved',
            date: new Date().toISOString(),
            description: 'Test cash voucher',
            approvedBy: 1,
            ...overrides
        };
    }

    /**
     * Generate a mock quality check
     */
    static createQualityCheck(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            projectId: 1,
            type: 'Concrete',
            description: 'Quality check description',
            date: new Date().toISOString(),
            result: 'Passed',
            checkedBy: 1,
            notes: 'All checks passed',
            ...overrides
        };
    }

    /**
     * Generate a mock phase
     */
    static createPhase(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            projectId: 1,
            name: 'Foundation',
            description: 'Foundation phase',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'In Progress',
            progress: 50,
            ...overrides
        };
    }

    /**
     * Generate a mock site media
     */
    static createSiteMedia(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            projectId: 1,
            type: 'Photo',
            url: '/media/photo1.jpg',
            caption: 'Site photo',
            uploadedBy: 1,
            uploadedAt: new Date().toISOString(),
            ...overrides
        };
    }

    /**
     * Generate a mock package
     */
    static createPackage(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            name: 'Basic Package',
            description: 'Basic package description',
            price: 1000,
            features: ['Feature 1', 'Feature 2'],
            isActive: true,
            ...overrides
        };
    }

    /**
     * Generate a mock company package
     */
    static createCompanyPackage(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            companyId: 1,
            packageId: 1,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            ...overrides
        };
    }

    /**
     * Generate a mock project team member
     */
    static createProjectTeamMember(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            projectId: 1,
            userId: 1,
            role: 'Site Engineer',
            startDate: new Date().toISOString(),
            endDate: null,
            isActive: true,
            ...overrides
        };
    }

    /**
     * Generate a mock project approval rule
     */
    static createProjectApprovalRule(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            companyId: 1,
            name: 'Budget Approval',
            type: 'Budget',
            threshold: 100000,
            approverRole: 'FinanceManager',
            isActive: true,
            ...overrides
        };
    }

    /**
     * Generate a mock setting
     */
    static createSetting(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            companyId: 1,
            key: 'test.setting',
            value: 'test value',
            description: 'Test setting',
            ...overrides
        };
    }

    /**
     * Generate a mock analytics data
     */
    static createAnalyticsData(overrides: Partial<any> = {}): any {
        return {
            totalProjects: 10,
            activeProjects: 5,
            completedProjects: 3,
            delayedProjects: 2,
            totalBudget: 10000000,
            totalSpent: 5000000,
            totalRevenue: 7500000,
            profit: 2500000,
            ...overrides
        };
    }

    /**
     * Generate a mock profitability data
     */
    static createProfitabilityData(overrides: Partial<any> = {}): any {
        return {
            projectId: 1,
            projectName: 'Test Project',
            budget: 1000000,
            actualCost: 500000,
            revenue: 750000,
            profit: 250000,
            profitMargin: 33.33,
            ...overrides
        };
    }

    /**
     * Generate a mock design
     */
    static createDesign(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            projectId: 1,
            name: 'Design 1',
            description: 'Design description',
            type: 'Architectural',
            url: '/designs/design1.pdf',
            uploadedBy: 1,
            uploadedAt: new Date().toISOString(),
            ...overrides
        };
    }

    /**
     * Generate a mock catalog item
     */
    static createCatalogItem(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            name: 'Catalog Item',
            code: 'CAT-001',
            category: 'Materials',
            unit: 'piece',
            unitPrice: 100,
            description: 'Catalog item description',
            ...overrides
        };
    }

    /**
     * Generate a mock misc expense
     */
    static createMiscExpense(overrides: Partial<any> = {}): any {
        return {
            id: 1,
            projectId: 1,
            description: 'Misc expense',
            amount: 500,
            date: new Date().toISOString(),
            category: 'Office',
            approvedBy: 1,
            ...overrides
        };
    }

    /**
     * Generate a mock client portal data
     */
    static createClientPortalData(overrides: Partial<any> = {}): any {
        return {
            clientId: 1,
            projects: [MockDataFactory.createProject()],
            documents: [MockDataFactory.createDocument()],
            invoices: [MockDataFactory.createInvoice()],
            ...overrides
        };
    }

    /**
     * Generate a mock dashboard data
     */
    static createDashboardData(overrides: Partial<any> = {}): any {
        return {
            analytics: MockDataFactory.createAnalyticsData(),
            recentProjects: [MockDataFactory.createProject()],
            recentDailyLogs: [MockDataFactory.createDailyLog()],
            recentTransactions: [MockDataFactory.createTransaction()],
            notifications: [MockDataFactory.createNotification()],
            ...overrides
        };
    }
}

// ============================================================================
// TEST BED CONFIGURATION
// ============================================================================

export class TestBedConfig {
    /**
     * Configure TestBed with common imports and providers
     */
    static configureTestingModule(config: {
        declarations?: any[];
        imports?: any[];
        providers?: any[];
        schemas?: any[];
    } = {}) {
        TestBed.configureTestingModule({
            declarations: config.declarations || [],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
                ReactiveFormsModule,
                FormsModule,
                BrowserAnimationsModule,
                ...(config.imports || [])
            ],
            providers: config.providers || [],
            schemas: config.schemas || []
        });
    }

    /**
     * Create a component fixture
     */
    static createComponent<T>(component: Type<T>): ComponentFixture<T> {
        TestBed.configureTestingModule({
            declarations: [component],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
                ReactiveFormsModule,
                FormsModule,
                BrowserAnimationsModule
            ]
        });

        return TestBed.createComponent(component);
    }
}

// ============================================================================
// HTTP TESTING UTILITIES
// ============================================================================

export class HttpTestUtils {
    /**
     * Get HttpTestingController from TestBed
     */
    static getHttpController(): HttpTestingController {
        return TestBed.inject(HttpTestingController);
    }

    /**
     * Expect a single HTTP request
     */
    static expectOne(
        url: string,
        method: string = 'GET',
        response: any = {}
    ): void {
        const httpMock = TestBed.inject(HttpTestingController);
        const req = httpMock.expectOne(url);
        expect(req.request.method).toBe(method);
        req.flush(response);
    }

    /**
     * Expect multiple HTTP requests
     */
    static expectMultiple(
        requests: Array<{ url: string; method?: string; response?: any }>
    ): void {
        const httpMock = TestBed.inject(HttpTestingController);
        requests.forEach(({ url, method = 'GET', response = {} }) => {
            const req = httpMock.expectOne(url);
            expect(req.request.method).toBe(method);
            req.flush(response);
        });
    }

    /**
     * Verify no pending requests
     */
    static verify(): void {
        const httpMock = TestBed.inject(HttpTestingController);
        httpMock.verify();
    }

    /**
     * Flush all pending requests
     */
    static flushAll(): void {
        const httpMock = TestBed.inject(HttpTestingController);
        httpMock.match(() => true).forEach(req => req.flush({}));
    }
}

// ============================================================================
// MOCK SERVICE UTILITIES
// ============================================================================

export class MockServiceUtils {
    /**
     * Create a mock service with methods
     */
    static createMockService(methods: { [key: string]: jasmine.Spy }): any {
        const service: any = {};
        Object.keys(methods).forEach(key => {
            service[key] = methods[key];
        });
        return service;
    }

    /**
     * Create a spy that returns an observable
     */
    static createSpyObservable(name: string, returnValue: any = {}): jasmine.Spy {
        return jasmine.createSpy(name).and.returnValue(of(returnValue));
    }

    /**
     * Create a spy that returns an error observable
     */
    static createSpyError(name: string, error: any = {}): jasmine.Spy {
        return jasmine.createSpy(name).and.returnValue(throwError(() => error));
    }

    /**
     * Create a spy that returns a promise
     */
    static createSpyPromise(name: string, returnValue: any = {}): jasmine.Spy {
        return jasmine.createSpy(name).and.returnValue(Promise.resolve(returnValue));
    }

    /**
     * Create a spy that returns a rejected promise
     */
    static createSpyPromiseReject(name: string, error: any = {}): jasmine.Spy {
        return jasmine.createSpy(name).and.returnValue(Promise.reject(error));
    }
}

// ============================================================================
// COMPONENT TESTING UTILITIES
// ============================================================================

export class ComponentTestUtils {
    /**
     * Detect changes in a component
     */
    static detectChanges(fixture: ComponentFixture<any>): void {
        fixture.detectChanges();
    }

    /**
     * Detect changes with tick for async operations
     */
    static detectChangesAsync(fixture: ComponentFixture<any>): void {
        tick();
        fixture.detectChanges();
    }

    /**
     * Get a component instance from fixture
     */
    static getComponent<T>(fixture: ComponentFixture<any>): T {
        return fixture.componentInstance as T;
    }

    /**
     * Get a native element from fixture
     */
    static getNativeElement(fixture: ComponentFixture<any>): any {
        return fixture.nativeElement;
    }

    /**
     * Query an element by CSS selector
     */
    static queryElement(fixture: ComponentFixture<any>, selector: string): any {
        return fixture.nativeElement.querySelector(selector);
    }

    /**
     * Query all elements by CSS selector
     */
    static queryAllElements(fixture: ComponentFixture<any>, selector: string): any[] {
        return Array.from(fixture.nativeElement.querySelectorAll(selector));
    }

    /**
     * Trigger a click event on an element
     */
    static clickElement(fixture: ComponentFixture<any>, selector: string): void {
        const element = this.queryElement(fixture, selector);
        if (element) {
            element.click();
            fixture.detectChanges();
        }
    }

    /**
     * Set input value on an element
     */
    static setInputValue(fixture: ComponentFixture<any>, selector: string, value: string): void {
        const element = this.queryElement(fixture, selector);
        if (element) {
            element.value = value;
            element.dispatchEvent(new Event('input'));
            element.dispatchEvent(new Event('change'));
            fixture.detectChanges();
        }
    }

    /**
     * Check if element exists
     */
    static elementExists(fixture: ComponentFixture<any>, selector: string): boolean {
        return this.queryElement(fixture, selector) !== null;
    }

    /**
     * Check if element has class
     */
    static elementHasClass(fixture: ComponentFixture<any>, selector: string, className: string): boolean {
        const element = this.queryElement(fixture, selector);
        return element ? element.classList.contains(className) : false;
    }

    /**
     * Get element text content
     */
    static getElementText(fixture: ComponentFixture<any>, selector: string): string {
        const element = this.queryElement(fixture, selector);
        return element ? element.textContent?.trim() || '' : '';
    }

    /**
     * Check if element is visible
     */
    static isElementVisible(fixture: ComponentFixture<any>, selector: string): boolean {
        const element = this.queryElement(fixture, selector);
        if (!element) return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
    }

    /**
     * Check if element is disabled
     */
    static isElementDisabled(fixture: ComponentFixture<any>, selector: string): boolean {
        const element = this.queryElement(fixture, selector);
        return element ? element.disabled : false;
    }

    /**
     * Wait for async operations to complete
     */
    static waitForAsync(fixture: ComponentFixture<any>, callback: () => void): void {
        fakeAsync(() => {
            callback();
            tick();
            fixture.detectChanges();
        })();
    }
}

// ============================================================================
// FORM TESTING UTILITIES
// ============================================================================

export class FormTestUtils {
    /**
     * Set form control value
     */
    static setControlValue(form: any, controlName: string, value: any): void {
        form.get(controlName)?.setValue(value);
        form.get(controlName)?.markAsDirty();
        form.get(controlName)?.markAsTouched();
    }

    /**
     * Check if form control is valid
     */
    static isControlValid(form: any, controlName: string): boolean {
        return form.get(controlName)?.valid || false;
    }

    /**
     * Check if form control is invalid
     */
    static isControlInvalid(form: any, controlName: string): boolean {
        return form.get(controlName)?.invalid || false;
    }

    /**
     * Check if form control has error
     */
    static controlHasError(form: any, controlName: string, error: string): boolean {
        return form.get(controlName)?.hasError(error) || false;
    }

    /**
     * Get form control error message
     */
    static getControlError(form: any, controlName: string): string | null {
        const control = form.get(controlName);
        if (!control || !control.errors) return null;
        const firstError = Object.keys(control.errors)[0];
        return firstError || null;
    }

    /**
     * Check if form is valid
     */
    static isFormValid(form: any): boolean {
        return form.valid || false;
    }

    /**
     * Check if form is invalid
     */
    static isFormInvalid(form: any): boolean {
        return form.invalid || false;
    }

    /**
     * Check if form is dirty
     */
    static isFormDirty(form: any): boolean {
        return form.dirty || false;
    }

    /**
     * Check if form is pristine
     */
    static isFormPristine(form: any): boolean {
        return form.pristine || false;
    }

    /**
     * Submit form
     */
    static submitForm(form: any): void {
        form.markAllAsTouched();
        if (form.valid) {
            form.onSubmit(new Event('submit'));
        }
    }
}

// ============================================================================
// ROUTER TESTING UTILITIES
// ============================================================================

export class RouterTestUtils {
    /**
     * Navigate to a route
     */
    static async navigateTo(url: string): Promise<boolean> {
        const router = TestBed.inject(Router);
        return router.navigate([url]);
    }

    /**
     * Get current URL
     */
    static getCurrentUrl(): string {
        const router = TestBed.inject(Router);
        return router.url;
    }

    /**
     * Expect navigation to a specific URL
     */
    static expectNavigation(url: string): void {
        const router = TestBed.inject(Router);
        expect(router.url).toBe(url);
    }
}

// ============================================================================
// DATE TESTING UTILITIES
// ============================================================================

export class DateTestUtils {
    /**
     * Create a mock date
     */
    static createDate(year: number, month: number, day: number): Date {
        return new Date(year, month - 1, day);
    }

    /**
     * Format date to ISO string
     */
    static toISOString(date: Date): string {
        return date.toISOString();
    }

    /**
     * Format date to display string
     */
    static toDisplayString(date: Date): string {
        return date.toLocaleDateString();
    }

    /**
     * Parse date string
     */
    static parseDate(dateString: string): Date {
        return new Date(dateString);
    }

    /**
     * Add days to date
     */
    static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    /**
     * Subtract days from date
     */
    static subtractDays(date: Date, days: number): Date {
        return this.addDays(date, -days);
    }
}

// ============================================================================
// ASSERTION UTILITIES
// ============================================================================

export class AssertionUtils {
    /**
     * Assert object equals
     */
    static assertEqual(actual: any, expected: any, message?: string): void {
        expect(actual).toEqual(expected);
    }

    /**
     * Assert object deep equals
     */
    static assertDeepEqual(actual: any, expected: any, message?: string): void {
        expect(actual).toEqual(expected);
    }

    /**
     * Assert value is truthy
     */
    static assertTrue(value: any, message?: string): void {
        expect(value).toBeTruthy();
    }

    /**
     * Assert value is falsy
     */
    static assertFalse(value: any, message?: string): void {
        expect(value).toBeFalsy();
    }

    /**
     * Assert value is null
     */
    static assertNull(value: any, message?: string): void {
        expect(value).toBeNull();
    }

    /**
     * Assert value is undefined
     */
    static assertUndefined(value: any, message?: string): void {
        expect(value).toBeUndefined();
    }

    /**
     * Assert value is defined
     */
    static assertDefined(value: any, message?: string): void {
        expect(value).toBeDefined();
    }

    /**
     * Assert array contains
     */
    static assertContains(array: any[], item: any, message?: string): void {
        expect(array).toContain(item);
    }

    /**
     * Assert array length
     */
    static assertLength(array: any[], length: number, message?: string): void {
        expect(array.length).toBe(length);
    }

    /**
     * Assert object has property
     */
    static assertHasProperty(obj: any, property: string, message?: string): void {
        expect(obj[property]).toBeDefined();
    }

    /**
     * Assert string contains
     */
    static assertStringContains(str: string, substring: string, message?: string): void {
        expect(str).toContain(substring);
    }

    /**
     * Assert number equals
     */
    static assertNumberEquals(actual: number, expected: number, tolerance: number = 0, message?: string): void {
        if (tolerance > 0) {
            expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
        } else {
            expect(actual).toBe(expected);
        }
    }

    /**
     * Assert throws
     */
    static async assertThrows(fn: () => any, message?: string): Promise<void> {
        try {
            await fn();
            fail('Expected function to throw');
        } catch (error) {
            expect(error).toBeDefined();
        }
    }
}

// ============================================================================
// ASYNC TESTING UTILITIES
// ============================================================================

export class AsyncTestUtils {
    /**
     * Wait for a promise to resolve
     */
    static async waitFor<T>(promise: Promise<T>): Promise<T> {
        return promise;
    }

    /**
     * Wait for a specified time
     */
    static async wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Wait for condition to be true
     */
    static async waitForCondition(
        condition: () => boolean,
        timeout: number = 5000,
        interval: number = 100
    ): Promise<void> {
        const startTime = Date.now();
        while (!condition()) {
            if (Date.now() - startTime > timeout) {
                throw new Error('Condition not met within timeout');
            }
            await this.wait(interval);
        }
    }

    /**
     * Run async test with fakeAsync
     */
    static runFakeAsync(testFn: () => void): void {
        fakeAsync(() => {
            testFn();
            tick();
        })();
    }
}

// ============================================================================
// STORAGE TESTING UTILITIES
// ============================================================================

export class StorageTestUtils {
    private static mockStorage: { [key: string]: string } = {};

    /**
     * Clear mock storage
     */
    static clear(): void {
        this.mockStorage = {};
    }

    /**
     * Set item in mock storage
     */
    static setItem(key: string, value: string): void {
        this.mockStorage[key] = value;
    }

    /**
     * Get item from mock storage
     */
    static getItem(key: string): string | null {
        return this.mockStorage[key] || null;
    }

    /**
     * Remove item from mock storage
     */
    static removeItem(key: string): void {
        delete this.mockStorage[key];
    }

    /**
     * Get all keys from mock storage
     */
    static keys(): string[] {
        return Object.keys(this.mockStorage);
    }

    /**
     * Get mock storage length
     */
    static length(): number {
        return Object.keys(this.mockStorage).length;
    }
}

// ============================================================================
// EVENT TESTING UTILITIES
// ============================================================================

export class EventTestUtils {
    /**
     * Create a mock event
     */
    static createMockEvent(type: string, properties: any = {}): Event {
        const event = new Event(type);
        Object.assign(event, properties);
        return event;
    }

    /**
     * Create a mock keyboard event
     */
    static createKeyboardEvent(type: string, key: string, properties: any = {}): KeyboardEvent {
        const event = new KeyboardEvent(type, { key, ...properties });
        return event;
    }

    /**
     * Create a mock mouse event
     */
    static createMouseEvent(type: string, properties: any = {}): MouseEvent {
        const event = new MouseEvent(type, properties);
        return event;
    }

    /**
     * Dispatch event on element
     */
    static dispatchEvent(element: HTMLElement, event: Event): void {
        element.dispatchEvent(event);
    }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================



// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================


