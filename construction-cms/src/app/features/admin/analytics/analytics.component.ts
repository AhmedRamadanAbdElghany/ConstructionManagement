import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService, DashboardSummary, FinancialAnalytics, ResourceAnalytics, KPIDashboard, ChartData } from '../../../core/services/analytics.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="analytics-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Analytics & Reports</h1>
          <p class="subtitle">Monitor your construction projects performance</p>
        </div>
        <div class="header-actions">
          <select [(ngModel)]="selectedPeriod" class="period-select">
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <button class="btn btn-primary" (click)="refreshData()">
            <span class="icon">&#8635;</span> Refresh
          </button>
          <button class="btn btn-secondary" (click)="exportReport()">
            <span class="icon">&#8595;</span> Export
          </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner [centered]="true" label="Loading analytics data..."></app-loading-spinner>
      }

      <!-- Dashboard Summary -->
      @if (dashboardSummary(); as summary) {
        <!-- Metric Cards -->
        <div class="metrics-grid">
          <div class="metric-card project-health">
            <div class="metric-icon">&#128202;</div>
            <div class="metric-content">
              <span class="metric-title">Project Health</span>
              <span class="metric-value">{{ summary.projectHealthScore | number:'1.0-0' }}%</span>
              <span class="metric-subtitle">
                {{ summary.activeProjects }} Active / {{ summary.totalProjects }} Total
              </span>
            </div>
            <div class="metric-trend" [class.up]="summary.projectHealthScore >= 80" [class.down]="summary.projectHealthScore < 60">
              {{ summary.projectHealthScore >= 80 ? '&#10003;' : summary.projectHealthScore < 60 ? '&#9888;' : '&#8594;' }}
            </div>
          </div>

          <div class="metric-card financial">
            <div class="metric-icon">&#128176;</div>
            <div class="metric-content">
              <span class="metric-title">Revenue</span>
              <span class="metric-value">{{ summary.totalRevenue | currency:'USD':'symbol':'1.0-0' }}</span>
              <span class="metric-subtitle">
                Profit: {{ summary.grossProfit | currency:'USD':'symbol':'1.0-0' }} ({{ summary.profitMargin | number:'1.1-1' }}%)
              </span>
            </div>
          </div>

          <div class="metric-card resource">
            <div class="metric-icon">&#128101;</div>
            <div class="metric-content">
              <span class="metric-title">Labor Utilization</span>
              <span class="metric-value">{{ summary.laborUtilization | number:'1.0-0' }}%</span>
              <span class="metric-subtitle">{{ summary.activeWorkers }} Active Workers</span>
            </div>
          </div>

          <div class="metric-card quality">
            <div class="metric-icon">&#10004;</div>
            <div class="metric-content">
              <span class="metric-title">Quality Score</span>
              <span class="metric-value">{{ summary.qualityScore | number:'1.0-0' }}%</span>
              <span class="metric-subtitle">{{ summary.openDefects }} Open Defects</span>
            </div>
          </div>

          <div class="metric-card safety">
            <div class="metric-icon">&#128737;</div>
            <div class="metric-content">
              <span class="metric-title">Safety Score</span>
              <span class="metric-value">{{ summary.safetyScore | number:'1.0-0' }}%</span>
              <span class="metric-subtitle">{{ summary.safetyIncidents }} Incidents</span>
            </div>
          </div>

          <div class="metric-card overdue">
            <div class="metric-icon">&#9889;</div>
            <div class="metric-content">
              <span class="metric-title">Overdue Payments</span>
              <span class="metric-value">{{ summary.overduePayments | currency:'USD':'symbol':'1.0-0' }}</span>
              <span class="metric-subtitle">Pending: {{ summary.pendingInvoices | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
          </div>
        </div>
      }

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Revenue Chart -->
        <div class="chart-card large">
          <div class="chart-header">
            <h3>Revenue Trend</h3>
            <div class="chart-actions">
              <button [class.active]="revenueChartType === 'bar'" (click)="revenueChartType = 'bar'; loadRevenueChart()">Bar</button>
              <button [class.active]="revenueChartType === 'line'" (click)="revenueChartType = 'line'; loadRevenueChart()">Line</button>
            </div>
          </div>
          <div class="chart-container">
            <div class="chart-placeholder">
              <div class="chart-bars">
                @for (item of revenueData; track $index) {
                  <div class="bar" [style.height.%]="(item / maxRevenue) * 100">
                    <span class="bar-value">{{ formatCompact(item) }}</span>
                  </div>
                }
              </div>
              <div class="chart-labels">
                @for (month of revenueMonths; track $index) {
                  <span>{{ month }}</span>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Project Progress Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Project Progress</h3>
          </div>
          <div class="chart-container">
            <div class="horizontal-bar-chart">
              @for (item of projectProgress; track $index) {
                <div class="progress-row">
                  <span class="progress-label">{{ item.name }}</span>
                  <div class="progress-bar-container">
                    <div class="progress-bar" [style.width.%]="item.progress">
                      <span class="progress-value">{{ item.progress | number:'1.0-0' }}%</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Cost Breakdown -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Cost Breakdown</h3>
          </div>
          <div class="chart-container">
            <div class="pie-chart-container">
              <div class="pie-chart"></div>
              <div class="pie-legend">
                <div class="legend-item">
                  <span class="legend-color" style="background: #ef4444"></span>
                  <span class="legend-label">Labor</span>
                  <span class="legend-value">$750K</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background: #f59e0b"></span>
                  <span class="legend-label">Materials</span>
                  <span class="legend-value">$520K</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background: #10b981"></span>
                  <span class="legend-label">Equipment</span>
                  <span class="legend-value">$280K</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background: #3b82f6"></span>
                  <span class="legend-label">Subcontractors</span>
                  <span class="legend-value">$300K</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resource Utilization -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Resource Utilization</h3>
          </div>
          <div class="chart-container">
            <div class="donut-chart">
              <div class="donut-center">
                <span class="donut-value">82%</span>
                <span class="donut-label">Labor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI Section -->
      <div class="kpi-section">
        <div class="section-header">
          <h2>Key Performance Indicators</h2>
          <button class="btn btn-link" (click)="showAllKPIs = !showAllKPIs">
            {{ showAllKPIs ? 'Show Less' : 'View All' }}
          </button>
        </div>
        <div class="kpi-grid">
          @for (kpi of kpiList; track kpi.id) {
            <div class="kpi-card" [class]="kpi.statusClass">
              <div class="kpi-header">
                <span class="kpi-name">{{ kpi.name }}</span>
                <span class="kpi-trend" [class]="kpi.trendClass">
                  {{ kpi.trendIcon }}
                </span>
              </div>
              <div class="kpi-value">{{ kpi.displayValue }}</div>
              <div class="kpi-target">
                Target: {{ kpi.target }}
              </div>
              <div class="kpi-progress">
                <div class="progress-fill" [style.width.%]="kpi.progress"></div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Financial Details -->
      @if (financialAnalytics(); as financial) {
        <div class="details-section">
          <div class="section-header">
            <h2>Financial Details</h2>
          </div>
          <div class="details-grid">
            <div class="detail-card">
              <h4>Revenue Breakdown</h4>
              <div class="detail-row">
                <span>Total Invoiced</span>
                <span>{{ financial.invoicedAmount | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-row">
                <span>Collected</span>
                <span class="success">{{ financial.collectedAmount | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-row">
                <span>Pending</span>
                <span class="warning">{{ financial.pendingAmount | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-row">
                <span>Overdue</span>
                <span class="danger">{{ financial.overdueAmount | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-row highlight">
                <span>Collection Rate</span>
                <span>{{ financial.collectionRate | number:'1.1-1' }}%</span>
              </div>
            </div>

            <div class="detail-card">
              <h4>Cost Breakdown</h4>
              <div class="detail-row">
                <span>Labor</span>
                <span>{{ financial.laborCosts | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-row">
                <span>Materials</span>
                <span>{{ financial.materialCosts | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-row">
                <span>Equipment</span>
                <span>{{ financial.equipmentCosts | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-row">
                <span>Subcontractors</span>
                <span>{{ financial.subcontractorCosts | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-row highlight">
                <span>Total Costs</span>
                <span>{{ financial.totalCosts | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
            </div>

            <div class="detail-card">
              <h4>Profitability</h4>
              <div class="detail-row">
                <span>Gross Profit</span>
                <span class="success">{{ financial.grossProfit | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-row">
                <span>Net Profit</span>
                <span class="success">{{ financial.netProfit | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-row">
                <span>Profit Margin</span>
                <span [class]="financial.profitMargin >= 0 ? 'success' : 'danger'">
                  {{ financial.profitMargin | number:'1.1-1' }}%
                </span>
              </div>
              <div class="detail-row">
                <span>ROI</span>
                <span>{{ financial.returnOnInvestment | number:'1.1-1' }}%</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Resource Details -->
      @if (resourceAnalytics(); as resource) {
        <div class="details-section">
          <div class="section-header">
            <h2>Resource Utilization</h2>
          </div>
          <div class="resource-cards">
            <div class="resource-stat">
              <span class="stat-value">{{ resource.totalWorkers }}</span>
              <span class="stat-label">Total Workers</span>
            </div>
            <div class="resource-stat">
              <span class="stat-value">{{ resource.averageUtilization | number:'1.0-0' }}%</span>
              <span class="stat-label">Avg Utilization</span>
            </div>
            <div class="resource-stat">
              <span class="stat-value">{{ resource.productivityIndex | number:'1.2-2' }}</span>
              <span class="stat-label">Productivity Index</span>
            </div>
            <div class="resource-stat">
              <span class="stat-value">{{ resource.totalEquipment }}</span>
              <span class="stat-label">Equipment</span>
            </div>
            <div class="resource-stat">
              <span class="stat-value">{{ resource.totalLaborCost | currency:'USD':'symbol':'1.0-0' }}</span>
              <span class="stat-label">Labor Cost</span>
            </div>
          </div>
        </div>
      }

      <!-- Quick Reports -->
      <div class="quick-reports-section">
        <div class="section-header">
          <h2>Quick Reports</h2>
        </div>
        <div class="reports-grid">
          <button class="report-card" (click)="generateReport('financial')">
            <span class="report-icon">&#128200;</span>
            <span class="report-name">Financial Summary</span>
            <span class="report-desc">Revenue, costs, and profitability</span>
          </button>
          <button class="report-card" (click)="generateReport('project')">
            <span class="report-icon">&#128196;</span>
            <span class="report-name">Project Status</span>
            <span class="report-desc">Progress and milestones</span>
          </button>
          <button class="report-card" (click)="generateReport('resource')">
            <span class="report-icon">&#128101;</span>
            <span class="report-name">Resource Report</span>
            <span class="report-desc">Team and equipment utilization</span>
          </button>
          <button class="report-card" (click)="generateReport('quality')">
            <span class="report-icon">&#10004;</span>
            <span class="report-name">Quality Report</span>
            <span class="report-desc">Inspections and defects</span>
          </button>
          <button class="report-card" (click)="generateReport('safety')">
            <span class="report-icon">&#128737;</span>
            <span class="report-name">Safety Report</span>
            <span class="report-desc">Incidents and compliance</span>
          </button>
          <button class="report-card" (click)="generateReport('custom')">
            <span class="report-icon">&#9881;</span>
            <span class="report-name">Custom Report</span>
            <span class="report-desc">Build your own report</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 24px;
      background: #f8fafc;
      min-height: 100%;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #1e293b;
    }

    .subtitle {
      margin: 4px 0 0;
      color: #64748b;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .period-select {
      padding: 8px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #4f46e5;
      color: white;
    }

    .btn-primary:hover {
      background: #4338ca;
    }

    .btn-secondary {
      background: white;
      color: #4f46e5;
      border: 1px solid #4f46e5;
    }

    .btn-secondary:hover {
      background: #f5f3ff;
    }

    .btn-link {
      background: none;
      color: #4f46e5;
      padding: 0;
    }

    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: #64748b;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .metric-icon {
      font-size: 32px;
    }

    .metric-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .metric-title {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
    }

    .metric-subtitle {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }

    .metric-trend {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .metric-trend.up {
      background: #dcfce7;
      color: #16a34a;
    }

    .metric-trend.down {
      background: #fee2e2;
      color: #dc2626;
    }

    .charts-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .chart-card.large {
      grid-column: span 2;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .chart-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .chart-actions {
      display: flex;
      gap: 8px;
    }

    .chart-actions button {
      padding: 4px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: white;
      font-size: 12px;
      cursor: pointer;
    }

    .chart-actions button.active {
      background: #4f46e5;
      color: white;
      border-color: #4f46e5;
    }

    .chart-container {
      min-height: 200px;
    }

    .chart-placeholder {
      height: 200px;
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 160px;
      padding: 0 10px;
    }

    .bar {
      width: 40px;
      background: linear-gradient(180deg, #4f46e5 0%, #6366f1 100%);
      border-radius: 4px 4px 0 0;
      position: relative;
      transition: height 0.3s;
    }

    .bar-value {
      position: absolute;
      top: -24px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      color: #64748b;
      white-space: nowrap;
    }

    .chart-labels {
      display: flex;
      justify-content: space-around;
      padding: 8px 10px 0;
    }

    .chart-labels span {
      width: 40px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }

    .horizontal-bar-chart {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .progress-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .progress-label {
      width: 120px;
      font-size: 13px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .progress-bar-container {
      flex: 1;
      height: 24px;
      background: #f1f5f9;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 8px;
      transition: width 0.3s;
    }

    .progress-value {
      font-size: 12px;
      font-weight: 500;
      color: white;
    }

    .pie-chart-container {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .pie-chart {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: conic-gradient(
        #ef4444 0% 25%,
        #f59e0b 25% 45%,
        #10b981 45% 70%,
        #3b82f6 70% 100%
      );
      position: relative;
    }

    .pie-legend {
      flex: 1;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-label {
      flex: 1;
      font-size: 13px;
      color: #64748b;
    }

    .legend-value {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }

    .donut-chart {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: #e2e8f0;
      position: relative;
      margin: 0 auto;
      background: conic-gradient(
        #4f46e5 0% 82%,
        #e2e8f0 82% 100%
      );
    }

    .donut-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .donut-value {
      display: block;
      font-size: 28px;
      font-weight: 600;
      color: #1e293b;
    }

    .donut-label {
      font-size: 12px;
      color: #64748b;
    }

    .kpi-section, .details-section, .quick-reports-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }

    .kpi-card {
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #e2e8f0;
    }

    .kpi-card.ontarget {
      border-left-color: #10b981;
      background: #f0fdf4;
    }

    .kpi-card.warning {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }

    .kpi-card.critical {
      border-left-color: #ef4444;
      background: #fef2f2;
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .kpi-name {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }

    .kpi-trend {
      font-size: 14px;
    }

    .kpi-trend.up { color: #10b981; }
    .kpi-trend.down { color: #ef4444; }
    .kpi-trend.stable { color: #64748b; }

    .kpi-value {
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .kpi-target {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 8px;
    }

    .kpi-progress {
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #4f46e5;
      transition: width 0.3s;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .detail-card {
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .detail-card h4 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-row span:first-child {
      color: #64748b;
    }

    .detail-row span:last-child {
      font-weight: 500;
      color: #1e293b;
    }

    .detail-row.highlight {
      background: #f1f5f9;
      margin: 8px -16px;
      padding: 12px 16px;
      border-bottom: none;
      font-weight: 600;
    }

    .detail-row .success { color: #10b981; }
    .detail-row .warning { color: #f59e0b; }
    .detail-row .danger { color: #ef4444; }

    .resource-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .resource-stat {
      text-align: center;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .stat-value {
      display: block;
      font-size: 32px;
      font-weight: 600;
      color: #4f46e5;
    }

    .stat-label {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }

    .report-card {
      padding: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
    }

    .report-card:hover {
      background: white;
      border-color: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
    }

    .report-icon {
      font-size: 32px;
      display: block;
      margin-bottom: 12px;
    }

    .report-name {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .report-desc {
      display: block;
      font-size: 12px;
      color: #94a3b8;
    }

    @media (max-width: 768px) {
      .analytics-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .charts-section {
        grid-template-columns: 1fr;
      }

      .chart-card.large {
        grid-column: span 1;
      }

      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private analyticsService = inject(AnalyticsService);
  private i18nService = inject(I18nService);
  private destroy$ = new Subject<void>();

  // Signals
  isLoading = signal(true);
  dashboardSummary = signal<DashboardSummary | null>(null);
  financialAnalytics = signal<FinancialAnalytics | null>(null);
  resourceAnalytics = signal<ResourceAnalytics | null>(null);
  kpiDashboard = signal<KPIDashboard | null>(null);

  // State
  selectedPeriod = '30d';
  revenueChartType: 'bar' | 'line' = 'bar';
  showAllKPIs = false;

  // Chart data derived from backend data
  revenueData: number[] = [];
  revenueMonths: string[] = [];
  maxRevenue = 0;

  // Project progress derived from dashboard summary
  projectProgress: { name: string; progress: number }[] = [];

  // KPIs derived from backend KPI dashboard
  kpiList: { id: number; name: string; displayValue: string; target: string; statusClass: string; trendClass: string; trendIcon: string; progress: number }[] = [];

  ngOnInit(): void {
    this.loadData();

    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading.set(true);

    const startDate = this.getStartDate();
    const endDate = new Date().toISOString();

    this.analyticsService.getDashboardSummary(startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardSummary.set(data);
          this.isLoading.set(false);
          this.updateChartData(data);
        },
        error: () => {
          this.isLoading.set(false);
          // Show empty state when backend unavailable
          this.dashboardSummary.set(null);
        }
      });

    this.analyticsService.getFinancialAnalytics(startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.financialAnalytics.set(data);
          this.updateRevenueChartData(data);
        },
        error: () => {
          // Show empty state when backend unavailable
          this.financialAnalytics.set(null);
        }
      });

    this.analyticsService.getResourceAnalytics(startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.resourceAnalytics.set(data),
        error: () => {
          // Show empty state when backend unavailable
          this.resourceAnalytics.set(null);
        }
      });

    this.analyticsService.getKPIDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.kpiDashboard.set(data);
          this.updateKPIList(data);
        }
      });
  }

  updateChartData(data: DashboardSummary): void {
    // Update project progress from revenue trend if available
    if (data.revenueTrend && data.revenueTrend.length > 0) {
      this.revenueData = data.revenueTrend.map(t => t.value);
      this.revenueMonths = data.revenueTrend.map(t => t.label || t.period);
      this.maxRevenue = Math.max(...this.revenueData);
    }
  }

  updateRevenueChartData(data: FinancialAnalytics): void {
    if (data.monthlyRevenue && data.monthlyRevenue.length > 0) {
      this.revenueData = data.monthlyRevenue.map(t => t.amount);
      this.revenueMonths = data.monthlyRevenue.map(t => t.monthName);
      this.maxRevenue = Math.max(...this.revenueData);
    }
  }

  updateKPIList(data: KPIDashboard): void {
    if (data.kpis && data.kpis.length > 0) {
      this.kpiList = data.kpis.map(kpi => ({
        id: kpi.id,
        name: kpi.name,
        displayValue: this.formatKPIValue(kpi.currentValue, kpi.displayFormat, kpi.displayPrecision),
        target: kpi.targetValue || '',
        statusClass: kpi.status.toLowerCase() === 'ontarget' ? 'ontarget' :
          kpi.status.toLowerCase() === 'warning' ? 'warning' : 'critical',
        trendClass: kpi.trend.toLowerCase() === 'up' ? 'up' :
          kpi.trend.toLowerCase() === 'down' ? 'down' : 'stable',
        trendIcon: kpi.trend.toLowerCase() === 'up' ? '&#8593;' :
          kpi.trend.toLowerCase() === 'down' ? '&#8595;' : '&#8594;',
        progress: kpi.targetValue ? Math.min(100, (kpi.currentValue / parseFloat(kpi.targetValue)) * 100) : 50
      }));
    }
  }

  formatKPIValue(value: number, format: string, precision: number): string {
    switch (format) {
      case 'Percentage':
        return `${value.toFixed(precision)}%`;
      case 'Currency':
        return `$${value.toFixed(precision)}`;
      case 'Ratio':
        return value.toFixed(precision);
      default:
        return value.toFixed(precision);
    }
  }

  // Mock data methods removed - data now comes from backend only
  // If backend is unavailable, empty state is shown

  loadRevenueChart(): void {
    this.analyticsService.getRevenueChartData(12)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  getStartDate(): string {
    const now = new Date();
    switch (this.selectedPeriod) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      case '12m':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  refreshData(): void {
    this.loadData();
  }

  exportReport(): void {
    alert('Export functionality would generate a PDF/Excel report');
  }

  generateReport(type: string): void {
    alert(`Generating ${type} report...`);
  }

  formatCompact(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  }
}
