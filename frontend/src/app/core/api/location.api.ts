import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Province {
  code: number;
  name: string;
  name_en?: string;
  full_name: string;
  full_name_en?: string;
  code_name?: string;
  districts?: District[];
}

export interface District {
  code: number;
  name: string;
  name_en?: string;
  full_name: string;
  full_name_en?: string;
  code_name?: string;
  province_code?: number;
  wards?: Ward[];
}

export interface Ward {
  code: number;
  name: string;
  name_en?: string;
  full_name: string;
  full_name_en?: string;
  code_name?: string;
  district_code?: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocationApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://provinces.open-api.vn/api';

  getProvinces(): Observable<Province[]> {
    return this.http.get<Province[]>(`${this.baseUrl}/p/`);
  }

  getDistricts(provinceCode: number): Observable<Province> {
    return this.http.get<Province>(`${this.baseUrl}/p/${provinceCode}?depth=2`);
  }

  getWards(districtCode: number): Observable<District> {
    return this.http.get<District>(`${this.baseUrl}/d/${districtCode}?depth=2`);
  }
}
