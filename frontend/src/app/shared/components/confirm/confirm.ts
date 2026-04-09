import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '@core/services/confirm.service';
import { Button } from '@shared/components/button/button';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './confirm.html',
  styleUrl: './confirm.css'
})
export class ConfirmComponent {
  private readonly confirmService = inject(ConfirmService);

  readonly state = this.confirmService.state$;

  onConfirm(): void {
    this.confirmService.resolve(true);
  }

  onCancel(): void {
    this.confirmService.resolve(false);
  }
}
