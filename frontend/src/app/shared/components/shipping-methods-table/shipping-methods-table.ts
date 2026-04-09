import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface ShippingOption {
  labelKey: string;
  timeKey?: string;
  timeParams?: Record<string, any>;
  cost: string;
  costKey?: string;
}

@Component({
  selector: 'app-shipping-methods-table',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './shipping-methods-table.html',
  styleUrl: './shipping-methods-table.css'
})
export class ShippingMethodsTableComponent {
  methods = signal<ShippingOption[]>([
    {
      labelKey: 'shop.shipping.standard',
      timeKey: 'shop.shipping.days',
      timeParams: { count: 2 },
      cost: '$5'
    },
    {
      labelKey: 'shop.shipping.quick',
      timeKey: 'shop.shipping.days',
      timeParams: { count: 1 },
      cost: '$7.5'
    },
    {
      labelKey: 'shop.shipping.regular',
      timeKey: 'shop.shipping.days',
      timeParams: { count: 3 },
      cost: 'shop.shipping.free'
    },
    {
      labelKey: 'shop.shipping.superFast',
      timeKey: 'shop.shipping.hours',
      timeParams: { count: 12 },
      cost: '$10'
    }
  ]);

  headingKey = input('shop.shipping.deliveryOption');
}
