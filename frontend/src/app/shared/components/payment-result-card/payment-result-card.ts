import { Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export interface PaymentDetail {
  labelKey: string;
  value: string;
  valueClass?: string;
  show?: boolean;
}

@Component({
  selector: 'app-payment-result-card',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './payment-result-card.html',
  styleUrl: './payment-result-card.css'
})
export class PaymentResultCardComponent {
  titleKey = input.required<string>();
  messageKey = input<string | null>(null);
  message = input<string | null>(null);
  subMessageKey = input<string | null>(null);
  iconPath = input.required<string>();
  iconBgClass = input<string>('bg-green-500');
  details = input<PaymentDetail[]>([]);
  detailsClass = input<string>('bg-white dark:bg-title p-6 rounded-lg mb-8 space-y-4');
  actionsClass = input<string>('flex flex-col sm:flex-row gap-4 justify-center');

  readonly defaultValueClass = 'font-semibold text-title dark:text-white';

  readonly iconWrapperClass = computed(() =>
    `w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${this.iconBgClass()}`
  );

  readonly visibleDetails = computed(() =>
    this.details().filter(detail => detail.show !== false && detail.value !== '')
  );
}
