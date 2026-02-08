# Construction Management System - Feature Testing Guide

This guide provides detailed testing steps for software developers acting as QA to test each feature in the Construction Management System.

## Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [User Management & Authentication](#1-user-management--authentication-testing)
3. [Company Management](#2-company-management-testing)
4. [Project Management](#3-project-management-testing)
5. [BOQ Management](#4-boq-management-testing)
6. [Daily Logs & Progress Tracking](#5-daily-logs--progress-tracking-testing)
7. [Site Media Management](#6-site-media-management-testing)
8. [Equipment Management](#7-equipment-management-testing)
9. [Inventory Management](#8-inventory-management-testing)
10. [Quality Control](#9-quality-control-testing)
11. [Safety Management](#10-safety-management-testing)
12. [Subcontractor Management](#11-subcontractor-management-testing)
13. [Financial Management](#12-financial-management-testing)
14. [Analytics & Reporting](#13-analytics--reporting-testing)
15. [Notifications](#14-notifications-testing)
16. [Document Management](#15-document-management-testing)
17. [Design Management](#16-design-management-testing)
18. [Client Portal](#17-client-portal-testing)
19. [Access Control](#18-access-control-testing)
20. [HR Management](#19-hr-management-testing)
21. [Vendor Management](#20-vendor-management-testing)

---

## Pre-Testing Setup

### Environment Setup

1. **Database Setup**
   - Ensure SQL Server is running
   - Run migrations: `dotnet ef database update`
   - Verify connection string in `appsettings.json`

2. **Backend Setup**
   - Navigate to `src/ConstructionManagement.WebApi`
   - Run: `dotnet run`
   - Verify API is running at `http://localhost:5000`
   - Check Swagger at `http://localhost:5000/swagger`

3. **Frontend Setup**
   - Navigate to `construction-cms`
   - Run: `npm install`
   - Run: `ng serve`
   - Verify app at `http://localhost:4200`

### Test Accounts

Create the following test accounts before testing:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| SuperAdmin | admin@construction.com | Admin@123 | Test system-wide features |
| CompanyAdmin | admin@company.com | Company@123 | Test company management |
| CompanyUser | user@company.com | User@123 | Test user features |
| NormalUser | normal@company.com | Normal@123 | Test limited features |
| Client | client@project.com | Client@123 | Test client portal |

### Test Data Preparation

Before testing, create the following test data:

1. **Create a Company**
   - Name: "Test Construction Co."
   - Package: "Professional"
   - Settings: Default

2. **Create Team Members**
   - 3-4 workers with different roles
   - 1-2 supervisors

3. **Create a Test Project**
   - Name: "Test Building Project"
   - Start Date: Current date
   - End Date: 6 months from now
   - Contract Value: $1,000,000

---

## 1. User Management & Authentication Testing

### Test Cases

#### TC-001: User Login with Valid Credentials
**Steps:**
1. Navigate to login page
2. Enter valid email: `admin@construction.com`
3. Enter valid password: `Admin@123`
4. Click "Login" button

**Expected Result:**
- User is redirected to dashboard
- User profile icon appears in top navigation
- JWT token is stored securely
- User role is displayed

**Actual Result:** _________

#### TC-002: User Login with Invalid Password
**Steps:**
1. Navigate to login page
2. Enter valid email: `admin@construction.com`
3. Enter invalid password: `WrongPassword`
4. Click "Login" button

**Expected Result:**
- Error message displayed: "Invalid email or password"
- User remains on login page
- No token is generated

**Actual Result:** _________

#### TC-003: User Login with Non-existent Email
**Steps:**
1. Navigate to login page
2. Enter email: `nonexistent@test.com`
3. Enter any password
4. Click "Login" button

**Expected Result:**
- Error message displayed: "User not found"
- User remains on login page

**Actual Result:** _________

#### TC-004: Token Expiration
**Steps:**
1. Login successfully
2. Wait for token to expire (or manually set token to expired)
3. Try to access protected resource

**Expected Result:**
- 401 Unauthorized response
- User is redirected to login page

**Actual Result:** _________

#### TC-005: Create New User
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → HR
3. Click "Add New User"
4. Fill in details:
   - Full Name: "John Doe"
   - Email: `john@construction.com`
   - Role: CompanyUser
   - Salary: 5000
   - Status: Working
5. Click "Save"

**Expected Result:**
- User is created successfully
- Confirmation message displayed
- User appears in user list
- Test email received with login credentials

**Actual Result:** _________

#### TC-006: Edit User Details
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → HR
3. Click on user: "John Doe"
4. Click "Edit"
5. Change salary to: 6000
6. Click "Save"

**Expected Result:**
- User details updated
- Confirmation message displayed
- New salary is reflected in user details

**Actual Result:** _________

#### TC-007: Deactivate User
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → HR
3. Click on user: "John Doe"
4. Change status to: Absent
5. Click "Save"

**Expected Result:**
- User status changed to "Absent"
- User cannot login (if trying to login)
- User no longer appears in active user lists

**Actual Result:** _________

#### TC-008: View User Profile
**Steps:**
1. Login as CompanyUser
2. Click on user profile icon
3. Click "My Profile"

**Expected Result:**
- User profile page displayed
- Personal information, salary records, performance metrics shown

**Actual Result:** _________

### Test Data Required
- Test users with different roles
- Supervisor-user relationships

---

## 2. Company Management Testing

### Test Cases

#### TC-009: View All Companies (SuperAdmin)
**Steps:**
1. Login as SuperAdmin
2. Navigate to Admin → Companies

**Expected Result:**
- List of all companies displayed
- Each company shows: Name, Package, Status, Active Projects Count
- Pagination working correctly

**Actual Result:** _________

#### TC-010: Create New Company
**Steps:**
1. Login as SuperAdmin
2. Navigate to Admin → Companies
3. Click "Add New Company"
4. Fill in details:
   - Name: "New Construction Ltd."
   - Package: "Enterprise"
   - Admin Email: `admin@newconstruction.com`
5. Click "Create"

**Expected Result:**
- Company created successfully
- Default admin user created
- Company appears in companies list
- Confirmation message displayed

**Actual Result:** _________

#### TC-011: View Company Details
**Steps:**
1. Login as SuperAdmin
2. Navigate to Admin → Companies
3. Click on company: "Test Construction Co."

**Expected Result:**
- Company detail page displayed
- Shows: Projects, Users, Subscriptions, Settings
- All tabs functional

**Actual Result:** _________

#### TC-012: Update Company Settings
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Company Settings
3. Modify settings:
   - Enable Delay Notifications: ON
   - Photo Upload: ON
   - Require Photo Review: ON
   - Client Can See Financials: OFF
4. Click "Save Changes"

**Expected Result:**
- Settings updated successfully
- Confirmation message displayed
- Changes reflected in application behavior

**Actual Result:** _________

#### TC-013: Company Settings - Delay Notifications
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Company Settings
3. Configure:
   - Enable Delay Notification: ON
   - Delay Notification Interval: 3 days
   - Delay Grace Period: 2 days
   - Send Email: ON
4. Click "Save"

**Expected Result:**
- Settings saved
- Delays trigger notifications based on configuration

**Actual Result:** _________

#### TC-014: Company Settings - Inventory Management
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Company Settings
3. Configure:
   - Enable Inventory Management: ON
   - Require Material Request Approval: ON
   - Enable Stock Alerts: ON
   - Default Low Stock Threshold: 10
4. Click "Save"

**Expected Result:**
- Settings saved
- Inventory features enabled
- Approval workflow active

**Actual Result:** _________

### Test Data Required
- Multiple company packages
- Company settings configurations

---

## 3. Project Management Testing

### Test Cases

#### TC-015: Create New Project
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Projects
3. Click "Create New Project"
4. Fill in details:
   - Project Name: "Downtown Office Building"
   - Description: "A 20-story commercial building"
   - Start Date: Current date
   - End Date: 2 years from now
   - General Manager: Select from dropdown
   - Accounting System: "Standard"
   - Total Contract Value: 50000000
   - Calculation Method: "Measured"
5. Click "Create"

**Expected Result:**
- Project created successfully
- Confirmation message displayed
- Project appears in projects list
- Default BOQ structure created

**Actual Result:** _________

#### TC-016: View Project Details
**Steps:**
1. Login as CompanyUser
2. Navigate to Admin → Projects
3. Click on project: "Downtown Office Building"

**Expected Result:**
- Project detail page loads
- Shows: Overview, BOQ Items, Team, Daily Logs, Media, Financials
- All tabs functional
- Progress percentage displayed

**Actual Result:** _________

#### TC-017: Update Project Information
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Projects
3. Click on project: "Downtown Office Building"
4. Click "Edit Project"
5. Change End Date to: 1 month later
6. Change Total Contract Value: 51000000
7. Click "Save"

**Expected Result:**
- Project updated successfully
- Changes reflected in project details
- Financial calculations updated

**Actual Result:** _________

#### TC-018: Close Project
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Projects
3. Click on project: "Downtown Office Building"
4. Verify all work is completed (100% progress)
5. Click "Close Project"
6. Confirm closure

**Expected Result:**
- Project status changes to "Completed"
- Project marked as closed
- No further modifications allowed
- Confirmation message displayed

**Actual Result:** _________

#### TC-019: Project Hierarchy View
**Steps:**
1. Login as CompanyUser
2. Navigate to Admin → Project Hierarchy
3. Select project: "Downtown Office Building"

**Expected Result:**
- Tree structure displayed
- Shows: Phases → BOQ Items
- Can expand/collapse nodes
- Progress indicators visible

**Actual Result:** _________

#### TC-020: Project Dashboard Statistics
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Dashboard

**Expected Result:**
- Dashboard shows:
  - Active Projects: X
  - Completed Projects: Y
  - Delayed Projects: Z
  - Total Revenue: $XXX
  - Average Progress: XX%

**Actual Result:** _________

### Test Data Required
- Multiple projects with different statuses
- Projects with different calculation methods

---

## 4. BOQ Management Testing

### Test Cases

#### TC-021: Create BOQ Item - Measured Method
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Projects
3. Click on project: "Downtown Office Building"
4. Go to BOQ Items tab
5. Click "Add BOQ Item"
6. Fill in details:
   - Item Name: "Excavation Work"
   - Description: "Main excavation"
   - Unit: "m³"
   - Agreed Quantity: 10000
   - Unit Price: 50
   - Accounting Type: "Measured"
7. Click "Save"

**Expected Result:**
- BOQ item created
- Shows in BOQ list
- Total value: $500,000
- Progress starts at 0%

**Actual Result:** _________

#### TC-022: Create BOQ Item - Supervision Method
**Steps:**
1. Login as CompanyAdmin
2. Navigate to project BOQ Items
3. Click "Add BOQ Item"
4. Fill in:
   - Item Name: "Structural Engineering"
   - Unit: "%"
   - Agreed Quantity: 5
   - Unit Price: 100000
   - Accounting Type: "Supervision"
   - Supervision Percentage: 5%
5. Click "Save"

**Expected Result:**
- BOQ item created
- Calculation based on supervision percentage
- Total value: $5,000,000 (5% of contract)

**Actual Result:** _________

#### TC-023: Create BOQ Item - Package Method
**Steps:**
1. Login as CompanyAdmin
2. Navigate to project BOQ Items
3. Click "Add BOQ Item"
4. Fill in:
   - Item Name: "Complete HVAC System"
   - Unit: "Lump Sum"
   - Agreed Quantity: 1
   - Unit Price: 500000
   - Accounting Type: "Packages"
5. Click "Save"

**Expected Result:**
- BOQ item created as lump sum package
- Value: $500,000
- Progress tracked as single unit

**Actual Result:** _________

#### TC-024: Update BOQ Item
**Steps:**
1. Login as CompanyUser
2. Navigate to project BOQ Items
3. Click on item: "Excavation Work"
4. Click "Edit"
5. Change Unit Price: 55
6. Click "Save"

**Expected Result:**
- Item updated
- New unit price reflected
- Total value recalculated

**Actual Result:** _________

#### TC-025: View BOQ Item Progress
**Steps:**
1. Login as CompanyUser
2. Navigate to project BOQ Items
3. View item: "Excavation Work"

**Expected Result:**
- Shows:
  - Total Quantity: 10,000 m³
  - Executed Quantity: X,XXX m³
  - Progress: XX%
  - Status: Active/Delayed

**Actual Result:** _________

#### TC-026: Delete BOQ Item
**Steps:**
1. Login as CompanyAdmin
2. Navigate to project BOQ Items
3. Click on item to delete
4. Click "Delete"
5. Confirm deletion

**Expected Result:**
- Item deleted
- No longer appears in list
- Associated data preserved for audit

**Actual Result:** _________

### Test Data Required
- BOQ items with different accounting types
- Projects with multiple BOQ items

---

## 5. Daily Logs & Progress Tracking Testing

### Test Cases

#### TC-027: Create Daily Log Entry
**Steps:**
1. Login as CompanyUser
2. Navigate to Worker → Daily Log
3. Select project: "Downtown Office Building"
4. Select BOQ Item: "Excavation Work"
5. Click "Create Daily Log"
6. Enter Log Date: Today
7. Click "Create"

**Expected Result:**
- Daily log created
- System returns log ID
- Log appears in history

**Actual Result:** _________

#### TC-028: Add Progress Entry
**Steps:**
1. Open daily log for today
2. Click "Add Progress Entry"
3. Fill in:
   - Quantity: 500
   - Notes: "Completed section A"
   - Start Time: 08:00
4. Click "Save"

**Expected Result:**
- Progress entry added
- BOQ executed quantity updated
- Total progress increased

**Actual Result:** _________

#### TC-029: Close Daily Log
**Steps:**
1. Open daily log for today
2. Verify all progress entries are correct
3. Click "Close Daily Log"
4. Fill in:
   - Completion Percentage: 5%
   - Notes: "Day 1 of excavation"
5. Click "Close"

**Expected Result:**
- Log closed
- No further entries allowed for this date
- Confirmation message displayed
- Status shows: "Closed"

**Actual Result:** _________

#### TC-030: Reopen Closed Day
**Steps:**
1. Find closed daily log
2. Click "Reopen"
3. Enter reason: "Forgot to add afternoon progress"
4. Select Notify Roles: ["Supervisor"]
5. Click "Reopen"

**Expected Result:**
- Log reopened
- Status shows: "Open"
- Can add new entries
- Supervisor receives notification

**Actual Result:** _________

#### TC-031: View Daily Log History
**Steps:**
1. Navigate to project BOQ Items
2. Click on item: "Excavation Work"
3. Go to "Daily Log History" tab

**Expected Result:**
- All daily logs displayed
- Shows: Date, Closure Status, Completion %, Notes
- Can filter by date range
- Pagination works correctly

**Actual Result:** _________

#### TC-032: Daily Log Auto-Close
**Steps:**
1. Login as CompanyAdmin
2. Configure company settings:
   - Auto Close Day: ON
   - Auto Close Time: "18:00"
3. Create daily log before auto-close time
4. Wait for auto-close time

**Expected Result:**
- Daily log auto-closed at configured time
- Closure percentage matches last entry
- Notification sent to relevant parties

**Actual Result:** _________

### Test Data Required
- Projects with BOQ items
- Workers with different roles

---

## 6. Site Media Management Testing

### Test Cases

#### TC-033: Upload Site Photo
**Steps:**
1. Login as CompanyUser
2. Navigate to project: "Downtown Office Building"
3. Go to Site Media tab
4. Click "Upload Media"
5. Fill in:
   - BOQ Item: "Excavation Work"
   - Media Type: "Image"
   - Description: "Morning progress photo"
6. Select image file
7. Click "Upload"

**Expected Result:**
- File uploaded successfully
- Media appears in list with status: "Pending"
- Uploaded by user information recorded
- Upload timestamp recorded

**Actual Result:** _________

#### TC-034: Upload Site Video
**Steps:**
1. Login as CompanyUser
2. Navigate to project Site Media
3. Click "Upload Media"
4. Fill in:
   - Media Type: "Video"
   - Description: "Time-lapse of excavation"
5. Select video file (under 100MB)
6. Click "Upload"

**Expected Result:**
- Video uploaded successfully
- Thumbnail generated
- Status: "Pending"
- Video can be played

**Actual Result:** _________

#### TC-035: Review and Approve Media
**Steps:**
1. Login as CompanyAdmin (or approver)
2. Navigate to Admin → Media → Site Media Review
3. Select pending media
4. Review the content
5. Click "Approve"

**Expected Result:**
- Media status changes to: "Approved"
- Approved by and date recorded
- Media visible in gallery

**Actual Result:** _________

#### TC-036: Reject Media
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Media Review
3. Select pending media
4. Click "Reject"
5. Fill in:
   - Rejection Reason: "Photo is blurry"
   - Rejection Type: "Quality Issue"
6. Click "Submit"

**Expected Result:**
- Media status changes to: "Rejected"
- Rejection reason recorded
- Uploader notified

**Actual Result:** _________

#### TC-037: View Media Gallery
**Steps:**
1. Login as CompanyUser
2. Navigate to Admin → Media → Media Gallery
3. Filter by:
   - Project: "Downtown Office Building"
   - Status: "Approved"
   - Media Type: "Image"
4. View gallery grid

**Expected Result:**
- Approved media displayed
- Filters work correctly
- Images load properly
- Lightbox opens on click

**Actual Result:** _________

#### TC-038: Client Portal Media Access
**Steps:**
1. Configure company settings:
   - Client Can See Media: ON
2. Login as Client
3. Navigate to Client Portal → Project
4. Check if media is visible

**Expected Result:**
- Client can see approved media
- Pending/rejected media hidden
- Only approved content visible

**Actual Result:** _________

### Test Data Required
- Test images (JPG, PNG)
- Test videos (MP4, under 100MB)
- Different media types

---

## 7. Equipment Management Testing

### Test Cases

#### TC-039: Create Equipment Type
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Equipment
3. Click "Equipment Types" tab
4. Click "Add Type"
5. Fill in:
   - Name: "Excavator"
   - Description: "Heavy duty excavator"
   - Default Daily Rate: 500
   - Default Hourly Rate: 75
6. Click "Save"

**Expected Result:**
- Equipment type created
- Appears in types list
- Default rates set

**Actual Result:** _________

#### TC-040: Add New Equipment
**Steps:**
1. Navigate to Admin → Equipment
2. Click "Add Equipment"
3. Fill in:
   - Name: "CAT 320 Excavator"
   - Serial Number: "CAT320-2024-001"
   - Equipment Type: "Excavator"
   - Manufacturer: "Caterpillar"
   - Model: "320"
   - Year: 2024
   - Status: "Available"
   - Purchase Price: 250000
4. Click "Save"

**Expected Result:**
- Equipment added successfully
- Appears in equipment list
- Status: "Available"

**Actual Result:** _________

#### TC-041: Assign Equipment to Project
**Steps:**
1. Navigate to Admin → Equipment → Assignments
2. Click "New Assignment"
3. Fill in:
   - Equipment: "CAT 320 Excavator"
   - Project: "Downtown Office Building"
   - Assignment Type: "Project Assignment"
   - Start Date: Today
   - End Date: 1 month from now
   - Purpose: "Foundation excavation"
4. Click "Assign"

**Expected Result:**
- Assignment created
- Equipment status: "Assigned"
- Project receives equipment
- Assignment details recorded

**Actual Result:** _________

#### TC-042: Return Equipment
**Steps:**
1. Navigate to Equipment Assignments
2. Find active assignment: "CAT 320 Excavator"
3. Click "Return"
4. Fill in:
   - Condition at Return: "Good"
   - Fuel Level: 75%
   - Operating Hours: 150
   - Notes: "Returned after project completion"
5. Click "Return Equipment"

**Expected Result:**
- Equipment returned
- Status: "Available"
- Assignment closed
- Return details recorded

**Actual Result:** _________

#### TC-043: Schedule Equipment Maintenance
**Steps:**
1. Navigate to Admin → Equipment → Maintenance
2. Click "Schedule Maintenance"
3. Fill in:
   - Equipment: "CAT 320 Excavator"
   - Maintenance Type: "Scheduled Service"
   - Scheduled Date: Next week
   - Service Provider: "Caterpillar Dealer"
   - Estimated Cost: 2000
4. Click "Schedule"

**Expected Result:**
- Maintenance scheduled
- Equipment marked for service
- Calendar entry created

**Actual Result:** _________

#### TC-044: Start Maintenance
**Steps:**
1. Navigate to Scheduled Maintenance
2. Find pending maintenance
3. Click "Start"
4. Record actual start details

**Expected Result:**
- Maintenance status: "In Progress"
- Start time recorded
- Equipment status: "In Maintenance"

**Actual Result:** _________

#### TC-045: Complete Maintenance
**Steps:**
1. Navigate to In-Progress Maintenance
2. Click "Complete"
3. Fill in:
   - Actual Date: Today
   - Work Performed: "Oil change, filter replacement"
   - Parts Used: "Oil filter, 10L oil"
   - Cost: 1800
   - Next Maintenance Due: 3 months
4. Click "Complete"

**Expected Result:**
- Maintenance completed
- Equipment status: "Available"
- Cost recorded
- Next maintenance date set
- Equipment value updated

**Actual Result:** _________

#### TC-046: Equipment Dashboard View
**Steps:**
1. Navigate to Admin → Equipment
2. View dashboard

**Expected Result:**
- Dashboard shows:
  - Total Equipment: X
  - Available: X
  - Assigned: X
  - In Maintenance: X
  - Out of Service: X
  - Overdue Assignments: X
  - Upcoming Maintenance: X
  - Average Utilization Rate: XX%

**Actual Result:** _________

#### TC-047: Track Equipment GPS
**Steps:**
1. Add equipment with GPS:
   - Has GPS Tracking: ON
   - GPS Device ID: "GPS-001"
2. Navigate to equipment details
3. Check GPS location feature

**Expected Result:**
- GPS status displayed
- Location tracking enabled
- Current location visible (if map integration)

**Actual Result:** _________

### Test Data Required
- Various equipment types
- Equipment with different statuses
- Maintenance schedules

---

## 8. Inventory Management Testing

### Test Cases

#### TC-048: Add Inventory Item
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Inventory
3. Click "Add Item"
4. Fill in:
   - Item Code: "CONC-001"
   - Item Name: "Ready Mix Concrete"
   - Category: "Materials"
   - Unit: "m³"
   - Quantity: 100
   - Unit Price: 150
   - Location: "Warehouse A"
   - Supplier: "ABC Concrete Co."
   - Minimum Stock: 20
   - Maximum Stock: 500
   - Reorder Level: 50
5. Click "Save"

**Expected Result:**
- Item added successfully
- Appears in inventory list
- Stock level recorded
- Location and supplier info saved

**Actual Result:** _________

#### TC-049: View Low Stock Items
**Steps:**
1. Navigate to Admin → Inventory
2. Click "Low Stock" tab

**Expected Result:**
- Shows items below reorder level
- Priority indicators for critical items
- Quick action to create purchase order

**Actual Result:** _________

#### TC-050: Record Stock Receipt
**Steps:**
1. Navigate to Admin → Inventory
2. Click on item: "Ready Mix Concrete"
3. Click "Add Stock"
4. Fill in:
   - Quantity: 50
   - Date: Today
   - Reference: "PO-2024-001"
   - Notes: "Monthly delivery"
5. Click "Add"

**Expected Result:**
- Stock increased by 50
- New total: 150
- Transaction recorded

**Actual Result:** _________

#### TC-051: Record Stock Issue
**Steps:**
1. Navigate to Admin → Inventory
2. Click on item: "Ready Mix Concrete"
3. Click "Issue Stock"
4. Fill in:
   - Quantity: 25
   - Date: Today
   - Project: "Downtown Office Building"
   - Issued To: "Site Team"
   - Notes: "Foundation work"
5. Click "Issue"

**Expected Result:**
- Stock decreased by 25
- New total: 125
- Transaction recorded
- Project linked to transaction

**Actual Result:** _________

#### TC-052: Inventory Transactions History
**Steps:**
1. Navigate to Admin → Inventory → Transactions

**Expected Result:**
- All transactions displayed
- Shows: Date, Item, Type (In/Out), Quantity, User
- Filter by date range
- Filter by item

**Actual Result:** _________

#### TC-053: Stock Alerts
**Steps:**
1. Set item stock below reorder level
2. Wait for stock check (or trigger manually)

**Expected Result:**
- Low stock alert generated
- Notification sent to responsible users
- Alert visible in dashboard

**Actual Result:** _________

#### TC-054: Inventory Settings Validation
**Steps:**
1. Configure company settings:
   - Enable Inventory Management: ON
   - Require Material Request Approval: ON
   - Material Request Approver Role: "CompanyAdmin"
2. Try to create material request without approval

**Expected Result:**
- Request requires approval
- Status: "Pending Approval"
- Cannot issue stock until approved

**Actual Result:** _________

### Test Data Required
- Various inventory categories
- Items at different stock levels
- Multiple suppliers

---

## 9. Quality Control Testing

### Test Cases

#### TC-055: Create Quality Standard
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Quality
3. Click "Quality Standards" tab
4. Click "Add Standard"
5. Fill in:
   - Name: "Concrete Pour Quality Standard"
   - Category: "Concrete"
   - Description: "Standards for concrete pouring"
   - Standard Code: "QC-CONC-001"
   - Criteria: "Mix design, slump test, temperature"
   - Acceptance Criteria: "Slump 100-150mm, Temp < 30°C"
6. Click "Save"

**Expected Result:**
- Quality standard created
- Appears in standards list

**Actual Result:** _________

#### TC-056: Schedule Quality Inspection
**Steps:**
1. Navigate to Admin → Quality → Inspections
2. Click "Schedule Inspection"
3. Fill in:
   - Project: "Downtown Office Building"
   - Phase: "Foundation"
   - Title: "Foundation Concrete Pour"
   - Inspection Type: "Concrete Quality"
   - Scheduled Date: Tomorrow
   - Location: "Site Foundation Area"
4. Click "Schedule"

**Expected Result:**
- Inspection scheduled
- Appears in inspections list
- Status: "Scheduled"

**Actual Result:** _________

#### TC-057: Conduct Quality Inspection
**Steps:**
1. Navigate to Scheduled Inspections
2. Find inspection: "Foundation Concrete Pour"
3. Click "Start Inspection"
4. Complete checklist items:
   - Item 1: Mix Design - Pass
   - Item 2: Slump Test - Pass (120mm)
   - Item 3: Temperature - Pass (25°C)
   - Item 4: Cover Check - Fail (insufficient)
5. Click "Complete Inspection"
6. Fill in:
   - Overall Result: "Partial Pass"
   - Score: 75
   - Notes: "Need to verify cover on rebar"
7. Click "Submit"

**Expected Result:**
- Inspection completed
- Results recorded
- Score: 75%
- Failed items highlighted
- Follow-up required for failed item

**Actual Result:** _________

#### TC-058: Report Quality Defect
**Steps:**
1. Navigate to Admin → Quality → Defects
2. Click "Report Defect"
3. Fill in:
   - Project: "Downtown Office Building"
   - Title: "Concrete Cracking"
   - Description: "Surface cracks observed on slab"
   - Category: "Concrete"
   - Severity: "Major"
   - Priority: "High"
   - Location: "Ground Floor Slab"
   - Estimated Cost: 5000
   - Safety Related: No
   - Requires Rework: Yes
4. Click "Report"

**Expected Result:**
- Defect reported
- Defect number generated (e.g., DEF-2024-001)
- Status: "Open"
- Appears in defects list

**Actual Result:** _________

#### TC-059: Assign Defect
**Steps:**
1. Navigate to Defects list
2. Click on defect: "Concrete Cracking"
3. Click "Assign"
4. Fill in:
   - Assigned To: "Quality Team Lead"
   - Target Resolution Date: Next week
5. Click "Assign"

**Expected Result:**
- Defect assigned
- Assignee notified
- Target date set

**Actual Result:** _________

#### TC-060: Resolve Defect
**Steps:**
1. Navigate to assigned defect
2. Click "Resolve"
3. Fill in:
   - Corrective Action: "Removed and repoured section"
   - Actual Cost: 4500
   - Notes: "Issue was improper curing"
4. Click "Resolve"

**Expected Result:**
- Defect resolved
- Resolution date recorded
- Cost updated

**Actual Result:** _________

#### TC-061: Close Defect
**Steps:**
1. Navigate to resolved defect
2. Verify rework completed
3. Click "Close"
4. Fill in closure notes
5. Click "Close"

**Expected Result:**
- Defect closed
- Status: "Closed"
- Closure date recorded

**Actual Result:** _________

#### TC-062: Create Punch List Item
**Steps:**
1. Navigate to Admin → Quality → Punch List
2. Click "Add Item"
3. Fill in:
   - Description: "Paint touch-up required"
   - Location: "Level 5, Corridor B"
   - Category: "Finishing"
   - Priority: "Medium"
   - Assigned To: "Painting Team"
   - Due Date: Next week
   - Cost Estimate: 500
4. Click "Add"

**Expected Result:**
- Punch list item created
- Appears in punch list

**Actual Result:** _________

#### TC-063: Punch List Management
**Steps:**
1. Navigate to Punch List
2. Filter by status: "Open"
3. Update item: "Paint touch-up required"
4. Mark as complete
5. Enter actual cost: 450
6. Click "Complete"

**Expected Result:**
- Item completed
- Completion date recorded
- Cost variance tracked

**Actual Result:** _________

#### TC-064: Quality Dashboard
**Steps:**
1. Navigate to Admin → Quality
2. View dashboard

**Expected Result:**
- Dashboard shows:
  - Total Inspections: X
  - Defects: X (Open/Resolved)
  - Punch List: X (Pending/Completed)
  - Average Inspection Score: XX%
  - Defect Resolution Rate: XX%

**Actual Result:** _________

### Test Data Required
- Quality standards and checklists
- Inspection schedules
- Defect scenarios

---

## 10. Safety Management Testing

### Test Cases

#### TC-065: Create Safety Checklist
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Safety
3. Click "Checklists" tab
4. Click "Add Checklist"
5. Fill in:
   - Name: "Daily Site Safety Checklist"
   - Category: "Daily Inspection"
   - Description: "Standard daily safety checks"
6. Add checklist items:
   - Item 1: "PPE Compliance" (Critical: Yes)
   - Item 2: "Scaffolding Safety" (Critical: Yes)
   - Item 3: "Fire Extinguisher Check" (Critical: Yes)
   - Item 4: "First Aid Kit" (Critical: No)
7. Click "Save"

**Expected Result:**
- Checklist created
- Items ordered correctly

**Actual Result:** _________

#### TC-066: Schedule Safety Inspection
**Steps:**
1. Navigate to Admin → Safety → Inspections
2. Click "New Inspection"
3. Fill in:
   - Checklist: "Daily Site Safety Checklist"
   - Project: "Downtown Office Building"
   - Inspector: "Safety Officer"
   - Inspection Date: Today
   - Location: "Main Construction Area"
4. Click "Create"

**Expected Result:**
- Inspection scheduled
- Appears in inspections list

**Actual Result:** _________

#### TC-067: Conduct Safety Inspection
**Steps:**
1. Navigate to scheduled inspection
2. Click "Start Inspection"
3. Complete checklist:
   - Item 1: PPE Compliance - Pass
   - Item 2: Scaffolding Safety - Fail (not properly secured)
   - Item 3: Fire Extinguisher - Pass
   - Item 4: First Aid Kit - Pass (N/A)
4. Add notes for failed item
5. Click "Submit"

**Expected Result:**
- Inspection completed
- Pass rate: 67%
- Failed item requires follow-up
- Follow-up scheduled

**Actual Result:** _________

#### TC-068: Report Safety Incident
**Steps:**
1. Navigate to Admin → Safety → Incidents
2. Click "Report Incident"
3. Fill in:
   - Project: "Downtown Office Building"
   - Severity: "Major"
   - Title: "Worker Fall from Ladder"
   - Description: "Worker slipped while descending ladder"
   - Incident Date: Today
   - Time: 10:30 AM
   - Location: "Level 3, East Wing"
   - Involved Persons: "Ahmed Hassan"
   - Witnesses: "Mohamed Ali"
   - Immediate Actions: "Worker sent for medical evaluation"
   - Required Medical Attention: Yes
   - Estimated Cost: 50000
4. Click "Report"

**Expected Result:**
- Incident reported
- Incident number generated
- Status: "Reported"
- Investigation required

**Actual Result:** _________

#### TC-069: Update Incident Investigation
**Steps:**
1. Navigate to incident: "Worker Fall from Ladder"
2. Click "Update Investigation"
3. Fill in:
   - Root Cause: "Ladder not secured at top"
   - Corrective Actions: "Implement ladder safety policy, provide ladder stabilizers"
   - Follow-up Date: Next week
4. Click "Update"

**Expected Result:**
- Investigation updated
- Root cause documented
- Corrective actions recorded

**Actual Result:** _________

#### TC-070: Schedule Safety Training
**Steps:**
1. Navigate to Admin → Safety → Training
2. Click "Schedule Training"
3. Fill in:
   - Title: "Ladder Safety Training"
   - Description: "Proper ladder usage and safety"
   - Training Type: "Safety"
   - Scheduled Date: Next week
   - Trainer: "Safety Manager"
   - Duration: 60 minutes
   - Requires Certification: Yes
   - Certification Expiry: 1 year
   - Max Participants: 30
4. Click "Schedule"

**Expected Result:**
- Training scheduled
- Appears in training calendar

**Actual Result:** _________

#### TC-071: Complete Safety Training
**Steps:**
1. Navigate to scheduled training
2. Click "Start Training"
3. Conduct training session
4. Click "Complete"
5. Fill in:
   - Completed Date: Today
   - Notes: "All participants attended and passed"
6. Click "Submit"

**Expected Result:**
- Training completed
- Participants receive certificates (if applicable)
- Certification expiry set

**Actual Result:** _________

#### TC-072: Add Training Participants
**Steps:**
1. Navigate to training: "Ladder Safety Training"
2. Click "Add Participants"
3. Select workers to add
4. Click "Add"

**Expected Result:**
- Participants added
- Participant count increased
- Notifications sent

**Actual Result:** _________

#### TC-073: Create Compliance Record
**Steps:**
1. Navigate to Admin → Safety → Compliance
2. Click "Add Compliance"
3. Fill in:
   - Project: "Downtown Office Building"
   - Standard Name: "OSHA 1926 - Fall Protection"
   - Description: "Compliance with OSHA standards"
   - Compliance Date: Today
   - Next Review Date: 6 months
4. Click "Create"

**Expected Result:**
- Compliance record created
- Can mark as compliant/non-compliant

**Actual Result:** _________

#### TC-074: Mark Compliance Status
**Steps:**
1. Navigate to Compliance Records
2. Find record: "OSHA 1926"
3. Click "Mark Compliant"
4. Add notes
5. Click "Submit"

**Expected Result:**
- Status: "Compliant"
- Compliance date recorded

**Actual Result:** _________

#### TC-075: Safety Dashboard
**Steps:**
1. Navigate to Admin → Safety
2. View dashboard

**Expected Result:**
- Dashboard shows:
  - Total Checklists: X
  - Total Inspections: X (Pass Rate: XX%)
  - Total Incidents: X (Critical: X)
  - Total Trainings: X (Completed: X)
  - Pending Investigations: X
  - Upcoming Trainings: X
  - Expiring Certifications: X

**Actual Result:** _________

### Test Data Required
- Safety checklists
- Incident scenarios (various severities)
- Training schedules

---

## 11. Subcontractor Management Testing

### Test Cases

#### TC-076: Add Subcontractor
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Subcontractors
3. Click "Add Subcontractor"
4. Fill in:
   - Name: "ABC Electrical Works"
   - Phone: "+1234567890"
   - Email: `contact@abcelectrical.com`
   - Address: "123 Industrial Area"
   - Tax Number: "TAX-123456"
   - Contact Person: "John Smith"
   - Trade Specialty: "Electrical"
   - License Number: "LIC-2024-001"
   - Insurance Policy: "INS-12345"
   - Insurance Expiry: 1 year from today
   - Retention Percentage: 10%
5. Click "Save"

**Expected Result:**
- Subcontractor added
- Status: "Pending Approval"

**Actual Result:** _________

#### TC-077: Approve Subcontractor
**Steps:**
1. Navigate to subcontractor: "ABC Electrical Works"
2. Click "Approve"
3. Fill in:
   - Approved By: "Company Admin"
   - Notes: "Verified license and insurance"
4. Click "Approve"

**Expected Result:**
- Subcontractor approved
- Status: "Active"
- Approval date recorded

**Actual Result:** _________

#### TC-078: Create Subcontractor Contract
**Steps:**
1. Navigate to Subcontractor → Contracts
2. Click "Create Contract"
3. Fill in:
   - Subcontractor: "ABC Electrical Works"
   - Project: "Downtown Office Building"
   - Contract Number: "SUB-2024-001"
   - Title: "Complete Electrical Works"
   - Contract Type: "Lump Sum"
   - Scope of Work: "All electrical installations for 20-story building"
   - Contract Amount: 500000
   - Retention Amount: 10%
   - Start Date: Today
   - Planned End Date: 1 year from now
4. Click "Create"

**Expected Result:**
- Contract created
- Appears in contracts list
- Status: "Active"

**Actual Result:** _________

#### TC-079: Update Contract Status
**Steps:**
1. Navigate to contract: "SUB-2024-001"
2. Click "Update Status"
3. Fill in:
   - Status: "In Progress"
   - Completion Percentage: 25%
4. Click "Update"

**Expected Result:**
- Status updated
- Completion percentage recorded

**Actual Result:** _________

#### TC-080: Process Subcontractor Payment
**Steps:**
1. Navigate to Subcontractor → Payments
2. Click "Create Payment"
3. Fill in:
   - Subcontractor: "ABC Electrical Works"
   - Contract: "SUB-2024-001"
   - Payment Number: "PAY-001"
   - Payment Type: "Progress Payment"
   - Amount: 100000
   - Retention Deducted: 10000
   - Net Payment: 90000
   - Invoice Date: Today
   - Due Date: Next week
4. Click "Create"

**Expected Result:**
- Payment created
- Appears in payments list
- Status: "Pending"

**Actual Result:** _________

#### TC-081: Approve Payment
**Steps:**
1. Navigate to payments list
2. Find payment: "PAY-001"
3. Click "Approve"
4. Update status: "Approved"
5. Click "Approve"

**Expected Result:**
- Payment approved
- Status: "Approved"

**Actual Result:** _________

#### TC-082: Record Payment
**Steps:**
1. Navigate to approved payment
2. Click "Record Payment"
3. Fill in:
   - Payment Date: Today
   - Reference: "BANK-TRANSFER-001"
4. Click "Record"

**Expected Result:**
- Payment marked as paid
- Status: "Paid"
- Payment date recorded

**Actual Result:** _________

#### TC-083: Rate Subcontractor
**Steps:**
1. Navigate to Subcontractor → Ratings
2. Click "Rate Subcontractor"
3. Fill in:
   - Subcontractor: "ABC Electrical Works"
   - Evaluator: "Project Manager"
   - Quality of Work: 4
   - Timeliness: 5
   - Communication: 4
   - Professionalism: 5
   - Safety Compliance: 5
   - Budget Adherence: 4
   - Strengths: "Excellent work quality, always on time"
   - Weaknesses: "Communication could be better"
   - Would Recommend: Yes
4. Click "Submit"

**Expected Result:**
- Rating submitted
- Overall rating calculated
- Appears in ratings list

**Actual Result:** _________

#### TC-084: Subcontractor Summary Dashboard
**Steps:**
1. Navigate to Admin → Subcontractors
2. View summary dashboard

**Expected Result:**
- Dashboard shows:
  - Total Subcontractors: X
  - Active: X
  - Pending Approval: X
  - Expiring Insurance: X
  - Total Outstanding Balance: $XXX
  - Average Rating: X.X

**Actual Result:** _________

#### TC-085: View Subcontractor Details
**Steps:**
1. Click on subcontractor: "ABC Electrical Works"

**Expected Result:**
- Detailed view shows:
  - Contact Information
  - Contracts
  - Payments
  - Ratings
  - Performance History

**Actual Result:** _________

### Test Data Required
- Multiple subcontractors (different specialties)
- Contracts with various statuses
- Payment histories

---

## 12. Financial Management Testing

### Test Cases

#### TC-086: Create Invoice (Measured)
**Steps:**
1. Login as CompanyUser
2. Navigate to project BOQ Items
3. Click on item: "Excavation Work"
4. Click "Create Invoice"
5. Fill in:
   - Amount: 250000
   - Description: "Progress payment #1 - 50% excavation"
   - Invoice Date: Today
6. Click "Create"

**Expected Result:**
- Invoice created
- Invoice number generated
- Status: "Pending Review"

**Actual Result:** _________

#### TC-087: Review Invoice
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Invoices
3. Find invoice: "INV-001"
4. Click "Review"
5. Review details
6. Click "Approve"

**Expected Result:**
- Invoice approved
- Status: "Approved"
- Approved by recorded

**Actual Result:** _________

#### TC-088: Reject Invoice
**Steps:**
1. Find invoice to reject
2. Click "Reject"
3. Enter rejection reason: "Amount exceeds approved progress"
4. Click "Reject"

**Expected Result:**
- Invoice rejected
- Status: "Rejected"
- Reason recorded
- Creator notified

**Actual Result:** _________

#### TC-089: Record Client Payment
**Steps:**
1. Navigate to project Financials
2. Click "Record Payment"
3. Fill in:
   - Amount: 250000
   - Date: Today
   - Method: "Bank Transfer"
   - Reference: "TRF-2024-001"
   - Notes: "Progress payment #1"
4. Click "Record"

**Expected Result:**
- Payment recorded
- Cash flow updated
- Appears in payments list

**Actual Result:** _________

#### TC-090: Create Transaction (Expense)
**Steps:**
1. Navigate to project Financials
2. Click "Add Transaction"
3. Fill in:
   - Type: "Expense"
   - Amount: 50000
   - Date: Today
   - Description: "Material purchase - Steel"
   - Category: "Materials"
4. Click "Save"

**Expected Result:**
- Transaction created
- Expense recorded
- Balance updated

**Actual Result:** _________

#### TC-091: Create Transaction (Income)
**Steps:**
1. Navigate to project Financials
2. Click "Add Transaction"
3. Fill in:
   - Type: "Income"
   - Amount: 100000
   - Date: Today
   - Description: "Consulting fee"
4. Click "Save"

**Expected Result:**
- Transaction created
- Income recorded
- Balance updated

**Actual Result:** _________

#### TC-092: Create Cash Voucher
**Steps:**
1. Navigate to project Financials
2. Click "Create Cash Voucher"
3. Fill in:
   - Amount: 5000
   - Description: "Site supplies"
   - Date: Today
   - Category: "Petty Cash"
   - Recipient: "Site Supervisor"
4. Click "Create"

**Expected Result:**
- Voucher created
- Appears in vouchers list
- Cash flow updated

**Actual Result:** _________

#### TC-093: Record Miscellaneous Expense
**Steps:**
1. Navigate to project Financials
2. Click "Add Expense"
3. Fill in:
   - Amount: 250
   - Description: "Site safety equipment"
   - Date: Today
   - Category: "Safety"
4. Click "Save"

**Expected Result:**
- Expense recorded
- Appears in expenses list

**Actual Result:** _________

#### TC-094: View Project Financials
**Steps:**
1. Navigate to project detail
2. Go to "Financials" tab

**Expected Result:**
- Shows:
  - Total Revenue: $XXX
  - Total Costs: $XXX
  - Profit: $XXX
  - Profit Margin: XX%
  - Cash Flow: $XXX
  - Invoices: X (Pending/Approved)
  - Payments: X (Pending/Paid)

**Actual Result:** _________

#### TC-095: View Profitability Dashboard
**Steps:**
1. Navigate to Admin → Analytics → Profitability

**Expected Result:**
- Shows:
  - Project Profitability:
    - Total Estimated Budget: $XXX
    - Total Spent: $XXX
    - Total Profit: $XXX
    - Profit Percentage: XX%
  - Item Profitability:
    - Each BOQ item's profit/loss

**Actual Result:** _________

### Test Data Required
- BOQ items with different accounting types
- Multiple invoices and payments
- Various transaction types

---

## 13. Analytics & Reporting Testing

### Test Cases

#### TC-096: View Dashboard Summary
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Dashboard

**Expected Result:**
- Dashboard shows:
  - Project Statistics (Active, Completed, Delayed)
  - Financial Metrics (Revenue, Costs, Profit)
  - Resource Utilization (Labor, Equipment)
  - Quality Metrics (Score, Defects)
  - Safety Metrics (Incidents, Score)
  - Trend Charts

**Actual Result:** _________

#### TC-097: View Financial Analytics
**Steps:**
1. Navigate to Admin → Analytics → Financial

**Expected Result:**
- Shows:
  - Total Revenue: $XXX
  - Total Costs: $XXX
  - Gross Profit: $XXX
  - Profit Margin: XX%
  - Collection Rate: XX%
  - Cost Breakdown (Labor, Materials, Equipment, Subcontractors)
  - Monthly Trends (Revenue, Costs, Profit)

**Actual Result:** _________

#### TC-098: View Resource Analytics
**Steps:**
1. Navigate to Admin → Analytics → Resources

**Expected Result:**
- Shows:
  - Worker Statistics (Total, Active, Utilization)
  - Equipment Statistics (Total, Active, Utilization)
  - Labor Costs and Productivity
  - Equipment Costs and Maintenance
  - Project Resource Utilization
  - Top Performers

**Actual Result:** _________

#### TC-099: View KPI Dashboard
**Steps:**
1. Navigate to Admin → Analytics → KPI

**Expected Result:**
- Shows:
  - KPI Definitions (Name, Category, Target, Current Value)
  - KPI Status (On Target, Warning, Critical)
  - KPI Alerts
  - KPI Trend Charts

**Actual Result:** _________

#### TC-100: View Revenue Chart
**Steps:**
1. Navigate to Admin → Analytics
2. View Revenue Chart

**Expected Result:**
- Chart shows:
  - Monthly revenue over time
  - Comparison with previous periods
  - Trend indicators

**Actual Result:** _________

#### TC-101: View Project Progress Chart
**Steps:**
1. Navigate to Admin → Analytics
2. View Project Progress Chart

**Expected Result:**
- Chart shows:
  - Progress over time
  - Planned vs Actual
  - Milestone tracking

**Actual Result:** _________

#### TC-102: View Resource Utilization Chart
**Steps:**
1. Navigate to Admin → Analytics
2. View Resource Utilization Chart

**Expected Result:**
- Chart shows:
  - Labor utilization
  - Equipment utilization
  - Trends over time

**Actual Result:** _________

#### TC-103: View Cost Breakdown Chart
**Steps:**
1. Navigate to Admin → Analytics
2. View Cost Breakdown Chart

**Expected Result:**
- Chart shows:
  - Cost by category (Labor, Materials, Equipment, Subcontractors)
  - Percentage breakdown
  - Trends over time

**Actual Result:** _________

#### TC-104: Create Custom Report
**Steps:**
1. Navigate to Admin → Analytics → Reports
2. Click "Create Report"
3. Fill in:
   - Name: "Monthly Project Status"
   - Description: "Comprehensive monthly project report"
   - Report Type: "Project Status"
   - Category: "Operations"
   - Columns: ["Project Name", "Progress", "Status", "Budget", "Spent"]
   - Filters: ["Status=Active"]
   - Group By: "Status"
   - Sort By: "Progress"
   - Sort Order: "Descending"
   - Is Public: Yes
   - Is Scheduled: Yes
   - Schedule Frequency: "Monthly"
4. Click "Create"

**Expected Result:**
- Report definition created
- Appears in reports list
- Scheduled for monthly execution

**Actual Result:** _________

#### TC-105: Execute Report
**Steps:**
1. Navigate to Admin → Analytics → Reports
2. ClickMonthly Project Status"
3. Click " on report: "Execute"
4. Fill in parameters:
   - Start Date: First day of month
   - End Date: Today
   - Format: "PDF"
5. Click "Execute"

**Expected Result:**
- Report executed
- Data returned
- Can export to PDF

**Actual Result:** _________

#### TC-106: Export Report
**Steps:**
1. After executing report
2. Click "Export"
3. Select format: "Excel"
4. Download file

**Expected Result:**
- File downloaded
- Data matches report output
- Formatting preserved

**Actual Result:** _________

#### TC-107: Scheduled Report Execution
**Steps:**
1. Create scheduled report
2. Wait for scheduled time
3. Check report execution history

**Expected Result:**
- Report executed automatically
- Execution recorded in history
- Report available for download

**Actual Result:** _________

### Test Data Required
- Projects with financial data
- Historical data for trends
- Multiple KPI definitions

---

## 14. Notifications Testing

### Test Cases

#### TC-108: Receive Notification
**Steps:**
1. Configure company settings for notifications
2. Perform action that triggers notification (e.g., approve invoice)
3. Wait for notification (or refresh)

**Expected Result:**
- Notification appears in bell
- Notification badge count increases
- Sound played (if enabled)

**Actual Result:** _________

#### TC-109: View Notification Details
**Steps:**
1. Click on notification bell
2. Click on specific notification

**Expected Result:**
- Notification details shown
- Message, type, timestamp visible
- Action button if applicable

**Actual Result:** _________

#### TC-110: Mark Notification as Read
**Steps:**
1. View unread notification
2. Click "Mark as Read" or click notification

**Expected Result:**
- Notification marked as read
- Badge count decreases
- Notification grayed out

**Actual Result:** _________

#### TC-111: Mark All Notifications as Read
**Steps:**
1. Click on notification bell
2. Click "Mark All as Read"

**Expected Result:**
- All notifications marked as read
- Badge count goes to zero

**Actual Result:** _________

#### TC-112: Notification Types
**Test different notification types:**
1. Warning: Delay notification
2. Info: New invoice received
3. Success: Invoice approved
4. Error: System error

**Expected Result:**
- Each type shows appropriate icon/color
- Messages are clear and actionable

**Actual Result:** _________

### Test Data Required
- Various notification-triggering actions

---

## 15. Document Management Testing

### Test Cases

#### TC-113: Upload Document
**Steps:**
1. Login as CompanyUser
2. Navigate to Admin → Documents
3. Click "Upload Document"
4. Fill in:
   - Document Name: "Project Blueprint v1"
   - Description: "Initial architectural drawings"
   - Category: "Drawings"
   - Project: "Downtown Office Building"
5. Select file (PDF, DWG)
6. Click "Upload"

**Expected Result:**
- Document uploaded
- Metadata recorded
- Appears in documents list

**Actual Result:** _________

#### TC-114: Download Document
**Steps:**
1. Navigate to Documents
2. Find document: "Project Blueprint v1"
3. Click download icon

**Expected Result:**
- File downloads to device
- Original filename preserved

**Actual Result:** _________

#### TC-115: Filter Documents
**Steps:**
1. Navigate to Documents
2. Filter by:
   - Category: "Drawings"
   - Project: "Downtown Office Building"
3. Apply filters

**Expected Result:**
- Only matching documents shown
- Filters work correctly

**Actual Result:** _________

#### TC-116: Delete Document
**Steps:**
1. Navigate to Documents
2. Find document to delete
3. Click "Delete"
4. Confirm deletion

**Expected Result:**
- Document deleted
- Removed from list

**Actual Result:** _________

### Test Data Required
- Various document types (PDF, DOC, DWG, images)

---

## 16. Design Management Testing

### Test Cases

#### TC-117: Create Design Category
**Steps:**
1. Login as CompanyUser
2. Navigate to project: "Downtown Office Building"
3. Go to "Designs" tab
4. Click "Create Category"
5. Fill in:
   - Name: "Architectural Drawings"
   - Description: "All architectural designs"
   - Order: 1
6. Click "Save"

**Expected Result:**
- Category created
- Appears in categories list

**Actual Result:** _________

#### TC-118: Upload Design
**Steps:**
1. Navigate to project Designs
2. Click "Upload Design"
3. Fill in:
   - Name: "Floor Plan - Level 1"
   - Description: "Ground floor layout"
   - Category: "Architectural Drawings"
   - Status: "Draft"
4. Select file (PDF)
5. Click "Upload"

**Expected Result:**
- Design uploaded
- Appears in designs list
- Status: "Draft"

**Actual Result:** _________

#### TC-119: Create New Design Version
**Steps:**
1. Navigate to existing design: "Floor Plan - Level 1"
2. Click "Create New Version"
3. Select updated file
4. Fill in:
   - Change Notes: "Added emergency exits"
5. Click "Upload"

**Expected Result:**
- New version created
- Version number incremented
- Change notes recorded

**Actual Result:** _________

#### TC-120: Approve Design
**Steps:**
1. Navigate to design: "Floor Plan - Level 1"
2. Verify status is ready for approval
3. Click "Approve"
4. Add approval notes
5. Click "Approve"

**Expected Result:**
- Design approved
- Status: "Approved"
- Approval date recorded

**Actual Result:** _________

#### TC-121: Reject Design
**Steps:**
1. Navigate to design
2. Click "Reject"
3. Enter rejection reason: "Missing fire escape dimensions"
4. Click "Reject"

**Expected Result:**
- Design rejected
- Status: "Rejected"
- Reason recorded

**Actual Result:** _________

#### TC-122: View Design Versions
**Steps:**
1. Navigate to design details
2. View version history

**Expected Result:**
- All versions listed
- Each version shows: Number, Date, Change Notes
- Can download any version

**Actual Result:** _________

### Test Data Required
- Design files in various formats
- Multiple categories

---

## 17. Client Portal Testing

### Test Cases

#### TC-123: Client Login
**Steps:**
1. Navigate to Client Portal URL
2. Enter client credentials:
   - Email: `client@project.com`
   - Password: `Client@123`
3. Click "Login"

**Expected Result:**
- Login successful
- Redirected to client dashboard
- Shows client-specific information

**Actual Result:** _________

#### TC-124: View Client Dashboard
**Steps:**
1. After login, view dashboard

**Expected Result:**
- Shows:
  - Active Projects
  - Recent Activities
  - Payment Status
  - Notifications

**Actual Result:** _________

#### TC-125: View Project Progress
**Steps:**
1. Navigate to Client → Projects
2. Click on project: "Downtown Office Building"

**Expected Result:**
- Shows:
  - Project Details
  - Progress Percentage
  - BOQ Summary (if enabled)
  - Site Media (if enabled)
  - Financials (if enabled)

**Actual Result:** _________

#### TC-126: Make Payment
**Steps:**
1. Navigate to Client → Payments
2. Click "Make Payment"
3. Fill in:
   - Amount: 100000
   - Payment Method: "Bank Transfer"
   - Reference: "TRF-CLIENT-001"
4. Click "Submit"

**Expected Result:**
- Payment recorded
- Confirmation shown
- Admin notified

**Actual Result:** _________

#### TC-127: Send Message
**Steps:**
1. Navigate to Client → Messages
2. Click "New Message"
3. Fill in:
   - Subject: "Question about timeline"
   - Message: "When will phase 2 start?"
4. Click "Send"

**Expected Result:**
- Message sent
- Appears in conversation
- Admin can respond

**Actual Result:** _________

#### TC-128: View Change Orders
**Steps:**
1. Navigate to Client → Change Orders

**Expected Result:**
- Shows all change orders
- Can view details of each
- Can approve/reject change orders

**Actual Result:** _________

#### TC-129: Approve Change Order
**Steps:**
1. Find pending change order
2. Click "Approve"
3. Confirm approval

**Expected Result:**
- Change order approved
- Status updated
- Contract updated

**Actual Result:** _________

#### TC-130: View Client Documents
**Steps:**
1. Navigate to Client → Documents

**Expected Result:**
- Shows shared documents
- Can download documents
- Only approved documents visible

**Actual Result:** _________

#### TC-131: View Client Reports
**Steps:**
1. Navigate to Client → Reports

**Expected Result:**
- Shows available reports
- Can generate and download reports

**Actual Result:** _________

#### TC-132: Client Settings
**Steps:**
1. Navigate to Client → Settings
2. Update profile information
3. Change password
4. Configure notification preferences

**Expected Result:**
- Settings updated
- Changes reflected

**Actual Result:** _________

### Test Data Required
- Client user account
- Projects with client access enabled
- Change orders

---

## 18. Access Control Testing

### Test Cases

#### TC-133: View Roles
**Steps:**
1. Login as SuperAdmin
2. Navigate to Admin → Access Control → Roles

**Expected Result:**
- Shows all roles:
  - SuperAdmin
  - CompanyAdmin
  - CompanyUser
  - NormalUser
- Each role shows permissions count

**Actual Result:** _________

#### TC-134: View Permissions
**Steps:**
1. Navigate to Admin → Access Control → Permissions

**Expected Result:**
- Shows all permissions
- Organized by category
- Each permission shows name, description

**Actual Result:** _________

#### TC-135: Create Custom Role
**Steps:**
1. Navigate to Roles
2. Click "Add Role"
3. Fill in:
   - Name: "Project Supervisor"
   - Description: "Can manage projects and team"
4. Click "Save"

**Expected Result:**
- Role created
- No permissions assigned yet

**Actual Result:** _________

#### TC-136: Assign Permissions to Role
**Steps:**
1. Navigate to role: "Project Supervisor"
2. Click "Edit Permissions"
3. Select permissions:
   - Project.View
   - Project.Edit
   - Team.View
   - Team.Edit
   - DailyLog.View
4. Click "Save"

**Expected Result:**
- Permissions assigned
- Role updated

**Actual Result:** _________

#### TC-137: Test Role Access
**Steps:**
1. Create user with role: "Project Supervisor"
2. Login as that user
3. Try to access various features

**Expected Result:**
- Can access allowed features
- Cannot access restricted features
- Proper error messages for denied access

**Actual Result:** _________

### Test Data Required
- Custom roles with various permissions

---

## 19. HR Management Testing

### Test Cases

#### TC-138: View Employee List
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → HR

**Expected Result:**
- Shows all employees
- Each employee shows: Name, Role, Status, Department
- Pagination works

**Actual Result:** _________

#### TC-139: Create Employee
**Steps:**
1. Click "Add New User"
2. Fill in:
   - Full Name: "Ahmed Hassan"
   - Email: `ahmed@company.com`
   - Role: CompanyUser
   - Salary: 8000
   - Status: Working
   - Reports To: "Project Manager"
3. Click "Save"

**Expected Result:**
- Employee created
- User account created
- Can login after password set

**Actual Result:** _________

#### TC-140: View Employee Details
**Steps:**
1. Click on employee: "Ahmed Hassan"

**Expected Result:**
- Shows:
  - Personal Information
  - Employment Details
  - Salary Records
  - Performance Metrics
  - Leave Requests

**Actual Result:** _________

#### TC-141: View Salary Records
**Steps:**
1. Navigate to employee details
2. Go to "Salary" tab

**Expected Result:**
- Shows salary history
- Each record: Month, Basic, Bonus, Deductions, Net
- Status (Paid/Pending)

**Actual Result:** _________

#### TC-142: Create Leave Request
**Steps:**
1. Login as employee
2. Navigate to Worker → Personal HR
3. Click "Request Leave"
4. Fill in:
   - Type: "Annual"
   - Start Date: Next week
   - End Date: 1 week
   - Reason: "Family vacation"
5. Click "Submit"

**Expected Result:**
- Leave request created
- Status: "Pending"
- Manager receives notification

**Actual Result:** _________

#### TC-143: Approve Leave Request
**Steps:**
1. Login as manager
2. Navigate to HR
3. Find leave request
4. Click "Approve"
5. Add notes
6. Click "Approve"

**Expected Result:**
- Leave approved
- Status: "Approved"
- Employee notified

**Actual Result:** _________

#### TC-144: View Performance Metrics
**Steps:**
1. Navigate to employee details
2. Go to "Performance" tab

**Expected Result:**
- Shows:
  - Tasks Completed
  - Efficiency Score
  - Attendance Rate
  - Approved Items
  - Rejected Items
  - Overall Status (Peak/Steady/Below Average)

**Actual Result:** _________

### Test Data Required
- Multiple employees with different roles
- Salary history
- Leave requests

---

## 20. Vendor Management Testing

### Test Cases

#### TC-145: Create Vendor
**Steps:**
1. Login as CompanyAdmin
2. Navigate to Admin → Vendors
3. Click "Add Vendor"
4. Fill in:
   - Name: "ABC Building Materials"
   - Contact Person: "Sales Manager"
   - Phone: "+1234567890"
   - Email: `sales@abcbuilding.com`
   - Address: "456 Supply Street"
   - Tax Number: "TAX-789"
   - Categories: "Concrete, Steel, Lumber"
5. Click "Save"

**Expected Result:**
- Vendor created
- Appears in vendors list

**Actual Result:** _________

#### TC-146: View Vendor Details
**Steps:**
1. Click on vendor: "ABC Building Materials"

**Expected Result:**
- Shows:
  - Contact Information
  - Categories
  - Performance Rating
  - Order History
  - Payment Terms

**Actual Result:** _________

#### TC-147: Filter Vendors by Category
**Steps:**
1. Navigate to Vendors
2. Filter by category: "Concrete"

**Expected Result:**
- Only vendors in concrete category shown

**Actual Result:** _________

### Test Data Required
- Multiple vendors with different categories

---

## Testing Checklist Summary

### Pre-Test Checklist
- [ ] Database migrations applied
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Test accounts created
- [ ] Test data prepared

### Test Execution Checklist
- [ ] All test cases executed
- [ ] Results documented
- [ ] Issues logged
- [ ] Retesting performed for fixed issues

### Post-Test Checklist
- [ ] All bugs documented
- [ ] Performance metrics captured
- [ ] Security issues identified
- [ ] Test report generated

---

## Bug Reporting Template

When logging bugs, use this format:

```
Bug ID: [Auto-assigned]
Title: [Brief description]
Module: [Feature/Module]
Severity: [Critical/High/Medium/Low]
Priority: [High/Medium/Low]
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Environment:
- Browser: [Chrome/Firefox/Edge]
- OS: [Windows/Mac/Linux]
- API Version: [X.X.X]

Screenshots: [Attach if applicable]
Logs: [Attach relevant logs]
```

---

## Performance Testing Guidelines

### Key Metrics to Track
1. **Page Load Time**: Target < 3 seconds
2. **API Response Time**: Target < 500ms
3. **Concurrent Users**: Test with expected user load × 2
4. **Data Processing Time**: Test with large datasets

### Load Testing Scenarios
1. **Login**: 100 concurrent users
2. **Dashboard**: 100 concurrent users
3. **Report Generation**: 20 concurrent users
4. **Media Upload**: 10 concurrent users

---

## Security Testing Guidelines

### Areas to Test
1. **Authentication**: Login, logout, session timeout
2. **Authorization**: Role-based access control
3. **Input Validation**: SQL injection, XSS prevention
4. **Data Encryption**: Sensitive data protection
5. **API Security**: JWT token validation

### Test Cases
1. Try accessing admin features as regular user
2. Try SQL injection in input fields
3. Try XSS in form fields
4. Try manipulating API requests
5. Try accessing other users' data

---

## Conclusion

This comprehensive testing guide covers all features of the Construction Management System. Follow the test cases systematically, document results, and report any issues encountered. Regular testing ensures the system meets quality standards and provides a reliable experience for all users.

For questions or support, refer to the API documentation or contact the development team.