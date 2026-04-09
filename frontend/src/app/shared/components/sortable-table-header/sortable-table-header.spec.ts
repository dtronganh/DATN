import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SortableTableHeaderComponent, TableColumn } from './sortable-table-header';
import { TranslateModule } from '@ngx-translate/core';

describe('SortableTableHeaderComponent', () => {
  let component: SortableTableHeaderComponent;
  let fixture: ComponentFixture<SortableTableHeaderComponent>;

  const mockColumns: TableColumn[] = [
    { field: 'name', label: 'Name', sortable: true },
    { field: 'email', label: 'Email', sortable: true },
    { field: 'actions', label: 'Actions', sortable: false }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortableTableHeaderComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SortableTableHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all columns', () => {
    const headers = fixture.nativeElement.querySelectorAll('th');
    expect(headers.length).toBe(3);
  });

  it('should emit sort event on sortable column click', () => {
    let emittedEvent: any;
    component.sortChange.subscribe((event: any) => {
      emittedEvent = event;
    });

    const firstHeader = fixture.nativeElement.querySelector('th');
    firstHeader.click();

    expect(emittedEvent).toBeTruthy();
    expect(emittedEvent.field).toBe('name');
  });

  it('should toggle sort direction', () => {
    fixture.componentRef.setInput('sortField', 'name');
    fixture.componentRef.setInput('sortDirection', 'ASC');
    fixture.detectChanges();

    let emittedEvent: any;
    component.sortChange.subscribe((event: any) => {
      emittedEvent = event;
    });

    component.onSort('name');

    expect(emittedEvent.direction).toBe('DESC');
  });
});
