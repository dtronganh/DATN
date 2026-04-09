import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

import { CategoryManagerPage } from './category-manager';

describe('CategoryManagerPage', () => {
  let component: CategoryManagerPage;
  let fixture: ComponentFixture<CategoryManagerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryManagerPage, HttpClientTestingModule, TranslateModule.forRoot()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CategoryManagerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
