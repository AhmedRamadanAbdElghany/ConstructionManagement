$filePath = "construction-cms/src/app/features/admin/companies/companies.component.ts"

# Read the file
$content = Get-Content -Path $filePath -Raw

# Fix duplicate </section> tag
$content = $content -replace "</section>`r`n                 </section>", "</section>"

# Write the fixed content
Set-Content -Path $filePath -Value $content -NoNewline
Write-Host "Duplicate section tag fixed"
