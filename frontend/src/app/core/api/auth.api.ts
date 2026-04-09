import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-url';
import { ApiResponse } from '@core/models/api.response';
import { AuthTokens, LoginPayload, RegisterPayload } from '@core/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private http = inject(HttpClient);

  login(payload: LoginPayload): Observable<ApiResponse<AuthTokens>> {
    return this.http.post<ApiResponse<AuthTokens>>(`${API_URL}/auth/login`, payload);
  }

  register(payload: RegisterPayload): Observable<ApiResponse<AuthTokens>> {
    return this.http.post<ApiResponse<AuthTokens>>(`${API_URL}/auth/register`, payload);
  }
}
