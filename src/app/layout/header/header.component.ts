import { SidebarService } from '../../core/services/sidebar.service';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { visits } from './header.model';
import { ToastService } from '../../core/services/toast.service';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  Visits: visits | null = null;
  hasLoaded = false;
  private readonly toast = inject(ToastService);
  private readonly HeaderService = inject(HeaderService);

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService, // حقن AuthService لتسجيل الخروج
    private router: Router, // حقن Router للتعامل مع التنقل
    private activatedRoute: ActivatedRoute, // حقن ActivatedRoute للوصول للروت الحالي
  ) {}

  ngOnInit(): void {
    this.loadVisits();
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  async logout(): Promise<void> {
    const confirmed = await this.toast.confirm('هل أنت متأكد من تسجيل الخروج؟');
    if (confirmed) {
      this.authService.logout();
      this.router.navigate(['/auth/login'], { replaceUrl: true });
      this.sidebarService.close();
    }
  }

  loadVisits(): void {
    this.HeaderService.getVisits().subscribe({
      next: (data) => {
        this.Visits = data;
        this.hasLoaded = true;
      },
      error: (err) => {
        this.toast.error(err.message);
        this.hasLoaded = true;
      },
    });
  }
}
