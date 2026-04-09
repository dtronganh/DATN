import { Injectable, signal } from '@angular/core';

export interface ProductFormDraftValue {
  name: string;
  price: number;
  stock: number;
  categoryId: number | null;
  description: string;
}

export interface ProductFormDraft {
  mode: 'new' | 'edit';
  productId: number | null;
  value: ProductFormDraftValue;
  images: string[];
}

@Injectable({ providedIn: 'root' })
export class ProductFormDraftStore {
  readonly draft = signal<ProductFormDraft | null>(null);

  setDraft(draft: ProductFormDraft): void {
    this.draft.set(draft);
  }

  getMatchingDraft(mode: 'new' | 'edit', productId: number | null): ProductFormDraft | null {
    const current = this.draft();
    if (!current) return null;
    if (current.mode !== mode) return null;
    if ((current.productId ?? null) !== (productId ?? null)) return null;
    return current;
  }

  updateDescription(description: string): void {
    const current = this.draft();
    if (!current) return;
    this.draft.set({
      ...current,
      value: {
        ...current.value,
        description
      }
    });
  }

  clear(): void {
    this.draft.set(null);
  }
}
