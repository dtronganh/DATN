
import { Component, signal } from '@angular/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Breadcrumb } from "@shared/components/breadcrumb/breadcrumb";
import Aos from 'aos';
import { Footer } from "@shared/components/footer/footer";
import { TranslateModule } from '@ngx-translate/core';
import { Button } from '@shared/components/button/button';

@Component({
  selector: 'app-contact',
  imports: [
    Navbar,
    Breadcrumb,
    Footer,
    TranslateModule,
    Button
],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {

  readonly contactFields = signal([
    {
      type: 'text',
      labelKey: 'contact.fullName',
      placeholderKey: 'contact.fullNamePlaceholder'
    },
    {
      type: 'email',
      labelKey: 'contact.email',
      placeholderKey: 'contact.emailPlaceholder'
    },
    {
      type: 'number',
      labelKey: 'contact.phone',
      placeholderKey: 'contact.phonePlaceholder'
    }
  ]);

  readonly subjectOptions = signal([
    { value: '', labelKey: 'contact.selectSubject' },
    { value: '1', labelKey: 'contact.subjects.payment' },
    { value: '2', labelKey: 'contact.subjects.quality' },
    { value: '3', labelKey: 'contact.subjects.shipping' },
    { value: '4', labelKey: 'contact.subjects.return' },
    { value: '5', labelKey: 'contact.subjects.size' },
    { value: '6', labelKey: 'contact.subjects.other' }
  ]);

  ngOnInit(): void {
    Aos.init()
  }

}
