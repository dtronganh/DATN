import { Component, inject, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '@core/services/toast.service';

interface ToastConfig {
  icon: string;
  borderColor: string;
  iconColor: string;
  progressColor: string;
}

@Component({
  selector: 'app-toast',
  imports: [TranslateModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  
  protected readonly toasts = this.toastService.toasts$;

  protected readonly toastConfig: Record<string, ToastConfig> = {
    success: {
      icon: 'lnr-checkmark-circle',
      borderColor: 'border-green-500',
      iconColor: 'text-green-500',
      progressColor: 'bg-green-500'
    },
    error: {
      icon: 'lnr-cross-circle',
      borderColor: 'border-red-500',
      iconColor: 'text-red-500',
      progressColor: 'bg-red-500'
    },
    warning: {
      icon: 'lnr-warning',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-500',
      progressColor: 'bg-yellow-500'
    },
    info: {
      icon: 'lnr-information',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-500',
      progressColor: 'bg-blue-500'
    }
  };

  protected getConfig(type: string): ToastConfig {
    return this.toastConfig[type] ?? this.toastConfig['info'];
  }

  protected onDismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
