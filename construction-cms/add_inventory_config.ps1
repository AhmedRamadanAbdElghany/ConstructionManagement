$filePath = "construction-cms/src/app/features/admin/companies/companies.component.ts"

# Read all lines
$lines = Get-Content -Path $filePath

# Step 1: Add inventory fields to FormBuilder after enableInventoryManagement
$newLines = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    $newLines += $lines[$i]
    
    # Add inventory config fields after enableInventoryManagement in FormBuilder
    if ($i -eq 366) {
        # Line 367: enableInventoryManagement: [false],
        $newLines += "       requireMaterialRequestApproval: [false],"
        $newLines += "       materialRequestApproverRole: [''],"
        $newLines += "       enableMultiWarehouse: [false],"
        $newLines += "       enableStockAlerts: [true],"
        $newLines += "       defaultLowStockThreshold: [10],"
    }
}

# Write and re-read
$newContent = $newLines -join "`n"
Set-Content -Path $filePath -Value $newContent -NoNewline

# Step 2: Add to reset values in openCreateModal
$content = Get-Content -Path $filePath -Raw
$content = $content -replace 'enableInventoryManagement: false,', 'enableInventoryManagement: false,
       requireMaterialRequestApproval: false,
       materialRequestApproverRole: '''',
       enableMultiWarehouse: false,
       enableStockAlerts: true,
       defaultLowStockThreshold: 10,'
Set-Content -Path $filePath -Value $content -NoNewline

# Step 3: Add to patch values in openEditModal
$content = Get-Content -Path $filePath -Raw
$content = $content -replace 'enableInventoryManagement: company.settings.enableInventoryManagement,', 'enableInventoryManagement: company.settings.enableInventoryManagement,
         requireMaterialRequestApproval: company.settings.requireMaterialRequestApproval,
         materialRequestApproverRole: company.settings.materialRequestApproverRole,
         enableMultiWarehouse: company.settings.enableMultiWarehouse,
         enableStockAlerts: company.settings.enableStockAlerts,
         defaultLowStockThreshold: company.settings.defaultLowStockThreshold,'
Set-Content -Path $filePath -Value $content -NoNewline

Write-Host "Inventory config fields added successfully"
