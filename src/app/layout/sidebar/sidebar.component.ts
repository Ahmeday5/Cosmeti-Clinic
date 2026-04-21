import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  inject,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  Subscription,
} from 'rxjs';
import { SidebarService } from '../../core/services/sidebar.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  isSidebarOpen: boolean = false;
  isCollapsed: boolean = false;
  isMobile = false;

  menuItems: any[] = [];
  filteredMenuItems: any[] = [];
  private searchSub: Subscription | null = null;
  @ViewChild('searchInput', { static: true })
  searchInputRef!: ElementRef<HTMLInputElement>;

  private readonly toast = inject(ToastService);

  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private authService: AuthService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.updateMenuItems();
    this.updateSidebarState();

    this.menuItems.forEach((section) => {
      section.items?.forEach((item: any) => {
        if (item.submenu && item.label) {
          const saved = localStorage.getItem(`submenu_${item.label}`);
          if (saved !== null) {
            item.isOpen = saved === 'true';
          }
        }
      });
    });

    this.filteredMenuItems = JSON.parse(JSON.stringify(this.menuItems));

    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed) {
      this.isCollapsed = savedCollapsed === 'true';
    }

    this.sidebarService.sidebar$.subscribe((isOpen) => {
      this.isSidebarOpen = isOpen;
    });
  }

  async handleSpecialAction(subItem: any): Promise<void> {
    if (subItem.key === 'تسجيل الخروج') {
      const confirmed = await this.toast.confirm('هل أنت متأكد من تسجيل الخروج؟');
      if (confirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
        this.sidebarService.close();
      }
    }
  }

  closeSidebar() {
    this.sidebarService.close();
  }

  toggleCollapse(): void {
    if (window.innerWidth >= 993) {
      this.isCollapsed = !this.isCollapsed;
      localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
      window.dispatchEvent(new Event('resize'));
    }
  }

  ngAfterViewInit(): void {
    window.addEventListener('resize', () => this.updateSidebarState());

    this.searchSub = fromEvent(this.searchInputRef.nativeElement, 'input')
      .pipe(
        map((e: any) => e.target.value as string),
        map((v) => v.trim()),
        debounceTime(200),
        distinctUntilChanged(),
      )
      .subscribe((query) => {
        this.applyFilter(query);
      });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  private updateSidebarState(): void {
    this.isMobile = window.innerWidth <= 992;

    if (this.isMobile) {
      this.isSidebarOpen = false;
      this.isCollapsed = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  toggleSubmenu(sectionIndex: number, itemIndex: number): void {
    const section = this.filteredMenuItems[sectionIndex];
    if (!section?.items) return;

    const item = section.items[itemIndex];
    if (!item) return;

    item.isOpen = !item.isOpen;

    if (item.label) {
      localStorage.setItem(`submenu_${item.label}`, item.isOpen.toString());
    }
  }

  private applyFilter(query: string): void {
    if (!query) {
      this.filteredMenuItems = JSON.parse(JSON.stringify(this.menuItems));
      this.closeAllSubmenus(this.filteredMenuItems);
      return;
    }

    const q = query.toLowerCase();
    const result: any[] = [];

    for (const section of this.menuItems) {
      const clonedSection: any = { ...section };
      clonedSection.items = [];

      const titleMatches = section.title && section.title.toLowerCase().includes(q);

      if (titleMatches) {
        clonedSection.items = JSON.parse(JSON.stringify(section.items || []));
        if (clonedSection.items)
          clonedSection.items.forEach((it: any) => {
            if (it.submenu) it.isOpen = true;
          });
        result.push(clonedSection);
        continue;
      }

      if (section.items && section.items.length) {
        for (const item of section.items) {
          const itemLabel = (item.label || '').toLowerCase();
          let matchedItem: any = null;

          if (itemLabel.includes(q)) {
            matchedItem = JSON.parse(JSON.stringify(item));
            if (matchedItem.submenu) matchedItem.isOpen = true;
          } else if (item.submenu && item.submenu.length) {
            const matchingSub: any[] = [];
            for (const sub of item.submenu) {
              const subKey = (sub.key || '').toLowerCase();
              if (subKey.includes(q)) {
                matchingSub.push(JSON.parse(JSON.stringify(sub)));
              }
            }
            if (matchingSub.length) {
              matchedItem = {
                ...JSON.parse(JSON.stringify(item)),
                submenu: matchingSub,
                isOpen: true,
              };
            }
          }

          if (matchedItem) {
            clonedSection.items.push(matchedItem);
          }
        }

        if (clonedSection.items.length) {
          result.push(clonedSection);
        }
      }
    }

    this.filteredMenuItems = result;
  }

  private closeAllSubmenus(list: any[]): void {
    for (const section of list) {
      if (section.items && section.items.length) {
        for (const it of section.items) {
          if (it.submenu) it.isOpen = false;
        }
      }
    }
  }

  private updateMenuItems(): void {
    this.menuItems = [
      {
        items: [
          { label: 'الصفحة الرئيسية', path: 'dashboard/mainDashboard', icons: 'fas fa-house', isOpen: false },
        ],
      },
      {
        items: [
          { label: 'الاقسام الفرعية', path: 'categories/main-category', icons: 'fas fa-layer-group', isOpen: false },
        ],
      },
      {
        items: [
          { label: 'المحتوي الرأسي', path: 'categories/sub-category', icons: 'fas fa-th-large', isOpen: false },
        ],
      },
      {
        items: [
          { label: 'الاشعارات', path: 'Notificaion/notificaion', icons: 'fas fa-bell', isOpen: false },
        ],
      },
      {
        items: [
          { label: 'المستخدمين', path: 'app-users', icons: 'fas fa-users', isOpen: false },
        ],
      },
      {
        items: [
          { label: 'الطلاب', path: 'students', icons: 'fas fa-user-graduate', isOpen: false },
        ],
      },
      {
        items: [
          { label: 'الشروط والأحكام', path: 'terms', icons: 'fas fa-file-contract', isOpen: false },
        ],
      },
    ];
  }
}
