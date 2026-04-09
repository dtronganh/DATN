import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncDec } from './inc-dec';

describe('IncDec', () => {
  let component: IncDec;
  let fixture: ComponentFixture<IncDec>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncDec]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncDec);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
