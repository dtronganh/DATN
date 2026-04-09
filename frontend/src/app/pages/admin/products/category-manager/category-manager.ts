import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryApi } from '@core/api/category.api';
import { Category } from '@core/models/category.model';
import { ConfirmService } from '@core/services/confirm.service';
import { ToastService } from '@core/services/toast.service';
import { LocaleService } from '@core/services/locale.service';
import { Button } from '@shared/components/button/button';

@Component({
  selector: 'admin-category-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, Button],
  templateUrl: './category-manager.html',
  styleUrl: './category-manager.css'
})
export class CategoryManagerPage implements OnInit {
  private readonly categoryApi = inject(CategoryApi);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);
  private readonly localeService = inject(LocaleService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formNameError = signal<string | null>(null);

  formName = '';
  formDescription = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryApi.getAll(100).subscribe({
      next: (res) => {
        this.categories.set(res.data.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.formName = '';
    this.formDescription = '';
    this.formNameError.set(null);
    this.showForm.set(true);
  }

  openEditForm(cat: Category): void {
    this.editingId.set(cat.id);
    this.formName = cat.name;
    this.formDescription = cat.description || '';
    this.formNameError.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.formName = '';
    this.formDescription = '';
    this.formNameError.set(null);
  }

  saveCategory(): void {
    this.formNameError.set(null);
    if (!this.formName.trim()) {
      this.formNameError.set(this.localeService.t('admin.categories.nameRequired'));
      return;
    }
    if (this.formName.trim().length < 2) {
      this.formNameError.set(this.localeService.t('admin.categories.nameTooShort'));
      return;
    }
    
    this.saving.set(true);

    const payload = {
      name: this.formName.trim(),
      description: this.formDescription.trim() || undefined,
    };

    if (this.editingId()) {
      this.categoryApi.update(this.editingId()!, payload).subscribe({
        next: () => {
          this.toastService.success(this.localeService.t('admin.categories.updateSuccess'));
          this.saving.set(false);
          this.closeForm();
          this.loadCategories();
        },
        error: () => {
          this.toastService.error('Failed to update category');
          this.saving.set(false);
        }
      });
    } else {
      this.categoryApi.create(payload).subscribe({
        next: () => {
          this.toastService.success(this.localeService.t('admin.categories.createSuccess'));
          this.saving.set(false);
          this.closeForm();
          this.loadCategories();
        },
        error: () => {
          this.toastService.error('Failed to create category');
          this.saving.set(false);
        }
      });
    }
  }

  async deleteCategory(cat: Category): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      this.localeService.t('admin.categories.confirmDelete'),
      { title: this.localeService.t('admin.common.confirm') }
    );
    if (!confirmed) return;

    this.categoryApi.delete(cat.id).subscribe({
      next: () => {
        this.toastService.success(this.localeService.t('admin.categories.deleteSuccess'));
        this.loadCategories();
      },
      error: () => {
        this.toastService.error('Failed to delete category');
      }
    });
  }
}
