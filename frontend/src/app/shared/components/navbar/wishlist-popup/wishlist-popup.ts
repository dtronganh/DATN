import { ChangeDetectionStrategy, Component, input, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClickOutsideDirective } from 'ng-click-outside2';

import { WishlistStore } from '@core/wishlist/wishlist.store';
import { formatVND } from '@shared/utils';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-wishlist-popup',
  standalone: true,
  imports: [RouterLink, NgClickOutsideDirective, TranslateModule],
  templateUrl: './wishlist-popup.html',
  styleUrl: './wishlist-popup.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistPopup {
  readonly categoryMap = input.required<Map<number, string>>();

  readonly wishlistStore = inject(WishlistStore);
  private readonly translate = inject(TranslateService);
  readonly formatVND = formatVND;

  readonly open = signal(false);

  toggleOpen(): void {
    this.open.update(v => !v);
  }

  onClickedOutside(_: Event): void {
    this.open.set(false);
  }

  getCategoryName(categoryId: number | undefined): string {
    if (!categoryId) return this.translate.instant('nav.uncategorized');
    return this.categoryMap().get(categoryId) ?? this.translate.instant('nav.uncategorized');
  }
}
