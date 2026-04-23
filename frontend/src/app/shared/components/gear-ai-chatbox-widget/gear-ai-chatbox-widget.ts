import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';

import { GearChatboxApi } from '@core/api/gear-chatbox.api';
import { ProductApi } from '@core/api/product.api';
import {
  GearChatboxHistoryItem,
  GearChatboxSuggestion,
} from '@core/models/gear-chatbox.model';
import { Product } from '@core/models/product.model';

type GearChatboxRole = 'user' | 'assistant';

type GearChatboxTexts = {
  title: string;
  subtitle: string;
  welcome: string;
  emptyAnswer: string;
  error: string;
  processing: string;
  inputPlaceholder: string;
  send: string;
  openLabel: string;
  closeLabel: string;
  inStock: string;
};

type GearChatboxMessage = {
  role: GearChatboxRole;
  content: string;
  suggestions?: GearChatboxSuggestion[];
};

type GearChatboxPersistedState = {
  v: number;
  locale: string;
  open: boolean;
  inputDraft: string;
  updatedAt: number;
  messages: GearChatboxMessage[];
};

const GEAR_CHATBOX_STATE_KEY = 'gear_chatbox_state_v2';
const GEAR_CHATBOX_LEGACY_MESSAGES_KEY = 'gear_chatbox_messages_v1';
const GEAR_CHATBOX_STATE_VERSION = 2;
const GEAR_CHATBOX_SESSION_TTL = 24 * 60 * 60 * 1000;
const GEAR_CHATBOX_HISTORY_LIMIT = 8;
const GEAR_CHATBOX_SUGGESTION_LIMIT = 5;

@Component({
  selector: 'app-gear-ai-chatbox-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './gear-ai-chatbox-widget.html',
  styleUrl: './gear-ai-chatbox-widget.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GearAiChatboxWidget {
  private readonly gearChatboxApi = inject(GearChatboxApi);
  private readonly productApi = inject(ProductApi);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  readonly gearChatboxOpen = signal(false);
  readonly gearChatboxInput = signal('');
  readonly gearChatboxLoading = signal(false);
  readonly gearChatboxBlockedByRoute = signal(false);
  readonly gearChatboxTexts = signal<GearChatboxTexts>({
    title: '',
    subtitle: '',
    welcome: '',
    emptyAnswer: '',
    error: '',
    processing: '',
    inputPlaceholder: '',
    send: '',
    openLabel: '',
    closeLabel: '',
    inStock: '',
  });
  readonly gearChatboxMessages = signal<GearChatboxMessage[]>([]);

  readonly gearChatboxVisible = computed(() => !this.gearChatboxBlockedByRoute());

  readonly gearChatboxCanSend = computed(() => {
    return this.gearChatboxInput().trim().length > 1 && !this.gearChatboxLoading();
  });

  constructor() {
    this.hydrateGearChatboxTexts();
    this.hydrateGearChatboxState();
    this.bindRouteChanges();

    this.translate.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.hydrateGearChatboxTexts();
        this.persistGearChatboxState();
      });
  }

  toggleGearChatbox(): void {
    this.gearChatboxOpen.update((open) => !open);
    this.persistGearChatboxState();
  }

  closeGearChatbox(): void {
    this.gearChatboxOpen.set(false);
    this.persistGearChatboxState();
  }

  onGearChatboxInputChange(value: string): void {
    this.gearChatboxInput.set(value);
    this.persistGearChatboxState();
  }

  submitGearChatbox(): void {
    const question = this.gearChatboxInput().trim();
    if (!question || this.gearChatboxLoading()) {
      return;
    }

    const currentMessages = this.gearChatboxMessages();
    const userMessage: GearChatboxMessage = {
      role: 'user',
      content: question,
    };

    this.gearChatboxInput.set('');
    this.gearChatboxLoading.set(true);

    const userUpdated = [...currentMessages, userMessage];
    this.persistGearChatboxState(userUpdated);

    const history = this.buildGearConversationHistory(userUpdated);

    this.gearChatboxApi
      .ask({
        message: question,
        locale: this.currentGearLocale(),
        history,
      })
      .pipe(
        take(1),
        switchMap((response) => {
          const fallback = this.gearChatboxTexts().emptyAnswer;
          const answer = response.data?.answer || fallback;
          const primarySuggestions = response.data?.suggestions ?? [];

          return this.resolveGearSmartSuggestions(question, primarySuggestions).pipe(
            map((suggestions) => ({ answer, suggestions })),
          );
        }),
        catchError(() =>
          of({
            answer: this.gearChatboxTexts().error,
            suggestions: [] as GearChatboxSuggestion[],
          }),
        ),
      )
      .subscribe({
        next: ({ answer, suggestions }) => {
          const assistantMessage: GearChatboxMessage = {
            role: 'assistant',
            content: answer,
            suggestions,
          };

          this.persistGearChatboxState([...userUpdated, assistantMessage]);
          this.gearChatboxLoading.set(false);
        },
      });
  }

  formatGearChatboxPrice(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  formatGearChatboxStock(stock: number): string {
    return this.gearChatboxTexts().inStock.replace('{{count}}', `${stock}`).trim();
  }

  private bindRouteChanges(): void {
    this.syncGearChatboxRouteVisibility(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.syncGearChatboxRouteVisibility(event.urlAfterRedirects);
      });
  }

  private syncGearChatboxRouteVisibility(url: string): void {
    const shouldHide = url.startsWith('/auth') || url.startsWith('/invoice');
    this.gearChatboxBlockedByRoute.set(shouldHide);

    if (shouldHide) {
      this.gearChatboxOpen.set(false);
      this.persistGearChatboxState();
    }
  }

  private hydrateGearChatboxTexts(): void {
    const translations = this.translate.instant([
      'gearChatbox.title',
      'gearChatbox.subtitle',
      'gearChatbox.welcome',
      'gearChatbox.emptyAnswer',
      'gearChatbox.error',
      'gearChatbox.processing',
      'gearChatbox.inputPlaceholder',
      'gearChatbox.send',
      'gearChatbox.openLabel',
      'gearChatbox.closeLabel',
      'gearChatbox.inStock',
    ]);

    this.gearChatboxTexts.set({
      title: translations['gearChatbox.title'] ?? '',
      subtitle: translations['gearChatbox.subtitle'] ?? '',
      welcome: translations['gearChatbox.welcome'] ?? '',
      emptyAnswer: translations['gearChatbox.emptyAnswer'] ?? '',
      error: translations['gearChatbox.error'] ?? '',
      processing: translations['gearChatbox.processing'] ?? '',
      inputPlaceholder: translations['gearChatbox.inputPlaceholder'] ?? '',
      send: translations['gearChatbox.send'] ?? '',
      openLabel: translations['gearChatbox.openLabel'] ?? '',
      closeLabel: translations['gearChatbox.closeLabel'] ?? '',
      inStock: translations['gearChatbox.inStock'] ?? '',
    });

    this.replaceLegacyGearWelcomeToken();
  }

  private hydrateGearChatboxState(): void {
    const persistedState = this.readGearPersistedState();

    if (!persistedState) {
      this.gearChatboxOpen.set(false);
      this.gearChatboxInput.set('');
      this.resetGearChatboxWithWelcome();
      return;
    }

    this.gearChatboxOpen.set(Boolean(persistedState.open));
    this.gearChatboxInput.set(persistedState.inputDraft || '');
    this.gearChatboxMessages.set(persistedState.messages);
    this.replaceLegacyGearWelcomeToken();

    if (this.gearChatboxMessages().length === 0) {
      this.resetGearChatboxWithWelcome();
      return;
    }

    this.persistGearChatboxState();
  }

  private readGearPersistedState(): GearChatboxPersistedState | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const rawState = window.sessionStorage.getItem(GEAR_CHATBOX_STATE_KEY);
      if (rawState) {
        const parsed = JSON.parse(rawState) as Partial<GearChatboxPersistedState>;
        const normalized = this.normalizeGearPersistedState(parsed);

        if (!normalized) {
          return null;
        }

        const isExpired = Date.now() - normalized.updatedAt > GEAR_CHATBOX_SESSION_TTL;
        if (isExpired) {
          return null;
        }

        return normalized;
      }

      const rawLegacyMessages = window.sessionStorage.getItem(
        GEAR_CHATBOX_LEGACY_MESSAGES_KEY,
      );
      if (!rawLegacyMessages) {
        return null;
      }

      const parsedLegacyMessages = JSON.parse(rawLegacyMessages) as unknown;
      const normalizedLegacyMessages = this.normalizeGearMessages(parsedLegacyMessages);

      return {
        v: GEAR_CHATBOX_STATE_VERSION,
        locale: this.currentGearLocale(),
        open: false,
        inputDraft: '',
        updatedAt: Date.now(),
        messages: normalizedLegacyMessages,
      };
    } catch {
      return null;
    }
  }

  private normalizeGearPersistedState(
    state: Partial<GearChatboxPersistedState>,
  ): GearChatboxPersistedState | null {
    if (state.v !== GEAR_CHATBOX_STATE_VERSION) {
      return null;
    }

    if (typeof state.updatedAt !== 'number' || !Number.isFinite(state.updatedAt)) {
      return null;
    }

    return {
      v: GEAR_CHATBOX_STATE_VERSION,
      locale:
        typeof state.locale === 'string' && state.locale.trim().length > 0
          ? state.locale
          : this.currentGearLocale(),
      open: Boolean(state.open),
      inputDraft: typeof state.inputDraft === 'string' ? state.inputDraft : '',
      updatedAt: state.updatedAt,
      messages: this.normalizeGearMessages(state.messages),
    };
  }

  private normalizeGearMessages(raw: unknown): GearChatboxMessage[] {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((item): GearChatboxMessage | null => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const candidate = item as Partial<GearChatboxMessage>;
        if (candidate.role !== 'user' && candidate.role !== 'assistant') {
          return null;
        }

        if (typeof candidate.content !== 'string' || candidate.content.trim().length === 0) {
          return null;
        }

        const normalizedSuggestions = Array.isArray(candidate.suggestions)
          ? candidate.suggestions
              .map((suggestion) => this.normalizeGearSuggestion(suggestion))
              .filter((suggestion): suggestion is GearChatboxSuggestion => Boolean(suggestion))
          : undefined;

        const normalizedMessage: GearChatboxMessage = {
          role: candidate.role,
          content: candidate.content,
        };

        if (normalizedSuggestions && normalizedSuggestions.length > 0) {
          normalizedMessage.suggestions = normalizedSuggestions;
        }

        return normalizedMessage;
      })
      .filter((message): message is GearChatboxMessage => Boolean(message));
  }

  private normalizeGearSuggestion(raw: unknown): GearChatboxSuggestion | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const candidate = raw as Partial<GearChatboxSuggestion>;
    if (typeof candidate.id !== 'number' || !Number.isFinite(candidate.id)) {
      return null;
    }

    if (typeof candidate.name !== 'string' || candidate.name.trim().length === 0) {
      return null;
    }

    const slug =
      typeof candidate.slug === 'string' && candidate.slug.trim().length > 0
        ? candidate.slug
        : `${candidate.id}`;

    return {
      id: candidate.id,
      name: candidate.name,
      slug,
      price: Number(candidate.price ?? 0),
      stock: Number(candidate.stock ?? 0),
      thumbnail:
        typeof candidate.thumbnail === 'string' && candidate.thumbnail.trim().length > 0
          ? candidate.thumbnail
          : null,
    };
  }

  private replaceLegacyGearWelcomeToken(): void {
    const welcomeText = this.gearChatboxTexts().welcome;
    if (!welcomeText) {
      return;
    }

    const normalized = this.gearChatboxMessages().map((message) => {
      if (message.role === 'assistant' && message.content === 'gearChatbox.welcome') {
        return {
          ...message,
          content: welcomeText,
        };
      }

      return message;
    });

    if (normalized.length === 0) {
      return;
    }

    this.gearChatboxMessages.set(normalized);
  }

  private resolveGearSmartSuggestions(
    question: string,
    primarySuggestions: GearChatboxSuggestion[],
  ): Observable<GearChatboxSuggestion[]> {
    if (primarySuggestions.length > 0) {
      return of(primarySuggestions.slice(0, GEAR_CHATBOX_SUGGESTION_LIMIT));
    }

    if (!this.detectGearShoppingIntent(question)) {
      return of([]);
    }

    const latestSuggestions$ = this.productApi
      .getAll({ page: 1, limit: GEAR_CHATBOX_SUGGESTION_LIMIT })
      .pipe(
        take(1),
        map((response) =>
          this.mapProductsToGearSuggestions(response.data?.data ?? []).slice(
            0,
            GEAR_CHATBOX_SUGGESTION_LIMIT,
          ),
        ),
        catchError(() => of([] as GearChatboxSuggestion[])),
      );

    return this.productApi.search(question).pipe(
      take(1),
      map((response) =>
        this.mapProductsToGearSuggestions(response.data?.data ?? []).slice(
          0,
          GEAR_CHATBOX_SUGGESTION_LIMIT,
        ),
      ),
      switchMap((searchSuggestions) => {
        if (searchSuggestions.length > 0) {
          return of(searchSuggestions);
        }

        return latestSuggestions$;
      }),
      catchError(() => latestSuggestions$),
    );
  }

  private mapProductsToGearSuggestions(products: Product[]): GearChatboxSuggestion[] {
    return products
      .filter((product) => product && typeof product.id === 'number')
      .map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug || `${product.id}`,
        price: Number(product.price ?? 0),
        stock: Number(product.stock ?? 0),
        thumbnail: product.thumbnail ?? null,
      }));
  }

  private detectGearShoppingIntent(text: string): boolean {
    const normalized = text.toLowerCase();
    const shoppingKeywords = [
      'mua',
      'tìm',
      'gợi ý',
      'sản phẩm',
      'giá',
      'size',
      'model',
      'laptop',
      'pc',
      'chuột',
      'bàn phím',
      'tai nghe',
      'recommend',
      'suggest',
      'product',
      'shop',
      'find',
      'price',
      'gaming',
    ];

    return shoppingKeywords.some((keyword) => normalized.includes(keyword));
  }

  private buildGearConversationHistory(
    messages: GearChatboxMessage[],
  ): GearChatboxHistoryItem[] {
    return messages
      .slice(-GEAR_CHATBOX_HISTORY_LIMIT)
      .map((message) => ({
        role: message.role,
        content: message.content.slice(0, 500),
      }));
  }

  private currentGearLocale(): string {
    const currentLocale = this.translate.currentLang;
    return typeof currentLocale === 'string' && currentLocale.trim().length > 0
      ? currentLocale
      : 'vi';
  }

  private resetGearChatboxWithWelcome(): void {
    const welcomeText = this.gearChatboxTexts().welcome;
    const initialMessages: GearChatboxMessage[] = welcomeText
      ? [{ role: 'assistant', content: welcomeText }]
      : [];

    this.persistGearChatboxState(initialMessages);
  }

  private persistGearChatboxState(
    messages: GearChatboxMessage[] = this.gearChatboxMessages(),
  ): void {
    const normalizedMessages = this.normalizeGearMessages(messages);
    this.gearChatboxMessages.set(normalizedMessages);

    if (typeof window === 'undefined') {
      return;
    }

    const persistedState: GearChatboxPersistedState = {
      v: GEAR_CHATBOX_STATE_VERSION,
      locale: this.currentGearLocale(),
      open: this.gearChatboxOpen(),
      inputDraft: this.gearChatboxInput(),
      updatedAt: Date.now(),
      messages: normalizedMessages,
    };

    try {
      window.sessionStorage.setItem(
        GEAR_CHATBOX_STATE_KEY,
        JSON.stringify(persistedState),
      );
      window.sessionStorage.removeItem(GEAR_CHATBOX_LEGACY_MESSAGES_KEY);
    } catch {
      // Ignore storage errors.
    }
  }
}
