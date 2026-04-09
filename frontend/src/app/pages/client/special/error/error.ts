
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import { Footer } from "@shared/components/footer/footer";
import { Button } from "@shared/components/button/button";
import { LocaleService } from '@core/services/locale.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-error',
  imports: [
    RouterLink,
    Navbar,
    Breadcrumb,
    Footer,
    Button,
    TranslateModule
],
  templateUrl: './error.html',
  styleUrl: './error.css'
})
export class Error {
  readonly localeService = inject(LocaleService);
}
