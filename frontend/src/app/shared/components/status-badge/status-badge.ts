import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './status-badge.html'
})
export class StatusBadgeComponent {
  status = input.required<OrderStatus | string>();

  normalizedStatus(): string {
    return (this.status() ?? '').toUpperCase();
  }

  getStatusColor(): string {
    const status = this.normalizedStatus();
    
    switch (status) {
      case 'PENDING':
        return 'bg-[#EC991D]';
      case 'PAID':
        return 'bg-[#60A5FA]';
      case 'PROCESSING':
        return 'bg-[#3B82F6]';
      case 'SHIPPED':
        return 'bg-[#8B5CF6]';
      case 'COMPLETED':
        return 'bg-[#31A051]';
      case 'FAILED':
        return 'bg-[#E13939]';
      case 'CANCELLED':
        return 'bg-[#E13939]';
      default:
        return 'bg-gray-500';
    }
  }
}
