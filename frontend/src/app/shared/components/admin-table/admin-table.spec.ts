import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTableComponent } from './admin-table';
import { TranslateModule } from '@ngx-translate/core';

describe('AdminTableComponent', () => {
  let component: AdminTableComponent;
  let fixture: ComponentFixture<AdminTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTableComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
