# Dashboard i18n Fix Plan

## Problem Analysis

### Issue 1: Hardcoded "93%" Dummy Data
**Location**: `construction-cms/src/app/features/common/dashboard/dashboard.component.ts` line 156

```html
<span class="text-emerald-500 text-sm font-black">93% {{ 'project_detail.health_score' | translate }}</span>
```

**Problem**: The "93%" is hardcoded dummy data. This should either:
- Be removed entirely
- Be replaced with actual dynamic data from the backend
- Use a proper translation key like `dashboard.subscription_health` with the percentage as a parameter

### Issue 2: Translation Key Display Issue
The translation key `project_detail.health_score` exists in both translation files:
- `en.json`: `"health_score": "Health Score"`
- `ar.json`: `"health_score": "نقاط الصحة"`

If the key is showing as raw text "project_detail.health_score" instead of the translated value, this could indicate:
1. TranslateModule not properly imported (but it IS imported)
2. Translation service not loading properly
3. Key path resolution issue

### Issue 3: Multiple Hardcoded Strings in Dashboard

The dashboard component has numerous hardcoded English strings that won't translate to Arabic:

#### Pending Approval View (Lines 40-120)
| Line | Hardcoded Text | Suggested Translation Key |
|------|---------------|-------------------------|
| 41 | "Welcome to STRUCT" | `dashboard.welcome_to_struct` |
| 44 | "We're excited to have you on board..." | `dashboard.onboard_message` |
| 54 | "Activation Progress" | `dashboard.activation_progress` |
| 56 | "Live Status: Auditing" | `dashboard.live_status_auditing` |
| 72 | "Created" | `dashboard.step_created` |
| 73 | "Completed" | `dashboard.step_completed` |
| 81 | "Verification" | `dashboard.step_verification` |
| 82 | "Verified" | `dashboard.step_verified` |
| 92 | "Audit" | `dashboard.step_audit` |
| 93 | "In Progress" | `dashboard.in_progress` |
| 101 | "Activation" | `dashboard.step_activation` |
| 110 | "What happens next?" | `dashboard.what_happens_next` |
| 112 | "1-2 business days" | `dashboard.business_days` |

#### Client Dashboard Section (Lines 300-660)
| Line | Hardcoded Text | Suggested Translation Key |
|------|---------------|-------------------------|
| 300 | "Your Construction Journey Starts Here" | `client_portal.journey_starts` |
| 302 | "Join a professional company..." | `client_portal.join_company_desc` |
| 313 | "Browse Verified Firms" | `client_portal.browse_firms` |
| 314 | "Find the perfect partner..." | `client_portal.browse_firms_desc` |
| 315 | "Explore Firms" | `client_portal.explore_firms` |
| 324 | "Nearby Suppliers" | `client_portal.nearby_suppliers` |
| 325 | "Source materials directly..." | `client_portal.suppliers_desc` |
| 326 | "Find Suppliers" | `client_portal.find_suppliers` |
| 406 | "Paid Ratio" | `client_portal.paid_ratio` |
| 418 | "Total Paid" | `client_portal.total_paid` |
| 427 | "Pending" | `client_portal.pending` |
| 436 | "Total Contract Value" | `client_portal.total_contract_value` |
| 449-450 | "No financial data yet" | `client_portal.no_financial_data` |
| 473 | "Project Files" | `client_portal.project_files` |
| 478 | "Invoices" | `client_portal.invoices` |
| 490 | "Real-time Site Status" | `client_portal.realtime_status` |
| 494 | "View All" | `common.view_all` |
| 528-541 | "Company", "Last Update", "Duration", "Manager" | Various keys |
| 557 | "Progress" | `common.progress` |
| 563 | "Enter Project Details" | `client_portal.enter_project` |
| 581-582 | "No Active Projects" | `client_portal.no_active_projects` |
| 594 | "Project Momentum" | `client_portal.project_momentum` |
| 620 | "No Recent Milestones" | `client_portal.no_milestones` |
| 631 | "Communication" | `client_portal.communication` |
| 651 | "Inbox Zero" | `client_portal.inbox_zero` |
| 657 | "Open Messages" | `client_portal.open_messages` |

#### Worker Dashboard Section (Lines 670-800+)
| Line | Hardcoded Text | Suggested Translation Key |
|------|---------------|-------------------------|
| 740 | "94%" (hardcoded efficiency) | Should be dynamic data |
| 775 | "+12" (hardcoded worker count) | Should be dynamic data |

## Implementation Plan

### Step 1: Add Translation Keys to en.json
Add all new translation keys under appropriate sections (`dashboard`, `client_portal`, `common`).

### Step 2: Add Arabic Translations to ar.json
Add corresponding Arabic translations for all new keys.

### Step 3: Update Dashboard Component
1. Replace hardcoded "93%" with either:
   - Remove the percentage display entirely
   - Use dynamic data from backend: `{{ saStats.healthScore }}%`
   - Or use a translation with parameter

2. Replace all hardcoded strings with translation pipe:
   ```html
   <!-- Before -->
   <p>Created</p>
   
   <!-- After -->
   <p>{{ 'dashboard.step_created' | translate }}</p>
   ```

### Step 4: Remove Dummy Data
Remove or replace hardcoded dummy values:
- Line 156: "93%" - should be dynamic or removed
- Line 173: "+18% MoM" - should be dynamic or removed
- Line 740: "94%" efficiency - should be dynamic
- Line 775: "+12" workers - should be dynamic

## Translation Keys to Add

### en.json additions:
```json
{
  "dashboard": {
    "welcome_to_struct": "Welcome to STRUCT",
    "onboard_message": "We're excited to have you on board. Your professional workspace is being prepared to deliver a premium management experience.",
    "activation_progress": "Activation Progress",
    "live_status_auditing": "Live Status: Auditing",
    "step_created": "Created",
    "step_completed": "Completed",
    "step_verification": "Verification",
    "step_verified": "Verified",
    "step_audit": "Audit",
    "in_progress": "In Progress",
    "step_activation": "Activation",
    "what_happens_next": "What happens next?",
    "business_days": "1-2 business days",
    "review_message": "Our compliance team is reviewing your company documents and registration details. This typically takes {days}. You will receive an email and a system notification as soon as your professional dashboard is unlocked.",
    "subscription_health": "Subscription Health"
  },
  "client_portal": {
    "journey_starts": "Your Construction Journey Starts Here",
    "join_company_desc": "Join a professional company to manage your project, or explore our curated list of suppliers and partners nearby.",
    "browse_firms": "Browse Verified Firms",
    "browse_firms_desc": "Find the perfect partner for your construction or renovation needs. Compare portfolios and reviews.",
    "explore_firms": "Explore Firms",
    "nearby_suppliers": "Nearby Suppliers",
    "suppliers_desc": "Source materials directly from local vendors. Get the best prices on cement, steel, and more.",
    "find_suppliers": "Find Suppliers",
    "paid_ratio": "Paid Ratio",
    "total_paid": "Total Paid",
    "pending": "Pending",
    "total_contract_value": "Total Contract Value",
    "no_financial_data": "No financial data yet",
    "no_financial_data_desc": "Investment metrics will appear here once your project begins.",
    "project_files": "Project Files",
    "invoices": "Invoices",
    "realtime_status": "Real-time Site Status",
    "view_all": "View All",
    "company": "Company",
    "last_update": "Last Update",
    "duration": "Duration",
    "manager": "Manager",
    "active_ops": "Active Ops",
    "live_view": "Live View",
    "progress": "Progress",
    "enter_project": "Enter Project Details",
    "no_active_projects": "No Active Projects",
    "no_projects_desc": "Your dashboard will light up with real-time progress updates once a project is assigned to you.",
    "project_momentum": "Project Momentum",
    "no_milestones": "No Recent Milestones",
    "communication": "Communication",
    "inbox_zero": "Inbox Zero",
    "open_messages": "Open Messages"
  }
}
```

### ar.json additions:
```json
{
  "dashboard": {
    "welcome_to_struct": "مرحباً بك في STRUCT",
    "onboard_message": "نحن متحمسون لانضمامك إلينا. يتم حالياً إعداد مساحة العمل الاحترافية الخاصة بك لتقديم تجربة إدارة متميزة.",
    "activation_progress": "تقدم التفعيل",
    "live_status_auditing": "الحالة المباشرة: قيد المراجعة",
    "step_created": "تم الإنشاء",
    "step_completed": "مكتمل",
    "step_verification": "التحقق",
    "step_verified": "تم التحقق",
    "step_audit": "المراجعة",
    "in_progress": "قيد التنفيذ",
    "step_activation": "التفعيل",
    "what_happens_next": "ماذا بعد؟",
    "business_days": "1-2 أيام عمل",
    "review_message": "فريق الامتثال لدينا يراجع مستندات شركة وتفاصيل التسجيل الخاص بك. عادة ما يستغرق ذلك {days}. ستتلقى بريداً إلكترونياً وإشعاراً بالنظام بمجرد فتح لوحة التحكم الاحترافية الخاصة بك.",
    "subscription_health": "صحة الاشتراك"
  },
  "client_portal": {
    "journey_starts": "رحلة البناء الخاصة بك تبدأ من هنا",
    "join_company_desc": "انضم إلى شركة مهنية لإدارة مشروعك، أو استكشف قائمتنا المختارة من الموردين والشركاء القريبين.",
    "browse_firms": "تصفح الشركات المعتمدة",
    "browse_firms_desc": "ابحث عن الشريك المثالي لاحتياجات البناء أو التجديد الخاصة بك. قارن بين المحافظ والتقييمات.",
    "explore_firms": "استكشف الشركات",
    "nearby_suppliers": "الموردين القريبين",
    "suppliers_desc": "احصل على المواد مباشرة من البائعين المحليين. احصل على أفضل الأسعار للأسمنت والحديد والمزيد.",
    "find_suppliers": "ابحث عن الموردين",
    "paid_ratio": "نسبة المدفوع",
    "total_paid": "إجمالي المدفوع",
    "pending": "قيد الانتظار",
    "total_contract_value": "إجمالي قيمة العقد",
    "no_financial_data": "لا توجد بيانات مالية بعد",
    "no_financial_data_desc": "ستظهر مقاييس الاستثمار هنا بمجرد بدء مشروعك.",
    "project_files": "ملفات المشروع",
    "invoices": "الفواتير",
    "realtime_status": "حالة الموقع في الوقت الفعلي",
    "view_all": "عرض الكل",
    "company": "الشركة",
    "last_update": "آخر تحديث",
    "duration": "المدة",
    "manager": "المدير",
    "active_ops": "عمليات نشطة",
    "live_view": "عرض مباشر",
    "progress": "التقدم",
    "enter_project": "أدخل تفاصيل المشروع",
    "no_active_projects": "لا توجد مشاريع نشطة",
    "no_projects_desc": "ستضيء لوحة التحكم الخاصة بك بتحديثات التقدم في الوقت الفعلي بمجرد تعيين مشروع لك.",
    "project_momentum": "زخم المشروع",
    "no_milestones": "لا توجد معالم حديثة",
    "communication": "التواصل",
    "inbox_zero": "صندوق الوارد فارغ",
    "open_messages": "فتح الرسائل"
  }
}
```

## Files to Modify

1. **`construction-cms/src/assets/i18n/en.json`** - Add new translation keys
2. **`construction-cms/src/assets/i18n/ar.json`** - Add Arabic translations
3. **`construction-cms/src/app/features/common/dashboard/dashboard.component.ts`** - Replace hardcoded strings with translations

## Notes

- The `project_detail.health_score` key already exists and has proper translations
- The issue with "93% project_detail.health_score" appearing as raw text might be a runtime issue with the translation service
- All dummy data values (percentages, counts) should ideally come from the backend API
