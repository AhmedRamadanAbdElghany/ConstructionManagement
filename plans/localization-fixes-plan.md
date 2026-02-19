# Localization Fixes Plan

## Overview
This plan addresses all remaining hardcoded English text in the Construction CMS application that needs to be localized for Arabic/English support.

## Issues Identified

### 1. Projects Component - Validation Error Messages
**File:** `construction-cms/src/app/features/admin/projects/projects.component.ts`
**Lines:** 712-728

**Current Code:**
```typescript
if (!f.name) errors.push('Project Name');
if (!f.startDate) errors.push('Start Date');
if (!f.endDate) errors.push('Target End Date');
if (f.calculationMethod === 'Measured' && (!f.totalContractValue || f.totalContractValue <= 0)) {
  errors.push('Total Project Cost');
}
if (f.calculationMethod === 'Packages' && !f.packageId) {
  errors.push('Contract Package selection');
}
if (f.extraFees > 0 && !f.extraFeesDescription) errors.push('Extra Fees Description');
if (f.deductedAmount > 0 && !f.deductedAmountDescription) errors.push('Deduction Reason (وصف الخصم)');
```

**Fix:** Replace with translation keys using `TranslateService.instant()`

---

### 2. Project Detail Component - Hardcoded Labels
**File:** `construction-cms/src/app/features/admin/projects/project-detail/project-detail.component.ts`

| Line | Current Text | Translation Key |
|------|-------------|-----------------|
| 1140 | Mobilization Date | `projects.mobilization_date` |
| 1145 | Anticipated Handover | `projects.anticipated_handover` |
| 1357 | Start Date | `common.start_date` |
| 1362 | End Date | `common.end_date` |
| 1419 | Date | `common.date` |
| 1495 | Date Received | `common.date_received` |
| 1936 | Address | `common.address` |
| 1937 | Start Date | `common.start_date` |
| 1938 | End Date | `common.end_date` |

---

### 3. BOQ Items Component - Hardcoded Labels
**File:** `construction-cms/src/app/features/admin/projects/boq-items/boq-items.component.ts`

| Line | Current Text | Translation Key |
|------|-------------|-----------------|
| 233 | Start Date | `common.start_date` |
| 239 | End Date | `common.end_date` |

---

### 4. Subcontractor Contracts Component - Hardcoded Labels
**File:** `construction-cms/src/app/features/admin/subcontractor/subcontractor-contracts/subcontractor-contracts.component.ts`

| Line | Current Text | Translation Key |
|------|-------------|-----------------|
| 250 | Start Date * | `subcontractors.start_date_required` |
| 257 | Planned End Date | `subcontractors.planned_end_date` |

---

### 5. Subcontractor Payments Component - Hardcoded Labels
**File:** `construction-cms/src/app/features/admin/subcontractor/subcontractor-payments/subcontractor-payments.component.ts`

| Line | Current Text | Translation Key |
|------|-------------|-----------------|
| 321 | Invoice Date * | `subcontractors.invoice_date_required` |
| 326 | Due Date | `subcontractors.due_date` |

---

### 6. Daily Logs Component - Hardcoded Labels
**File:** `construction-cms/src/app/features/admin/projects/daily-logs/daily-logs.component.ts`

| Line | Current Text | Translation Key |
|------|-------------|-----------------|
| 210 | Log Date * | `daily_logs.log_date_required` |

---

### 7. Vendors Component - Hardcoded Labels
**File:** `construction-cms/src/app/features/admin/vendors/vendors.component.ts`

| Line | Current Text | Translation Key |
|------|-------------|-----------------|
| 424 | From | `common.from` |
| 428 | To | `common.to` |

---

## Translation Keys to Add

### en.json Additions:
```json
{
  "common": {
    "start_date": "Start Date",
    "end_date": "End Date",
    "date": "Date",
    "date_received": "Date Received",
    "address": "Address",
    "from": "From",
    "to": "To"
  },
  "projects": {
    "project_name": "Project Name",
    "target_end_date": "Target End Date",
    "total_project_cost": "Total Project Cost",
    "contract_package_selection": "Contract Package Selection",
    "extra_fees_description": "Extra Fees Description",
    "deduction_reason": "Deduction Reason",
    "mobilization_date": "Mobilization Date",
    "anticipated_handover": "Anticipated Handover"
  },
  "subcontractors": {
    "start_date_required": "Start Date *",
    "planned_end_date": "Planned End Date",
    "invoice_date_required": "Invoice Date *",
    "due_date": "Due Date"
  },
  "daily_logs": {
    "log_date_required": "Log Date *"
  }
}
```

### ar.json Additions:
```json
{
  "common": {
    "start_date": "تاريخ البدء",
    "end_date": "تاريخ الانتهاء",
    "date": "التاريخ",
    "date_received": "تاريخ الاستلام",
    "address": "العنوان",
    "from": "من",
    "to": "إلى"
  },
  "projects": {
    "project_name": "اسم المشروع",
    "target_end_date": "تاريخ الانتهاء المستهدف",
    "total_project_cost": "إجمالي تكلفة المشروع",
    "contract_package_selection": "اختيار حزمة العقد",
    "extra_fees_description": "وصف الرسوم الإضافية",
    "deduction_reason": "سبب الخصم",
    "mobilization_date": "تاريخ التعبئة",
    "anticipated_handover": "التسليم المتوقع"
  },
  "subcontractors": {
    "start_date_required": "تاريخ البدء *",
    "planned_end_date": "تاريخ الانتهاء المخطط",
    "invoice_date_required": "تاريخ الفاتورة *",
    "due_date": "تاريخ الاستحقاق"
  },
  "daily_logs": {
    "log_date_required": "تاريخ السجل *"
  }
}
```

---

## Implementation Steps

### Step 1: Add Translation Keys
Add all missing translation keys to both `en.json` and `ar.json` files.

### Step 2: Fix Projects Component
Update [`projects.component.ts`](construction-cms/src/app/features/admin/projects/projects.component.ts:712) to use `TranslateService.instant()` for validation errors.

### Step 3: Fix Project Detail Component
Update [`project-detail.component.ts`](construction-cms/src/app/features/admin/projects/project-detail/project-detail.component.ts:1140) to use translation pipe for all hardcoded labels.

### Step 4: Fix BOQ Items Component
Update [`boq-items.component.ts`](construction-cms/src/app/features/admin/projects/boq-items/boq-items.component.ts:233) to use translation pipe.

### Step 5: Fix Subcontractor Components
Update both [`subcontractor-contracts.component.ts`](construction-cms/src/app/features/admin/subcontractor/subcontractor-contracts/subcontractor-contracts.component.ts:250) and [`subcontractor-payments.component.ts`](construction-cms/src/app/features/admin/subcontractor/subcontractor-payments/subcontractor-payments.component.ts:321).

### Step 6: Fix Daily Logs Component
Update [`daily-logs.component.ts`](construction-cms/src/app/features/admin/projects/daily-logs/daily-logs.component.ts:210).

### Step 7: Fix Vendors Component
Update [`vendors.component.ts`](construction-cms/src/app/features/admin/vendors/vendors.component.ts:424).

### Step 8: Verify Build
Run `ng build` to ensure all changes compile successfully.

---

## Notes

1. **Currency Display**: The `$0` issue in HR component is due to the Angular currency pipe using USD. For Arabic, we may want to consider displaying currency differently or keeping it as-is since USD is an international currency.

2. **Date Format**: HTML5 date inputs (`type="date"`) always display in the browser's locale format. The `mm/dd/yyyy` placeholder is browser-dependent and cannot be easily changed via Angular. The actual date display format will follow the user's browser locale settings.

3. **Translation Service**: For validation error messages in TypeScript code (not templates), use `TranslateService.instant()` which requires translations to be loaded first. This is already handled by the fix in `I18nService`.
