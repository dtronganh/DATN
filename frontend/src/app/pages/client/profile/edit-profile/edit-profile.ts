
import { Component, afterNextRender, inject, signal, OnInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import { AccountTab } from "@shared/components/account-tab/account-tab";
import Aos from 'aos';
import { Footer } from "@shared/components/footer/footer";
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { AuthStore } from '@core/auth/auth.store';
import { AddressApi } from '@core/api/address.api';
import { UserApi } from '@core/api/user.api';
import { ToastService } from '@core/services/toast.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from '@shared/components/button/button';
import { LocationSelectorComponent } from '@shared/components';
import { forkJoin, finalize } from 'rxjs';

@Component({
  selector: 'app-edit-profile',
  imports: [
    Navbar,
    Breadcrumb,
    AccountTab,
    Footer,
    ReactiveFormsModule,
    CommonModule,
    TranslateModule,
    Button,
    LocationSelectorComponent
  ],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css'
})
export class EditProfile implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly addressApi = inject(AddressApi);
  private readonly userApi = inject(UserApi);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  existingAddressId = signal<number | null>(null);
  previewImage = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  isLoading = signal(false);

  private readonly _loadingEffect = effect(() => {
    if (this.isLoading()) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  });

  provinceControl = new FormControl<string | null>(null, [Validators.required]);
  districtControl = new FormControl<string | null>(null, [Validators.required]);
  wardControl = new FormControl<string | null>(null, [Validators.required]);

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^(\+84|0)[3|5|7|8|9][0-9]{8}$/)]],
    specificAddress: ['', [Validators.required, Validators.minLength(2)]]
  });

  private readonly afterRender = afterNextRender(() => {
    Aos.init();
  });

  ngOnInit() {
    if (!this.authStore.isAuthenticated()) {
      this.toastService.error(this.translate.instant('profile.edit.toasts.loginRequired'));
      this.router.navigate(['/login']);
      return;
    }

    const user = this.authStore.currentUser();
    if (user) {
      this.form.patchValue({
        fullName: user.fullName,
        email: user.email
      });
      this.previewImage.set(user.image || null);
    }

    this.loadExistingAddress();
  }

  private loadExistingAddress() {
    this.addressApi.getAll().subscribe({
      next: (res) => {
        if (res.data.data.length > 0) {
          const defaultAddr = res.data.data.find(a => a.isDefault) || res.data.data[0];
          this.existingAddressId.set(defaultAddr.id);
          
          this.form.patchValue({
            phone: defaultAddr.phone,
            specificAddress: defaultAddr.specificAddress
          });

          this.provinceControl.setValue(defaultAddr.province);
          this.districtControl.setValue(defaultAddr.district);
          this.wardControl.setValue(defaultAddr.ward);
        }
      },
      error: (err) => {
        console.error('Error loading address:', err);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return this.translate.instant('profile.edit.errors.required', { field: this.getFieldLabel(controlName) });
    }
    if (control.errors['email']) return this.translate.instant('profile.edit.errors.invalidEmail');
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return this.translate.instant('profile.edit.errors.minLength', { field: this.getFieldLabel(controlName), min: minLength });
    }
    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return this.translate.instant('profile.edit.errors.maxLength', { field: this.getFieldLabel(controlName), max: maxLength });
    }
    if (control.errors['pattern']) {
      return this.translate.instant('profile.edit.errors.invalidPhone');
    }
    return '';
  }

  getFieldLabel(controlName: string): string {
    const labelKeys: {[key: string]: string} = {
      'fullName': 'profile.edit.fields.fullName',
      'email': 'profile.edit.fields.email',
      'phone': 'profile.edit.fields.phone',
      'province': 'profile.edit.fields.province',
      'district': 'profile.edit.fields.district',
      'ward': 'profile.edit.fields.ward',
      'specificAddress': 'profile.edit.fields.specificAddress'
    };
    const key = labelKeys[controlName];
    return key ? this.translate.instant(key) : controlName;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.toastService.error(this.translate.instant('profile.edit.toasts.invalidImageType'));
        return;
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.toastService.error(this.translate.instant('profile.edit.toasts.imageTooLarge'));
        return;
      }
      
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.isLoading()) return;

    if (this.form.invalid || !this.provinceControl.value || !this.districtControl.value || !this.wardControl.value) {
      this.form.markAllAsTouched();
      this.provinceControl.markAsTouched();
      this.districtControl.markAsTouched();
      this.wardControl.markAsTouched();
      this.toastService.error(this.translate.instant('profile.edit.toasts.fillRequired'));
      return;
    }

    this.isLoading.set(true);
    const { fullName, email, phone, specificAddress } = this.form.value;
    const imageBase64 = this.previewImage();

    const addressPayload = {
      receiverName: fullName!,
      phone: phone!,
      specificAddress: specificAddress!,
      province: this.provinceControl.value!,
      district: this.districtControl.value!,
      ward: this.wardControl.value!
    };

    const profileObs = this.userApi.updateProfile({
      fullName: fullName!,
      email: email!,
      image: imageBase64 || undefined
    });

    const addressObs = this.existingAddressId()
      ? this.addressApi.update(this.existingAddressId()!, addressPayload)
      : this.addressApi.create(addressPayload);

    forkJoin([profileObs, addressObs]).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: ([profileRes, addressRes]) => {
        this.authStore.updateUser(profileRes.data);
        if (!this.existingAddressId()) {
          this.existingAddressId.set(addressRes.data.id);
        }
        this.toastService.success(this.translate.instant('profile.edit.toasts.updateSuccess'));
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || this.translate.instant('profile.edit.toasts.updateError'));
      }
    });
  }
}
