$filePath = "construction-cms/src/app/features/admin/companies/companies.component.ts"

# Read all lines
$lines = Get-Content -Path $filePath

# Find line 242 (end of Inventory Configuration section) and add Equipment Configuration after it
$insertAfter = 241  # 0-indexed

$equipmentConfigSection = @'
                </section>

                <!-- Equipment Configuration -->
                <section class="pt-6" *ngIf="companyForm.get('enableEquipmentManagement')?.value">
                  <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Equipment Configuration
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <!-- Maintenance Scheduling -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableEquipmentMaintenanceScheduling')?.value ? 'border-emerald-600 bg-emerald-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">Maintenance Scheduling</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Enable scheduled maintenance</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" formControlName="enableEquipmentMaintenanceScheduling" class="sr-only peer">
                          <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                     </div>
                     <!-- Utilization Tracking -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableEquipmentUtilizationTracking')?.value ? 'border-emerald-600 bg-emerald-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">Utilization Tracking</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Track equipment usage hours</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" formControlName="enableEquipmentUtilizationTracking" class="sr-only peer">
                          <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                     </div>
                     <!-- GPS Tracking -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableEquipmentGPSTracking')?.value ? 'border-emerald-600 bg-emerald-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">GPS Tracking</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Track equipment location</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" formControlName="enableEquipmentGPSTracking" class="sr-only peer">
                          <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                     </div>
                     <!-- Billing Integration -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableEquipmentBilling')?.value ? 'border-emerald-600 bg-emerald-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">Billing Integration</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Equipment rental billing</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" formControlName="enableEquipmentBilling" class="sr-only peer">
                          <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                     </div>
                     <!-- Maintenance Alert Threshold -->
                     <div class="p-6 border-2 rounded-3xl" [ngClass]="companyForm.get('equipmentMaintenanceAlertThreshold')?.value ? 'border-emerald-600 bg-emerald-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <span class="font-black text-[10px] uppercase tracking-widest block mb-4">Maintenance Alert (Hours)</span>
                        <input type="number" formControlName="equipmentMaintenanceAlertThreshold" 
                               class="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-600 rounded-xl outline-none text-xs font-bold">
                     </div>
                  </div>
                </section>

'@

$newLines = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    $newLines += $lines[$i]
    
    if ($i -eq $insertAfter) {
        $newLines += $equipmentConfigSection
    }
}

# Write and re-read
$newContent = $newLines -join "`n"
Set-Content -Path $filePath -Value $newContent -NoNewline

# Add form controls to FormBuilder
$content = Get-Content -Path $filePath -Raw
$content = $content -replace 'enableEquipmentManagement: \[false\],', 'enableEquipmentManagement: [false],
       enableEquipmentMaintenanceScheduling: [true],
       enableEquipmentUtilizationTracking: [true],
       enableEquipmentGPSTracking: [false],
       enableEquipmentBilling: [true],
       equipmentMaintenanceAlertThreshold: [100],'
Set-Content -Path $filePath -Value $content -NoNewline

# Add to reset values in openCreateModal
$content = Get-Content -Path $filePath -Raw
$content = $content -replace 'enableEquipmentManagement: false,', 'enableEquipmentManagement: false,
       enableEquipmentMaintenanceScheduling: true,
       enableEquipmentUtilizationTracking: true,
       enableEquipmentGPSTracking: false,
       enableEquipmentBilling: true,
       equipmentMaintenanceAlertThreshold: 100,'
Set-Content -Path $filePath -Value $content -NoNewline

# Add to patch values in openEditModal
$content = Get-Content -Path $filePath -Raw
$content = $content -replace 'enableEquipmentManagement: company.settings.enableEquipmentManagement,', 'enableEquipmentManagement: company.settings.enableEquipmentManagement,
         enableEquipmentMaintenanceScheduling: company.settings.enableEquipmentMaintenanceScheduling,
         enableEquipmentUtilizationTracking: company.settings.enableEquipmentUtilizationTracking,
         enableEquipmentGPSTracking: company.settings.enableEquipmentGPSTracking,
         enableEquipmentBilling: company.settings.enableEquipmentBilling,
         equipmentMaintenanceAlertThreshold: company.settings.equipmentMaintenanceAlertThreshold,'
Set-Content -Path $filePath -Value $content -NoNewline

Write-Host "Equipment Configuration section added successfully"
