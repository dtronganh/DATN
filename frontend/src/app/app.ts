import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollToTop } from "@shared/components/scroll-to-top/scroll-to-top";
import { ToastComponent } from "@shared/components/toast/toast";
import { ConfirmComponent } from "@shared/components/confirm/confirm";
import { SidebarStickers } from "@shared/components/sidebar-stickers/sidebar-stickers";
import { GearAiChatboxWidget } from '@shared/components/gear-ai-chatbox-widget/gear-ai-chatbox-widget';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ScrollToTop,
    ToastComponent,
    ConfirmComponent,
    SidebarStickers,
    GearAiChatboxWidget,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('app');
}
