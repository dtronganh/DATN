import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-url';
import { ApiResponse, PaginatedResponse } from '@core/models/api.response';
import { 
  Order, 
  CreateOrderPayload, 
  UpdateOrderStatusPayload,
  OrderListParams 
} from '@core/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderApi {
  private http = inject(HttpClient);

  getAll(params?: OrderListParams): Observable<ApiResponse<PaginatedResponse<Order>>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }
      if (params.sort) {
        httpParams = httpParams.set('sort', params.sort);
      }
    }

    return this.http.get<ApiResponse<PaginatedResponse<Order>>>(`${API_URL}/orders`, { params: httpParams });
  }

  getById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${API_URL}/orders/${id}`);
  }

  create(payload: CreateOrderPayload): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${API_URL}/orders`, payload);
  }

  cancel(id: number): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${API_URL}/orders/${id}`, {});
  }

  updateStatus(id: number, payload: UpdateOrderStatusPayload): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${API_URL}/orders/${id}/status`, payload);
  }

  search(query: string): Observable<ApiResponse<PaginatedResponse<Order>>> {
    const httpParams = new HttpParams().set('query', query);
    return this.http.get<ApiResponse<PaginatedResponse<Order>>>(`${API_URL}/orders/search`, { params: httpParams });
  }
}
