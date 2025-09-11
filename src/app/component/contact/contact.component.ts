import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { ThemeService } from '../../theme.service';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NgOptimizedImage,RouterLink,RouterModule],
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
