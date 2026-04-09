
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LocaleService } from '@core/services/locale.service';

@Component({
  selector: 'app-switcher',
  standalone: true,
  imports: [],
  templateUrl: './switcher.html',
  styleUrl: './switcher.css'
})
export class Switcher implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly localeService = inject(LocaleService);
  private readonly THEME_KEY = 'theme';
  readonly showLangToggle = input<boolean>(true);
  readonly defaultLang = input<'en' | 'vi'>('en');
  readonly currentLang = signal(this.localeService.currentLang());

  ngOnInit() {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.document.documentElement.classList.remove('dark', 'light');
      this.document.documentElement.classList.add(savedTheme);
    } else {
      const defaultTheme = 'light';
      this.document.documentElement.classList.add(defaultTheme);
      localStorage.setItem(this.THEME_KEY, defaultTheme);
    }

    const storedLang = localStorage.getItem('lang');
    if (!storedLang) {
      const lang = this.defaultLang();
      this.localeService.use(lang).subscribe({
        next: () => this.currentLang.set(lang)
      });
    } else {
      this.currentLang.set(this.localeService.currentLang());
    }
  }

  changeMode() {
    if (this.document.documentElement.classList.contains("dark")) {
      this.document.documentElement.classList.remove('dark');
      this.document.documentElement.classList.add('light');
      localStorage.setItem(this.THEME_KEY, 'light');
    } else {
      this.document.documentElement.classList.remove('light');
      this.document.documentElement.classList.add('dark');
      localStorage.setItem(this.THEME_KEY, 'dark');
    }
  }

  toggleLang(): void {
    const next = this.currentLang() === 'vi' ? 'en' : 'vi';
    this.localeService.use(next).subscribe({
      next: () => this.currentLang.set(next)
    });
  }

  setLang(lang: 'en' | 'vi'): void {
    if (this.currentLang() === lang) return;
    this.localeService.use(lang).subscribe({
      next: () => this.currentLang.set(lang)
    });
  }
}
