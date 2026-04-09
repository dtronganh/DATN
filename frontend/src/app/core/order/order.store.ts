import { Injectable, inject, signal, computed } from '@angular/core';
import { OrderApi } from '@core/api/order.api';
import { Order, CreateOrderPayload, OrderStatus } from '@core/models/order.model';
import { ToastService } from '@core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class OrderStore {
  private readonly orderApi = inject(OrderApi);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  private readonly orders = signal<Order[]>([]);
  private readonly pendingOrderPayload = signal<CreateOrderPayload | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentOrder = signal<Order | null>(null);

  readonly orderList = computed(() => this.orders());
  readonly orderCount = computed(() => this.orders().length);
  readonly pendingOrders = computed(() => 
    this.orders().filter(o => o.status === 'PENDING')
  );
  readonly completedOrders = computed(() => 
    this.orders().filter(o => o.status === 'SHIPPED')
  );

  setPendingOrder(payload: CreateOrderPayload): void {
    this.pendingOrderPayload.set(payload);
  }

  getPendingOrder(): CreateOrderPayload | null {
    return this.pendingOrderPayload();
  }

  clearPendingOrder(): void {
    this.pendingOrderPayload.set(null);
  }

  loadOrders(params?: { page?: number; limit?: number; sort?: string }): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderApi.getAll(params).subscribe({
      next: (response) => {
        this.orders.set(response.data.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error.set(err.message || this.translate.instant('order.toast.loadOrdersFailed'));
        this.loading.set(false);
        this.toastService.error(this.translate.instant('order.toast.loadOrdersFailed'));
      }
    });
  }

  loadOrder(orderId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderApi.getById(orderId).subscribe({
      next: (response) => {
        this.currentOrder.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error.set(err.message || this.translate.instant('order.toast.loadOrderFailed'));
        this.loading.set(false);
        this.toastService.error(this.translate.instant('order.toast.loadOrderDetailsFailed'));
      }
    });
  }

  createOrder(payload: CreateOrderPayload): Promise<Order> {
    return new Promise((resolve, reject) => {
      this.loading.set(true);
      this.error.set(null);

      this.orderApi.create(payload).subscribe({
        next: (response) => {
          const order = response.data;
          this.currentOrder.set(order);
          this.orders.update(orders => [order, ...orders]);
          this.loading.set(false);
          resolve(order);
        },
        error: (err) => {
          console.error('Error creating order:', err);
          this.error.set(err.message || this.translate.instant('order.toast.createFailed'));
          this.loading.set(false);
          const errorMsg = err.error?.message || this.translate.instant('order.toast.createFailed');
          this.toastService.error(errorMsg);
          reject(err);
        }
      });
    });
  }

  cancelOrder(orderId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading.set(true);
      this.error.set(null);

      this.orderApi.cancel(orderId).subscribe({
        next: (response) => {
          this.orders.update(orders => 
            orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' as OrderStatus } : o)
          );
          
          if (this.currentOrder()?.id === orderId) {
            this.currentOrder.update(order => 
              order ? { ...order, status: 'CANCELLED' as OrderStatus } : null
            );
          }
          
          this.loading.set(false);
          this.toastService.success(this.translate.instant('order.toast.cancelled'));
          resolve();
        },
        error: (err) => {
          console.error('Error cancelling order:', err);
          this.error.set(err.message || this.translate.instant('order.toast.cancelFailed'));
          this.loading.set(false);
          const errorMsg = err.error?.message || this.translate.instant('order.toast.cancelFailed');
          this.toastService.error(errorMsg);
          reject(err);
        }
      });
    });
  }

  reset(): void {
    this.orders.set([]);
    this.currentOrder.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}
