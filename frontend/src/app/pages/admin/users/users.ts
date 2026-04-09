import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserApi } from '@core/api/user.api';
import { AuthStore } from '@core/auth/auth.store';
import { User } from '@core/models/user.model';
import { ConfirmService } from '@core/services/confirm.service';
import { ToastService } from '@core/services/toast.service';
import { LocaleService } from '@core/services/locale.service';
import { AdminSearch } from '@shared/components/admin-search/admin-search';
import { Button } from '@shared/components/button/button';
import { formatDate } from '@shared/utils';
import { Subject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { SortableTableHeaderComponent, TableColumn, SortEvent, AdminTableComponent } from '@shared/components';

@Component({
  selector: 'admin-users',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TranslateModule, 
    AdminSearch, 
    Button, 
    SortableTableHeaderComponent,
    AdminTableComponent
  ],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class UsersPage implements OnInit {
  private readonly userApi = inject(UserApi);
  readonly authStore = inject(AuthStore);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);
  private readonly localeService = inject(LocaleService);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = signal<User[]>([]);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly sortField = signal<string>('createdAt');
  readonly sortDirection = signal<'ASC' | 'DESC'>('DESC');
  readonly formatDate = formatDate;
  readonly tableColumns: TableColumn[] = [
    { field: 'fullName', label: 'admin.users.fullName', sortable: true },
    { field: 'email', label: 'admin.users.email', sortable: true },
    { field: 'role', label: 'admin.users.role', sortable: true },
    { field: 'createdAt', label: 'admin.users.joinDate', sortable: true },
    { field: 'actions', label: 'admin.users.actions', sortable: false, align: 'right', width: '1%' },
  ];

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadUsers();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      if (query.trim()) {
        this.searchUsers(query);
      } else {
        this.loadUsers();
      }
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userApi.getUsers({ page: this.currentPage(), limit: 10, sort: `${this.sortField()}:${this.sortDirection()}` })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
      next: (res) => {
        this.users.set(res.data.data);
        this.totalPages.set(res.data.meta.totalPages);
        this.total.set(res.data.meta.total);
      },
      error: () => {}
    });
  }

  searchUsers(query: string): void {
    this.loading.set(true);
    this.userApi.searchUsers(query)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
      next: (res) => {
        this.users.set(res.data.data);
        this.totalPages.set(res.data.meta.totalPages);
        this.total.set(res.data.meta.total);
      },
      error: () => {}
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadUsers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSortChange(event: SortEvent): void {
    this.sortField.set(event.field);
    this.sortDirection.set(event.direction);
    this.currentPage.set(1);
    this.loadUsers();
  }

  async toggleRole(user: User): Promise<void> {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const roleLabel = this.localeService.t('admin.users.roles.' + newRole);
    const confirmed = await this.confirmService.confirm(
      `${this.localeService.t('admin.users.confirmRoleChange')} "${roleLabel}"?`,
      { title: this.localeService.t('admin.users.changeRole') }
    );
    if (!confirmed) return;

    this.userApi.updateUser(user.id, { role: newRole }).subscribe({
      next: () => {
        this.toastService.success(this.localeService.t('admin.users.roleUpdateSuccess'));
        this.loadUsers();
      },
      error: () => {
        this.toastService.error('Failed to update user role');
      }
    });
  }

  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      this.localeService.t('admin.users.confirmDelete'),
      { title: this.localeService.t('admin.common.confirm') }
    );
    if (!confirmed) return;

    this.userApi.deleteUser(user.id).subscribe({
      next: () => {
        this.toastService.success(this.localeService.t('admin.users.deleteSuccess'));
        this.loadUsers();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404 || error.status === 405) {
          this.userApi.updateUser(user.id, { isActive: false }).subscribe({
            next: () => {
              this.toastService.success(this.localeService.t('admin.users.deleteSuccess'));
              this.loadUsers();
            },
            error: () => {
              this.toastService.error('Failed to delete user');
            }
          });
          return;
        }
        this.toastService.error('Failed to delete user');
      }
    });
  }

  isCurrentUser(user: User): boolean {
    return this.authStore.currentUser()?.id === user.id;
  }

  getRoleColor(role: string): string {
    return role === 'admin'
      ? 'bg-primary text-white'
      : 'bg-gray-500 text-white';
  }

}
