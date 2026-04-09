import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

const LANG_STORAGE_KEY = 'lang';

@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  private readonly supportedLangs = ['en', 'vi'];
  private readonly defaultLang = 'en';

  constructor(private readonly translate: TranslateService) {}

  async init(): Promise<void> {
    const storedLang = localStorage.getItem(LANG_STORAGE_KEY) ?? undefined;
    const browserLang = this.translate.getBrowserLang() ?? undefined;
    const lang = this.normalizeLang(storedLang ?? browserLang ?? this.defaultLang);

    this.translate.setFallbackLang(this.defaultLang);
    await firstValueFrom(this.translate.use(lang));
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }

  use(lang: string) {
    const normalized = this.normalizeLang(lang);
    localStorage.setItem(LANG_STORAGE_KEY, normalized);
    return this.translate.use(normalized);
  }

  currentLang(): string {
    return this.translate.getCurrentLang() || this.defaultLang;
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  private normalizeLang(lang: string): string {
    return this.supportedLangs.includes(lang) ? lang : this.defaultLang;
  }
}
