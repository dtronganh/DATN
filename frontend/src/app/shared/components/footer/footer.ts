import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from '@shared/components/button/button';

interface FooterLink {
  name: string;
  link: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  url: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule, Button],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  readonly currentYear = computed(() => new Date().getFullYear());

  readonly socialLinks = signal<SocialLink[]>([
    { url: '#', icon: 'fa-facebook-f', label: 'Facebook' },
    { url: '#', icon: 'fa-twitter', label: 'Twitter' },
    { url: '#', icon: 'fa-instagram', label: 'Instagram' },
    { url: '#', icon: 'fa-linkedin-in', label: 'Linkedin' }
  ]);

  readonly footerSections = signal<FooterSection[]>([
    {
      title: 'footer.sitemap',
      links: [
        { name: 'nav.home', link: '/' },
        { name: 'nav.shop', link: '/shop' },
        { name: 'footer.categories', link: '/shop' },
        { name: 'nav.blog', link: '/blog' },
        { name: 'nav.contact', link: '/contact' }
      ]
    },
    {
      title: 'footer.others',
      links: [
        { name: 'footer.aboutUs', link: '/about' },
        { name: 'nav.blog', link: '/blog' },
        { name: 'nav.contact', link: '/contact' }
      ]
    },
    {
      title: 'nav.shop',
      links: [
        { name: 'footer.allProducts', link: '/shop' },
        { name: 'footer.categories', link: '/shop' },
        { name: 'cart.viewCart', link: '/cart' },
        { name: 'cart.checkout', link: '/checkout' }
      ]
    },
    {
      title: 'footer.customerService',
      links: [
        { name: 'profile.myProfile', link: '/my-profile' },
        { name: 'profile.editProfile', link: '/edit-profile' },
        { name: 'profile.orderHistory', link: '/order-history' },
        { name: 'wishlist.title', link: '/wishlist' }
      ]
    }
  ]);
}
