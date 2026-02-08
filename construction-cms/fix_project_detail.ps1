# PowerShell script to replace mockDataService references in project-detail.component.ts

$filePath = "construction-cms/src/app/features/admin/projects/project-detail/project-detail.component.ts"
$content = Get-Content $filePath -Raw

# Replace mockDataService.getProjects() with projectService.getProjectById(projectId)
$content = $content -replace 'this\.mockDataService\.getProjects\(\)\.subscribe\(projects =>', 'this.projectService.getProjectById(projectId).subscribe(project =>'

# Replace mockDataService.getUsers() with projectTeamService.getTeam(projectId)
$content = $content -replace 'this\.mockDataService\.getUsers\(\)\.subscribe\(users =>', 'this.projectTeamService.getTeam(projectId).subscribe(users =>'

# Replace mockDataService.getDailyLogs(projectId) with dailyLogsService.getDailyLogHistory(itemId)
$content = $content -replace 'this\.mockDataService\.getDailyLogs\(projectId\)\.subscribe\(logs =>', 'this.dailyLogsService.getDailyLogHistory(itemId).subscribe(logs =>'

# Replace mockDataService.getBOQItems(projectId) with boqService.getItems(projectId)
$content = $content -replace 'this\.mockDataService\.getBOQItems\(projectId\)\.subscribe\(items =>', 'this.boqService.getItems(projectId).subscribe(items =>'

# Replace mockDataService.getTransactions(projectId) with transactionsService.getTransactions(projectId)
$content = $content -replace 'this\.mockDataService\.getTransactions\(projectId\)\.subscribe\(trans =>', 'this.transactionsService.getTransactions(projectId).subscribe(trans =>'

# Replace mockDataService.getRoles() with rolesService.getRoles()
$content = $content -replace 'this\.mockDataService\.getRoles\(\)\.subscribe\(roles =>', 'this.rolesService.getRoles().subscribe(roles =>'

# Replace mockDataService.getBills(projectId) with invoicesService.getInvoices(projectId)
$content = $content -replace 'this\.mockDataService\.getBills\(projectId\)\.subscribe\(bills =>', 'this.invoicesService.getInvoices(projectId).subscribe(bills =>'

# Replace mockDataService.getClientPayments(projectId) with invoicesService.getInvoices(projectId)
$content = $content -replace 'this\.mockDataService\.getClientPayments\(projectId\)\.subscribe\(payments =>', 'this.invoicesService.getInvoices(projectId).subscribe(payments =>'

# Remove the mock data enrichment code for BOQ items
$content = $content -replace '(?s)// For demo, ensure we have some items linked to phases with dates and varied progress.*?this\.loadProjectPhases\(projectId\);', 'this.loadProjectPhases(projectId);'

# Remove the mock data enrichment code for daily logs
$content = $content -replace '(?s)// Enriching logs for better historical demo.*?\}\);', '});'

# Remove the mock data code for users
$content = $content -replace '(?s)const potentialMembers = users\.filter\(u => u\.role === ''CompanyUser'' \|\| u\.role === ''CompanyAdmin''\);.*?this\.teamMembers = potentialMembers\.slice\(0, 3\); // Mocking that some are already members', 'this.teamMembers = team;'

# Remove the mock data code for projects
$content = $content -replace '(?s)this\.project = projects\.find\(p => p\.id === projectId\);', 'this.project = project;'

Set-Content $filePath -Value $content -NoNewline

Write-Host "Replaced mockDataService references in project-detail.component.ts"
