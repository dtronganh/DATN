import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-url';
import { ApiResponse } from '@core/models/api.response';
import { Wishlist, AddToWishlistPayload } from '@core/models/wishlist.model';

@Injectable({ providedIn: 'root' })
export class WishlistApi {
  private http = inject(HttpClient);

  getWishlist(): Observable<ApiResponse<Wishlist>> {
    return this.http.get<ApiResponse<Wishlist>>(`${API_URL}/wishlists`);
  }

  addItem(payload: AddToWishlistPayload): Observable<ApiResponse<Wishlist>> {
    return this.http.post<ApiResponse<Wishlist>>(`${API_URL}/wishlists/items`, payload);
  }

  removeItem(itemId: number): Observable<ApiResponse<Wishlist>> {
    return this.http.delete<ApiResponse<Wishlist>>(`${API_URL}/wishlists/items/${itemId}`);
  }

  clearWishlist(): Observable<ApiResponse<Wishlist>> {
    return this.http.delete<ApiResponse<Wishlist>>(`${API_URL}/wishlists`);
  }
}
