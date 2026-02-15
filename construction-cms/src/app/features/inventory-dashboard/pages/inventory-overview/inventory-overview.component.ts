import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VendorService, VendorStats, VendorTransaction } from '../../../../core/services/vendor.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-inventory-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div class="max-w-7xl mx-auto">

        <!-- Header -->
        <div class="mb-10">
          <div class="flex items-center space-x-2 mb-3">
            <span class="px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center border border-emerald-500/20">
              <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              INVENTORY OWNER
            </span>
          </div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            Welcome back, {{ userName }}! <span class="text-emerald-500">📦</span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">Here's how your store is performing today</p>
        </div>

        <!-- Loading State -->
        @if (loading) {
          <div class="flex justify-center items-center h-64">
            <div class="relative">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 animate-pulse shadow-lg shadow-emerald-500/30"></div>
              <div class="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 animate-ping opacity-20"></div>
            </div>
          </div>
        }

        <!-- Error State -->
        @if (error) {
          <div class="bg-rose-500/5 dark:bg-rose-500/10 rounded-3xl p-8 border border-rose-500/20 shadow-sm mb-8 flex items-center gap-6">
            <div class="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 shrink-0">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Failed to Load</h3>
              <p class="text-sm text-rose-600 dark:text-rose-400 font-medium">{{ error }}</p>
            </div>
            <button (click)="loadStats()" class="ml-auto px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all shadow-sm">Retry</button>
          </div>
        }

        @if (!loading && !error && stats) {
          <!-- ═══════════ STAT CARDS ═══════════ -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total Revenue -->
            <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 group hover:border-emerald-500/30 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/15 transition-colors"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  @if (stats.totalRevenue > 0) {
                    <span class="text-emerald-500 text-sm font-black">💰</span>
                  }
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ stats.totalRevenue | currency:'EGP':'EGP ':'1.0-0' }}</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Total Revenue</p>
              </div>
            </div>

            <!-- Total Profit -->
            <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 group hover:border-blue-500/30 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/15 transition-colors"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                  </div>
                  @if (stats.totalRevenue > 0) {
                    <span class="text-blue-500 text-sm font-black">{{ profitMargin | number:'1.0-0' }}% margin</span>
                  }
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ stats.totalProfit | currency:'EGP':'EGP ':'1.0-0' }}</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Total Profit</p>
              </div>
            </div>

            <!-- Total Products -->
            <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 group hover:border-purple-500/30 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/15 transition-colors"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  </div>
                  @if (stats.lowStockCount > 0) {
                    <span class="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black uppercase tracking-widest border border-amber-500/20 animate-pulse">{{ stats.lowStockCount }} Low</span>
                  }
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ stats.totalProducts }}</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Total Products</p>
              </div>
            </div>

            <!-- Pending Orders -->
            <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/5 group hover:border-amber-500/30 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/15 transition-colors"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                    </svg>
                  </div>
                  @if (stats.pendingOrders > 0) {
                    <span class="px-2 py-1 bg-amber-500 text-white rounded text-[10px] font-black tracking-tighter uppercase animate-pulse">Action Required</span>
                  }
                </div>
                <p class="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{{ stats.pendingOrders }}</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Pending Orders</p>
              </div>
            </div>
          </div>

          <!-- ═══════════ CHARTS ROW ═══════════ -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            <!-- Revenue & Profit Chart -->
            <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="flex items-center justify-between mb-8">
                <div>
                  <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Revenue & Profit</h2>
                  <p class="text-xs text-slate-500 font-medium mt-1">Monthly performance overview</p>
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-gradient-to-t from-emerald-600 to-emerald-400"></div>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-gradient-to-t from-blue-600 to-blue-400"></div>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profit</span>
                  </div>
                </div>
              </div>

              <div class="h-72 flex items-end justify-between px-4 gap-4 mt-8">
                @for (month of monthlyChart; track month.label) {
                  <div class="flex-1 flex flex-col items-center group/bar cursor-pointer h-full relative">
                    <!-- Tooltip -->
                    <div class="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold py-1.5 px-3 rounded-xl pointer-events-none z-10 whitespace-nowrap shadow-lg">
                      {{ month.revenue | currency:'EGP':'EGP ':'1.0-0' }}
                    </div>
                    <div class="relative w-full flex items-end justify-center space-x-1.5 h-full pb-6">
                      <div class="w-full max-w-[14px] bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-300 rounded-full transition-all duration-1000 ease-out shadow-lg group-hover/bar:brightness-125"
                           [style.height.%]="month.revenuePercent"></div>
                      <div class="w-full max-w-[14px] bg-gradient-to-t from-blue-700 via-blue-500 to-blue-300 rounded-full transition-all duration-1000 delay-75 shadow-lg group-hover/bar:brightness-125"
                           [style.height.%]="month.profitPercent"></div>
                    </div>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{{ month.label }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Stock Health Ring -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="flex items-center justify-between mb-8">
                <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Stock Health</h2>
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">📊</div>
              </div>

              <div class="relative w-48 h-48 mx-auto mb-8">
                <!-- SVG Doughnut -->
                <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" stroke-width="12" class="text-slate-100 dark:text-slate-800/50" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#stockGradient)" stroke-width="12"
                          stroke-dasharray="251.2"
                          [attr.stroke-dashoffset]="251.2 * (1 - healthyStockPercent / 100)"
                          stroke-linecap="round"
                          class="transition-all duration-1000 ease-out" />
                  <defs>
                    <linearGradient id="stockGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#10b981" />
                      <stop offset="100%" stop-color="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Healthy</p>
                  <p class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{{ healthyStockPercent | number:'1.0-0' }}%</p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                  <div class="flex items-center gap-3">
                    <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span class="text-xs font-black text-slate-500 uppercase tracking-widest">In Stock</span>
                  </div>
                  <span class="text-sm font-black text-slate-900 dark:text-white">{{ stats.totalProducts - stats.lowStockCount }}</span>
                </div>
                <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                  <div class="flex items-center gap-3">
                    <div class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                    <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Low Stock</span>
                  </div>
                  <span class="text-sm font-black text-amber-500">{{ stats.lowStockCount }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══════════ TRANSACTION TYPES + SALES SUMMARY ═══════════ -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            <!-- Transaction Types Breakdown -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div class="flex items-center justify-between mb-8">
                <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Transaction Types</h2>
                <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">{{ stats.totalSales }} total</span>
              </div>
              <div class="space-y-5">
                @for (type of transactionTypes; track type.name) {
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full" [style.background]="type.color"></div>
                        <span class="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{{ type.name }}</span>
                      </div>
                      <span class="text-sm font-black text-slate-900 dark:text-white">{{ type.count }}</span>
                    </div>
                    <div class="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-1000 ease-out"
                           [style.width.%]="type.percent"
                           [style.background]="type.color"></div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Sales Performance Summary -->
            <div class="bg-gradient-to-br from-emerald-600 to-cyan-700 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
              <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
              <div class="relative">
                <h3 class="text-lg font-black uppercase tracking-widest mb-8 opacity-80">Sales Performance</h3>
                
                <div class="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p class="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Sales</p>
                    <p class="text-4xl font-black tracking-tighter">{{ stats.totalSales }}</p>
                  </div>
                  <div>
                    <p class="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Avg. Order</p>
                    <p class="text-4xl font-black tracking-tighter">{{ avgOrderValue | currency:'EGP':'EGP ':'1.0-0' }}</p>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                      </div>
                      <span class="text-sm font-bold">Profit Margin</span>
                    </div>
                    <span class="text-xl font-black">{{ profitMargin | number:'1.0-0' }}%</span>
                  </div>
                  <div class="flex items-center justify-between p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                      </div>
                      <span class="text-sm font-bold">Products Listed</span>
                    </div>
                    <span class="text-xl font-black">{{ stats.totalProducts }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══════════ RECENT TRANSACTIONS TABLE ═══════════ -->
          <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div class="px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Activity</h2>
              <a routerLink="/inventory-dashboard/sales" class="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] hover:translate-x-1 transition-transform inline-flex items-center">
                View All
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
              </a>
            </div>

            @if (stats.recentTransactions && stats.recentTransactions.length > 0) {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="text-left bg-slate-50/50 dark:bg-slate-950/30">
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Type</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Product</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Quantity</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Amount</th>
                      <th class="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Date</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                    @for (tx of stats.recentTransactions; track tx.id) {
                      <tr class="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td class="px-8 py-6">
                          <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                                [ngClass]="getTransactionBadgeClass(tx.transactionType)">
                            {{ tx.transactionType }}
                          </span>
                        </td>
                        <td class="px-8 py-6 font-black text-slate-900 dark:text-white">{{ tx.productName }}</td>
                        <td class="px-8 py-6">
                          <span class="font-bold text-slate-700 dark:text-slate-300">{{ tx.quantity }}</span>
                        </td>
                        <td class="px-8 py-6 font-black text-emerald-500 tracking-tight">{{ tx.totalAmount | currency:'EGP':'EGP ':'1.0-0' }}</td>
                        <td class="px-8 py-6 text-sm text-slate-500 font-medium">{{ tx.transactionDate | date:'MMM d, y' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="text-center py-20">
                <div class="w-20 h-20 mx-auto mb-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shadow-inner">
                  <svg class="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">No Recent Activity</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Transactions will appear here once you start selling</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class InventoryOverviewComponent implements OnInit {
  stats: VendorStats | null = null;
  loading = true;
  error: string | null = null;
  userName = '';

  // Computed data
  monthlyChart: { label: string; revenue: number; profit: number; revenuePercent: number; profitPercent: number }[] = [];
  transactionTypes: { name: string; count: number; percent: number; color: string }[] = [];

  constructor(
    private vendorService: VendorService,
    private authService: AuthService
  ) {
    const user = this.authService.getCurrentUser();
    this.userName = user?.fullName?.split(' ')[0] || 'there';
  }

  ngOnInit(): void {
    this.loadStats();
  }

  get profitMargin(): number {
    if (!this.stats || this.stats.totalRevenue === 0) return 0;
    return (this.stats.totalProfit / this.stats.totalRevenue) * 100;
  }

  get avgOrderValue(): number {
    if (!this.stats || this.stats.totalSales === 0) return 0;
    return this.stats.totalRevenue / this.stats.totalSales;
  }

  get healthyStockPercent(): number {
    if (!this.stats || this.stats.totalProducts === 0) return 100;
    return ((this.stats.totalProducts - this.stats.lowStockCount) / this.stats.totalProducts) * 100;
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;

    this.vendorService.getMyStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.buildMonthlyChart();
        this.buildTransactionTypes();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.error = 'Failed to load dashboard statistics. Please try again.';
        this.loading = false;
      }
    });
  }

  buildMonthlyChart(): void {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentMonth = now.getMonth();

    // Build from transactions if available
    const monthData: { [key: string]: { revenue: number; profit: number } } = {};
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      last6.push(months[idx]);
      monthData[months[idx]] = { revenue: 0, profit: 0 };
    }

    if (this.stats?.recentTransactions) {
      for (const tx of this.stats.recentTransactions) {
        const date = new Date(tx.transactionDate);
        const label = months[date.getMonth()];
        if (monthData[label] && tx.transactionType === 'Sale') {
          monthData[label].revenue += tx.totalAmount;
          monthData[label].profit += tx.totalAmount * 0.3; // estimate
        }
      }
    }

    const maxRevenue = Math.max(...Object.values(monthData).map(d => d.revenue), 1);

    this.monthlyChart = last6.map(label => ({
      label,
      revenue: monthData[label].revenue,
      profit: monthData[label].profit,
      revenuePercent: (monthData[label].revenue / maxRevenue) * 85 + 5,
      profitPercent: (monthData[label].profit / maxRevenue) * 85 + 5
    }));
  }

  buildTransactionTypes(): void {
    if (!this.stats?.recentTransactions) {
      this.transactionTypes = [];
      return;
    }

    const colorMap: { [key: string]: string } = {
      'Sale': '#10b981',
      'Purchase': '#3b82f6',
      'Adjustment': '#f59e0b',
      'InitialStock': '#8b5cf6',
      'Return': '#64748b',
      'Loss': '#ef4444'
    };

    const counts: { [key: string]: number } = {};
    for (const tx of this.stats.recentTransactions) {
      counts[tx.transactionType] = (counts[tx.transactionType] || 0) + 1;
    }

    const total = this.stats.recentTransactions.length || 1;

    this.transactionTypes = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({
        name,
        count,
        percent: (count / total) * 100,
        color: colorMap[name] || '#94a3b8'
      }));
  }

  getTransactionBadgeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'Sale': 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      'Purchase': 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      'Adjustment': 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      'InitialStock': 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
      'Return': 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
      'Loss': 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
    };
    return classes[type] || 'bg-slate-50 text-slate-600 border-slate-100';
  }
}
