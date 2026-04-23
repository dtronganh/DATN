
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
  readonly showLangToggle = input<boolean>(true);
  readonly defaultLang = input<'en' | 'vi'>('vi');
  readonly currentLang = signal(this.localeService.currentLang());

  ngOnInit() {
    const defaultTheme = 'light';
    this.document.documentElement.classList.remove('dark', 'light');
    this.document.documentElement.classList.add(defaultTheme);

    const defaultLang: 'vi' = 'vi';
    this.localeService.use(defaultLang).subscribe({
      next: () => this.currentLang.set(defaultLang)
    });
  }

  changeMode() {
    if (this.document.documentElement.classList.contains("dark")) {
      this.document.documentElement.classList.remove('dark');
      this.document.documentElement.classList.add('light');
    } else {
      this.document.documentElement.classList.remove('light');
      this.document.documentElement.classList.add('dark');
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
