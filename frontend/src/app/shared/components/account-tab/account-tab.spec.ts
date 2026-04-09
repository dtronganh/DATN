import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTab } from './account-tab';

describe('AccountTab', () => {
  let component: AccountTab;
  let fixture: ComponentFixture<AccountTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
