import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { ThemeService } from '../../theme.service';
import { TranslateModule } from '@ngx-translate/core';
import { ChatComponent } from "../chat/chat";
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NgOptimizedImage, TranslateModule, ChatComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  isDarkTheme: boolean | undefined;

  constructor(public themeService: ThemeService) {
    this.themeService.darkMode$.subscribe(darkMode => {
      this.isDarkTheme = darkMode;
    });
  }
}
