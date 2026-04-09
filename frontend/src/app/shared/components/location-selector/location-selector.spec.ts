import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { LocationSelectorComponent } from './location-selector';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('LocationSelectorComponent', () => {
  let component: LocationSelectorComponent;
  let fixture: ComponentFixture<LocationSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationSelectorComponent, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationSelectorComponent);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('provinceControl', new FormControl(''));
    fixture.componentRef.setInput('districtControl', new FormControl(''));
    fixture.componentRef.setInput('wardControl', new FormControl(''));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display three dropdowns', () => {
    const selects = fixture.nativeElement.querySelectorAll('select');
    expect(selects.length).toBe(3);
  });

  it('should disable district when province is not selected', () => {
    const districtSelect = fixture.nativeElement.querySelectorAll('select')[1];
    expect(districtSelect.disabled).toBeTruthy();
  });

  it('should disable ward when district is not selected', () => {
    const wardSelect = fixture.nativeElement.querySelectorAll('select')[2];
    expect(wardSelect.disabled).toBeTruthy();
  });
});
