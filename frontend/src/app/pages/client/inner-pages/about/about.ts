import { Component, signal } from '@angular/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import { Footer } from "@shared/components/footer/footer";
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import Aos from 'aos';

@Component({
  selector: 'app-about',
  imports: [
    Navbar,
    Breadcrumb,
    Footer,
    TranslateModule,
    RouterLink
  ],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  ngOnInit(): void {
    Aos.init();
  }

  readonly quickStats = signal([
    { id: 1, value: '10K+', labelKey: 'about.stats.customers' },
    { id: 2, value: '500+', labelKey: 'about.stats.products' },
    { id: 3, value: '4.9★', labelKey: 'about.stats.rating' }
  ]);

  readonly stats = signal([
    { id: 1, value: '10,000+', labelKey: 'about.stats.customers' },
    { id: 2, value: '500+',    labelKey: 'about.stats.products' },
    { id: 3, value: '10+',     labelKey: 'about.stats.years' },
    { id: 4, value: '24/7',    labelKey: 'about.stats.support' }
  ]);

  readonly feature = signal([
    {
      id: 1,
      icon: 'mdi-check-decagram',
      titleKey: 'about.features.1.title',
      descKey: 'about.features.1.desc'
    },
    {
      id: 2,
      icon: 'mdi-headset',
      titleKey: 'about.features.2.title',
      descKey: 'about.features.2.desc'
    },
    {
      id: 3,
      icon: 'mdi-shield-check',
      titleKey: 'about.features.3.title',
      descKey: 'about.features.3.desc'
    },
    {
      id: 4,
      icon: 'mdi-tag-multiple',
      titleKey: 'about.features.4.title',
      descKey: 'about.features.4.desc'
    },
    {
      id: 5,
      icon: 'mdi-truck-fast',
      titleKey: 'about.features.5.title',
      descKey: 'about.features.5.desc'
    },
    {
      id: 6,
      icon: 'mdi-star-circle',
      titleKey: 'about.features.6.title',
      descKey: 'about.features.6.desc'
    }
  ]);

  readonly offers = signal([
    {
      id: 1,
      icon: 'mdi-laptop',
      titleKey: 'about.offer.items.1.title',
      descKey: 'about.offer.items.1.desc'
    },
    {
      id: 2,
      icon: 'mdi-cpu-64-bit',
      titleKey: 'about.offer.items.2.title',
      descKey: 'about.offer.items.2.desc'
    },
    {
      id: 3,
      icon: 'mdi-controller-classic',
      titleKey: 'about.offer.items.3.title',
      descKey: 'about.offer.items.3.desc'
    },
    {
      id: 4,
      icon: 'mdi-usb',
      titleKey: 'about.offer.items.4.title',
      descKey: 'about.offer.items.4.desc'
    }
  ]);
}

