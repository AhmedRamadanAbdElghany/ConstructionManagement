using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Data;

/// <summary>
/// Seeder for warehouse-specific roles and permissions
/// </summary>
public static class WarehouseRoleSeeder
{
    /// <summary>
    /// Warehouse-specific permissions
    /// </summary>
    public static readonly string[] WarehousePermissions = new[]
    {
        // Product Management
        "warehouse.products.view",
        "warehouse.products.create",
        "warehouse.products.edit",
        "warehouse.products.delete",
        
        // Order Management
        "warehouse.orders.view",
        "warehouse.orders.process",
        "warehouse.orders.cancel",
        "warehouse.orders.update_status",
        
        // Inventory Management
        "warehouse.inventory.view",
        "warehouse.inventory.manage",
        "warehouse.inventory.adjust",
        
        // Employee Management
        "warehouse.employees.view",
        "warehouse.employees.manage",
        "warehouse.employees.hire",
        "warehouse.employees.fire",
        
        // Reports
        "warehouse.reports.view",
        "warehouse.reports.sales",
        "warehouse.reports.inventory",
        
        // Settings
        "warehouse.settings.view",
        "warehouse.settings.edit",
        
        // HR
        "warehouse.hr.attendance",
        "warehouse.hr.payroll",
        "warehouse.hr.leave_manage"
    };

    /// <summary>
    /// Seed warehouse roles and permissions for a company
    /// </summary>
    public static async Task SeedWarehouseRolesAsync(
        ApplicationDbContext context,
        int companyId,
        ILogger? logger = null)
    {
        // Check if roles already exist for this company
        var existingRoles = await context.Roles
            .Where(r => r.CompanyId == companyId)
            .Select(r => r.Name)
            .ToListAsync();

        // Define warehouse roles
        var warehouseRoles = new Dictionary<string, (string Description, string[] Permissions)>
        {
            ["WarehouseOwner"] = (
                "صاحب المخزن - كامل الصلاحيات",
                WarehousePermissions // All permissions
            ),
            ["WarehouseManager"] = (
                "مدير المخزن - إدارة كاملة ما عدا الإعدادات",
                new[]
                {
                    "warehouse.products.view", "warehouse.products.create", "warehouse.products.edit", "warehouse.products.delete",
                    "warehouse.orders.view", "warehouse.orders.process", "warehouse.orders.cancel", "warehouse.orders.update_status",
                    "warehouse.inventory.view", "warehouse.inventory.manage", "warehouse.inventory.adjust",
                    "warehouse.employees.view", "warehouse.employees.manage",
                    "warehouse.reports.view", "warehouse.reports.sales", "warehouse.reports.inventory",
                    "warehouse.hr.attendance", "warehouse.hr.payroll", "warehouse.hr.leave_manage"
                }
            ),
            ["WarehouseSales"] = (
                "موظف مبيعات - إدارة الطلبات والمنتجات",
                new[]
                {
                    "warehouse.products.view", "warehouse.products.create", "warehouse.products.edit",
                    "warehouse.orders.view", "warehouse.orders.process", "warehouse.orders.update_status",
                    "warehouse.inventory.view",
                    "warehouse.reports.view", "warehouse.reports.sales"
                }
            ),
            ["WarehouseInventory"] = (
                "مسؤول المخزون - إدارة المنتجات والمخزون",
                new[]
                {
                    "warehouse.products.view", "warehouse.products.create", "warehouse.products.edit",
                    "warehouse.inventory.view", "warehouse.inventory.manage", "warehouse.inventory.adjust",
                    "warehouse.reports.view", "warehouse.reports.inventory"
                }
            ),
            ["WarehouseHR"] = (
                "مسؤول الموارد البشرية - إدارة الموظفين",
                new[]
                {
                    "warehouse.employees.view", "warehouse.employees.manage", "warehouse.employees.hire", "warehouse.employees.fire",
                    "warehouse.hr.attendance", "warehouse.hr.payroll", "warehouse.hr.leave_manage",
                    "warehouse.reports.view"
                }
            ),
            ["WarehouseViewer"] = (
                "مشاهد - عرض فقط",
                new[]
                {
                    "warehouse.products.view",
                    "warehouse.orders.view",
                    "warehouse.inventory.view",
                    "warehouse.reports.view"
                }
            )
        };

        // Ensure permissions exist
        var allPermissionNames = WarehousePermissions.ToList();
        var existingPermissions = await context.Permissions
            .Where(p => p.CompanyId == companyId || p.CompanyId == null)
            .ToListAsync();

        foreach (var permissionName in allPermissionNames)
        {
            if (!existingPermissions.Any(p => p.Name == permissionName))
            {
                var permission = new Permission
                {
                    Name = permissionName,
                    Description = GetPermissionDescription(permissionName),
                    CompanyId = companyId
                };
                context.Permissions.Add(permission);
                logger?.LogInformation("Created permission: {PermissionName}", permissionName);
            }
        }

        await context.SaveChangesAsync();

        // Refresh permissions list
        existingPermissions = await context.Permissions
            .Where(p => p.CompanyId == companyId || p.CompanyId == null)
            .ToListAsync();

        // Create roles
        foreach (var (roleName, (description, permissions)) in warehouseRoles)
        {
            if (existingRoles.Contains(roleName))
            {
                logger?.LogInformation("Role {RoleName} already exists for company {CompanyId}", roleName, companyId);
                continue;
            }

            var role = new Role
            {
                Name = roleName,
                Description = description,
                CompanyId = companyId
            };
            context.Roles.Add(role);
            await context.SaveChangesAsync();

            // Assign permissions to role
            foreach (var permissionName in permissions)
            {
                var permission = existingPermissions.FirstOrDefault(p => p.Name == permissionName);
                if (permission != null)
                {
                    context.RolePermissions.Add(new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = permission.Id,
                        CompanyId = companyId
                    });
                }
            }

            logger?.LogInformation("Created role: {RoleName} with {PermissionCount} permissions", roleName, permissions.Length);
        }

        await context.SaveChangesAsync();
    }

    private static string GetPermissionDescription(string permissionName)
    {
        return permissionName switch
        {
            // Products
            "warehouse.products.view" => "عرض المنتجات",
            "warehouse.products.create" => "إضافة منتجات جديدة",
            "warehouse.products.edit" => "تعديل المنتجات",
            "warehouse.products.delete" => "حذف المنتجات",
            
            // Orders
            "warehouse.orders.view" => "عرض الطلبات",
            "warehouse.orders.process" => "معالجة الطلبات",
            "warehouse.orders.cancel" => "إلغاء الطلبات",
            "warehouse.orders.update_status" => "تحديث حالة الطلب",
            
            // Inventory
            "warehouse.inventory.view" => "عرض المخزون",
            "warehouse.inventory.manage" => "إدارة المخزون",
            "warehouse.inventory.adjust" => "تعديل كميات المخزون",
            
            // Employees
            "warehouse.employees.view" => "عرض الموظفين",
            "warehouse.employees.manage" => "إدارة الموظفين",
            "warehouse.employees.hire" => "توظيف موظفين جدد",
            "warehouse.employees.fire" => "إنهاء خدمة موظفين",
            
            // Reports
            "warehouse.reports.view" => "عرض التقارير",
            "warehouse.reports.sales" => "تقارير المبيعات",
            "warehouse.reports.inventory" => "تقارير المخزون",
            
            // Settings
            "warehouse.settings.view" => "عرض الإعدادات",
            "warehouse.settings.edit" => "تعديل الإعدادات",
            
            // HR
            "warehouse.hr.attendance" => "إدارة الحضور والانصراف",
            "warehouse.hr.payroll" => "إدارة الرواتب",
            "warehouse.hr.leave_manage" => "إدارة الإجازات",
            
            _ => permissionName
        };
    }
}
