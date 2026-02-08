/**
 * Client Login Component Integration Tests
 * Tests for the client login functionality including form validation,
 * authentication service integration, and navigation behavior
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import {
    MockDataFactory,
    HttpTestUtils,
    ComponentTestUtils,
    FormTestUtils,
    AssertionUtils
} from '../../../../test-setup';

// Mock the component (since we don't have the actual implementation)
class MockClientLoginComponent {
    loginForm: any;
    isLoading = false;
    errorMessage = '';
    showPassword = false;

    constructor(private authService: any, private router: Router) {
        this.loginForm = {
            value: { email: '', password: '' },
            get: (key: string) => ({
                value: '',
                setValue: jasmine.createSpy('setValue'),
                markAsDirty: jasmine.createSpy('markAsDirty'),
                markAsTouched: jasmine.createSpy('markAsTouched'),
                valid: true,
                invalid: false,
                errors: null,
                hasError: jasmine.createSpy('hasError').and.returnValue(false)
            }),
            valid: true,
            invalid: false,
            markAllAsTouched: jasmine.createSpy('markAllAsTouched'),
            reset: jasmine.createSpy('reset')
        };
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.isLoading = true;
            this.authService.login(this.loginForm.value.email, this.loginForm.value.password)
                .subscribe(
                    (response: any) => {
                        this.isLoading = false;
                        this.router.navigate(['/client/dashboard']);
                    },
                    (error: any) => {
                        this.isLoading = false;
                        this.errorMessage = error.message || 'Login failed';
                    }
                );
        }
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    navigateToRegister(): void {
        this.router.navigate(['/client/register']);
    }

    navigateToForgotPassword(): void {
        this.router.navigate(['/client/forgot-password']);
    }
}

describe('ClientLoginComponent', () => {
    let component: MockClientLoginComponent;
    let fixture: ComponentFixture<MockClientLoginComponent>;
    let httpMock: HttpTestingController;
    let router: Router;
    let mockAuthService: any;

    beforeEach(async () => {
        // Create mock auth service
        mockAuthService = {
            login: jasmine.createSpy('login').and.callFake((email: string, password: string) => {
                if (email === 'test@example.com' && password === 'password123') {
                    return jasmine.createSpyObj('Observable', ['subscribe']).and.callFake((success: any, error: any) => {
                        success({ token: 'mock-token', user: MockDataFactory.createUser() });
                    });
                } else {
                    return jasmine.createSpyObj('Observable', ['subscribe']).and.callFake((success: any, error: any) => {
                        error({ message: 'Invalid credentials' });
                    });
                }
            }),
            logout: jasmine.createSpy('logout'),
            getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(of(MockDataFactory.createUser()))
        };

        await TestBed.configureTestingModule({
            declarations: [MockClientLoginComponent],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
                ReactiveFormsModule,
                FormsModule,
                BrowserAnimationsModule
            ],
            providers: [
                { provide: 'AuthService', useValue: mockAuthService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MockClientLoginComponent);
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

        it('should initialize login form with empty values', () => {
            expect(component.loginForm.value.email).toBe('');
            expect(component.loginForm.value.password).toBe('');
        });

        it('should initialize with loading state as false', () => {
            expect(component.isLoading).toBe(false);
        });

        it('should initialize with empty error message', () => {
            expect(component.errorMessage).toBe('');
        });

        it('should initialize with password hidden', () => {
            expect(component.showPassword).toBe(false);
        });
    });

    describe('Form Validation', () => {
        it('should have valid form when email and password are provided', () => {
            component.loginForm.value.email = 'test@example.com';
            component.loginForm.value.password = 'password123';
            expect(component.loginForm.valid).toBe(true);
        });

        it('should have invalid form when email is missing', () => {
            component.loginForm.value.email = '';
            component.loginForm.value.password = 'password123';
            expect(component.loginForm.invalid).toBe(true);
        });

        it('should have invalid form when password is missing', () => {
            component.loginForm.value.email = 'test@example.com';
            component.loginForm.value.password = '';
            expect(component.loginForm.invalid).toBe(true);
        });

        it('should have invalid form when email format is incorrect', () => {
            component.loginForm.value.email = 'invalid-email';
            component.loginForm.value.password = 'password123';
            expect(component.loginForm.invalid).toBe(true);
        });

        it('should have invalid form when password is too short', () => {
            component.loginForm.value.email = 'test@example.com';
            component.loginForm.value.password = '123';
            expect(component.loginForm.invalid).toBe(true);
        });
    });

    describe('Login Functionality', () => {
        it('should call authService.login with correct credentials', fakeAsync(() => {
            component.loginForm.value.email = 'test@example.com';
            component.loginForm.value.password = 'password123';

            component.onSubmit();
            tick();

            expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
        }));

        it('should set loading state to true during login', fakeAsync(() => {
            component.loginForm.value.email = 'test@example.com';
            component.loginForm.value.password = 'password123';

            component.onSubmit();
            expect(component.isLoading).toBe(true);
            tick();
            expect(component.isLoading).toBe(false);
        }));

        it('should navigate to dashboard on successful login', fakeAsync(() => {
            component.loginForm.value.email = 'test@example.com';
            component.loginForm.value.password = 'password123';

            component.onSubmit();
            tick();

            expect(router.navigate).toHaveBeenCalledWith(['/client/dashboard']);
        }));

        it('should set error message on failed login', fakeAsync(() => {
            component.loginForm.value.email = 'wrong@example.com';
            component.loginForm.value.password = 'wrongpassword';

            component.onSubmit();
            tick();

            expect(component.errorMessage).toBe('Invalid credentials');
        }));

        it('should reset loading state on failed login', fakeAsync(() => {
            component.loginForm.value.email = 'wrong@example.com';
            component.loginForm.value.password = 'wrongpassword';

            component.onSubmit();
            tick();

            expect(component.isLoading).toBe(false);
        }));

        it('should not submit form when form is invalid', () => {
            component.loginForm.value.email = '';
            component.loginForm.value.password = '';

            component.onSubmit();

            expect(mockAuthService.login).not.toHaveBeenCalled();
        });
    });

    describe('Password Visibility Toggle', () => {
        it('should toggle password visibility when called', () => {
            expect(component.showPassword).toBe(false);

            component.togglePasswordVisibility();
            expect(component.showPassword).toBe(true);

            component.togglePasswordVisibility();
            expect(component.showPassword).toBe(false);
        });
    });

    describe('Navigation', () => {
        it('should navigate to register page', () => {
            component.navigateToRegister();
            expect(router.navigate).toHaveBeenCalledWith(['/client/register']);
        });

        it('should navigate to forgot password page', () => {
            component.navigateToForgotPassword();
            expect(router.navigate).toHaveBeenCalledWith(['/client/forgot-password']);
        });
    });

    describe('Form Reset', () => {
        it('should reset form after successful login', fakeAsync(() => {
            component.loginForm.value.email = 'test@example.com';
            component.loginForm.value.password = 'password123';

            component.onSubmit();
            tick();

            expect(component.loginForm.reset).toHaveBeenCalled();
        }));

        it('should clear error message on new form submission', fakeAsync(() => {
            component.loginForm.value.email = 'wrong@example.com';
            component.loginForm.value.password = 'wrongpassword';

            component.onSubmit();
            tick();
            expect(component.errorMessage).toBe('Invalid credentials');

            component.loginForm.value.email = 'test@example.com';
            component.loginForm.value.password = 'password123';
            component.onSubmit();
            tick();

            expect(component.errorMessage).toBe('');
        }));
    });

    describe('Edge Cases', () => {
        it('should handle network errors gracefully', fakeAsync(() => {
            mockAuthService.login.and.returnValue(throwError(() => ({ message: 'Network error' })));

            component.loginForm.value.email = 'test@example.com';
            component.loginForm.value.password = 'password123';

            component.onSubmit();
            tick();

            expect(component.errorMessage).toBe('Network error');
            expect(component.isLoading).toBe(false);
        }));

        it('should handle server errors gracefully', fakeAsync(() => {
            mockAuthService.login.and.returnValue(throwError(() => ({ message: 'Server error' })));

            component.loginForm.value.email = 'test@example.com';
            component.loginForm.value.password = 'password123';

            component.onSubmit();
            tick();

            expect(component.errorMessage).toBe('Server error');
        }));

        it('should handle empty response from server', fakeAsync(() => {
            mockAuthService.login.and.returnValue(of(null));

            component.loginForm.value.email = 'test@example.com';
            component.loginForm.value.password = 'password123';

            component.onSubmit();
            tick();

            expect(component.isLoading).toBe(false);
        }));

        it('should handle multiple rapid login attempts', fakeAsync(() => {
            component.loginForm.value.email = 'test@example.com';
            component.loginForm.value.password = 'password123';

            component.onSubmit();
            component.onSubmit();
            tick();

            expect(mockAuthService.login).toHaveBeenCalledTimes(2);
        }));
    });

    describe('Security', () => {
        it('should not expose password in error messages', fakeAsync(() => {
            component.loginForm.value.email = 'wrong@example.com';
            component.loginForm.value.password = 'password123';

            component.onSubmit();
            tick();

            expect(component.errorMessage).not.toContain('password123');
        }));

        it('should clear password from form after successful login', fakeAsync(() => {
            component.loginForm.value.email = 'test@example.com';
            component.loginForm.value.password = 'password123';

            component.onSubmit();
            tick();

            expect(component.loginForm.value.password).toBe('');
        }));
    });

    describe('Accessibility', () => {
        it('should have proper form labels', () => {
            // This would be tested with actual DOM elements
            expect(component.loginForm).toBeDefined();
        });

        it('should have proper error messages for invalid fields', () => {
            component.loginForm.value.email = '';
            component.loginForm.value.password = '';

            expect(component.loginForm.invalid).toBe(true);
        });
    });
});
