import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectService } from '../../../../core/services/project.service';
import { SettingsService, UpdateProjectSettingsRequest } from '../../../../core/services/settings.service';
import { Project, ProjectSettings } from '../../../../shared/interfaces';

@Component({
  selector: 'app-project-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './project-settings.component.html',
  styleUrls: ['./project-settings.component.scss']
})
export class ProjectSettingsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private settingsService = inject(SettingsService);

  projectId: number | null = null;
  project: Project | null = null;
  settings: ProjectSettings | null = null;
  originalSettings: ProjectSettings | null = null;
  loading = true;
  saving = false;
  error: string | null = null;
  success = false;
  activeTab = 'general';

  // Form values
  form: UpdateProjectSettingsRequest = {};

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectId = parseInt(id, 10);
        this.loadData();
      }
    });
  }

  loadData(): void {
    if (!this.projectId) return;

    this.loading = true;
    this.error = null;

    // Load project details and settings in parallel
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
      },
      error: (err) => {
        this.error = 'Failed to load project details';
        console.error('Error loading project:', err);
      }
    });

    this.settingsService.getProjectSettings(this.projectId).subscribe({
      next: (settings) => {
        this.settings = settings;
        this.originalSettings = { ...settings };
        this.initializeForm();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load project settings';
        this.loading = false;
        console.error('Error loading settings:', err);
      }
    });
  }

  initializeForm(): void {
    if (!this.settings) return;

    this.form = {
      enableDelayNotification: this.settings.enableDelayNotification,
      delayNotificationIsOneTimeOnly: this.settings.delayNotificationIsOneTimeOnly,
      delayNotificationIntervalDays: this.settings.delayNotificationIntervalDays,
      delayNotificationSendEmail: this.settings.delayNotificationSendEmail,
      delayGracePeriodDays: this.settings.delayGracePeriodDays,
      enablePhotoUpload: this.settings.enablePhotoUpload,
      requirePhotoReview: this.settings.requirePhotoReview,
      photoApproverRole: this.settings.photoApproverRole,
      enableInvoiceReview: this.settings.enableInvoiceReview,
      enableInvoiceAggregation: this.settings.enableInvoiceAggregation,
      maxPhotosPerUpload: this.settings.maxPhotosPerUpload,
      clientCanSeeFinancials: this.settings.clientCanSeeFinancials,
      clientCanSeeMedia: this.settings.clientCanSeeMedia,
      clientCanSeeBOQ: this.settings.clientCanSeeBOQ,
      moneyCalculationMethod: this.settings.moneyCalculationMethod,
      allowAddProgressEntry: this.settings.allowAddProgressEntry,
      allowReopenClosedDay: this.settings.allowReopenClosedDay,
      autoCloseDay: this.settings.autoCloseDay,
      autoCloseDayTime: this.settings.autoCloseDayTime
    };
  }

  saveSettings(): void {
    if (!this.projectId) return;

    this.saving = true;
    this.error = null;
    this.success = false;

    this.settingsService.updateProjectSettings(this.projectId, this.form).subscribe({
      next: (updatedSettings) => {
        this.settings = updatedSettings;
        this.originalSettings = { ...updatedSettings };
        this.success = true;
        this.saving = false;

        // Hide success message after 3 seconds
        setTimeout(() => {
          this.success = false;
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to save settings';
        this.saving = false;
        console.error('Error saving settings:', err);
      }
    });
  }

  resetToDefaults(): void {
    if (!this.originalSettings) return;

    this.initializeForm();
    this.success = false;
    this.error = null;
  }

  hasChanges(): boolean {
    if (!this.originalSettings) return false;

    return JSON.stringify(this.form) !== JSON.stringify(this.originalSettings);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/admin/projects']);
  }

  // Helper methods
  isNull(value: any): boolean {
    return value === null || value === undefined;
  }

  getCalculationMethodLabel(method: string | null): string {
    switch (method) {
      case 'Measured': return 'Measured';
      case 'Supervision': return 'Supervision';
      case 'Packages': return 'Packages';
      default: return 'Inherit from Company';
    }
  }

  getApproverRoleLabel(role: string | null): string {
    if (!role) return 'Inherit from Company';
    return role;
  }
}
