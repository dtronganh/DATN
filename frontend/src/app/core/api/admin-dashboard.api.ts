import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-url';
import { ApiResponse } from '@core/models/api.response';
import {
  AdminStatsAiInquiryPayload,
  AdminStatsAiInquiryResponse,
  DashboardExportMode,
  DashboardGranularity,
  DashboardMetric,
  DashboardOverview,
} from '@core/models/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class AdminDashboardApi {
  private readonly http = inject(HttpClient);

  getOverview(
    metric: DashboardMetric,
    granularity: DashboardGranularity,
  ): Observable<ApiResponse<DashboardOverview>> {
    const params = new HttpParams()
      .set('metric', metric)
      .set('granularity', granularity);

    return this.http.get<ApiResponse<DashboardOverview>>(`${API_URL}/admin/dashboard/overview`, { params });
  }

  exportExcel(params: {
    metric: DashboardMetric;
    granularity: DashboardGranularity;
    mode: DashboardExportMode;
    snapshotAt?: string;
  }): Observable<Blob> {
    let httpParams = new HttpParams()
      .set('metric', params.metric)
      .set('granularity', params.granularity)
      .set('mode', params.mode);

    if (params.snapshotAt) {
      httpParams = httpParams.set('snapshotAt', params.snapshotAt);
    }

    return this.http.get(`${API_URL}/admin/dashboard/export`, {
      params: httpParams,
      responseType: 'blob',
    });
  }

  askStatsAi(payload: AdminStatsAiInquiryPayload): Observable<ApiResponse<AdminStatsAiInquiryResponse>> {
    return this.http.post<ApiResponse<AdminStatsAiInquiryResponse>>(`${API_URL}/chatbot/admin/stats`, payload);
  }
}
