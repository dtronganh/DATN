import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ProductApi } from '@core/api/product.api';
import { SearchPopup } from './search-popup';

describe('SearchPopup', () => {
  let component: SearchPopup;
  let fixture: ComponentFixture<SearchPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchPopup],
      providers: [
        {
          provide: ProductApi,
          useValue: {
            search: () => of({ data: { data: [] } })
          }
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPopup);
    fixture.componentRef.setInput('open', false);
    fixture.componentRef.setInput('categoryMap', new Map());
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
