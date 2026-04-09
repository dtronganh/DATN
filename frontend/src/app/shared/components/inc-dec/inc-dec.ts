
import { Component, model, input } from '@angular/core';

@Component({
  selector: 'app-inc-dec',
  standalone: true,
  imports: [],
  templateUrl: './inc-dec.html',
  styleUrl: './inc-dec.css'
})
export class IncDec {
  readonly min = input(0);
  readonly max = input(Number.MAX_SAFE_INTEGER);
  readonly val = model(0);

  dec = () => {
    this.val.update(v => v > this.min() ? v - 1 : v);
  }

  inc = () => {
    this.val.update(v => v < this.max() ? v + 1 : v);
  }
}
