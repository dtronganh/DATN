import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-url';
import { ApiResponse, PaginatedResponse } from '@core/models/api.response';
import { Address, CreateAddressPayload, UpdateAddressPayload } from '@core/models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressApi {
  private http = inject(HttpClient);

  getAll(): Observable<ApiResponse<PaginatedResponse<Address>>> {
    return this.http.get<ApiResponse<PaginatedResponse<Address>>>(`${API_URL}/addresses`);
  }

  getById(id: number): Observable<ApiResponse<Address>> {
    return this.http.get<ApiResponse<Address>>(`${API_URL}/addresses/${id}`);
  }

  create(payload: CreateAddressPayload): Observable<ApiResponse<Address>> {
    return this.http.post<ApiResponse<Address>>(`${API_URL}/addresses`, payload);
  }

  update(id: number, payload: UpdateAddressPayload): Observable<ApiResponse<Address>> {
    return this.http.patch<ApiResponse<Address>>(`${API_URL}/addresses/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/addresses/${id}`);
  }
}
