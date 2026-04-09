import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastIdCounter = 0;
  private toasts = signal<Toast[]>([]);

  readonly toasts$ = this.toasts.asReadonly();
  show(type: ToastType, message: string, duration: number = 5000): void {
    if (this.toasts().some(toast => toast.message === message)) {
      return;
    }

    const toast: Toast = {
      id: ++this.toastIdCounter,
      type,
      message,
      duration: duration > 0 ? duration : 5000
    };

    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, duration);
    }
  }

  success(message: string, duration: number = 5000): void {
    this.show('success', message, duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show('error', message, duration);
  }

  warning(message: string, duration: number = 5000): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration: number = 5000): void {
    this.show('info', message, duration);
  }

  dismiss(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clearAll(): void {
    this.toasts.set([]);
  }
}
