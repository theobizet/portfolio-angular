import { Component } from '@angular/core';
import { ThemeService } from '../../theme.service';
import { NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [NgOptimizedImage,TranslateModule],
  templateUrl: './education.component.html',
  styleUrl: './education.component.css'
})
export class EducationComponent {
  isDarkTheme: boolean | undefined;

  constructor(public themeService: ThemeService) {
    this.themeService.darkMode$.subscribe(darkMode => {
      this.isDarkTheme = darkMode;
    });
  }
}
