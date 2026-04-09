import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar';
import { TranslateModule } from '@ngx-translate/core';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search after debounce', fakeAsync(() => {
    let emittedValue: string | undefined;
    component.search.subscribe((value: string) => {
      emittedValue = value;
    });

    component.onSearchChange('test');

    tick(400);

    expect(emittedValue).toBe('test');
  }));

  it('should clear search', () => {
    component.searchQuery = 'test';
    component.clearSearch();
    
    expect(component.searchQuery).toBe('');
  });

  it('should show clear button when search query exists', () => {
    component.searchQuery = 'test';
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('button');
    expect(clearButton).toBeTruthy();
  });
});
