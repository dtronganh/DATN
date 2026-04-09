import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

const DEFAULT_STATE: ConfirmState = {
  open: false,
  title: 'Confirm',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel'
};

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private readonly state = signal<ConfirmState>({ ...DEFAULT_STATE });
  readonly state$ = this.state.asReadonly();

  private resolver?: (value: boolean) => void;

  confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
    if (this.resolver) {
      this.resolver(false);
      this.resolver = undefined;
    }

    this.state.set({
      open: true,
      title: options?.title ?? DEFAULT_STATE.title,
      message,
      confirmText: options?.confirmText ?? DEFAULT_STATE.confirmText,
      cancelText: options?.cancelText ?? DEFAULT_STATE.cancelText
    });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  resolve(result: boolean): void {
    if (this.resolver) {
      this.resolver(result);
      this.resolver = undefined;
    }
    this.state.set({ ...DEFAULT_STATE });
  }
}
