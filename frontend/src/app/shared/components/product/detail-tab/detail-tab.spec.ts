import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailTab } from './detail-tab';

describe('DetailTab', () => {
  let component: DetailTab;
  let fixture: ComponentFixture<DetailTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
