# API Testing Guide for Construction Management System

This document provides comprehensive API testing guidance for the Construction Management System.

## API Endpoints Overview

The system includes 18 API controllers with the following endpoints:

### 1. Projects API (`/api/projects`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/{projectId}` | Get project details |
| PUT | `/api/projects/{projectId}` | Update project |
| PUT | `/api/projects/{projectId}/close` | Close project |
| GET | `/api/projects/my-projects` | Get current user's projects |

### 2. Vendors API (`/api/vendors`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vendors` | Get all vendors |
| GET | `/api/vendors/{id}` | Get vendor by ID |
| POST | `/api/vendors` | Create vendor |
| PUT | `/api/vendors/{id}` | Update vendor |
| DELETE | `/api/vendors/{id}` | Delete vendor |
| GET | `/api/vendors/summary` | Get vendor invoice summary |
| GET | `/api/vendors/{vendorId}/invoices` | Get vendor invoices |
| GET | `/api/vendors/invoices/pending` | Get pending invoices |
| POST | `/api/vendors/invoices` | Create invoice |
| POST | `/api/vendors/invoices/{id}/review` | Review invoice |

### 3. Transactions API (`/api/projects/{projectId}/transactions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/{projectId}/transactions` | Create transaction |
| GET | `/api/projects/{projectId}/transactions/{transactionId}` | Get transaction |
| GET | `/api/projects/{projectId}/transactions` | Get project transactions |
| PUT | `/api/projects/{projectId}/transactions/{transactionId}/review` | Review transaction |

### 4. Invoices API (`/api/items/{itemId}/invoices`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/items/{itemId}/invoices` | Create invoice |
| GET | `/api/items/{itemId}/invoices/{invoiceId}` | Get invoice |
| PUT | `/api/items/{itemId}/invoices/{invoiceId}/review` | Review invoice |

### 5. Notifications API (`/api/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| POST | `/api/notifications/{notificationId}/read` | Mark as read |
| POST | `/api/notifications/read-all` | Mark all as read |

### 6. Roles API (`/api/roles`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | Get roles |
| POST | `/api/roles` | Create role |
| PUT | `/api/roles/{id}` | Update role |
| DELETE | `/api/roles/{id}` | Delete role |
| POST | `/api/roles/permissions` | Update role permissions |

### 7. Permissions API (`/api/permissions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/permissions` | Get all permissions |
| POST | `/api/permissions` | Create permission |
| DELETE | `/api/permissions/{id}` | Delete permission |

### 8. Daily Logs API (`/api/items/{itemId}/dailylogs`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/items/{itemId}/dailylogs` | Create/get daily log |
| PUT | `/api/items/{itemId}/dailylogs/{logDate}/close` | Close daily log |
| GET | `/api/items/{itemId}/dailylogs/history` | Get log history |
| PUT | `/api/items/{itemId}/dailylogs/{logDate}/reopen` | Reopen closed day |

### 9. Site Media API (`/api/projects/{projectId}/media`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/{projectId}/media` | Upload media |
| GET | `/api/projects/{projectId}/media/{mediaId}` | Get media |
| GET | `/api/projects/{projectId}/media` | Get project media |
| PUT | `/api/projects/{projectId}/media/{mediaId}/review` | Review media |

### 10. Reports API (`/api/reports`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/client-export` | Export client report |

### 11. Phases API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/{projectId}/phases` | Get project phases |
| POST | `/api/projects/{projectId}/phases` | Create phase |
| PUT | `/api/phases/{phaseId}` | Update phase |
| DELETE | `/api/phases/{phaseId}` | Delete phase |
| GET | `/api/companies/{companyId}/default-phases` | Get default phases |
| POST | `/api/companies/{companyId}/default-phases` | Create default phase |

### 12. Misc Expenses API (`/api/miscexpenses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/miscexpenses` | Get all expenses |
| GET | `/api/miscexpenses/{id}` | Get expense |
| POST | `/api/miscexpenses` | Create expense |
| GET | `/api/miscexpenses/summary` | Get expense summary |
| GET | `/api/miscexpenses/pending` | Get pending expenses |
| GET | `/api/miscexpenses/by-category` | Get by category |
| POST | `/api/miscexpenses/{id}/review` | Review expense |

### 13. Profitability API (`/api/projects/{projectId}/profitability`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/{projectId}/profitability` | Get project profitability |
| GET | `/api/projects/{projectId}/profitability/item/{boqItemId}` | Get item profitability |

### 14. Project Approval Rules API (`/api/projects/{projectId}/approval-rules`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/{projectId}/approval-rules` | Get rules |
| POST | `/api/projects/{projectId}/approval-rules` | Create rule |
| GET | `/api/projects/{projectId}/approval-rules/{ruleId}` | Get rule |

### 15. Project Settings API (`/api/projects/{projectId}/settings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/{projectId}/settings` | Get settings |
| PUT | `/api/projects/{projectId}/settings` | Update settings |

### 16. Project Team API (`/api/projects/{projectId}/team`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/{projectId}/team` | Get project team |
| GET | `/api/projects/{projectId}/team/roles` | Get project roles |
| POST | `/api/projects/{projectId}/team/members` | Add team member |
| POST | `/api/projects/{projectId}/team/roles` | Create project role |
| POST | `/api/projects/{projectId}/team/{teamId}/assign-role` | Assign role |

### 17. Designs API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/{projectId}/designs` | Get project designs |
| GET | `/api/designs/{designId}` | Get design |
| POST | `/api/projects/{projectId}/designs` | Create design |
| PUT | `/api/designs/{designId}` | Update design |
| DELETE | `/api/designs/{designId}` | Delete design |
| GET | `/api/projects/{projectId}/designs/categories` | Get categories |
| GET | `/api/projects/{projectId}/designs/categories/tree` | Get category tree |
| POST | `/api/projects/{projectId}/designs/categories` | Create category |
| PUT | `/api/designs/categories/{categoryId}` | Update category |
| DELETE | `/api/designs/categories/{categoryId}` | Delete category |

### 18. Company Settings API (`/api/company-settings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/company-settings` | Get company settings |
| PUT | `/api/company-settings` | Update company settings |

## Testing Best Practices

### 1. Authentication Testing
All endpoints (except public reports) require authentication. Use JWT tokens in the Authorization header:
```
Authorization: Bearer <token>
```

### 2. Authorization Testing
Test role-based access:
- SystemAdmin: Full access
- CompanyAdmin: Company-level access
- User: Limited access based on permissions

### 3. Request/Response Validation
- Validate HTTP status codes (200, 201, 400, 401, 403, 404)
- Validate response body structure
- Validate error messages

### 4. CRUD Testing Pattern
For each entity, test:
- Create (POST) - Returns 201 Created
- Read (GET) - Returns 200 OK
- Update (PUT) - Returns 200 OK
- Delete (DELETE) - Returns 204 No Content
- Not Found - Returns 404

### 5. Integration Test Examples

```csharp
// Example: Testing Projects API
[Fact]
public async Task CreateProject_ShouldReturn201Created()
{
    // Arrange
    var request = new CreateProjectRequest(
        "Test Project",
        "Description",
        DateTime.UtcNow,
        DateTime.UtcNow.AddMonths(1),
        100000);

    // Act
    var response = await _client.PostAsync("/api/projects", 
        new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json"));

    // Assert
    Assert.Equal(201, (int)response.StatusCode);
}
```

### 6. Testing with Mock Services
Use Moq to mock service dependencies:
```csharp
[Fact]
public async Task GetProject_ShouldReturn200Ok()
{
    // Arrange
    var mockService = new Mock<IProjectService>();
    mockService.Setup(s => s.GetProjectByIdAsync(1))
              .ReturnsAsync(new ProjectDto { Id = 1, Name = "Test" });
    
    var controller = new ProjectsController(mockService.Object);
    
    // Act
    var result = await controller.Get(1);
    
    // Assert
    Assert.IsType<OkObjectResult>(result);
}
```

## Common Test Scenarios

### Positive Tests
- Create valid entities
- Retrieve existing entities
- Update entities with valid data
- Delete entities
- Filter and search entities

### Negative Tests
- Create with invalid data
- Retrieve non-existent entity (404)
- Update non-existent entity (404)
- Delete non-existent entity (404)
- Unauthorized access (401)
- Forbidden access (403)

### Edge Cases
- Empty results
- Large datasets
- Special characters
- Unicode content
- Maximum field lengths

## Test Data Factories

Use factory classes to create test data:

```csharp
public static class TestDataFactory
{
    public static Project CreateProject(string name = "Test") => new Project
    {
        ProjectName = name,
        Status = "Active",
        CreatedAt = DateTime.UtcNow
    };

    public static Vendor CreateVendor(string name = "Test Vendor") => new Vendor
    {
        VendorName = name,
        CompanyId = 1
    };
}
```

## Performance Testing

For high-volume endpoints:
- `/api/projects` - Pagination testing
- `/api/vendors` - Large vendor list
- `/api/transactions` - Financial data accuracy

## Security Testing

- Test SQL injection in query parameters
- Test XSS in input fields
- Test unauthorized access to protected endpoints
- Test role-based access control
- Test token expiration
<minimax:tool_call>
<invoke name="update_todo_list">
<parameter name="todos">[x] Implement Dependency Injection Validation in services
[x] Implement Enum-Based Status Management extensions
[x] Implement Structured Logging in services
[x] Implement Notification Queue Pattern
[x] Implement Caching for frequently accessed data
[x] Verify all implementations compile and tests pass
[x] Write unit tests for new code (InvoiceStatus, CacheService, NotificationQueue)
[x] Create API Testing Guide documentation