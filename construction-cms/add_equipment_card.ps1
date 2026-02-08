$filePath = "construction-cms/src/app/features/admin/companies/companies.component.ts"

# Read all lines
$lines = Get-Content -Path $filePath

# Change grid from 6 to 7 columns
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6') {
        $lines[$i] = $lines[$i] -replace 'grid-cols-6', 'grid-cols-7'
        Write-Host "Updated grid from 6 to 7 columns at line $($i+1)"
    }
}

# Find line 184 (Inventory closing div) and add Equipment card after it
$insertAfter = 183  # 0-indexed, so line 184 becomes index 183

$newLines = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    $newLines += $lines[$i]
    
    if ($i -eq $insertAfter) {
        $newLines += "                     <div (click)=""toggleFormControl('enableEquipmentManagement')"" "
        $newLines += "                          [ngClass]=""companyForm.get('enableEquipmentManagement')?.value ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 dark:text-emerald-100' : 'border-slate-100 dark:border-slate-800 text-slate-400'"" "
        $newLines += "                          class=""p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center group/card hover:scale-[1.02]"">"
        $newLines += "                        <span class=""text-2xl mb-2"">&#128668;</span>"
        $newLines += "                        <span class=""font-black text-[10px] uppercase tracking-widest text-center"">Equipment</span>"
        $newLines += "                     </div>"
    }
}

# Write and re-read
$newContent = $newLines -join "`n"
Set-Content -Path $filePath -Value $newContent -NoNewline

# Add form control to FormBuilder
$content = Get-Content -Path $filePath -Raw
$content = $content -replace 'enableInventoryManagement: \[false\],', 'enableInventoryManagement: [false],
       enableEquipmentManagement: [false],'
Set-Content -Path $filePath -Value $content -NoNewline

# Add to reset values in openCreateModal
$content = Get-Content -Path $filePath -Raw
$content = $content -replace 'enableInventoryManagement: false,', 'enableInventoryManagement: false,
       enableEquipmentManagement: false,'
Set-Content -Path $filePath -Value $content -NoNewline

# Add to patch values in openEditModal
$content = Get-Content -Path $filePath -Raw
$content = $content -replace 'enableInventoryManagement: company.settings.enableInventoryManagement,', 'enableInventoryManagement: company.settings.enableInventoryManagement,
         enableEquipmentManagement: company.settings.enableEquipmentManagement,'
Set-Content -Path $filePath -Value $content -NoNewline

Write-Host "Equipment module card added successfully"
