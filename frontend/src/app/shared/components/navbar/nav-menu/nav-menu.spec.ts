import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavMenu } from './nav-menu';

describe('NavMenu', () => {
  let component: NavMenu;
  let fixture: ComponentFixture<NavMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavMenu);
    fixture.componentRef.setInput('toggle', false);
    fixture.componentRef.setInput('categories', []);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
