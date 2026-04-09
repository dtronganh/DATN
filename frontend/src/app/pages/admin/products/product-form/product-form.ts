import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductApi } from '@core/api/product.api';
import { CategoryApi } from '@core/api/category.api';
import { Category } from '@core/models/category.model';
import { Product } from '@core/models/product.model';
import { ToastService } from '@core/services/toast.service';
import { LocaleService } from '@core/services/locale.service';
import { formatVND } from '@shared/utils';
import { Button } from '@shared/components/button/button';
import { SelectComponent } from '@shared/components';
import { ProductFormDraftStore } from './product-form-draft.store';

@Component({
  selector: 'admin-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslateModule, Button, SelectComponent],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productApi = inject(ProductApi);
  private readonly categoryApi = inject(CategoryApi);
  private readonly toastService = inject(ToastService);
  private readonly localeService = inject(LocaleService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formDraftStore = inject(ProductFormDraftStore);

  readonly categories = signal<Category[]>([]);
  readonly categoryOptions = computed(() => 
    this.categories().map(cat => ({ label: cat.name, value: cat.id }))
  );
  readonly isEditMode = signal(false);
  readonly productId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly images = signal<string[]>([]);
  readonly dragOver = signal(false);

  readonly formatVND = formatVND;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    price: [0, [Validators.required, Validators.min(1000), Validators.max(10000000)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.max(9999)]],
    categoryId: [null as number | null, [Validators.required]],
    description: [''],
  });

  ngOnInit(): void {
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(+id);
    }

    const restored = this.restoreDraftIfAny();
    if (!restored && id) {
      this.loadProduct(+id);
    }

    this.form.valueChanges.subscribe(() => {
      this.persistDraft();
    });
  }

  openDescriptionEditor(): void {
    this.persistDraft();
    this.router.navigate(['/admin/products/description-editor'], {
      queryParams: {
        returnUrl: this.router.url
      }
    });
  }

  private restoreDraftIfAny(): boolean {
    const draft = this.formDraftStore.getMatchingDraft(this.getMode(), this.productId());
    if (!draft) return false;

    this.form.patchValue({
      name: draft.value.name,
      price: draft.value.price,
      stock: draft.value.stock,
      categoryId: draft.value.categoryId,
      description: draft.value.description,
    }, { emitEvent: false });
    this.images.set([...draft.images]);
    return true;
  }

  private persistDraft(): void {
    const value = this.form.getRawValue();
    this.formDraftStore.setDraft({
      mode: this.getMode(),
      productId: this.productId(),
      value: {
        name: value.name || '',
        price: value.price || 0,
        stock: value.stock || 0,
        categoryId: value.categoryId,
        description: value.description || ''
      },
      images: [...this.images()]
    });
  }

  private getMode(): 'new' | 'edit' {
    return this.isEditMode() ? 'edit' : 'new';
  }

  private loadCategories(): void {
    this.categoryApi.getAll(100).subscribe({
      next: (res) => this.categories.set(res.data.data),
    });
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    this.productApi.getAll({ limit: 100 }).subscribe({
      next: (res) => {
        const product = res.data.data.find(p => p.id === id);
        if (product) {
          this.populateForm(product);
        }
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load product');
        this.loading.set(false);
      }
    });
  }

  private populateForm(product: Product): void {
    this.form.patchValue({
      name: product.name,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId ?? null,
      description: product.description ?? '',
    });

    this.images.set([...product.images]);
    this.persistDraft();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (event.dataTransfer?.files) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  private processFiles(files: File[]): void {
    const current = this.images();
    const remaining = 10 - current.length;

    if (remaining <= 0) {
      this.toastService.warning(this.localeService.t('admin.products.imagesMax'));
      return;
    }

    const toProcess = files.slice(0, remaining).filter(f => f.type.startsWith('image/'));

    toProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.images.update(imgs => [...imgs, reader.result as string]);
        this.persistDraft();
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.images.update(imgs => imgs.filter((_, i) => i !== index));
    this.persistDraft();
  }

  moveImage(from: number, to: number): void {
    if (to < 0 || to >= this.images().length) return;
    this.images.update(imgs => {
      const arr = [...imgs];
      [arr[from], arr[to]] = [arr[to], arr[from]];
      return arr;
    });
    this.persistDraft();
  }

  onNumberKeyDown(event: KeyboardEvent): void {
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(event.keyCode) !== -1 ||
      (event.keyCode === 65 && event.ctrlKey === true) ||
      (event.keyCode === 67 && event.ctrlKey === true) ||
      (event.keyCode === 86 && event.ctrlKey === true) ||
      (event.keyCode === 88 && event.ctrlKey === true) ||
      (event.keyCode >= 35 && event.keyCode <= 39)) {
      return;
    }
    if (event.key === 'e' || event.key === 'E' || event.key === '+' || event.key === '-' || event.key === '.') {
      event.preventDefault();
    }
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return this.localeService.t('admin.products.errors.required', { field: this.getFieldLabel(controlName) });
    }
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return this.localeService.t('admin.products.errors.minLength', { field: this.getFieldLabel(controlName), min: minLength });
    }
    if (control.errors['min']) {
      if (controlName === 'price') {
        return this.localeService.t('admin.products.errors.priceMin');
      }
      if (controlName === 'stock') {
        return this.localeService.t('admin.products.errors.stockMin');
      }
    }
    if (control.errors['max']) {
      if (controlName === 'price') {
        return this.localeService.t('admin.products.errors.priceMax');
      }
      if (controlName === 'stock') {
        return this.localeService.t('admin.products.errors.stockMax');
      }
    }
    return '';
  }

  getFieldLabel(controlName: string): string {
    const labelKeys: {[key: string]: string} = {
      'name': 'admin.products.name',
      'price': 'admin.products.price',
      'stock': 'admin.products.stock',
      'categoryId': 'admin.products.category',
      'description': 'admin.products.description'
    };
    const key = labelKeys[controlName];
    return key ? this.localeService.t(key) : controlName;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }

    if (this.images().length < 3) {
      this.toastService.warning(this.localeService.t('admin.products.imagesMin'));
      return;
    }

    this.saving.set(true);
    const formValue = this.form.getRawValue();

    const payload = {
      name: formValue.name!,
      price: formValue.price!,
      stock: formValue.stock!,
      categoryId: formValue.categoryId!,
      description: formValue.description || undefined,
      thumbnail: this.images()[0],
      images: this.images(),
    };

    if (this.isEditMode() && this.productId()) {
      this.productApi.update(this.productId()!, payload).subscribe({
        next: () => {
          this.toastService.success(this.localeService.t('admin.products.updateSuccess'));
          this.saving.set(false);
          this.formDraftStore.clear();
          this.router.navigate(['/admin/products']);
        },
        error: () => {
          this.toastService.error('Failed to update product');
          this.saving.set(false);
        }
      });
    } else {
      this.productApi.create(payload).subscribe({
        next: () => {
          this.toastService.success(this.localeService.t('admin.products.createSuccess'));
          this.saving.set(false);
          this.formDraftStore.clear();
          this.router.navigate(['/admin/products']);
        },
        error: () => {
          this.toastService.error('Failed to create product');
          this.saving.set(false);
        }
      });
    }
  }
}
