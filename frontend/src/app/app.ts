import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollToTop } from "@shared/components/scroll-to-top/scroll-to-top";
import { ToastComponent } from "@shared/components/toast/toast";
import { ConfirmComponent } from "@shared/components/confirm/confirm";
import { SidebarStickers } from "@shared/components/sidebar-stickers/sidebar-stickers";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScrollToTop, ToastComponent, ConfirmComponent, SidebarStickers],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('app');
}
