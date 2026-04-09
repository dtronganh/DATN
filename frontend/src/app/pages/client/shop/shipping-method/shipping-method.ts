
import { Component, afterNextRender } from '@angular/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import Aos from 'aos';
import { Footer } from "@shared/components/footer/footer";
import { TranslateModule } from '@ngx-translate/core';
import { ShippingMethodsTableComponent } from '@shared/components';

@Component({
  selector: 'app-shipping-method',
  standalone: true,
  imports: [
    Navbar,
    Breadcrumb,
    Footer,
    TranslateModule,
    ShippingMethodsTableComponent
],
  templateUrl: './shipping-method.html',
  styleUrl: './shipping-method.css'
})
export class ShippingMethod {
  private readonly afterRender = afterNextRender(() => {
    Aos.init();
  });
}
