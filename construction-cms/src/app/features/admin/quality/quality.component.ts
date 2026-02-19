import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QualityService, QualityInspection, Defect, PunchListItem, QualityStatistics } from '../../../core/services/quality.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-quality',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="quality-page">
      <div class="page-header">
        <h1>{{ 'quality.title' | translate }}</h1>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="activeTab = 'inspections'">
            <i class="icon-clipboard"></i> {{ 'quality.inspection.title' | translate }}
          </button>
          <button class="btn btn-primary" (click)="activeTab = 'defects'">
            <i class="icon-alert"></i> {{ 'quality.defect.title' | translate }}
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card" (click)="activeTab = 'inspections'">
          <div class="card-icon blue">
            <i class="icon-clipboard"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ statistics?.totalInspections || 0 }}</span>
            <span class="card-label">{{ 'quality.stats.total_inspections' | translate }}</span>
          </div>
        </div>
        <div class="summary-card" (click)="activeTab = 'defects'">
          <div class="card-icon red">
            <i class="icon-alert"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ statistics?.openDefects || 0 }}</span>
            <span class="card-label">{{ 'quality.stats.open_defects' | translate }}</span>
          </div>
        </div>
        <div class="summary-card" (click)="activeTab = 'defects'">
          <div class="card-icon orange">
            <i class="icon-warning"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ statistics?.criticalDefects || 0 }}</span>
            <span class="card-label">{{ 'quality.stats.critical' | translate }}</span>
          </div>
        </div>
        <div class="summary-card" (click)="activeTab = 'punchlist'">
          <div class="card-icon green">
            <i class="icon-list"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ statistics?.pendingPunchListItems || 0 }}</span>
            <span class="card-label">{{ 'quality.stats.punch_list' | translate }}</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon purple">
            <i class="icon-chart"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ statistics ? statistics.averageInspectionScore.toFixed(1) : '0.0' }}%</span>
            <span class="card-label">{{ 'quality.stats.avg_score' | translate }}</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button [class.active]="activeTab === 'inspections'" (click)="activeTab = 'inspections'">
          {{ 'quality.tabs.inspections' | translate }}
        </button>
        <button [class.active]="activeTab === 'defects'" (click)="activeTab = 'defects'">
          {{ 'quality.tabs.defects' | translate }}
        </button>
        <button [class.active]="activeTab === 'punchlist'" (click)="activeTab = 'punchlist'">
          {{ 'quality.tabs.punchlist' | translate }}
        </button>
        <button [class.active]="activeTab === 'standards'" (click)="activeTab = 'standards'">
          {{ 'quality.tabs.standards' | translate }}
        </button>
      </div>

      <!-- Inspections Tab -->
      <div class="tab-content" *ngIf="activeTab === 'inspections'">
        <div class="filter-section">
          <div class="search-box">
            <i class="icon-search"></i>
            <input type="text" [(ngModel)]="inspectionSearch" [placeholder]="'common.search' | translate">
          </div>
          <select [(ngModel)]="inspectionStatusFilter">
            <option value="">{{ 'common.all' | translate }}</option>
            <option value="Scheduled">{{ 'quality.inspection.scheduled' | translate }}</option>
            <option value="InProgress">{{ 'quality.inspection.in_progress' | translate }}</option>
            <option value="Completed">{{ 'common.completed' | translate }}</option>
          </select>
          <select [(ngModel)]="inspectionTypeFilter">
            <option value="">{{ 'quality.inspection.all_types' | translate }}</option>
            <option value="Daily">{{ 'quality.inspection.daily' | translate }}</option>
            <option value="Weekly">{{ 'quality.inspection.weekly' | translate }}</option>
            <option value="Monthly">{{ 'quality.inspection.monthly' | translate }}</option>
            <option value="Final">{{ 'quality.inspection.final' | translate }}</option>
          </select>
        </div>

        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>{{ 'quality.inspection.number' | translate }}</th>
                <th>{{ 'common.title' | translate }}</th>
                <th>{{ 'common.project' | translate }}</th>
                <th>{{ 'common.type' | translate }}</th>
                <th>{{ 'common.status' | translate }}</th>
                <th>{{ 'common.date' | translate }}</th>
                <th>{{ 'quality.inspection.score' | translate }}</th>
                <th>{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inspection of filteredInspections">
                <td>{{ inspection.inspectionNumber }}</td>
                <td>{{ inspection.title }}</td>
                <td>{{ inspection.projectName }}</td>
                <td>{{ inspection.inspectionType }}</td>
                <td>
                  <span class="status-badge" [ngClass]="getStatusClass(inspection.status)">
                    {{ inspection.status }}
                  </span>
                </td>
                <td>{{ inspection.scheduledDate | date:'mediumDate' }}</td>
                <td>
                  <div class="score-bar" *ngIf="inspection.score > 0">
                    <div class="score-fill" [style.width.%]="inspection.score" [ngClass]="getScoreClass(inspection.score)"></div>
                    <span>{{ inspection.score }}%</span>
                  </div>
                  <span *ngIf="inspection.score === 0">-</span>
                </td>
                <td>
                  <button class="btn-icon" [title]="'common.view' | translate" (click)="viewInspection(inspection)">
                    <i class="icon-eye"></i>
                  </button>
                  <button class="btn-icon" *ngIf="inspection.status === 'Scheduled'" [title]="'common.start' | translate" (click)="startInspection(inspection)">
                    <i class="icon-play"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Defects Tab -->
      <div class="tab-content" *ngIf="activeTab === 'defects'">
        <div class="filter-section">
          <div class="search-box">
            <i class="icon-search"></i>
            <input type="text" [(ngModel)]="defectSearch" [placeholder]="'quality.defect.search_placeholder' | translate">
          </div>
          <select [(ngModel)]="defectStatusFilter">
            <option value="">{{ 'quality.defect.all_status' | translate }}</option>
            <option value="Open">{{ 'quality.defect.open' | translate }}</option>
            <option value="InProgress">{{ 'quality.defect.in_progress' | translate }}</option>
            <option value="Resolved">{{ 'quality.defect.resolved' | translate }}</option>
            <option value="Closed">{{ 'quality.defect.closed' | translate }}</option>
          </select>
          <select [(ngModel)]="defectSeverityFilter">
            <option value="">{{ 'quality.defect.all_severity' | translate }}</option>
            <option value="Critical">{{ 'quality.defect.critical' | translate }}</option>
            <option value="Major">{{ 'quality.defect.major' | translate }}</option>
            <option value="Minor">{{ 'quality.defect.minor' | translate }}</option>
          </select>
        </div>

        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>{{ 'quality.defect.number' | translate }}</th>
                <th>{{ 'common.title' | translate }}</th>
                <th>{{ 'common.category' | translate }}</th>
                <th>{{ 'quality.defect.severity' | translate }}</th>
                <th>{{ 'common.status' | translate }}</th>
                <th>{{ 'quality.defect.priority' | translate }}</th>
                <th>{{ 'quality.defect.reported' | translate }}</th>
                <th>{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let defect of filteredDefects" [class.safety-row]="defect.isSafetyRelated">
                <td>{{ defect.defectNumber }}</td>
                <td>{{ defect.title }}</td>
                <td>{{ defect.category }}</td>
                <td>
                  <span class="severity-badge" [ngClass]="defect.severity.toLowerCase()">
                    {{ defect.severity }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [ngClass]="getDefectStatusClass(defect.status)">
                    {{ defect.status }}
                  </span>
                </td>
                <td>
                  <span class="priority-badge" [ngClass]="defect.priority.toLowerCase()">
                    {{ defect.priority }}
                  </span>
                </td>
                <td>{{ defect.reportedDate | date:'mediumDate' }}</td>
                <td>
                  <button class="btn-icon" [title]="'common.view' | translate" (click)="viewDefect(defect)">
                    <i class="icon-eye"></i>
                  </button>
                  <button class="btn-icon" [title]="'common.assign' | translate" *ngIf="defect.status === 'Open'" (click)="assignDefect(defect)">
                    <i class="icon-user"></i>
                  </button>
                  <i class="icon-alert safety-icon" *ngIf="defect.isSafetyRelated" [title]="'quality.defect.safety_related' | translate"></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Punch List Tab -->
      <div class="tab-content" *ngIf="activeTab === 'punchlist'">
        <div class="filter-section">
          <div class="search-box">
            <i class="icon-search"></i>
            <input type="text" [(ngModel)]="punchListSearch" [placeholder]="'quality.punchlist.search_placeholder' | translate">
          </div>
          <select [(ngModel)]="punchListStatusFilter">
            <option value="">{{ 'common.all_status' | translate }}</option>
            <option value="Pending">{{ 'common.pending' | translate }}</option>
            <option value="InProgress">{{ 'common.in_progress' | translate }}</option>
            <option value="Completed">{{ 'common.completed' | translate }}</option>
            <option value="Verified">{{ 'quality.punchlist.verified' | translate }}</option>
            <option value="Accepted">{{ 'quality.punchlist.accepted' | translate }}</option>
          </select>
        </div>

        <div class="punch-list-grid">
          <div class="punch-card" *ngFor="let item of filteredPunchListItems" [ngClass]="item.status.toLowerCase()">
            <div class="punch-header">
              <span class="item-number">{{ item.itemNumber }}</span>
              <span class="status-badge small" [ngClass]="getPunchListStatusClass(item.status)">
                {{ item.status }}
              </span>
            </div>
            <p class="punch-description">{{ item.description }}</p>
            <div class="punch-meta">
              <span><i class="icon-location"></i> {{ item.location }}</span>
              <span><i class="icon-category"></i> {{ item.category }}</span>
            </div>
            <div class="punch-footer">
              <span class="priority-badge" [ngClass]="item.priority.toLowerCase()">
                {{ item.priority }}
              </span>
              <span class="due-date" *ngIf="item.dueDate" [class.overdue]="isOverdue(item)">
                Due: {{ item.dueDate | date:'shortDate' }}
              </span>
            </div>
            <div class="punch-actions">
              <button class="btn btn-small" *ngIf="item.status === 'Pending'" (click)="startPunchItem(item)">Start</button>
              <button class="btn btn-small btn-primary" *ngIf="item.status === 'InProgress'" (click)="completePunchItem(item)">Complete</button>
              <button class="btn btn-small btn-outline" *ngIf="item.status === 'Completed'" (click)="verifyPunchItem(item)">Verify</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Standards Tab -->
      <div class="tab-content" *ngIf="activeTab === 'standards'">
        <div class="standards-grid">
          <div class="standard-card">
            <h4>Structural</h4>
            <ul>
              <li>Concrete compressive strength verification</li>
              <li>Steel reinforcement placement</li>
              <li>Foundation alignment</li>
            </ul>
          </div>
          <div class="standard-card">
            <h4>Electrical</h4>
            <ul>
              <li>Wiring gauge compliance</li>
              <li>Connection torque verification</li>
              <li>Ground resistance testing</li>
            </ul>
          </div>
          <div class="standard-card">
            <h4>Plumbing</h4>
            <ul>
              <li>Pressure testing</li>
              <li>Pipe slope verification</li>
              <li>Joint integrity inspection</li>
            </ul>
          </div>
          <div class="standard-card">
            <h4>Finishing</h4>
            <ul>
              <li>Surface flatness tolerance</li>
              <li>Paint adhesion testing</li>
              <li>Tile lippage limits</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Modals would go here -->
    </div>
  `,
  styles: [`
    .quality-page {
      padding: 24px;
      background: #f5f7fa;
      min-height: 100%;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      cursor: pointer;
      transition: all 0.2s;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-icon.blue { background: #e3f2fd; color: #1976d2; }
    .card-icon.green { background: #e8f5e9; color: #388e3c; }
    .card-icon.orange { background: #fff3e0; color: #f57c00; }
    .card-icon.red { background: #ffebee; color: #d32f2f; }
    .card-icon.purple { background: #f3e5f5; color: #7b1fa2; }

    .card-content {
      display: flex;
      flex-direction: column;
    }

    .card-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .card-label {
      font-size: 13px;
      color: #64748b;
    }

    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 24px;
      background: white;
      padding: 8px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .tabs button {
      padding: 12px 24px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      transition: all 0.2s;
    }

    .tabs button:hover {
      background: #f5f7fa;
    }

    .tabs button.active {
      background: #3b82f6;
      color: white;
    }

    .tab-content {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .filter-section {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 250px;
    }

    .search-box i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .search-box input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
    }

    .filter-section select {
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      font-size: 14px;
      min-width: 150px;
    }

    .data-table {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
    }

    th {
      font-weight: 600;
      color: #64748b;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    tr:hover {
      background: #f8fafc;
    }

    .safety-row {
      background: #fff8e1 !important;
    }

    .status-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.small {
      padding: 2px 8px;
      font-size: 10px;
    }

    .status-badge.scheduled { background: #e3f2fd; color: #1976d2; }
    .status-badge.inprogress, .status-badge.in-progress { background: #fff3e0; color: #f57c00; }
    .status-badge.completed { background: #e8f5e9; color: #388e3c; }
    .status-badge.open { background: #ffebee; color: #d32f2f; }
    .status-badge.inprogress { background: #fff3e0; color: #f57c00; }
    .status-badge.resolved { background: #e8f5e9; color: #388e3c; }
    .status-badge.closed { background: #eceff1; color: #546e7a; }
    .status-badge.pending { background: #fce4ec; color: #c2185b; }
    .status-badge.verified { background: #e3f2fd; color: #1976d2; }
    .status-badge.accepted { background: #e8f5e9; color: #388e3c; }

    .severity-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .severity-badge.critical { background: #d32f2f; color: white; }
    .severity-badge.major { background: #f57c00; color: white; }
    .severity-badge.minor { background: #ffeb3b; color: #333; }

    .priority-badge {
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 600;
    }

    .priority-badge.high { background: #d32f2f; color: white; }
    .priority-badge.medium { background: #f57c00; color: white; }
    .priority-badge.low { background: #4caf50; color: white; }

    .score-bar {
      width: 100px;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }

    .score-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s;
    }

    .score-fill.excellent { background: #4caf50; }
    .score-fill.good { background: #8bc34a; }
    .score-fill.fair { background: #ffeb3b; }
    .score-fill.poor { background: #f44336; }

    .score-bar span {
      position: absolute;
      right: -40px;
      top: -4px;
      font-size: 12px;
      font-weight: 500;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border: none;
      background: #f5f7fa;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 4px;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: #e2e8f0;
    }

    .safety-icon {
      color: #d32f2f;
      font-size: 16px;
    }

    .punch-list-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .punch-card {
      background: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      border-left: 4px solid #e2e8f0;
    }

    .punch-card.completed { border-left-color: #4caf50; }
    .punch-card.inprogress, .punch-card.in-progress { border-left-color: #f57c00; }
    .punch-card.verified { border-left-color: #1976d2; }

    .punch-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .item-number {
      font-weight: 600;
      color: #64748b;
      font-size: 12px;
    }

    .punch-description {
      margin: 0 0 12px 0;
      font-weight: 500;
      color: #1a1a2e;
    }

    .punch-meta {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #64748b;
      margin-bottom: 12px;
    }

    .punch-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .due-date {
      font-size: 12px;
      color: #64748b;
    }

    .due-date.overdue {
      color: #d32f2f;
      font-weight: 500;
    }

    .punch-actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-small {
      padding: 6px 12px;
      font-size: 12px;
    }

    .btn-outline {
      background: white;
      border: 1px solid #e2e8f0;
      color: #475569;
    }

    .standards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    .standard-card {
      background: #f8fafc;
      border-radius: 12px;
      padding: 20px;
    }

    .standard-card h4 {
      margin: 0 0 12px 0;
      color: #1a1a2e;
      font-size: 16px;
    }

    .standard-card ul {
      margin: 0;
      padding-left: 20px;
    }

    .standard-card li {
      margin-bottom: 8px;
      color: #64748b;
      font-size: 14px;
    }
  `]
})
export class QualityComponent implements OnInit {
  activeTab = 'inspections';
  statistics: QualityStatistics | null = null;

  inspections: QualityInspection[] = [];
  defects: Defect[] = [];
  punchListItems: PunchListItem[] = [];

  // Filters
  inspectionSearch = '';
  inspectionStatusFilter = '';
  inspectionTypeFilter = '';

  defectSearch = '';
  defectStatusFilter = '';
  defectSeverityFilter = '';

  punchListSearch = '';
  punchListStatusFilter = '';

  private destroy$ = new Subject<void>();
  private i18nService = inject(I18nService);

  constructor(private qualityService: QualityService) {
    // Subscribe to language changes to refresh data
    this.i18nService.onLanguageChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
      });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.qualityService.getStatistics().subscribe(stats => this.statistics = stats);
    this.qualityService.getInspections().subscribe(inspections => this.inspections = inspections);
    this.qualityService.getDefects().subscribe(defects => this.defects = defects);
    this.qualityService.getPunchListItems().subscribe(items => this.punchListItems = items);
  }

  get filteredInspections(): QualityInspection[] {
    return this.inspections.filter(i => {
      const matchesSearch = !this.inspectionSearch ||
        i.title.toLowerCase().includes(this.inspectionSearch.toLowerCase()) ||
        i.inspectionNumber.toLowerCase().includes(this.inspectionSearch.toLowerCase());
      const matchesStatus = !this.inspectionStatusFilter || i.status === this.inspectionStatusFilter;
      const matchesType = !this.inspectionTypeFilter || i.inspectionType === this.inspectionTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  get filteredDefects(): Defect[] {
    return this.defects.filter(d => {
      const matchesSearch = !this.defectSearch ||
        d.title.toLowerCase().includes(this.defectSearch.toLowerCase()) ||
        d.defectNumber.toLowerCase().includes(this.defectSearch.toLowerCase());
      const matchesStatus = !this.defectStatusFilter || d.status === this.defectStatusFilter;
      const matchesSeverity = !this.defectSeverityFilter || d.severity === this.defectSeverityFilter;
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }

  get filteredPunchListItems(): PunchListItem[] {
    return this.punchListItems.filter(p => {
      const matchesSearch = !this.punchListSearch ||
        p.description.toLowerCase().includes(this.punchListSearch.toLowerCase()) ||
        p.itemNumber.toLowerCase().includes(this.punchListSearch.toLowerCase());
      const matchesStatus = !this.punchListStatusFilter || p.status === this.punchListStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  getDefectStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getPunchListStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }

  isOverdue(item: PunchListItem): boolean {
    return item.dueDate ? new Date(item.dueDate) < new Date() : false;
  }

  viewInspection(inspection: QualityInspection): void {
    console.log('View inspection:', inspection);
  }

  startInspection(inspection: QualityInspection): void {
    console.log('Start inspection:', inspection);
  }

  viewDefect(defect: Defect): void {
    console.log('View defect:', defect);
  }

  assignDefect(defect: Defect): void {
    console.log('Assign defect:', defect);
  }

  startPunchItem(item: PunchListItem): void {
    console.log('Start punch item:', item);
  }

  completePunchItem(item: PunchListItem): void {
    console.log('Complete punch item:', item);
  }

  verifyPunchItem(item: PunchListItem): void {
    console.log('Verify punch item:', item);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
