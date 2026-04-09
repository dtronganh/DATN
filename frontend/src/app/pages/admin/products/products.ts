import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'admin-products',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class ProductsPage {}
