$filePath = "construction-cms/src/app/features/admin/companies/companies.component.ts"

# Read the file content
$content = Get-Content -Path $filePath -Raw

# Replace grid-cols-5 with grid-cols-6
$content = $content -replace 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6'

# Add the Inventory card after HR & Payroll card
$hrCardEnd = '                        <span class="font-black text-[10px] uppercase tracking-widest text-center">HR & Payroll</span>'
$inventoryCard = @'
                     </div>
                     <div (click)="toggleFormControl('"'"'enableInventoryManagement'"'"')"
                          [ngClass]="companyForm.get('"'"'enableInventoryManagement'"'"')?.value ? '"'"'border-violet-500 bg-violet-50/40 text-violet-900 dark:text-violet-100'"'"' : '"'"'border-slate-100 dark:border-slate-800 text-slate-400'"'"'"
                          class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center group/card hover:scale-[1.02]">
                        <span class="text-2xl mb-2">📋</span>
                        <span class="font-black text-[10px] uppercase tracking-widest text-center">Inventory</span>
                     </div>
'@
$content = $content -replace [regex]::Escape($hrCardEnd) + '\s+</div>', $hrCardEnd + $inventoryCard

# Write the modified content
Set-Content -Path $filePath -Value $content -NoNewline
Write-Host "Successfully added Inventory card to companies.component.ts"
