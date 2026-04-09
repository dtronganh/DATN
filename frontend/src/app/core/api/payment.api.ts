import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-url';
import { ApiResponse, PaginatedResponse } from '@core/models/api.response';
import { Payment, CreatePaymentPayload, UpdatePaymentPayload } from '@core/models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentApi {
  private http = inject(HttpClient);

  getAll(): Observable<ApiResponse<PaginatedResponse<Payment>>> {
    return this.http.get<ApiResponse<PaginatedResponse<Payment>>>(`${API_URL}/payment`);
  }

  create(payload: CreatePaymentPayload): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(`${API_URL}/payment`, payload);
  }

  confirm(id: number, payload: UpdatePaymentPayload): Observable<ApiResponse<Payment>> {
    return this.http.patch<ApiResponse<Payment>>(`${API_URL}/payment/${id}`, payload);
  }

  getById(id: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${API_URL}/payment/${id}`);
  }
}
