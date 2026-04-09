
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from "@shared/components/navbar/navbar";
import { Footer } from "@shared/components/footer/footer";
import { Button } from "@shared/components/button/button";
import { LocaleService } from '@core/services/locale.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-thank-you',
  imports: [
    RouterLink,
    Navbar,
    Footer,
    Button,
    TranslateModule
],
  templateUrl: './thank-you.html',
  styleUrl: './thank-you.css'
})
export class ThankYou {
  readonly localeService = inject(LocaleService);
}
