import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pagination } from '@shared/components/pagination/pagination';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state';

@Component({
  selector: 'app-admin-table',
  standalone: true,
  imports: [CommonModule, Pagination, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './admin-table.html'
})
export class AdminTableComponent {
  loading = input<boolean>(false);
  empty = input<boolean>(false);
  emptyIcon = input<string>('lnr-inbox');
  emptyMessage = input<string>('');
  loadingMessage = input<string>('admin.common.loading');
  totalPages = input<number>(1);
  currentPage = input<number>(1);

  pageChange = output<number>();
}
