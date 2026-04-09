import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface SocialLink {
  icon: string;
  ariaLabel: string;
  url?: string;
}

@Component({
  selector: 'app-social-share',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './social-share.html',
  styleUrl: './social-share.css'
})
export class SocialShareComponent {
  title = input<string>('product.share');
  links = signal<SocialLink[]>([
    { icon: 'fa-brands fa-facebook-f', ariaLabel: 'Facebook' },
    { icon: 'fa-brands fa-twitter', ariaLabel: 'Twitter' },
    { icon: 'fa-brands fa-instagram', ariaLabel: 'Instagram' }
  ]);

  gapClass = input<string>('gap-6');
}
