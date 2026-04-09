import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Switcher } from '@shared/components/switcher/switcher';
import { AuthStore } from '@core/auth/auth.store';
import { ConfirmService } from '@core/services/confirm.service';
import { ToastService } from '@core/services/toast.service';
import { LocaleService } from '@core/services/locale.service';
import { UserApi } from '@core/api/user.api';
import Aos from 'aos';

interface NavItem {
  path: string;
  icon: string;
  labelKey: string;
}

@Component({
  selector: 'admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, Switcher],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout implements OnInit {
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);
  private readonly localeService = inject(LocaleService);
  private readonly userApi = inject(UserApi);
  private readonly translate = inject(TranslateService);

  readonly sidebarOpen = signal(false);
  readonly sidebarCollapsed = signal(false);
  readonly previewImage = signal<string | null>(null);
  readonly isUploadingImage = signal<boolean>(false);

  readonly navItems = signal<NavItem[]>([
    { path: '/admin/dashboard', icon: 'lnr lnr-chart-bars', labelKey: 'admin.sidebar.dashboard' },
    { path: '/admin/products', icon: 'lnr lnr-tag', labelKey: 'admin.sidebar.products' },
    { path: '/admin/orders', icon: 'lnr lnr-cart', labelKey: 'admin.sidebar.orders' },
    { path: '/admin/users', icon: 'lnr lnr-users', labelKey: 'admin.sidebar.users' },
  ]);

  readonly userImage = computed(() => 
    this.previewImage() || this.authStore.currentUser()?.image || 'assets/img/profile.jpg'
  );

  readonly userName = computed(() => 
    this.authStore.currentUser()?.fullName || 'Admin'
  );

  readonly userEmail = computed(() => 
    this.authStore.currentUser()?.email || ''
  );

  ngOnInit() {
    Aos.init();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  toggleCollapse(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  getDesktopNavItemClasses(isActive: boolean): Record<string, boolean> {
    return {
      'justify-center': this.sidebarCollapsed(),
      'gap-3': !this.sidebarCollapsed(),
      'border-primary': isActive,
      'text-primary': isActive,
      'bg-primary/5': isActive,
      'dark:bg-primary/10': isActive,
      'font-semibold': isActive,
      'border-transparent': !isActive,
      'text-title': !isActive,
      'dark:text-white': !isActive,
      'hover:text-primary': !isActive,
      'dark:hover:text-primary': !isActive,
      'hover:bg-primary/5': !isActive,
      'dark:hover:bg-primary/10': !isActive,
    };
  }

  getMobileNavItemClasses(isActive: boolean): Record<string, boolean> {
    return {
      'border-primary': isActive,
      'text-primary': isActive,
      'bg-primary/5': isActive,
      'dark:bg-primary/10': isActive,
      'font-semibold': isActive,
      'border-transparent': !isActive,
      'text-title': !isActive,
      'dark:text-white': !isActive,
      'hover:text-primary': !isActive,
      'dark:hover:text-primary': !isActive,
      'hover:bg-primary/5': !isActive,
    };
  }

  onFileSelected(event: Event): void {
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
      
      const reader = new FileReader();
      reader.onload = () => {
        const imageBase64 = reader.result as string;
        this.previewImage.set(imageBase64);
        this.uploadImage(imageBase64);
      };
      reader.readAsDataURL(file);
    }
  }

  private uploadImage(imageBase64: string): void {
    const user = this.authStore.currentUser();
    if (!user) return;

    this.isUploadingImage.set(true);
    this.userApi.updateProfile({
      fullName: user.fullName,
      email: user.email,
      image: imageBase64
    }).subscribe({
      next: (res) => {
        this.authStore.updateUser(res.data);
        this.toastService.success(this.translate.instant('profile.edit.toasts.imageUpdateSuccess'));
        this.isUploadingImage.set(false);
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || this.translate.instant('profile.edit.toasts.imageUpdateError'));
        this.previewImage.set(null);
        this.isUploadingImage.set(false);
      }
    });
  }

  async logout(): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      this.localeService.t('admin.sidebar.logout') + '?',
      { title: this.localeService.t('admin.common.confirm') }
    );
    if (!confirmed) return;

    this.authStore.logout();
    this.router.navigate(['/auth/login']);
  }
}
