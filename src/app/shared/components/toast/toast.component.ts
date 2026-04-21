import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  toasts: Toast[] = [];

  ngOnInit(): void {
    this.toastService.toasts$.subscribe((t) => (this.toasts = t));
  }

  get notifications(): Toast[] {
    return this.toasts.filter((t) => t.type !== 'confirm');
  }

  get confirms(): Toast[] {
    return this.toasts.filter((t) => t.type === 'confirm');
  }

  remove(id: number): void {
    this.toastService.remove(id);
  }

  trackById(_: number, t: Toast): number {
    return t.id;
  }

  iconClass(type: string): string {
    const map: Record<string, string> = {
      success: 'fas fa-check',
      error: 'fas fa-times',
      warning: 'fas fa-exclamation',
      info: 'fas fa-info',
    };
    return map[type] ?? 'fas fa-bell';
  }

  toastTitle(type: string): string {
    const map: Record<string, string> = {
      success: 'تمت العملية بنجاح',
      error: 'حدث خطأ',
      warning: 'تحذير',
      info: 'معلومة',
    };
    return map[type] ?? '';
  }
}
