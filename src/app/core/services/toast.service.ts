import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this._toasts.asObservable();

  private counter = 0;

  success(message: string, duration = 4000): void {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration = 6000): void {
    this.show({ type: 'error', message, duration });
  }

  info(message: string, duration = 4500): void {
    this.show({ type: 'info', message, duration });
  }

  warning(message: string, duration = 5000): void {
    this.show({ type: 'warning', message, duration });
  }

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const id = this.counter++;
      const toast: Toast = {
        id,
        type: 'confirm',
        message,
        duration: 0,
        onConfirm: () => {
          this.remove(id);
          resolve(true);
        },
        onCancel: () => {
          this.remove(id);
          resolve(false);
        },
      };
      this._toasts.next([...this._toasts.value, toast]);
    });
  }

  remove(id: number): void {
    this._toasts.next(this._toasts.value.filter((t) => t.id !== id));
  }

  private show(toast: Omit<Toast, 'id'>): void {
    const id = this.counter++;
    this._toasts.next([...this._toasts.value, { ...toast, id }]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.remove(id), toast.duration);
    }
  }
}
