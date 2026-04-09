import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'admin-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-search.html',
  styleUrl: './admin-search.css'
})
export class AdminSearch {
  @Input() placeholder = '';
  @Output() search = new EventEmitter<Event>();

  onInput(event: Event): void {
    this.search.emit(event);
  }
}
