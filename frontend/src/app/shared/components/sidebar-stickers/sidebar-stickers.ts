import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-sidebar-stickers',
  standalone: true,
  imports: [],
  templateUrl: './sidebar-stickers.html',
  styleUrl: './sidebar-stickers.css'
})
export class SidebarStickers {
  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    )
  );

  readonly hidden = computed(() => {
    const url = this.currentUrl() ?? '';
    return url.startsWith('/auth') || url.startsWith('/admin') || url.startsWith('/invoice');
  });
}
