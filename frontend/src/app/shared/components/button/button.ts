import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  readonly text     = input('');
  readonly disabled = input(false);
  readonly width    = input<string | undefined>(undefined);
  readonly height   = input<string | undefined>(undefined);
  readonly color    = input<'btn-outline' | 'btn-secondary-solid' | 'btn-theme-outline' | 'btn-solid' | 'btn-theme-solid'>('btn-secondary-solid');
  readonly padding  = input('mt-4 md:mt-6');
  readonly size     = input<'btn-xs' | 'btn-sm' | ''>('');
  readonly routerLink  = input<string | undefined>(undefined);
  readonly queryParams = input<Record<string, any> | undefined>(undefined);
  
  readonly icon = input<string | undefined>(undefined);
  readonly clicked = output<void>();

  
  readonly variantClass = computed(() => {
    const map: Record<string, string> = {
      'btn-outline':        'v-outline',
      'btn-secondary-solid':'v-solid',
      'btn-solid':          'v-solid',
      'btn-theme-solid':    'v-solid',
      'btn-theme-outline':  'v-theme-outline',
    };
    return map[this.color()] ?? 'v-solid';
  });

  
  readonly hostClass = computed(() =>
    ['btn-anim', this.variantClass(), this.size(), this.padding()]
      .filter(Boolean)
      .join(' ')
  );

  onClick(): void {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }
}
