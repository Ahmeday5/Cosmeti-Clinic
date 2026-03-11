import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number; // ms
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toasts.asObservable();

  private counter = 0;

  success(message: string, duration = 5000): void {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration = 6000): void {
    this.show({ type: 'error', message, duration });
  }

  info(message: string, duration = 5000): void {
    this.show({ type: 'info', message, duration });
  }

  warning(message: string, duration = 6000): void {
    this.show({ type: 'warning', message, duration });
  }

  // لتأكيد الحذف (يمكن توسيعه لاحقًا ليرجع Promise<boolean>)
  async confirm(message: string = 'هل أنت متأكد؟'): Promise<boolean> {
    return new Promise((resolve) => {
      const id = this.counter++;
      this.toasts.next([
        ...this.toasts.value,
        {
          id,
          type: 'warning',
          message: `${message} <br><button class="btn btn-sm btn-danger me-2" data-id="${id}">نعم</button><button class="btn btn-sm btn-secondary" data-id="${id}">لا</button>`,
          duration: 0 // ما يختفيش تلقائي
        }
      ]);

      // هنا بننتظر click على الأزرار (هنحتاج directive أو host listener في الـ toast component)
      // للتبسيط حاليًا، بنستخدم confirm الأصلي
      resolve(window.confirm(message));
    });
  }

  remove(id: number): void {
    this.toasts.next(this.toasts.value.filter(t => t.id !== id));
  }

  private show(toast: Omit<Toast, 'id'>): void {
    const id = this.counter++;
    this.toasts.next([...this.toasts.value, { ...toast, id }]);

    if (toast.duration) {
      setTimeout(() => this.remove(id), toast.duration);
    }
  }
}
