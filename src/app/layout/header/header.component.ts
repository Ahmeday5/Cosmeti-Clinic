import { SidebarService } from '../../core/services/sidebar.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService, // حقن AuthService لتسجيل الخروج
    private router: Router, // حقن Router للتعامل مع التنقل
    private activatedRoute: ActivatedRoute, // حقن ActivatedRoute للوصول للروت الحالي
  ) {}

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  // دالة تسجيل الخروج
  logout(): void {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      this.authService.logout(); // ← ينظف فوراً
      this.router.navigate(['/auth/login'], {
        replaceUrl: true, // 🔥 مهم جداً عشان يمسح التاريخ ويمنع الرجوع
      });
      this.sidebarService.close();
    }
  }
}
