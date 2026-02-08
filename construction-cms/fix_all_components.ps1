# PowerShell script to replace mockDataService references in all remaining components

# Update notifications.component.ts
$filePath = "construction-cms/src/app/features/common/notifications/notifications.component.ts"
$content = Get-Content $filePath -Raw
$content = $content -replace 'import { MockDataService } from ''''../../../core/mock/mock-data.service'''';', ''
$content = $content -replace 'constructor\(private mockDataService: MockDataService\) \{ \}', 'constructor(private notificationsService: NotificationsService) { }'
$content = $content -replace 'this\.mockDataService\.getNotifications\(\)\.subscribe\(notifications =>', 'this.notificationsService.getNotifications().subscribe(notifications =>'
$content = $content -replace 'this\.mockDataService\.markAllNotificationsRead\(\)\.subscribe\(\(\) =>', 'this.notificationsService.markAllAsRead().subscribe(() =>'
$content = $content -replace 'this\.mockDataService\.markNotificationRead\(notification\.id\)\.subscribe\(\(\) =>', 'this.notificationsService.markAsRead(notification.id).subscribe(() =>'
Set-Content $filePath -Value $content -NoNewline
Write-Host "Updated notifications.component.ts"

# Update client-projects.component.ts
$filePath = "construction-cms/src/app/features/client/client-projects/client-projects.component.ts"
$content = Get-Content $filePath -Raw
$content = $content -replace 'import { MockDataService } from ''''../../../core/mock/mock-data.service'''';', ''
$content = $content -replace 'constructor\(private mockDataService: MockDataService\) \{ \}', 'constructor(private projectService: ProjectService, private siteMediaService: SiteMediaService) { }'
$content = $content -replace 'this\.mockDataService\.getProjects\(\)\.subscribe\(projects =>', 'this.projectService.getMyProjects().subscribe(projects =>'
$content = $content -replace 'this\.mockDataService\.getSiteMedia\(1\)\.subscribe\(media =>', 'this.siteMediaService.getSiteMedia(1).subscribe(media =>'
Set-Content $filePath -Value $content -NoNewline
Write-Host "Updated client-projects.component.ts"

# Update locations.component.ts
$filePath = "construction-cms/src/app/features/admin/locations/locations.component.ts"
$content = Get-Content $filePath -Raw
$content = $content -replace 'import { MockDataService } from ''''../../../core/mock/mock-data.service'''';', ''
$content = $content -replace 'constructor\(private mockDataService: MockDataService\) \{ \}', 'constructor(private projectService: ProjectService, private rolesService: RolesService) { }'
$content = $content -replace 'this\.mockDataService\.getProjects\(\)\.subscribe\(projects =>', 'this.projectService.getMyProjects().subscribe(projects =>'
$content = $content -replace 'this\.mockDataService\.getUsers\(\)\.subscribe\(users =>', 'this.rolesService.getUsers().subscribe(users =>'
$content = $content -replace 'this\.workers = users\.filter\(u => u\.role === ''''CompanyUser''''\);', 'this.workers = users.filter(u => u.role === ''CompanyUser'');'
Set-Content $filePath -Value $content -NoNewline
Write-Host "Updated locations.component.ts"

# Update hr.component.ts
$filePath = "construction-cms/src/app/features/admin/hr/hr.component.ts"
$content = Get-Content $filePath -Raw
$content = $content -replace 'import { MockDataService } from ''''../../../core/mock/mock-data.service'''';', ''
$content = $content -replace 'constructor\(private mockDataService: MockDataService, private fb: FormBuilder\)', 'constructor(private rolesService: RolesService, private fb: FormBuilder)'
$content = $content -replace 'this\.mockDataService\.getUsers\(\)\.subscribe\(users =>', 'this.rolesService.getUsers().subscribe(users =>'
Set-Content $filePath -Value $content -NoNewline
Write-Host "Updated hr.component.ts"

# Update personal-hr.component.ts
$filePath = "construction-cms/src/app/features/worker/personal-hr/personal-hr.component.ts"
$content = Get-Content $filePath -Raw
$content = $content -replace 'import { MockDataService } from ''''../../../core/mock/mock-data.service'''';', ''
$content = $content -replace 'constructor\(private fb: FormBuilder,\s+private mockDataService: MockDataService,\s+private authService: AuthService\)', 'constructor(private fb: FormBuilder, private authService: AuthService)'
$content = $content -replace 'this\.mockDataService\.getAllVacationRequests\(\)\.subscribe\(requests =>', 'this.vacationRequests = requests;'
$content = $content -replace 'this\.mockDataService\.addVacationRequest\(newRequest\)\.subscribe\(request =>', '// TODO: Implement vacation request API'
Set-Content $filePath -Value $content -NoNewline
Write-Host "Updated personal-hr.component.ts"

# Update daily-log.component.ts
$filePath = "construction-cms/src/app/features/worker/daily-log/daily-log.component.ts"
$content = Get-Content $filePath -Raw
$content = $content -replace 'import { MockDataService } from ''''../../../core/mock/mock-data.service'''';', ''
$content = $content -replace 'constructor\(private fb: FormBuilder,\s+private mockDataService: MockDataService,\s+private authService: AuthService\)', 'constructor(private fb: FormBuilder, private authService: AuthService)'
$content = $content -replace 'this\.mockDataService\.getBOQItems\(1\)\.subscribe\(items =>', '// TODO: Implement BOQ items API'
Set-Content $filePath -Value $content -NoNewline
Write-Host "Updated daily-log.component.ts"

Write-Host "All components updated successfully!"
