$filePath = "construction-cms/src/app/features/admin/companies/companies.component.ts"

# Read all lines
$lines = Get-Content -Path $filePath

# Find and replace grid-cols-5 to grid-cols-6 for better layout with 6 cards
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5') {
        $lines[$i] = $lines[$i] -replace 'grid-cols-5', 'grid-cols-6'
        Write-Host "Updated grid columns from 5 to 6 at line $($i+1)"
    }
}

# Find the HR & Payroll card closing (line 178: "                     </div>") and add Inventory card after it
$newLines = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    $newLines += $lines[$i]
    
    # After the HR & Payroll closing div, add the Inventory card
    # The HR & Payroll card ends with "                    </div>"
    if ($lines[$i] -match '\s*</div>\s*$' -and $lines[$i - 1] -match 'HR.*Payroll') {
        $newLines += "                    <div (click)`"toggleFormControl('enableInventoryManagement')`""
        $newLines += "                         [ngClass]`"companyForm.get('enableInventoryManagement')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-400'`""
        $newLines += "                         class=`"p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center group/card hover:scale-[1.02]`">"
        $newLines += "                        <span class=`"text-2xl mb-2`">📋</span>"
        $newLines += "                        <span class=`"font-black text-[10px] uppercase tracking-widest text-center`">Inventory</span>"
        $newLines += "                    </div>"
        Write-Host "Added Inventory card after HR & Payroll"
    }
}

# Write the modified content
Set-Content -Path $filePath -Value $newLines -NoNewline
Write-Host "Successfully modified companies.component.ts"
