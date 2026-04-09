
import { Component, inject, signal } from '@angular/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import Aos from 'aos';
import { AccountTab } from "@shared/components/account-tab/account-tab";
import { Footer } from "@shared/components/footer/footer";
import { AuthStore } from '@core/auth/auth.store';
import { AddressApi } from '@core/api/address.api';
import { Address } from '@core/models/address.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-my-profile',
  imports: [
    Navbar,
    Breadcrumb,
    AccountTab,
    Footer,
    TranslateModule
  ],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css'
})
export class MyProfile {
  readonly authStore = inject(AuthStore);
  private readonly addressApi = inject(AddressApi);
  
  primaryAddress = signal<Address | null>(null);

  ngOnInit(): void {
    Aos.init();
    this.loadAddress();
  }

  private loadAddress() {
    this.addressApi.getAll().subscribe({
      next: (res) => {
        if (res.data.data.length > 0) {
          const defaultAddr = res.data.data.find(a => a.isDefault);
          this.primaryAddress.set(defaultAddr || res.data.data[0]);
        }
      }
    });
  }
}
