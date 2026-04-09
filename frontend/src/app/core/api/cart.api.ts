import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-url';
import { ApiResponse } from '@core/models/api.response';
import { Cart, AddToCartPayload, UpdateCartItemPayload } from '@core/models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartApi {
  private http = inject(HttpClient);

  getCart(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(`${API_URL}/carts`);
  }

  addItem(payload: AddToCartPayload): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(`${API_URL}/carts/items`, payload);
  }

  updateItem(itemId: number, payload: UpdateCartItemPayload): Observable<ApiResponse<Cart>> {
    return this.http.patch<ApiResponse<Cart>>(`${API_URL}/carts/items/${itemId}`, payload);
  }

  removeItem(itemId: number): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(`${API_URL}/carts/items/${itemId}`);
  }

  clearCart(): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(`${API_URL}/carts`);
  }
}
