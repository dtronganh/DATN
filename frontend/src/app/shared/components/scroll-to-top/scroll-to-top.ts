
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [],
  templateUrl: './scroll-to-top.html',
  styleUrl: './scroll-to-top.css',
  host: {
    '(window:scroll)': 'onWindowScroll()'
  }
})
export class ScrollToTop {
  readonly scroll = signal(false);

  onWindowScroll() {
    this.scroll.set(window.scrollY > 50);
  }

  topFunction(e: Event) {
    e.preventDefault();
    
    const scrollToTop = () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      
      if (currentScroll > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, currentScroll - currentScroll / 8);
      }
    };
    
    scrollToTop();
  }
}
