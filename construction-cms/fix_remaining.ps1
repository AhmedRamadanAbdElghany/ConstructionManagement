# PowerShell script to fix remaining mockDataService references

# Update personal-hr.component.ts
$filePath = "construction-cms/src/app/features/worker/personal-hr/personal-hr.component.ts"
$content = Get-Content $filePath -Raw
$content = $content -replace 'private mockDataService: MockDataService,', ''
$content = $content -replace 'this\.mockDataService\.getAllVacationRequests\(\)\.subscribe\(requests =>', '// TODO: Vacation requests API'
Set-Content $filePath -Value $content -NoNewline
Write-Host "Updated personal-hr.component.ts"

# Update daily-log.component.ts
$filePath = "construction-cms/src/app/features/worker/daily-log/daily-log.component.ts"
$content = Get-Content $filePath -Raw
$content = $content -replace 'private mockDataService: MockDataService,', ''
$content = $content -replace 'this\.mockDataService\.getBOQItems\(1\)\.subscribe\(items =>', '// TODO: Implement BOQ items API'
Set-Content $filePath -Value $content -NoNewline
Write-Host "Updated daily-log.component.ts"
