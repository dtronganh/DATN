import { Component, afterNextRender, signal, inject, computed, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { Navbar } from "@shared/components/navbar/navbar";
import Aos from 'aos';

import { RouterLink } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { Footer } from "@shared/components/footer/footer";
import { ProductApi } from '@core/api/product.api';
import { Product } from '@core/models/product.model';
import { ProductCard } from "@shared/components/product/product-card/product-card";
import { CartStore } from '@core/cart/cart.store';
import { ToastService } from '@core/services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from '@shared/components/button/button';

interface ServicesData{
  icon: string;
  titleKey: string;
  productKey: string;
  descKey: string;
}

interface HeroSlide {
  image: string;
}

interface PromoBlock {
  image: string;
  titleKey: string;
  titleParams: { percent: string };
  subtitleKey: string;
}

interface StatItem {
  value: string;
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-index',
  imports: [
    RouterLink,
    NgClass,
    Navbar,
    CarouselModule,
    Footer,
    ProductCard,
    TranslateModule,
    Button
],
  templateUrl: './index.html',
  styleUrl: './index.css'
})
export class Index {
  private readonly productApi = inject(ProductApi);
  private readonly cartStore = inject(CartStore);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly servicesData = signal<ServicesData[]>([
    {
      icon: 'mdi-truck-fast',
      titleKey: 'home.services.fastShipping.title',
      productKey: 'home.services.fastShipping.product',
      descKey: 'home.services.fastShipping.desc'
    },
    {
      icon: 'mdi-shield-half-full',
      titleKey: 'home.services.easyReturns.title',
      productKey: 'home.services.easyReturns.product',
      descKey: 'home.services.easyReturns.desc'
    },
    {
      icon: 'mdi-shield-check',
      titleKey: 'home.services.securePayment.title',
      productKey: 'home.services.securePayment.product',
      descKey: 'home.services.securePayment.desc'
    },
    {
      icon: 'mdi-headset',
      titleKey: 'home.services.support.title',
      productKey: 'home.services.support.product',
      descKey: 'home.services.support.desc'
    }
  ]);

  readonly heroSlides = signal<HeroSlide[]>([
    { image: 'assets/img/carousel/carousel-01.jpg' },
    { image: 'assets/img/carousel/carousel-02.jpg' },
    { image: 'assets/img/carousel/carousel-03.jpg' },
    { image: 'assets/img/carousel/carousel-04.jpg' },
    { image: 'assets/img/carousel/carousel-05.jpg' },
    { image: 'assets/img/carousel/carousel-06.jpg' },
    { image: 'assets/img/carousel/carousel-07.jpg' },
    { image: 'assets/img/carousel/carousel-08.jpg' }
  ]);

  readonly promoBlocks = signal<PromoBlock[]>([
    {
      image: 'assets/img/pdct/pdct-01.jpg',
      titleKey: 'home.promo.dresses',
      titleParams: { percent: '20%' },
      subtitleKey: 'home.promo.summer'
    },
    {
      image: 'assets/img/pdct/pdct-02.jpg',
      titleKey: 'home.promo.accessories',
      titleParams: { percent: '35%' },
      subtitleKey: 'home.promo.trending'
    }
  ]);

  readonly statsData = signal<StatItem[]>([
    {
      value: '10K+',
      titleKey: 'home.stats.customers.title',
      descKey: 'home.stats.customers.desc'
    },
    {
      value: '5K+',
      titleKey: 'home.stats.products.title',
      descKey: 'home.stats.products.desc'
    },
    {
      value: '50+',
      titleKey: 'home.stats.countries.title',
      descKey: 'home.stats.countries.desc'
    },
    {
      value: '99%',
      titleKey: 'home.stats.satisfaction.title',
      descKey: 'home.stats.satisfaction.desc'
    }
  ]);

  private readonly productsResource = rxResource({
    stream: () => this.productApi.getAll({ limit: 8 })
  });

  readonly productList = computed(() => this.productsResource.value()?.data?.data ?? []);
  readonly loading = this.productsResource.isLoading;

  private readonly afterRender = afterNextRender(() => {
    window.dispatchEvent(new Event('resize'));
    Aos.init();
  });

  readonly isSliding = signal(false);
  private slideDebounce: ReturnType<typeof setTimeout> | null = null;

  readonly customOptions = {
    loop: false,
    rewind: true,
    margin: 0,
    nav: false,
    items: 1,
    dots: true,
    autoplay: true,
    autoplayTimeout: 10000,
    autoplaySpeed: 600,
    autoplayHoverPause: false,
    smartSpeed: 600,
    dragEndSpeed: 600,
    responsive: {
      0: { items: 1 }
    }
  };

  onSlideChange(): void {
    if (this.slideDebounce) clearTimeout(this.slideDebounce);
    this.isSliding.set(true);
  }

  onDragging(event: any): void {
    if (event.dragging) {
      if (this.slideDebounce) clearTimeout(this.slideDebounce);
      this.isSliding.set(true);
    }
  }

  onTranslated(): void {
    if (this.slideDebounce) clearTimeout(this.slideDebounce);
    this.slideDebounce = setTimeout(() => {
      this.isSliding.set(false);
      this.cdr.markForCheck();
    }, 100);
  }

  handleAddToCart(product: Product): void {
    this.cartStore.addToCart(product.id, 1);
  }

}
