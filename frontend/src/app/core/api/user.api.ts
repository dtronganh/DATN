import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-url';
import { ApiResponse, PaginatedResponse } from '@core/models/api.response';
import { User, UpdateProfilePayload, UpdateUserPayload, UserListParams } from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserApi {
  private http = inject(HttpClient);

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${API_URL}/users/profile`);
  }

  updateProfile(payload: UpdateProfilePayload): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${API_URL}/users/profile`, payload);
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${API_URL}/users/profile`);
  }

  getUsers(params?: UserListParams): Observable<ApiResponse<PaginatedResponse<User>>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.sort) httpParams = httpParams.set('sort', params.sort);
    return this.http.get<ApiResponse<PaginatedResponse<User>>>(`${API_URL}/users`, { params: httpParams });
  }

  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${API_URL}/users/${id}`);
  }

  updateUser(id: number, payload: UpdateUserPayload): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${API_URL}/users/${id}`, payload);
  }

  searchUsers(query: string): Observable<ApiResponse<PaginatedResponse<User>>> {
    const httpParams = new HttpParams().set('query', query);
    return this.http.get<ApiResponse<PaginatedResponse<User>>>(`${API_URL}/users/search`, { params: httpParams });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/users/${id}`);
  }
}
