import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-url';
import { ApiResponse, PaginatedResponse } from '@core/models/api.response';
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@core/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryApi {
  private http = inject(HttpClient);

  getAll(limit?: number): Observable<ApiResponse<PaginatedResponse<Category>>> {
    let httpParams = new HttpParams();
    if (limit) {
      httpParams = httpParams.set('limit', limit.toString());
    }
    return this.http.get<ApiResponse<PaginatedResponse<Category>>>(`${API_URL}/categories`, { params: httpParams });
  }

  getById(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${API_URL}/categories/${id}`);
  }

  create(payload: CreateCategoryPayload): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${API_URL}/categories`, payload);
  }

  update(id: number, payload: UpdateCategoryPayload): Observable<ApiResponse<Category>> {
    return this.http.patch<ApiResponse<Category>>(`${API_URL}/categories/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/categories/${id}`);
  }

  search(query: string): Observable<ApiResponse<PaginatedResponse<Category>>> {
    const httpParams = new HttpParams().set('query', query);
    return this.http.get<ApiResponse<PaginatedResponse<Category>>>(`${API_URL}/categories/search`, { params: httpParams });
  }
}
