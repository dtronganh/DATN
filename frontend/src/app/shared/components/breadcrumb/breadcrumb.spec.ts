import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Breadcrumb } from './breadcrumb';

describe('Breadcrumb', () => {
  let component: Breadcrumb;
  let fixture: ComponentFixture<Breadcrumb>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Breadcrumb]
    }).compileComponents();

    fixture = TestBed.createComponent(Breadcrumb);
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('items', [{ label: 'Home', link: '/' }]);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
