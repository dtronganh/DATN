import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { marked } from 'marked';
import { startWith } from 'rxjs';
import { Button } from '@shared/components/button/button';
import { preprocessProductDescriptionMarkdown } from '@shared/utils';
import { ProductFormDraftStore } from '../product-form/product-form-draft.store';

@Component({
  selector: 'admin-description-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, Button],
  templateUrl: './description-editor.html',
  styleUrl: './description-editor.css'
})
export class DescriptionEditorPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formDraftStore = inject(ProductFormDraftStore);

  readonly returnUrl = signal('/admin/products/new');
  private originalDescription = '';

  readonly form = this.fb.group({
    description: ['']
  });

  private readonly descriptionValue = toSignal(
    this.form.controls.description.valueChanges.pipe(startWith(this.form.controls.description.value ?? '')),
    { initialValue: this.form.controls.description.value ?? '' }
  );

  readonly previewHtml = computed(() => {
    const source = this.descriptionValue()?.trim() || '';
    if (!source) return null;
    const html = marked.parse(preprocessProductDescriptionMarkdown(source)) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  ngOnInit(): void {
    const qReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (qReturnUrl) {
      this.returnUrl.set(qReturnUrl);
    }

    const description = this.formDraftStore.draft()?.value.description || '';
    this.originalDescription = description;
    this.form.patchValue({ description });
  }

  saveAndBack(): void {
    const description = this.form.get('description')?.value || '';
    this.formDraftStore.updateDescription(description);
    this.router.navigateByUrl(this.returnUrl());
  }

  cancelAndBack(): void {
    this.formDraftStore.updateDescription(this.originalDescription);
    this.router.navigateByUrl(this.returnUrl());
  }
}
