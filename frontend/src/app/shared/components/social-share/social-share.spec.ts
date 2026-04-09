import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialShareComponent } from './social-share';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('SocialShareComponent', () => {
  let component: SocialShareComponent;
  let fixture: ComponentFixture<SocialShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialShareComponent, TranslateModule.forRoot()],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
