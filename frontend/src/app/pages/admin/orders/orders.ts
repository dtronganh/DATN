import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderApi } from '@core/api/order.api';
import { Order, OrderStatus } from '@core/models/order.model';
import { ConfirmService } from '@core/services/confirm.service';
import { ToastService } from '@core/services/toast.service';
import { LocaleService } from '@core/services/locale.service';
import { AdminSearch } from '@shared/components/admin-search/admin-search';
import { Button } from '@shared/components/button/button';
import { formatVND } from '@shared/utils';
import { forkJoin, Subject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { 
  LoadingSpinnerComponent, 
  StatusBadgeComponent, 
  SortableTableHeaderComponent,
  TableColumn,
  SortEvent,
  AdminTableComponent
} from '@shared/components';

const STATUS_FLOW_MAP: Record<OrderStatus, OrderStatus[]> = {
  'PENDING': ['PAID', 'FAILED', 'CANCELLED'],
  'PAID': ['SHIPPED', 'CANCELLED'],
  'SHIPPED': ['COMPLETED'],
  'COMPLETED': [],
  'FAILED': [],
  'CANCELLED': [],
};

@Component({
  selector: 'admin-orders',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    TranslateModule, 
    AdminSearch,
    Button,
    LoadingSpinnerComponent, 
    StatusBadgeComponent, 
    SortableTableHeaderComponent,
    AdminTableComponent
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class OrdersPage implements OnInit {
  private readonly orderApi = inject(OrderApi);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);
  private readonly localeService = inject(LocaleService);
  private readonly destroyRef = inject(DestroyRef);

  readonly orders = signal<Order[]>([]);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly filterStatus = signal<string>('ALL');
  readonly expandedOrderId = signal<number | null>(null);
  readonly expandedOrder = signal<Order | null>(null);
  readonly loadingDetail = signal(false);
  readonly receiverNameCache = signal<Record<number, string>>({});
  readonly sortField = signal<string>('createdAt');
  readonly sortDirection = signal<'ASC' | 'DESC'>('DESC');

  readonly statuses = signal<(OrderStatus | 'ALL')[]>(['ALL', 'PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'FAILED', 'CANCELLED']);
  readonly tableColumns: TableColumn[] = [
    { field: 'id', label: 'admin.orders.orderId', sortable: true },
    { field: 'customer', label: 'admin.orders.customer', sortable: false },
    { field: 'totalAmount', label: 'admin.orders.total', sortable: true },
    { field: 'status', label: 'admin.orders.status', sortable: true },
    { field: 'actions', label: 'admin.orders.actions', sortable: false, align: 'right', width: '1%' },
  ];
  readonly formatVND = formatVND;

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.expandedOrderId.set(null);
    this.expandedOrder.set(null);
    
    this.loadOrders();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      if (query.trim()) {
        this.searchOrders(query);
      } else {
        this.loadOrders();
      }
    });
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderApi.getAll({ page: this.currentPage(), limit: 10, sort: `${this.sortField()}:${this.sortDirection()}` })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
      next: (res) => {
        let orders = res.data.data;
        if (this.filterStatus() !== 'ALL') {
          orders = orders.filter(o => o.status === this.filterStatus());
        }
        this.orders.set(orders);
        this.totalPages.set(res.data.meta.totalPages);
        this.total.set(res.data.meta.total);
        this.loadReceiverNames(orders);
      },
      error: () => {}
    });
  }

  private loadReceiverNames(orders: Order[]): void {
    const uncached = orders.filter(o => !o.receiverName && !this.receiverNameCache()[o.id]);
    if (uncached.length === 0) return;

    forkJoin(
      uncached.map(o => this.orderApi.getById(o.id))
    ).subscribe({
      next: (results) => {
        const cache = { ...this.receiverNameCache() };
        results.forEach(res => {
          if (res.data.receiverName) {
            cache[res.data.id] = res.data.receiverName;
          }
        });
        this.receiverNameCache.set(cache);
      }
    });
  }

  searchOrders(query: string): void {
    this.loading.set(true);
    this.orderApi.search(query)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
      next: (res) => {
        this.orders.set(res.data.data);
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

  onFilterChange(status: string): void {
    this.filterStatus.set(status);
    this.currentPage.set(1);
    this.loadOrders();
  }

  onSortChange(event: SortEvent): void {
    this.sortField.set(event.field);
    this.sortDirection.set(event.direction);
    this.currentPage.set(1);
    this.loadOrders();
  }

  onPageChange(page: number): void {
    this.expandedOrderId.set(null);
    this.expandedOrder.set(null);
    
    this.currentPage.set(page);
    this.loadOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleDetail(orderId: number): void {
    if (this.expandedOrderId() === orderId) {
      this.expandedOrderId.set(null);
      this.expandedOrder.set(null);
      return;
    }
    this.expandedOrderId.set(orderId);
    this.loadingDetail.set(true);
    
    
    this.orderApi.getById(orderId).subscribe({
      next: (res) => {
        this.expandedOrder.set(res.data);
        this.loadingDetail.set(false);
      },
      error: (error) => {
        console.error('Failed to load order detail:', error);
        this.toastService.error(this.localeService.t('admin.orders.failedToLoadDetail'));
        this.loadingDetail.set(false);
      }
    });
  }

  async updateStatus(order: Order, newStatus: OrderStatus): Promise<void> {
    if (order.status === newStatus) return;

    const statusLabel = this.localeService.t('admin.orders.statuses.' + newStatus);
    const confirmed = await this.confirmService.confirm(
      `${this.localeService.t('admin.orders.confirmStatusChange')} "${statusLabel}"?`,
      { title: this.localeService.t('admin.orders.updateStatus') }
    );
    if (!confirmed) return;

    this.orderApi.updateStatus(order.id, { status: newStatus }).subscribe({
      next: () => {
        this.toastService.success(this.localeService.t('admin.orders.statusUpdateSuccess'));
        this.loadOrders();
      },
      error: () => {
        this.toastService.error('Failed to update order status');
      }
    });
  }

  getNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
    return STATUS_FLOW_MAP[currentStatus] || [];
  }

  getReceiverName(order: Order): string {
    if (order.receiverName) return order.receiverName;
    return this.receiverNameCache()[order.id] || '—';
  }

}
