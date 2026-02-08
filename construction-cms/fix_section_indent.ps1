$filePath = "construction-cms/src/app/features/admin/companies/companies.component.ts"

# Read all lines
$lines = Get-Content -Path $filePath

# Fix indentation of the comment and section
$newLines = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Fix indentation
    if ($line -match '^                 <!-- Inventory Configuration -->$') {
        $newLines += "                <!-- Inventory Configuration -->"
    }
    elseif ($line -match '^                 <section class="pt-6"') {
        $newLines += "                <section class=""pt-6"" *ngIf=""companyForm.get('enableInventoryManagement')?.value"">"
    }
    else {
        $newLines += $line
    }
}

# Write the fixed content
$newContent = $newLines -join "`n"
Set-Content -Path $filePath -Value $newContent -NoNewline
Write-Host "Section indentation fixed"
