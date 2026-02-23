# Warehouse Marketplace System - خطة تفصيلية شاملة

## نظرة عامة

تحويل النظام إلى منصة متكاملة لأصحاب مخازن مواد البناء والتشطيبات، تمكنهم من:
- إدارة منتجاتهم ومبيعاتهم ومشترياتهم
- إدارة الموارد البشرية (العاملين معاهم)
- الظهور للعملاء مع إمكانية البحث والطلب والدفع

**ملاحظة مهمة**: المخزن = شركة (نفس النظام بالظبط)
- صاحب المخزن يسجل → طلب انضمام للسيستم → System Admin يوافق/يرفض
- بعد الموافقة، صاحب المخزن يقدر ينشئ Roles خاصة بمخزنه
- العاملين يقدروا يطلبوا الانضمام للمخزن
- صاحب المخزن يحدد صلاحيات كل عامل

---

## القرارات الرئيسية

| القرار | الاختيار |
|--------|----------|
| دمج InventoryOwner و WarehouseOwner | ✅ دمج في نوع واحد (InventoryOwner) |
| نظام الانضمام | **المخزن = شركة** (طلب انضمام للسيستم + موافقة System Admin) |
| البحث بالقرب | اليوزر يحدد المسافة اللي عايزها (مش ثابتة) |
| أقسام المنتجات | محددة مسبقاً + طلب إنشاء أقسام جديدة بموافقة Admin |
| نظام الدفع | كل أنظمة الدفع المصرية (PayMob, Fawry, محافظ إلكترونية, كاش) |
| Roles والصلاحيات | صاحب المخزن ينشئ Roles خاصة بمخزنه ويحدد صلاحيات كل عامل |

---

## الميزات المطلوبة

### 1. إدارة المنتجات والمخزون

#### 1.1 أقسام المنتجات (Product Categories)
```
أقسام محددة مسبقاً:
├── مواد البناء
│   ├── أسمنت
│   ├── رمل وزلط
│   ├── حديد تسليح
│   ├── طوب وبلوك
│   └── خرسانة جاهزة
├── مواد التشطيب
│   ├── سيراميك وبلاط
│   ├── دهان وطلاء
│   ├── أرضيات
│   └── أسقف معلقة
├── أبواب وشبابيك
│   ├── أبواب خشب
│   ├── أبواب المنيوم
│   ├── شبابيك PVC
│   └── شبابيك المنيوم
├── أدوات صحية
│   ├── حمامات
│   ├── مطابخ
│   └── خلاطات
├── كهربائيات
│   ├── أسلاك وكابلات
│   ├── لوحات كهربائية
│   └── إضاءة
└── سباكة
    ├── مواسير
    ├── وصلات
    └── محابس
```

#### 1.2 طلب إنشاء قسم جديد
- المستخدم يطلب إنشاء قسم جديد
- الطلب يذهب للـ System Admin
- Admin يوافق أو يرفض أو يوجهه للقسم الموجود
- عند الموافقة، القسم يظهر للجميع

#### 1.3 إدارة المنتجات
- إضافة منتجات (اسم، وصف، سعر، وحدة، صور)
- تحديث الأسعار والكميات
- تتبع المخزون (تنبيهات نقص المخزون)
- إدارة خصومات وعروض

---

### 2. نظام المبيعات والمشتريات

#### 2.1 المبيعات
- استقبال الطلبات من العملاء
- تأكيد الطلبات أو رفضها
- تحديث حالة الطلب (جديد، قيد التجهيز، جاهز للتسليم، تم التسليم)
- إصدار فواتير

#### 2.2 المشتريات
- تسجيل المشتريات من الموردين
- تحديث المخزون تلقائياً
- تتبع تكلفة البضاعة

#### 2.3 التقارير
- تقرير المبيعات اليومية/الشهرية
- تقرير الأرباح والخسائر
- تقرير المنتجات الأكثر مبيعاً
- تقرير المخزون

---

### 3. نظام الموارد البشرية للمخزن (المخزن = شركة)

#### 3.1 تسجيل صاحب المخزن
- صاحب المخزن يسجل → **طلب انضمام للسيستم** (زي CompanyOwner بالظبط)
- System Admin يوافق أو يرفض
- بعد الموافقة، صاحب المخزن يقدر يبدأ يضيف منتجاته وعماله

#### 3.2 إدارة Roles والصلاحيات
- **صاحب المخزن ينشئ Roles خاصة بمخزنه**:
  - محاسب (صلاحيات مالية)
  - عامل مخزن (إضافة/تعديل المنتجات)
  - سائق (تسليم الطلبات)
  - مبيعات (استقبال الطلبات)
- **صاحب المخزن يحدد صلاحيات كل Role**:
  - إدارة المنتجات
  - إدارة الطلبات
  - إدارة المبيعات
  - التقارير
  - إدارة العاملين

#### 3.3 طلبات الانضمام للمخزن
- العاملين يقدروا يعملوا طلب انضمام للمخزن
- صاحب المخزن يوافق أو يرفض
- تحديد Role العامل وصلاحياته

#### 3.4 إدارة العاملين
- بيانات العاملين
- تتبع الحضور والانصراف
- حساب المرتبات

#### 3.5 الحضور والانصراف
- تسجيل حضور وانصراف يومي
- حساب ساعات العمل
- حساب الإضافي

---

### 4. صفحة المنتجات العامة (Marketplace)

#### 4.1 عرض المنتجات للعملاء
- عرض كل المنتجات من كل البائعين
- فلترة حسب القسم
- فلترة حسب الموقع
- فلترة حسب السعر

#### 4.2 البحث بالقرب
- **اليوزر يحدد المسافة اللي عايزها** (مش ثابتة)
- عرض البائعين ضمن النطاق المحدد
- عرض اللوكيشن والعنوان
- ترتيب حسب القرب

#### 4.3 صفحة البائع
- معلومات البائع (اسم، عنوان، تقييم)
- عدد الطلبات المباعة
- المنتجات المتاحة
- التقييمات والتعليقات

---

### 5. نظام الطلبات للعملاء

#### 5.1 إنشاء طلب
- اختيار المنتجات
- تحديد الكمية
- تحديد عنوان التسليم
- اختيار طريقة الدفع

#### 5.2 تتبع الطلب
- حالة الطلب
- تاريخ التسليم المتوقع
- معلومات السائق (إن وجد)

#### 5.3 إتمام الطلب
- تأكيد الاستلام
- تقييم البائع
- إضافة تعليق

---

### 6. نظام الدفع

#### 6.1 طرق الدفع المصرية
- **بطاقات الائتمان** (Visa, Mastercard)
- **PayMob** - بوابة دفع مصرية
- **Fawry** - فوري
- **المحافظ الإلكترونية**:
  - Vodafone Cash
  - Orange Money
  - Etisalat Cash
- **كاش** - الدفع عند الاستلام

#### 6.2 إدارة المدفوعات
- تسجيل المدفوعات
- إصدار إيصالات
- تتبع المدفوعات المعلقة
- استرداد المبالغ (إن لزم)

---

### 7. نظام التقييمات

#### 7.1 تقييم البائع
- تقييم من 1-5 نجوم
- تعليق مكتوب
- تقييم جودة المنتج
- تقييم سرعة التسليم
- تقييم التعامل

#### 7.2 عرض التقييمات
- متوسط التقييم
- عدد التقييمات
- آخر التقييمات

---

## البنية التقنية

### قاعدة البيانات - الكيانات الجديدة

**ملاحظة مهمة**: المخزن = شركة، لذا سنستخدم نفس جدول Company مع إضافة نوع (CompanyType)

```mermaid
erDiagram
    User ||--o{ Company : owns
    User ||--o{ JoinRequest : submits
    Company ||--o{ Vendor : has
    Company ||--o{ Role : has
    Company ||--o{ User : employees
    Vendor ||--o{ VendorProduct : has
    Vendor ||--o{ InventoryOrder : receives
    Vendor ||--o{ VendorReview : receives
    VendorProduct }o--|| ProductCategory : belongs_to
    ProductCategory ||--o{ CategoryRequest : has_requests
    Role ||--o{ Permission : has
    
    User {
        int Id
        string FullName
        string Email
        UserType UserType
        double Latitude
        double Longitude
        int CompanyId
    }
    
    Company {
        int Id
        string Name
        string CompanyType - Construction or Warehouse
        string Address
        double Latitude
        double Longitude
        string Status - Pending, Active, Rejected
    }
    
    Vendor {
        int Id
        int CompanyId
        int UserId
        string Name
        string Address
        double Latitude
        double Longitude
        bool IsPublic
        decimal AverageRating
        int TotalOrders
    }
    
    VendorProduct {
        int Id
        int VendorId
        int CategoryId
        string Name
        decimal Price
        decimal QuantityInStock
        string Unit
    }
    
    ProductCategory {
        int Id
        string Name
        string NameAr
        int ParentCategoryId
        bool IsApproved
        string Icon
    }
    
    CategoryRequest {
        int Id
        int UserId
        string Name
        string Description
        string Status
        int ReviewedBy
    }
    
    Role {
        int Id
        int CompanyId
        string Name
        string Description
    }
    
    Permission {
        int Id
        int RoleId
        string Name
        bool CanView
        bool CanEdit
        bool CanDelete
    }
    
    InventoryOrder {
        int Id
        int VendorId
        int CustomerId
        string Status
        decimal TotalAmount
        string PaymentMethod
        string PaymentStatus
    }
    
    VendorReview {
        int Id
        int VendorId
        int CustomerId
        int Rating
        string Comment
    }
```

---

### API Endpoints الجديدة

#### Product Categories
```
GET    /api/categories                    - عرض كل الأقسام
GET    /api/categories/tree               - عرض شجرة الأقسام
POST   /api/categories/request            - طلب إنشاء قسم جديد
GET    /api/categories/requests           - Admin: عرض طلبات الأقسام
PUT    /api/categories/requests/{id}      - Admin: موافقة/رفض طلب
```

#### Marketplace
```
GET    /api/marketplace/products          - عرض المنتجات
GET    /api/marketplace/nearby            - البحث بالقرب
GET    /api/marketplace/vendors/{id}      - صفحة البائع
GET    /api/marketplace/vendors/{id}/products - منتجات بائع معين
```

#### Orders
```
POST   /api/orders                        - إنشاء طلب جديد
GET    /api/orders/my                     - طلباتي
GET    /api/orders/{id}                   - تفاصيل طلب
PUT    /api/orders/{id}/status            - تحديث حالة الطلب
POST   /api/orders/{id}/confirm           - تأكيد الاستلام
POST   /api/orders/{id}/review            - تقييم الطلب
```

#### Vendor Dashboard
```
GET    /api/vendor/dashboard              - إحصائيات البائع
GET    /api/vendor/products               - منتجاتي
POST   /api/vendor/products               - إضافة منتج
PUT    /api/vendor/products/{id}          - تعديل منتج
DELETE /api/vendor/products/{id}          - حذف منتج
GET    /api/vendor/orders                 - الطلبات الواردة
PUT    /api/vendor/orders/{id}/accept     - قبول طلب
PUT    /api/vendor/orders/{id}/reject     - رفض طلب
```

#### Roles & Permissions (للمخزن والشركة)
```
GET    /api/company/roles                 - عرض الـ Roles
POST   /api/company/roles                 - إنشاء Role جديد
PUT    /api/company/roles/{id}            - تعديل Role
DELETE /api/company/roles/{id}            - حذف Role
GET    /api/company/roles/{id}/permissions - صلاحيات Role
PUT    /api/company/roles/{id}/permissions - تحديث صلاحيات
```

#### Warehouse HR
```
GET    /api/vendor/staff                  - عرض العاملين
POST   /api/vendor/join-requests          - طلب انضمام
GET    /api/vendor/join-requests          - عرض طلبات الانضمام
PUT    /api/vendor/join-requests/{id}     - موافقة/رفض
GET    /api/vendor/attendance             - سجل الحضور
POST   /api/vendor/attendance/check-in    - تسجيل حضور
POST   /api/vendor/attendance/check-out   - تسجيل انصراف
```

#### Payments
```
POST   /api/payments/initiate             - بدء دفع
POST   /api/payments/paymob/callback      - PayMob callback
POST   /api/payments/fawry/callback       - Fawry callback
GET    /api/payments/{id}                 - حالة دفع
POST   /api/payments/{id}/refund          - استرداد
```

---

## مراحل التنفيذ

### المرحلة 1: البنية الأساسية
- [ ] إضافة CompanyType للشركة (Construction / Warehouse)
- [ ] تعديل نظام تسجيل InventoryOwner (طلب انضمام + موافقة Admin)
- [ ] إنشاء أقسام المنتجات المحددة مسبقاً
- [ ] نظام طلبات إنشاء أقسام جديدة
- [ ] تحسين VendorProduct مع CategoryId

### المرحلة 2: نظام Roles والصلاحيات
- [ ] إنشاء نظام Roles ديناميكي لكل شركة/مخزن
- [ ] صاحب المخزن يقدر ينشئ Roles خاصة
- [ ] تحديد صلاحيات لكل Role
- [ ] ربط العاملين بالـ Roles

### المرحلة 3: صفحة Marketplace
- [ ] API عرض المنتجات للعملاء
- [ ] API البحث بالقرب (المسافة يحددها المستخدم)
- [ ] صفحة البائع العامة
- [ ] Frontend صفحة Marketplace

### المرحلة 4: نظام الطلبات
- [ ] تحسين نظام InventoryOrder
- [ ] إضافة طرق الدفع المصرية
- [ ] تكامل PayMob
- [ ] تكامل Fawry
- [ ] نظام تتبع الطلبات

### المرحلة 5: نظام التقييمات
- [ ] تحسين VendorReview
- [ ] عرض التقييمات في صفحة البائع
- [ ] حساب متوسط التقييم تلقائياً

### المرحلة 6: الموارد البشرية للمخزن
- [ ] نظام طلبات الانضمام للمخزن (نفس نظام الشركة)
- [ ] إدارة العاملين
- [ ] نظام الحضور والانصراف

### المرحلة 7: التقارير والإحصائيات
- [ ] تقارير المبيعات
- [ ] تقارير المخزون
- [ ] Dashboard البائع المحسن

---

## ملاحظات تقنية

### المخزن = شركة (نفس النظام)
```csharp
// إضافة CompanyType للشركة
public enum CompanyType
{
    Construction = 1,  // شركة مقاولات
    Warehouse = 2      // مخزن/بائع مواد
}

// تعديل Company Entity
public class Company
{
    public CompanyType Type { get; set; }
    // باقي الخصائص...
}

// InventoryOwner يسجل → طلب انضمام → موافقة Admin
// نفس نظام CompanyOwner بالظبط
```

### حذف WarehouseOwner من UserType
```csharp
// UserType النهائي
public enum UserType
{
    NormalUser = 0,
    Worker = 1,
    CompanyOwner = 2,      // شركة مقاولات
    InventoryOwner = 3,    // مخزن/بائع مواد
    Engineer = 5,
    Subcontractor = 6
}
// WarehouseOwner = 4 تم حذفه ودمجه مع InventoryOwner
```

### أقسام المنتجات الافتراضية
```sql
INSERT INTO ProductCategories (Name, NameAr, Icon, IsApproved) VALUES
('Building Materials', 'مواد البناء', 'building', 1),
('Finishing Materials', 'مواد التشطيب', 'paint', 1),
('Doors & Windows', 'أبواب وشبابيك', 'door', 1),
('Sanitary Ware', 'أدوات صحية', 'bath', 1),
('Electrical', 'كهربائيات', 'bolt', 1),
('Plumbing', 'سباكة', 'plumbing', 1);
```

### نظام Roles الديناميكي
```csharp
// صاحب المخزن ينشئ Roles خاصة بمخزنه
public class CompanyRole
{
    public int CompanyId { get; set; }
    public string Name { get; set; }  // محاسب، عامل مخزن، سائق
    public List<RolePermission> Permissions { get; set; }
}

public class RolePermission
{
    public string Module { get; set; }  // Products, Orders, Reports
    public bool CanView { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
}
```

### تكامل PayMob
```csharp
public interface IPayMobService
{
    Task<string> GeneratePaymentLink(decimal amount, string currency);
    Task<PaymentResult> ProcessCallback(Dictionary<string, string> callbackData);
    Task<RefundResult> RefundPayment(string paymentId, decimal amount);
}
```

---

## الخلاصة

هذه الخطة تحول النظام إلى منصة متكاملة لأصحاب مخازن مواد البناء والتشطيبات، مع:

### الميزات الأساسية:
- ✅ **المخزن = شركة** (نفس نظام الانضمام والموافقة)
- ✅ إدارة كاملة للمنتجات والمخزون
- ✅ نظام مبيعات ومشتريات متكامل
- ✅ موارد بشرية للمخزن (Roles + صلاحيات)
- ✅ صفحة عامة للمنتجات (Marketplace)
- ✅ بحث بالقرب من الموقع (المسافة يحددها المستخدم)
- ✅ نظام طلبات كامل
- ✅ كل طرق الدفع المصرية
- ✅ نظام تقييمات

### النقاط المهمة:
1. **InventoryOwner** يسجل → طلب انضمام للسيستم → System Admin يوافق/يرفض
2. **بعد الموافقة**، صاحب المخزن يقدر ينشئ Roles خاصة بمخزنه
3. **العاملين** يقدروا يطلبوا الانضمام للمخزن
4. **صاحب المخزن** يحدد صلاحيات كل عامل
