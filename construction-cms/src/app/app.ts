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
    // Don't show sidebar/topbar on auth routes
    return !currentUrl.startsWith('/auth');
  }
}
