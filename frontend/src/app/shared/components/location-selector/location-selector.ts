import { Component, input, OnInit, signal, effect, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LocationApi, Province, District, Ward } from '@core/api/location.api';
import { SelectComponent } from '@shared/components/select/select';

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SelectComponent],
  templateUrl: './location-selector.html'
})
export class LocationSelectorComponent implements OnInit {
  private readonly locationApi = inject(LocationApi);

  provinceControl = input.required<FormControl>();
  districtControl = input.required<FormControl>();
  wardControl = input.required<FormControl>();
  layout = input<'inline' | 'stacked'>('inline');
  required = input<boolean>(false);
  provinceError = input<string>('');
  districtError = input<string>('');
  wardError = input<string>('');
  isDisabled = input<boolean>(false);

  readonly provinces = signal<Province[]>([]);
  readonly districts = signal<District[]>([]);
  readonly wards = signal<Ward[]>([]);

  readonly provinceOptions = computed(() => 
    this.provinces().map(p => ({ label: p.name, value: p.name }))
  );
  readonly districtOptions = computed(() => 
    this.districts().map(d => ({ label: d.name, value: d.name }))
  );
  readonly wardOptions = computed(() => 
    this.wards().map(w => ({ label: w.name, value: w.name }))
  );
  
  readonly selectedProvince = signal<Province | null>(null);
  readonly selectedDistrict = signal<District | null>(null);

  constructor() {
    effect(() => {
      this.updateDisabledState();
    });
  }

  ngOnInit(): void {
    this.loadProvinces();
    
    this.provinceControl().valueChanges.subscribe(name => {
      if (name) {
        this.loadDistrictsByName(name);
      } else {
        this.districts.set([]);
        this.wards.set([]);
      }
      this.updateDisabledState();
    });

    this.districtControl().valueChanges.subscribe(name => {
      if (name) this.loadWardsByName(name);
      else this.wards.set([]);
      this.updateDisabledState();
    });

    this.updateDisabledState();
  }

  private loadProvinces(): void {
    this.locationApi.getProvinces().subscribe({
      next: (data) => {
        this.provinces.set(data);
        const currentProvince = this.provinceControl().value;
        if (currentProvince) {
          this.loadDistrictsByName(currentProvince);
        }
      },
      error: (err) => {
        console.error('Failed to load provinces:', err);
      }
    });
  }

  private loadDistrictsByName(provinceName: string): void {
    const province = this.provinces().find(p => p.name === provinceName);
    if (province) {
      this.selectedProvince.set(province);
      this.locationApi.getDistricts(province.code).subscribe({
        next: (data) => {
          this.districts.set(data.districts || []);
          const currentDistrict = this.districtControl().value;
          if (currentDistrict) {
            this.loadWardsByName(currentDistrict);
          }
        }
      });
    }
  }

  private loadWardsByName(districtName: string): void {
    const district = this.districts().find(d => d.name === districtName);
    if (district) {
      this.selectedDistrict.set(district);
      this.locationApi.getWards(district.code).subscribe({
        next: (data) => {
          this.wards.set(data.wards || []);
        }
      });
    }
  }

  private updateDisabledState(): void {
    const isDisabled = this.isDisabled();
    const pCtrl = this.provinceControl();
    const dCtrl = this.districtControl();
    const wCtrl = this.wardControl();

    if (isDisabled) {
      pCtrl.disable({ emitEvent: false });
      dCtrl.disable({ emitEvent: false });
      wCtrl.disable({ emitEvent: false });
      return;
    }

    pCtrl.enable({ emitEvent: false });

    if (pCtrl.value) {
      dCtrl.enable({ emitEvent: false });
    } else {
      dCtrl.disable({ emitEvent: false });
      if (dCtrl.value) dCtrl.setValue(null, { emitEvent: false });
    }

    if (dCtrl.value) {
      wCtrl.enable({ emitEvent: false });
    } else {
      wCtrl.disable({ emitEvent: false });
      if (wCtrl.value) wCtrl.setValue(null, { emitEvent: false });
    }
  }

  containerClass(): string {
    return this.layout() === 'inline' 
      ? 'grid md:grid-cols-3 gap-4' 
      : 'grid gap-5 sm:gap-6';
  }

  onProvinceChange(provinceName: any): void {
    this.districtControl().setValue(null, { emitEvent: false });
    this.wardControl().setValue(null, { emitEvent: false });
    this.districts.set([]);
    this.wards.set([]);
    
    if (provinceName) {
      this.loadDistrictsByName(provinceName);
    }
    this.updateDisabledState();
  }

  onDistrictChange(districtName: any): void {
    this.wardControl().setValue(null, { emitEvent: false });
    this.wards.set([]);
    
    if (districtName) {
      this.loadWardsByName(districtName);
    }
    this.updateDisabledState();
  }
}
