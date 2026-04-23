import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-url';
import { ApiResponse } from '@core/models/api.response';
import {
  GearChatboxAskPayload,
  GearChatboxAskResponse,
} from '@core/models/gear-chatbox.model';

@Injectable({ providedIn: 'root' })
export class GearChatboxApi {
  private readonly http = inject(HttpClient);

  ask(payload: GearChatboxAskPayload): Observable<ApiResponse<GearChatboxAskResponse>> {
    return this.http.post<ApiResponse<GearChatboxAskResponse>>(
      `${API_URL}/chatbot`,
      payload,
    );
  }
}
