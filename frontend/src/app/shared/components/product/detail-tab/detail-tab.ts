import { Component, signal, input, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { marked } from 'marked';
import { preprocessProductDescriptionMarkdown } from '@shared/utils';

interface Review {
  nameKey: string;
  descKey: string;
}

interface ShippingInfo {
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-detail-tab',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './detail-tab.html',
  styleUrl: './detail-tab.css'
})
export class DetailTab {
  private readonly sanitizer = inject(DomSanitizer);
  readonly description = input<string>('');
  readonly activeTab = signal(1);

  readonly descriptionHtml = computed(() => {
    const md = this.description();
    if (!md) return null;
    const processed = preprocessProductDescriptionMarkdown(md);
    const html = marked.parse(processed) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly detailReviewList = signal<Review[]>([
    {
      nameKey: 'product.reviews.1.name',
      descKey: 'product.reviews.1.desc'
    },
    {
      nameKey: 'product.reviews.2.name',
      descKey: 'product.reviews.2.desc'
    },
    {
      nameKey: 'product.reviews.3.name',
      descKey: 'product.reviews.3.desc'
    }
  ]);

  readonly shippingAboutList = signal<ShippingInfo[]>([
    {
      titleKey: 'product.shipping.1.title',
      descKey: 'product.shipping.1.desc'
    },
    {
      titleKey: 'product.shipping.2.title',
      descKey: 'product.shipping.2.desc'
    },
    {
      titleKey: 'product.shipping.3.title',
      descKey: 'product.shipping.3.desc'
    },
    {
      titleKey: 'product.shipping.4.title',
      descKey: 'product.shipping.4.desc'
    }
  ]);

  setActiveTab(tab: number) {
    this.activeTab.set(tab);
  }
}
