$filePath = "construction-cms/src/app/features/admin/companies/companies.component.ts"

# Read the file
$content = Get-Content -Path $filePath -Raw

# Find the end of Module Entitlements section and add Inventory Configuration section
# Looking for: "                </section>\n\n                <!-- Daily Log Policy -->"
$oldSection = @'
                </section>

                <!-- Daily Log Policy -->
'@

$newSection = @'
                </section>

                <!-- Inventory Configuration -->
                <section class="pt-6" *ngIf="companyForm.get('enableInventoryManagement')?.value">
                  <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <span class="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                    Inventory Configuration
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <!-- Material Request Approval -->
                     <div class="p-6 border-2 rounded-3xl" [ngClass]="companyForm.get('requireMaterialRequestApproval')?.value ? 'border-violet-500 bg-violet-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div class="flex items-center justify-between mb-4">
                           <span class="font-black text-[10px] uppercase tracking-widest">Material Request Approval</span>
                           <label class="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" formControlName="requireMaterialRequestApproval" class="sr-only peer">
                             <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
                           </label>
                        </div>
                        <input formControlName="materialRequestApproverRole" placeholder="Approver Role"
                               class="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-500 rounded-xl outline-none text-xs font-bold">
                     </div>
                     <!-- Multi Warehouse -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableMultiWarehouse')?.value ? 'border-violet-500 bg-violet-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">Multi Warehouse</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Enable multiple warehouses</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" formControlName="enableMultiWarehouse" class="sr-only peer">
                          <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
                        </label>
                     </div>
                     <!-- Stock Alerts -->
                     <div class="p-6 border-2 rounded-3xl flex items-center justify-between" [ngClass]="companyForm.get('enableStockAlerts')?.value ? 'border-violet-500 bg-violet-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <div>
                           <span class="font-black text-[10px] uppercase tracking-widest block">Stock Alerts</span>
                           <p class="text-[8px] font-bold uppercase opacity-60">Enable low stock notifications</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" formControlName="enableStockAlerts" class="sr-only peer">
                          <div class="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
                        </label>
                     </div>
                     <!-- Low Stock Threshold -->
                     <div class="p-6 border-2 rounded-3xl" [ngClass]="companyForm.get('defaultLowStockThreshold')?.value ? 'border-violet-500 bg-violet-50/40' : 'border-slate-100 dark:border-slate-800'">
                        <span class="font-black text-[10px] uppercase tracking-widest block mb-4">Low Stock Threshold</span>
                        <input type="number" formControlName="defaultLowStockThreshold" 
                               class="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-500 rounded-xl outline-none text-xs font-bold">
                     </div>
                  </div>
                </section>

                <!-- Daily Log Policy -->
'@

$content = $content -replace [regex]::Escape($oldSection), $newSection

# Write the modified content
Set-Content -Path $filePath -Value $content -NoNewline
Write-Host "Inventory Configuration section added successfully"
