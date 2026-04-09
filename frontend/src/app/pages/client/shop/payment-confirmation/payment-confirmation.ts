import { Component, signal } from '@angular/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import { Footer } from "@shared/components/footer/footer";
import { TranslateModule } from '@ngx-translate/core';
import { Button } from "@shared/components/button/button";

interface PaymentInfo {
  date: string;
  cardHolder: string;
  cardType: string;
  cardNumber: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-payment-confirmation',
  standalone: true,
  imports: [
    Navbar,
    Breadcrumb,
    Footer,
    TranslateModule,
    Button
],
  templateUrl: './payment-confirmation.html',
  styleUrl: './payment-confirmation.css'
})
export class PaymentConfirmation {
  readonly paymentInfo = signal<PaymentInfo>({
    date: '12/31/2024',
    cardHolder: 'John Smith Doe',
    cardType: 'Visa',
    cardNumber: '**** **** **** 1234',
    email: 'demomail@gmail.com',
    phone: '(+11) 01234 56789'
  });

  readonly totalAmount = signal(850);
}
