$filePath = "construction-cms/src/app/features/admin/companies/companies.component.ts"

# Read all lines
$lines = Get-Content -Path $filePath

# Remove the duplicate </section> tag on line 187
$newLines = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    # Skip line 186 (duplicate </section> with wrong indentation)
    if ($i -eq 186) {
        continue
    }
    $newLines += $lines[$i]
}

# Write the fixed content
$newContent = $newLines -join "`n"
Set-Content -Path $filePath -Value $newContent -NoNewline
Write-Host "Duplicate section tag removed"
