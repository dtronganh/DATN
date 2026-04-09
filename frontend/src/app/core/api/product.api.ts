import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-url';
import { ApiResponse, PaginatedResponse } from '@core/models/api.response';
import { 
  Product, 
  CreateProductPayload, 
  UpdateProductPayload,
  ProductListParams 
} from '@core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductApi {
  private http = inject(HttpClient);

  getAll(params?: ProductListParams): Observable<ApiResponse<PaginatedResponse<Product>>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.categoryId) {
        httpParams = httpParams.set('categoryId', params.categoryId.toString());
      }
      if (params.sort) {
        httpParams = httpParams.set('sort', params.sort);
      }
      if (params.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }
    }

    return this.http.get<ApiResponse<PaginatedResponse<Product>>>(`${API_URL}/products`, { params: httpParams });
  }

  getBySlug(slug: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${API_URL}/products/${slug}`);
  }

  getByCategory(categoryId: number, params?: { page?: number; limit?: number; sort?: string }): Observable<ApiResponse<PaginatedResponse<Product>>> {
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

    return this.http.get<ApiResponse<PaginatedResponse<Product>>>(`${API_URL}/products/category/${categoryId}`, { params: httpParams });
  }

  search(query: string): Observable<ApiResponse<PaginatedResponse<Product>>> {
    const httpParams = new HttpParams().set('query', query);
    return this.http.get<ApiResponse<PaginatedResponse<Product>>>(`${API_URL}/products/search`, { params: httpParams });
  }

  create(payload: CreateProductPayload): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${API_URL}/products`, payload);
  }

  update(id: number, payload: UpdateProductPayload): Observable<ApiResponse<Product>> {
    return this.http.patch<ApiResponse<Product>>(`${API_URL}/products/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/products/${id}`);
  }
}
