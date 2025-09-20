import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { ThemeService } from '../../theme.service';
import { RouterLink } from '@angular/router';
import { NgbCarouselConfig, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgbCarouselModule, CommonModule, TranslateModule],
  providers: [NgbCarouselConfig],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {
  isDarkTheme: boolean | undefined;
  tabs = [
    {
      titleKey: 'HOME.ABOUT_TITLE',
      descriptionKey: 'HOME.ABOUT_DESCRIPTION',
      route: '/about',
      imageUrl: './assets/about.jpg'
    },
    {
      titleKey: 'HOME.EDUCATION_TITLE',
      descriptionKey: 'HOME.EDUCATION_DESCRIPTION',
      route: '/education',
      imageUrl: './assets/education.jpg'
    },
    {
      titleKey: 'HOME.PROJECTS_TITLE',
      descriptionKey: 'HOME.PROJECTS_DESCRIPTION',
      route: '/projects',
      imageUrl: './assets/projects.jpg'
    },
    {
      titleKey: 'HOME.EXPERIENCE_TITLE',
      descriptionKey: 'HOME.EXPERIENCE_DESCRIPTION',
      route: '/experience',
      imageUrl: './assets/experience.jpg'
    },
    {
      titleKey: 'HOME.CONTACT_TITLE',
      descriptionKey: 'HOME.CONTACT_DESCRIPTION',
      route: '/contact',
      imageUrl: './assets/contact.jpg'
    }
  ];

  constructor(public themeService: ThemeService, config: NgbCarouselConfig) {
    this.themeService.darkMode$.subscribe(darkMode => {
      this.isDarkTheme = darkMode;
    });
  }
}
