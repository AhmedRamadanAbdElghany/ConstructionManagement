import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopbarComponent } from './layout/topbar/topbar.component';
import { ThemeService } from './core/theme/theme.service';
import { I18nService } from './core/i18n/i18n.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, CommonModule, LoadingSpinnerComponent, TranslateModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private i18nService = inject(I18nService);

  isNavigating = false;

  constructor() {
    this.i18nService.initializeLanguage();

    // Show spinner during page loads/transitions if it takes long enough
    let navTimeout: any;
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Clear any existing timeout
        if (navTimeout) clearTimeout(navTimeout);
        // Delay showing the loader to avoid flickering on fast navigations
        navTimeout = setTimeout(() => {
          this.isNavigating = true;
        }, 250);
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        if (navTimeout) clearTimeout(navTimeout);
        this.isNavigating = false;
      }
    });
  }

  get showLayout(): boolean {
    const currentUrl = this.router.url;
    const physicalUrl = window.location.pathname;

    // Don't show layout if we are on an auth route or still at the root (which redirects)
    const isAuth = currentUrl.startsWith('/auth') || physicalUrl.startsWith('/auth');
    const isRoot = currentUrl === '/' || physicalUrl === '/';

    return !isAuth && !isRoot;
  }
}
