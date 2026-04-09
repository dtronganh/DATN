import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface TableColumn {
  field: string;
  label: string;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SortEvent {
  field: string;
  direction: 'ASC' | 'DESC';
}

@Component({
  selector: 'thead[appSortableTableHeader]',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  host: {
    '[class]': 'theadClass()'
  },
  templateUrl: './sortable-table-header.html'
})
export class SortableTableHeaderComponent {
  columns = input.required<TableColumn[]>();
  sortField = input<string>('');
  sortDirection = input<'ASC' | 'DESC'>('DESC');
  theadClass = input<string>('border-b border-bdr-clr dark:border-bdr-clr-drk');
  cellClass = input<string>('');
  
  sortChange = output<SortEvent>();

  getHeaderClass(column: TableColumn): string {
    const baseClass = this.cellClass() || 'px-4 py-3 text-lg font-primary font-bold text-title dark:text-white tracking-wide';
    const alignClass = column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left';
    const cursorClass = column.sortable ? 'cursor-pointer hover:text-primary' : '';
    
    return `${baseClass} ${alignClass} ${cursorClass}`.trim();
  }

  getSortIconClass(field: string, direction: 'ASC' | 'DESC'): string {
    const isActive = this.sortField() === field && this.sortDirection() === direction;
    return isActive ? 'text-primary' : 'text-title/30 dark:text-white/30';
  }

  onSort(field: string): void {
    let newDirection: 'ASC' | 'DESC' = 'DESC';
    
    if (this.sortField() === field) {
      newDirection = this.sortDirection() === 'ASC' ? 'DESC' : 'ASC';
    }
    
    this.sortChange.emit({ field, direction: newDirection });
  }
}
