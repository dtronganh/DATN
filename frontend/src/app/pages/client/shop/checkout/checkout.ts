
import { Component, afterNextRender, signal, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import Aos from 'aos';
import { Footer } from "@shared/components/footer/footer";
import { CartStore } from '@core/cart/cart.store';
import { OrderStore } from '@core/order/order.store';
import { AddressApi } from '@core/api/address.api';
import { Address } from '@core/models/address.model';
import { AuthStore } from '@core/auth/auth.store';
import { ToastService } from '@core/services/toast.service';
import { formatVND } from '@shared/utils';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from '@shared/components/button/button';
import { LocationSelectorComponent } from '@shared/components';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    Navbar,
    Breadcrumb,
    Footer,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    TranslateModule,
    Button,
    LocationSelectorComponent
],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly cartStore = inject(CartStore);
  readonly orderStore = inject(OrderStore);
  private readonly addressApi = inject(AddressApi);
  readonly authStore = inject(AuthStore);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly formatVND = formatVND;
  readonly addresses = signal<Address[]>([]);
  readonly loadingAddresses = signal(false);
  readonly selectedAddressId = signal<number | null>(null);
  readonly showAddressForm = signal(false);
  readonly orderNote = signal('');
  readonly submitting = signal(false);

  readonly provinceControl = new FormControl<string | null>(null, [Validators.required]);
  readonly districtControl = new FormControl<string | null>(null, [Validators.required]);
  readonly wardControl = new FormControl<string | null>(null, [Validators.required]);

  readonly addressForm = this.fb.group({
    receiverName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^(\+84|0)[3|5|7|8|9][0-9]{8}$/)]],
    specificAddress: ['', [Validators.required, Validators.minLength(5)]],
    isDefault: [false]
  });

  private readonly afterRender = afterNextRender(() => {
    Aos.init();
  });

  ngOnInit(): void {
    if (!this.authStore.isAuthenticated()) {
      this.toastService.warning(this.translate.instant('shop.checkout.loginRequired'));
      this.router.navigate(['/login']);
      return;
    }

    if (this.cartStore.isEmpty()) {
      this.toastService.warning(this.translate.instant('shop.checkout.cartEmpty'));
      this.router.navigate(['/cart']);
      return;
    }

    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.loadingAddresses.set(true);
    this.addressApi.getAll().subscribe({
      next: (response) => {
        const addressList = response.data.data;
        this.addresses.set(addressList);
        
        if (addressList.length > 0) {
          const defaultAddr = addressList.find(a => a.isDefault) || addressList[0];
          this.selectedAddressId.set(defaultAddr.id);
        }
        
        this.loadingAddresses.set(false);
      },
      error: (err) => {
        console.error('Error loading addresses:', err);
        this.toastService.error(this.translate.instant('shop.checkout.loadAddressesFailed'));
        this.loadingAddresses.set(false);
      }
    });
  }

  toggleAddressForm(): void {
    this.showAddressForm.update(v => !v);
    if (!this.showAddressForm()) {
      this.addressForm.reset();
      this.provinceControl.reset();
      this.districtControl.reset();
      this.wardControl.reset();
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.addressForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return this.translate.instant('shop.checkout.errors.required', { field: this.getFieldLabel(controlName) });
    }
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return this.translate.instant('shop.checkout.errors.minLength', { field: this.getFieldLabel(controlName), min: minLength });
    }
    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return this.translate.instant('shop.checkout.errors.maxLength', { field: this.getFieldLabel(controlName), max: maxLength });
    }
    if (control.errors['pattern']) {
      return this.translate.instant('shop.checkout.errors.invalidPhone');
    }
    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labelKeys: {[key: string]: string} = {
      receiverName: 'shop.checkout.receiverName',
      phone: 'shop.checkout.phoneNumber',
      province: 'shop.checkout.province',
      district: 'shop.checkout.district',
      ward: 'shop.checkout.ward',
      specificAddress: 'shop.checkout.specificAddress'
    };
    const key = labelKeys[controlName];
    return key ? this.translate.instant(key) : controlName;
  }

  async saveNewAddress(): Promise<void> {
    if (this.addressForm.invalid || !this.provinceControl.value || !this.districtControl.value || !this.wardControl.value) {
      this.addressForm.markAllAsTouched();
      this.provinceControl.markAsTouched();
      this.districtControl.markAsTouched();
      this.wardControl.markAsTouched();
      this.toastService.warning(this.translate.instant('shop.checkout.fillRequired'));
      return;
    }

    const formValue = this.addressForm.value;
    const payload = {
      receiverName: formValue.receiverName!,
      phone: formValue.phone!,
      province: this.provinceControl.value!,
      district: this.districtControl.value!,
      ward: this.wardControl.value!,
      specificAddress: formValue.specificAddress!,
      isDefault: formValue.isDefault || false
    };

    this.submitting.set(true);
    this.addressApi.create(payload).subscribe({
      next: (response) => {
        const newAddress = response.data;
        this.addresses.update(list => [...list, newAddress]);
        this.selectedAddressId.set(newAddress.id);
        this.showAddressForm.set(false);
        this.addressForm.reset();
        this.provinceControl.reset();
        this.districtControl.reset();
        this.wardControl.reset();
        this.toastService.success(this.translate.instant('shop.checkout.addressAdded'));
        this.submitting.set(false);
      },
      error: (err) => {
        console.error('Error creating address:', err);
        this.toastService.error(err.error?.message || this.translate.instant('shop.checkout.createAddressFailed'));
        this.submitting.set(false);
      }
    });
  }

  selectAddress(addressId: number): void {
    this.selectedAddressId.set(addressId);
  }

  async placeOrder(): Promise<void> {
    if (!this.selectedAddressId()) {
      this.toastService.warning(this.translate.instant('shop.checkout.selectAddress'));
      return;
    }

    if (this.cartStore.isEmpty()) {
      this.toastService.warning(this.translate.instant('shop.checkout.cartEmpty'));
      return;
    }

    this.submitting.set(true);

    try {
      this.orderStore.setPendingOrder({
        addressId: this.selectedAddressId()!,
        note: this.orderNote() || undefined,
        products: this.cartStore.items().map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      });

      this.router.navigate(['/payment-method'], {
        queryParams: {
          amount: this.cartStore.total()
        }
      });
    } catch (err) {
      console.error('Error placing order:', err);
      this.submitting.set(false);
    }
  }

  getSelectedAddress(): Address | null {
    const id = this.selectedAddressId();
    return id ? this.addresses().find(a => a.id === id) || null : null;
  }

  getFullAddress(address: Address): string {
    return `${address.specificAddress}, ${address.ward}, ${address.district}, ${address.province}`;
  }
}
