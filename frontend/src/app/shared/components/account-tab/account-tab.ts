import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthStore } from '@core/auth/auth.store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmService } from '@core/services/confirm.service';

@Component({
  selector: 'app-account-tab',
  standalone: true,
  imports: [
    RouterLink,
    TranslateModule
  ],
  templateUrl: './account-tab.html',
  styleUrl: './account-tab.css'
})
export class AccountTab implements OnInit {
  private readonly location = inject(Location);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly confirmService = inject(ConfirmService);
  private readonly translate = inject(TranslateService);
  readonly currentPath = signal('');

  ngOnInit(): void {
    this.currentPath.set(this.location.path());
  }

  async logout(): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      this.translate.instant('profile.logoutConfirm.message'),
      {
        title: this.translate.instant('profile.logoutConfirm.title'),
        confirmText: this.translate.instant('profile.logoutConfirm.confirmText'),
        cancelText: this.translate.instant('profile.logoutConfirm.cancelText')
      }
    );

    if (confirmed) {
      this.authStore.logout();
      this.router.navigate(['/']);
    }
  }
}
