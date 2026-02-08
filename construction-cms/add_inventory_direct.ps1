$filePath = "construction-cms/src/app/features/admin/companies/companies.component.ts"

# Read all lines
$lines = Get-Content -Path $filePath

# Find line 177 (HR & Payroll text) and add Inventory card after line 178 (HR div closing)
$newLines = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    $newLines += $lines[$i]
    
    # After the HR & Payroll div closing (line 178 in original), add the Inventory card
    if ($i -eq 177) {
        $newLines += "                     <div (click)`"toggleFormControl('enableInventoryManagement')`""
        $newLines += "                          [ngClass]`"companyForm.get('enableInventoryManagement')?.value ? 'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100' : 'border-slate-100 dark:border-slate-800 text-slate-400'`""
        $newLines += "                          class=`"p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center group/card hover:scale-[1.02]`">"
        $newLines += "                        <span class=`"text-2xl mb-2`">📋</span>"
        $newLines += "                        <span class=`"font-black text-[10px] uppercase tracking-widest text-center`">Inventory</span>"
        $newLines += "                     </div>"
    }
}

# Write the modified content
Set-Content -Path $filePath -Value $newLines -NoNewline
Write-Host "Successfully added Inventory card"
