$filePath = "construction-cms/src/app/features/admin/companies/companies.component.ts"

# Read the file
$content = Get-Content -Path $filePath -Raw

# Fix indentation: replace single space indent with proper tab/space indent
# The inventory fields have inconsistent indentation - fix them
$content = $content -replace "`n       requireMaterialRequestApproval: \[false\],", "`n      requireMaterialRequestApproval: [false],"
$content = $content -replace "`n        materialRequestApproverRole: \[''\],", "`n      materialRequestApproverRole: [''],"
$content = $content -replace "`n        enableMultiWarehouse: \[false\],", "`n      enableMultiWarehouse: [false],"
$content = $content -replace "`n        enableStockAlerts: \[true\],", "`n      enableStockAlerts: [true],"
$content = $content -replace "`n        defaultLowStockThreshold: \[10\],", "`n      defaultLowStockThreshold: [10],"

$content = $content -replace "`n        requireMaterialRequestApproval: false,", "`n      requireMaterialRequestApproval: false,"
$content = $content -replace "`n        materialRequestApproverRole: '',", "`n      materialRequestApproverRole: '',"
$content = $content -replace "`n        enableMultiWarehouse: false,", "`n      enableMultiWarehouse: false,"
$content = $content -replace "`n        enableStockAlerts: true,", "`n      enableStockAlerts: true,"
$content = $content -replace "`n        defaultLowStockThreshold: 10,", "`n      defaultLowStockThreshold: 10,"

$content = $content -replace "`n         requireMaterialRequestApproval: company.settings.requireMaterialRequestApproval,", "`n        requireMaterialRequestApproval: company.settings.requireMaterialRequestApproval,"
$content = $content -replace "`n         materialRequestApproverRole: company.settings.materialRequestApproverRole,", "`n        materialRequestApproverRole: company.settings.materialRequestApproverRole,"
$content = $content -replace "`n         enableMultiWarehouse: company.settings.enableMultiWarehouse,", "`n        enableMultiWarehouse: company.settings.enableMultiWarehouse,"
$content = $content -replace "`n         enableStockAlerts: company.settings.enableStockAlerts,", "`n        enableStockAlerts: company.settings.enableStockAlerts,"
$content = $content -replace "`n         defaultLowStockThreshold: company.settings.defaultLowStockThreshold,", "`n        defaultLowStockThreshold: company.settings.defaultLowStockThreshold,"

# Write the fixed content
Set-Content -Path $filePath -Value $content -NoNewline
Write-Host "Indentation fixed successfully"
