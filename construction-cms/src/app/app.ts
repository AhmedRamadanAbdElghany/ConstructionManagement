import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopbarComponent } from './layout/topbar/topbar.component';
import { ThemeService } from './core/theme/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  private themeService = inject(ThemeService);
  private router = inject(Router);

  get showLayout(): boolean {
    const currentUrl = this.router.url;
    const physicalUrl = window.location.pathname;

    // Don't show layout if we are on an auth route or still at the root (which redirects)
    const isAuth = currentUrl.startsWith('/auth') || physicalUrl.startsWith('/auth');
    const isRoot = currentUrl === '/' || physicalUrl === '/';

    return !isAuth && !isRoot;
  }
}
